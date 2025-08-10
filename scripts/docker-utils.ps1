# Djobea Analytics - Docker Utilities for Windows PowerShell
# Version: 1.0.0
# Description: Docker management utilities for Windows environments

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("status", "logs", "restart", "scale", "backup", "restore", "monitor", "cleanup")]
    [string]$Action = "status",
    
    [Parameter(Mandatory=$false)]
    [string]$Service = "",
    
    [Parameter(Mandatory=$false)]
    [int]$Scale = 1,
    
    [Parameter(Mandatory=$false)]
    [string]$BackupPath = ".\backups",
    
    [Parameter(Mandatory=$false)]
    [switch]$Follow
)

# Color output functions
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    $colors = @{
        "Red" = [ConsoleColor]::Red; "Green" = [ConsoleColor]::Green
        "Yellow" = [ConsoleColor]::Yellow; "Blue" = [ConsoleColor]::Blue
        "Cyan" = [ConsoleColor]::Cyan; "Magenta" = [ConsoleColor]::Magenta
        "White" = [ConsoleColor]::White
    }
    Write-Host $Message -ForegroundColor $colors[$Color]
}

function Write-Success { param([string]$Message); Write-ColorOutput "✅ $Message" "Green" }
function Write-Error { param([string]$Message); Write-ColorOutput "❌ $Message" "Red" }
function Write-Warning { param([string]$Message); Write-ColorOutput "⚠️  $Message" "Yellow" }
function Write-Info { param([string]$Message); Write-ColorOutput "ℹ️  $Message" "Blue" }
function Write-Header { 
    param([string]$Message)
    Write-Host ""; Write-ColorOutput "🐳 $Message" "Cyan"
    Write-ColorOutput ("=" * ($Message.Length + 4)) "Cyan"
}

# Get Docker Compose file based on environment
function Get-ComposeFile {
    if (Test-Path "docker-compose.prod.yml") {
        $prodRunning = docker-compose -f docker-compose.prod.yml ps -q 2>$null
        if ($prodRunning) { return "docker-compose.prod.yml" }
    }
    return "docker-compose.dev.yml"
}

# Show container status
function Show-ContainerStatus {
    Write-Header "Docker Container Status"
    
    $composeFile = Get-ComposeFile
    Write-Info "Using compose file: $composeFile"
    Write-Host ""
    
    try {
        # Show compose services
        docker-compose -f $composeFile ps
        Write-Host ""
        
        # Show detailed container info
        $containers = docker-compose -f $composeFile ps -q
        if ($containers) {
            Write-Info "Container Details:"
            docker stats --no-stream $containers
            Write-Host ""
            
            # Show port mappings
            Write-Info "Port Mappings:"
            foreach ($container in $containers) {
                $containerInfo = docker inspect $container | ConvertFrom-Json
                $name = $containerInfo.Name.TrimStart('/')
                $ports = $containerInfo.NetworkSettings.Ports
                
                Write-Host "  $name" -ForegroundColor Yellow
                foreach ($port in $ports.PSObject.Properties) {
                    if ($port.Value) {
                        $hostPort = $port.Value[0].HostPort
                        $containerPort = $port.Name
                        Write-Host "    $containerPort -> localhost:$hostPort" -ForegroundColor Gray
                    }
                }
            }
        } else {
            Write-Warning "No containers are running"
        }
    } catch {
        Write-Error "Failed to get container status: $_"
    }
}

# Show service logs
function Show-ServiceLogs {
    param([string]$ServiceName = "", [bool]$FollowLogs = $false)
    
    $composeFile = Get-ComposeFile
    
    if ($ServiceName) {
        Write-Header "Logs for service: $ServiceName"
    } else {
        Write-Header "All Service Logs"
    }
    
    try {
        $logArgs = @("-f", $composeFile, "logs")
        if ($FollowLogs) { $logArgs += "--follow" }
        if ($ServiceName) { $logArgs += $ServiceName }
        
        & docker-compose $logArgs
    } catch {
        Write-Error "Failed to show logs: $_"
    }
}

# Restart services
function Restart-Services {
    param([string]$ServiceName = "")
    
    $composeFile = Get-ComposeFile
    
    if ($ServiceName) {
        Write-Header "Restarting service: $ServiceName"
    } else {
        Write-Header "Restarting all services"
    }
    
    try {
        if ($ServiceName) {
            docker-compose -f $composeFile restart $ServiceName
            Write-Success "Service $ServiceName restarted successfully"
        } else {
            docker-compose -f $composeFile restart
            Write-Success "All services restarted successfully"
        }
        
        # Wait a moment and show status
        Start-Sleep -Seconds 3
        Show-ContainerStatus
    } catch {
        Write-Error "Failed to restart services: $_"
    }
}

# Scale services
function Scale-Services {
    param([string]$ServiceName, [int]$Replicas)
    
    if (-not $ServiceName) {
        Write-Error "Service name is required for scaling"
        return
    }
    
    $composeFile = Get-ComposeFile
    Write-Header "Scaling $ServiceName to $Replicas replicas"
    
    try {
        docker-compose -f $composeFile up -d --scale $ServiceName=$Replicas
        Write-Success "Service $ServiceName scaled to $Replicas replicas"
        
        # Show updated status
        Start-Sleep -Seconds 3
        Show-ContainerStatus
    } catch {
        Write-Error "Failed to scale service: $_"
    }
}

# Backup data volumes
function Backup-DataVolumes {
    param([string]$BackupDirectory)
    
    Write-Header "Backing up data volumes"
    
    if (-not (Test-Path $BackupDirectory)) {
        New-Item -ItemType Directory -Path $BackupDirectory -Force | Out-Null
        Write-Info "Created backup directory: $BackupDirectory"
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupFile = Join-Path $BackupDirectory "djobea-backup-$timestamp.tar"
    
    try {
        # Get volume names
        $volumes = docker volume ls --filter "name=djobea" --format "{{.Name}}"
        
        if ($volumes) {
            Write-Info "Found volumes: $($volumes -join ', ')"
            
            # Create backup container
            docker run --rm -v djobea_postgres_data:/data -v ${PWD}:/backup alpine tar czf /backup/$backupFile /data
            
            Write-Success "Backup created: $backupFile"
            
            # Show backup info
            $backupInfo = Get-Item $backupFile
            Write-Info "Backup size: $([math]::Round($backupInfo.Length / 1MB, 2)) MB"
        } else {
            Write-Warning "No volumes found to backup"
        }
    } catch {
        Write-Error "Failed to create backup: $_"
    }
}

# Restore data volumes
function Restore-DataVolumes {
    param([string]$BackupFile)
    
    if (-not (Test-Path $BackupFile)) {
        Write-Error "Backup file not found: $BackupFile"
        return
    }
    
    Write-Header "Restoring data volumes from: $BackupFile"
    Write-Warning "This will overwrite existing data!"
    
    $confirm = Read-Host "Continue with restore? (y/N)"
    if ($confirm -ne "y") {
        Write-Info "Restore cancelled"
        return
    }
    
    try {
        # Stop services first
        $composeFile = Get-ComposeFile
        docker-compose -f $composeFile down
        
        # Restore data
        docker run --rm -v djobea_postgres_data:/data -v ${PWD}:/backup alpine tar xzf /backup/$BackupFile -C /
        
        # Restart services
        docker-compose -f $composeFile up -d
        
        Write-Success "Data restored successfully"
    } catch {
        Write-Error "Failed to restore data: $_"
    }
}

# Monitor resource usage
function Monitor-Resources {
    Write-Header "Resource Monitoring"
    Write-Info "Press Ctrl+C to stop monitoring"
    Write-Host ""
    
    try {
        # Continuous monitoring
        while ($true) {
            Clear-Host
            Write-Header "Docker Resource Monitor - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            
            # Container stats
            docker stats --no-stream
            Write-Host ""
            
            # System resources
            $cpu = Get-WmiObject -Class Win32_Processor | Measure-Object -Property LoadPercentage -Average
            $memory = Get-WmiObject -Class Win32_OperatingSystem
            $memoryUsed = [math]::Round((($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize) * 100, 2)
            
            Write-Info "System Resources:"
            Write-Host "  CPU Usage: $([math]::Round($cpu.Average, 2))%" -ForegroundColor Yellow
            Write-Host "  Memory Usage: $memoryUsed%" -ForegroundColor Yellow
            
            # Disk usage
            $disk = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
            $diskUsed = [math]::Round((($disk.Size - $disk.FreeSpace) / $disk.Size) * 100, 2)
            Write-Host "  Disk Usage (C:): $diskUsed%" -ForegroundColor Yellow
            
            Start-Sleep -Seconds 5
        }
    } catch {
        Write-Info "Monitoring stopped"
    }
}

# Cleanup unused resources
function Cleanup-DockerResources {
    Write-Header "Docker Resource Cleanup"
    
    try {
        # Show current usage
        Write-Info "Current Docker disk usage:"
        docker system df
        Write-Host ""
        
        $confirm = Read-Host "Remove unused containers, networks, images, and volumes? (y/N)"
        if ($confirm -eq "y") {
            Write-Info "Cleaning up unused resources..."
            
            # Remove stopped containers
            $stoppedContainers = docker ps -aq --filter "status=exited"
            if ($stoppedContainers) {
                docker rm $stoppedContainers
                Write-Success "Removed stopped containers"
            }
            
            # Remove unused networks
            docker network prune -f
            Write-Success "Removed unused networks"
            
            # Remove unused images
            docker image prune -f
            Write-Success "Removed unused images"
            
            # Remove unused volumes (with confirmation)
            $volumeConfirm = Read-Host "Also remove unused volumes? This may delete data! (y/N)"
            if ($volumeConfirm -eq "y") {
                docker volume prune -f
                Write-Success "Removed unused volumes"
            }
            
            Write-Host ""
            Write-Info "Cleanup completed. New disk usage:"
            docker system df
        } else {
            Write-Info "Cleanup cancelled"
        }
    } catch {
        Write-Error "Failed to cleanup resources: $_"
    }
}

# Main execution
function Main {
    Write-Header "Docker Utilities for Djobea Analytics"
    
    switch ($Action) {
        "status" {
            Show-ContainerStatus
        }
        
        "logs" {
            Show-ServiceLogs -ServiceName $Service -FollowLogs $Follow
        }
        
        "restart" {
            Restart-Services -ServiceName $Service
        }
        
        "scale" {
            if (-not $Service) {
                Write-Error "Service name is required for scaling"
                exit 1
            }
            Scale-Services -ServiceName $Service -Replicas $Scale
        }
        
        "backup" {
            Backup-DataVolumes -BackupDirectory $BackupPath
        }
        
        "restore" {
            if (-not $Service) {
                Write-Error "Backup file path is required for restore (use -Service parameter)"
                exit 1
            }
            Restore-DataVolumes -BackupFile $Service
        }
        
        "monitor" {
            Monitor-Resources
        }
        
        "cleanup" {
            Cleanup-DockerResources
        }
        
        default {
            Write-Error "Invalid action: $Action"
            Write-Info "Available actions: status, logs, restart, scale, backup, restore, monitor, cleanup"
            exit 1
        }
    }
}

# Execute main function
try {
    Main
} catch {
    Write-Error "Docker utilities failed: $_"
    exit 1
}
