# Djobea Analytics - Windows Environment Setup Script
# Version: 1.0.0
# Description: Automated setup for Windows development environment

param(
    [Parameter(Mandatory=$false)]
    [switch]$All,
    
    [Parameter(Mandatory=$false)]
    [switch]$Chocolatey,
    
    [Parameter(Mandatory=$false)]
    [switch]$Docker,
    
    [Parameter(Mandatory=$false)]
    [switch]$NodeJS,
    
    [Parameter(Mandatory=$false)]
    [switch]$SSL,
    
    [Parameter(Mandatory=$false)]
    [switch]$VSCode,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Require administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires Administrator privileges. Restarting as Administrator..." -ForegroundColor Yellow
    Start-Process PowerShell -Verb RunAs "-File `"$PSCommandPath`" $($MyInvocation.BoundParameters.Keys | ForEach-Object { "-$_ $($MyInvocation.BoundParameters[$_])" }) -All"
    exit
}

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
    Write-Host ""; Write-ColorOutput "🔧 $Message" "Cyan"
    Write-ColorOutput ("=" * ($Message.Length + 4)) "Cyan"
}

# Install Chocolatey package manager
function Install-Chocolatey {
    Write-Header "Installing Chocolatey Package Manager"
    
    try {
        $chocoVersion = choco --version 2>$null
        if ($chocoVersion) {
            Write-Success "Chocolatey already installed: v$chocoVersion"
            return
        }
    } catch {
        # Chocolatey not installed
    }
    
    try {
        Write-Info "Installing Chocolatey..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Write-Success "Chocolatey installed successfully"
    } catch {
        Write-Error "Failed to install Chocolatey: $_"
        exit 1
    }
}

# Install Docker Desktop
function Install-DockerDesktop {
    Write-Header "Installing Docker Desktop"
    
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion -and -not $Force) {
            Write-Success "Docker already installed: $dockerVersion"
            return
        }
    } catch {
        # Docker not installed
    }
    
    try {
        Write-Info "Installing Docker Desktop via Chocolatey..."
        choco install docker-desktop -y
        
        Write-Success "Docker Desktop installed successfully"
        Write-Warning "Please restart your computer and start Docker Desktop before continuing"
        
        # Check if Docker Desktop is running
        $dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
        if (-not $dockerProcess) {
            Write-Info "Starting Docker Desktop..."
            Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
            Write-Info "Waiting for Docker Desktop to start..."
            
            $timeout = 60
            $elapsed = 0
            while ($elapsed -lt $timeout) {
                try {
                    docker version 2>$null
                    Write-Success "Docker Desktop is running"
                    break
                } catch {
                    Start-Sleep -Seconds 5
                    $elapsed += 5
                    Write-Host "." -NoNewline
                }
            }
            
            if ($elapsed -ge $timeout) {
                Write-Warning "Docker Desktop startup timed out. Please start it manually."
            }
        }
    } catch {
        Write-Error "Failed to install Docker Desktop: $_"
        Write-Info "Please install Docker Desktop manually from https://www.docker.com/products/docker-desktop"
    }
}

# Install Node.js and pnpm
function Install-NodeJS {
    Write-Header "Installing Node.js and pnpm"
    
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion -and -not $Force) {
            Write-Success "Node.js already installed: $nodeVersion"
        } else {
            Write-Info "Installing Node.js via Chocolatey..."
            choco install nodejs -y
            
            # Refresh environment variables
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            Write-Success "Node.js installed successfully"
        }
    } catch {
        Write-Error "Failed to install Node.js: $_"
    }
    
    try {
        $pnpmVersion = pnpm --version 2>$null
        if ($pnpmVersion -and -not $Force) {
            Write-Success "pnpm already installed: v$pnpmVersion"
        } else {
            Write-Info "Installing pnpm..."
            npm install -g pnpm
            Write-Success "pnpm installed successfully"
        }
    } catch {
        Write-Error "Failed to install pnpm: $_"
    }
}

# Install VS Code and extensions
function Install-VSCode {
    Write-Header "Installing Visual Studio Code"
    
    try {
        $codeVersion = code --version 2>$null
        if ($codeVersion -and -not $Force) {
            Write-Success "VS Code already installed"
        } else {
            Write-Info "Installing VS Code via Chocolatey..."
            choco install vscode -y
            
            # Refresh environment variables
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            Write-Success "VS Code installed successfully"
        }
        
        # Install useful extensions
        Write-Info "Installing VS Code extensions..."
        $extensions = @(
            "ms-vscode.vscode-typescript-next",
            "bradlc.vscode-tailwindcss",
            "esbenp.prettier-vscode",
            "ms-vscode.vscode-eslint",
            "ms-vscode-remote.remote-containers",
            "ms-azuretools.vscode-docker",
            "formulahendry.auto-rename-tag",
            "christian-kohler.path-intellisense",
            "ms-vscode.vscode-json"
        )
        
        foreach ($extension in $extensions) {
            try {
                code --install-extension $extension --force
                Write-Success "Installed extension: $extension"
            } catch {
                Write-Warning "Failed to install extension: $extension"
            }
        }
    } catch {
        Write-Error "Failed to install VS Code: $_"
    }
}

# Generate SSL certificates for development
function Generate-SSLCertificates {
    Write-Header "Generating SSL Certificates for Development"
    
    $certDir = ".\certs"
    if (-not (Test-Path $certDir)) {
        New-Item -ItemType Directory -Path $certDir -Force | Out-Null
    }
    
    try {
        # Check if OpenSSL is available
        $opensslVersion = openssl version 2>$null
        if (-not $opensslVersion) {
            Write-Info "Installing OpenSSL via Chocolatey..."
            choco install openssl -y
            
            # Refresh environment variables
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        }
        
        # Generate private key
        Write-Info "Generating private key..."
        openssl genrsa -out "$certDir\localhost.key" 2048
        
        # Generate certificate signing request
        Write-Info "Generating certificate signing request..."
        $subject = "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        openssl req -new -key "$certDir\localhost.key" -out "$certDir\localhost.csr" -subj $subject
        
        # Generate self-signed certificate
        Write-Info "Generating self-signed certificate..."
        openssl x509 -req -days 365 -in "$certDir\localhost.csr" -signkey "$certDir\localhost.key" -out "$certDir\localhost.crt"
        
        Write-Success "SSL certificates generated in $certDir"
        Write-Warning "Remember to trust the certificate in your browser for HTTPS development"
        
    } catch {
        Write-Error "Failed to generate SSL certificates: $_"
        Write-Info "You can generate certificates manually or use mkcert tool"
    }
}

# Setup Windows-specific configurations
function Setup-WindowsConfiguration {
    Write-Header "Configuring Windows Environment"
    
    try {
        # Enable Windows Subsystem for Linux (optional)
        $wslFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
        if ($wslFeature.State -eq "Disabled") {
            $installWSL = Read-Host "Install Windows Subsystem for Linux? (y/N)"
            if ($installWSL -eq "y") {
                Write-Info "Enabling WSL..."
                Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -NoRestart
                Write-Success "WSL enabled (restart required)"
            }
        }
        
        # Configure Windows Defender exclusions for better performance
        Write-Info "Configuring Windows Defender exclusions..."
        try {
            Add-MpPreference -ExclusionPath (Get-Location).Path
            Add-MpPreference -ExclusionPath "$env:USERPROFILE\.docker"
            Add-MpPreference -ExclusionPath "$env:ProgramData\Docker"
            Write-Success "Windows Defender exclusions added"
        } catch {
            Write-Warning "Could not add Windows Defender exclusions (requires admin rights)"
        }
        
        # Set PowerShell execution policy
        Write-Info "Setting PowerShell execution policy..."
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-Success "PowerShell execution policy updated"
        
    } catch {
        Write-Warning "Some Windows configurations could not be applied: $_"
    }
}

# Verify installation
function Test-Installation {
    Write-Header "Verifying Installation"
    
    $checks = @(
        @{ Name = "Chocolatey"; Command = "choco --version" },
        @{ Name = "Docker"; Command = "docker --version" },
        @{ Name = "Docker Compose"; Command = "docker-compose --version" },
        @{ Name = "Node.js"; Command = "node --version" },
        @{ Name = "npm"; Command = "npm --version" },
        @{ Name = "pnpm"; Command = "pnpm --version" },
        @{ Name = "VS Code"; Command = "code --version" }
    )
    
    $allPassed = $true
    
    foreach ($check in $checks) {
        try {
            $result = Invoke-Expression $check.Command 2>$null
            if ($result) {
                Write-Success "$($check.Name): $($result.Split("`n")[0])"
            } else {
                Write-Error "$($check.Name): Not found"
                $allPassed = $false
            }
        } catch {
            Write-Error "$($check.Name): Not found"
            $allPassed = $false
        }
    }
    
    if ($allPassed) {
        Write-Success "All tools installed successfully!"
    } else {
        Write-Warning "Some tools are missing. Please check the installation."
    }
    
    # Test Docker
    try {
        Write-Info "Testing Docker..."
        docker run --rm hello-world 2>$null | Out-Null
        Write-Success "Docker is working correctly"
    } catch {
        Write-Warning "Docker test failed. Make sure Docker Desktop is running."
    }
}

# Main execution
function Main {
    Write-Header "Djobea Analytics - Windows Environment Setup"
    Write-Info "This script will install development tools for Windows"
    Write-Host ""
    
    if ($All) {
        $Chocolatey = $true
        $Docker = $true
        $NodeJS = $true
        $SSL = $true
        $VSCode = $true
    }
    
    if ($Chocolatey -or $All) {
        Install-Chocolatey
    }
    
    if ($Docker -or $All) {
        Install-DockerDesktop
    }
    
    if ($NodeJS -or $All) {
        Install-NodeJS
    }
    
    if ($VSCode -or $All) {
        Install-VSCode
    }
    
    if ($SSL -or $All) {
        Generate-SSLCertificates
    }
    
    if ($All) {
        Setup-WindowsConfiguration
    }
    
    Test-Installation
    
    Write-Header "Setup Complete!"
    Write-Success "Your Windows development environment is ready for Djobea Analytics"
    Write-Info "Next steps:"
    Write-Info "1. Restart your computer if Docker was installed"
    Write-Info "2. Start Docker Desktop"
    Write-Info "3. Run: .\scripts\deploy-windows.ps1 dev"
    Write-Host ""
}

# Execute main function
try {
    Main
} catch {
    Write-Error "Setup failed: $_"
    exit 1
}
