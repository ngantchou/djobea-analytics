param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment,
    
    [switch]$SkipTests,
    [switch]$Force,
    [switch]$DryRun,
    [switch]$Help
)

# Configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Couleurs pour l'affichage
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Show-Help {
    Write-ColorOutput "=== Djobea Analytics - Script de Déploiement ===" "Header"
    Write-Host ""
    Write-ColorOutput "UTILISATION:" "Info"
    Write-Host "  .\scripts\deploy-windows.ps1 -Environment <env> [options]"
    Write-Host ""
    Write-ColorOutput "ENVIRONNEMENTS:" "Info"
    Write-Host "  dev      - Environnement de développement"
    Write-Host "  staging  - Environnement de test"
    Write-Host "  prod     - Environnement de production"
    Write-Host ""
    Write-ColorOutput "OPTIONS:" "Info"
    Write-Host "  -SkipTests    Ignorer les tests"
    Write-Host "  -Force        Forcer le déploiement"
    Write-Host "  -DryRun       Simulation sans exécution"
    Write-Host "  -Help         Afficher cette aide"
    Write-Host ""
    Write-ColorOutput "EXEMPLES:" "Info"
    Write-Host "  .\scripts\deploy-windows.ps1 dev"
    Write-Host "  .\scripts\deploy-windows.ps1 prod -Force"
    Write-Host "  .\scripts\deploy-windows.ps1 staging -SkipTests -DryRun"
}

function Test-Prerequisites {
    Write-ColorOutput "🔍 Vérification des prérequis..." "Info"
    
    $prerequisites = @(
        @{ Name = "Node.js"; Command = "node --version"; MinVersion = "18.0.0" },
        @{ Name = "npm"; Command = "npm --version"; MinVersion = "8.0.0" },
        @{ Name = "Docker"; Command = "docker --version"; MinVersion = "20.0.0" },
        @{ Name = "Git"; Command = "git --version"; MinVersion = "2.30.0" }
    )
    
    $allGood = $true
    
    foreach ($prereq in $prerequisites) {
        try {
            $version = Invoke-Expression $prereq.Command 2>$null
            if ($version) {
                Write-ColorOutput "  ✅ $($prereq.Name): $version" "Success"
            } else {
                Write-ColorOutput "  ❌ $($prereq.Name): Non installé" "Error"
                $allGood = $false
            }
        } catch {
            Write-ColorOutput "  ❌ $($prereq.Name): Non disponible" "Error"
            $allGood = $false
        }
    }
    
    if (-not $allGood) {
        throw "Certains prérequis ne sont pas satisfaits"
    }
}

function Install-Dependencies {
    Write-ColorOutput "📦 Installation des dépendances..." "Info"
    
    if ($DryRun) {
        Write-ColorOutput "  [DRY RUN] npm ci" "Warning"
        return
    }
    
    try {
        npm ci --silent
        Write-ColorOutput "  ✅ Dépendances installées" "Success"
    } catch {
        throw "Échec de l'installation des dépendances: $_"
    }
}

function Run-Tests {
    if ($SkipTests) {
        Write-ColorOutput "⏭️  Tests ignorés" "Warning"
        return
    }
    
    Write-ColorOutput "🧪 Exécution des tests..." "Info"
    
    if ($DryRun) {
        Write-ColorOutput "  [DRY RUN] npm test" "Warning"
        return
    }
    
    try {
        npm test
        Write-ColorOutput "  ✅ Tous les tests passent" "Success"
    } catch {
        if (-not $Force) {
            throw "Tests échoués. Utilisez -Force pour continuer: $_"
        }
        Write-ColorOutput "  ⚠️  Tests échoués mais déploiement forcé" "Warning"
    }
}

function Build-Application {
    Write-ColorOutput "🏗️  Construction de l'application..." "Info"
    
    # Configuration des variables d'environnement
    $envVars = @{
        "dev" = @{
            "NODE_ENV" = "development"
            "NEXT_PUBLIC_API_URL" = "http://localhost:3000/api"
            "NEXT_PUBLIC_APP_URL" = "http://localhost:3000"
        }
        "staging" = @{
            "NODE_ENV" = "production"
            "NEXT_PUBLIC_API_URL" = "https://djobea-analytics-staging.vercel.app/api"
            "NEXT_PUBLIC_APP_URL" = "https://djobea-analytics-staging.vercel.app"
        }
        "prod" = @{
            "NODE_ENV" = "production"
            "NEXT_PUBLIC_API_URL" = "https://djobea-analytics.vercel.app/api"
            "NEXT_PUBLIC_APP_URL" = "https://djobea-analytics.vercel.app"
        }
    }
    
    # Définir les variables d'environnement
    foreach ($var in $envVars[$Environment].GetEnumerator()) {
        $env:($var.Key) = $var.Value
        Write-ColorOutput "  📝 $($var.Key) = $($var.Value)" "Info"
    }
    
    if ($DryRun) {
        Write-ColorOutput "  [DRY RUN] npm run build" "Warning"
        return
    }
    
    try {
        npm run build
        Write-ColorOutput "  ✅ Application construite avec succès" "Success"
    } catch {
        throw "Échec de la construction: $_"
    }
}

function Deploy-ToEnvironment {
    Write-ColorOutput "🚀 Déploiement vers $Environment..." "Info"
    
    switch ($Environment) {
        "dev" {
            Deploy-Development
        }
        "staging" {
            Deploy-Staging
        }
        "prod" {
            Deploy-Production
        }
    }
}

function Deploy-Development {
    Write-ColorOutput "  🔧 Déploiement en développement..." "Info"
    
    if ($DryRun) {
        Write-ColorOutput "  [DRY RUN] Démarrage du serveur de développement" "Warning"
        return
    }
    
    try {
        # Démarrer le serveur de développement
        Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow
        Write-ColorOutput "  ✅ Serveur de développement démarré sur http://localhost:3000" "Success"
    } catch {
        throw "Échec du déploiement en développement: $_"
    }
}

function Deploy-Staging {
    Write-ColorOutput "  🎭 Déploiement en staging..." "Info"
    
    if ($DryRun) {
        Write-ColorOutput "  [DRY RUN] Déploiement Docker staging" "Warning"
        return
    }
    
    try {
        # Construction de l'image Docker
        docker build -t djobea-analytics:staging -f Dockerfile.dev .
        
        # Arrêt du conteneur existant s'il existe
        docker stop djobea-analytics-staging 2>$null
        docker rm djobea-analytics-staging 2>$null
        
        # Démarrage du nouveau conteneur
        docker run -d --name djobea-analytics-staging -p 3001:3000 djobea-analytics:staging
        
        Write-ColorOutput "  ✅ Application déployée en staging sur http://localhost:3001" "Success"
    } catch {
        throw "Échec du déploiement en staging: $_"
    }
}

function Deploy-Production {
    Write-ColorOutput "  🏭 Déploiement en production..." "Info"
    
    if (-not $Force) {
        $confirmation = Read-Host "⚠️  Êtes-vous sûr de vouloir déployer en PRODUCTION? (oui/non)"
        if ($confirmation -ne "oui") {
            Write-ColorOutput "  ❌ Déploiement annulé" "Warning"
            return
        }
    }
    
    if ($DryRun) {
        Write-ColorOutput "  [DRY RUN] Déploiement Vercel production" "Warning"
        return
    }
    
    try {
        # Vérifier si Vercel CLI est installé
        $vercelVersion = vercel --version 2>$null
        if (-not $vercelVersion) {
            Write-ColorOutput "  📦 Installation de Vercel CLI..." "Info"
            npm install -g vercel
        }
        
        # Déploiement sur Vercel
        vercel --prod --yes
        
        Write-ColorOutput "  ✅ Application déployée en production" "Success"
        Write-ColorOutput "  🌐 URL: https://djobea-analytics.vercel.app" "Info"
    } catch {
        throw "Échec du déploiement en production: $_"
    }
}

function Run-PostDeploymentTests {
    Write-ColorOutput "🔍 Tests post-déploiement..." "Info"
    
    $urls = @{
        "dev" = "http://localhost:3000"
        "staging" = "http://localhost:3001"
        "prod" = "https://djobea-analytics.vercel.app"
    }
    
    $url = $urls[$Environment]
    
    if ($DryRun) {
        Write-ColorOutput "  [DRY RUN] Test de santé sur $url" "Warning"
        return
    }
    
    try {
        # Attendre que l'application soit prête
        Start-Sleep -Seconds 10
        
        # Test de santé
        $response = Invoke-WebRequest -Uri "$url/api/health" -TimeoutSec 30 -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-ColorOutput "  ✅ Application accessible et fonctionnelle" "Success"
        } else {
            Write-ColorOutput "  ⚠️  Application accessible mais statut: $($response.StatusCode)" "Warning"
        }
    } catch {
        Write-ColorOutput "  ❌ Échec du test de santé: $_" "Error"
        if (-not $Force) {
            throw "Tests post-déploiement échoués"
        }
    }
}

function Send-Notification {
    Write-ColorOutput "📢 Envoi des notifications..." "Info"
    
    $message = @{
        "dev" = "🔧 Déploiement développement terminé"
        "staging" = "🎭 Déploiement staging terminé"
        "prod" = "🏭 Déploiement production terminé ✅"
    }
    
    $deploymentInfo = @{
        Environment = $Environment
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Version = (Get-Content "package.json" | ConvertFrom-Json).version
        User = $env:USERNAME
        Machine = $env:COMPUTERNAME
    }
    
    Write-ColorOutput "  📋 Informations de déploiement:" "Info"
    $deploymentInfo.GetEnumerator() | ForEach-Object {
        Write-ColorOutput "    $($_.Key): $($_.Value)" "Info"
    }
    
    # Ici, vous pourriez ajouter l'envoi vers Slack, Teams, etc.
    if ($DryRun) {
        Write-ColorOutput "  [DRY RUN] Notification envoyée" "Warning"
    } else {
        Write-ColorOutput "  ✅ $($message[$Environment])" "Success"
    }
}

function Cleanup {
    Write-ColorOutput "🧹 Nettoyage..." "Info"
    
    if ($DryRun) {
        Write-ColorOutput "  [DRY RUN] Nettoyage des fichiers temporaires" "Warning"
        return
    }
    
    try {
        # Nettoyage des fichiers temporaires
        if (Test-Path ".next") {
            Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        # Nettoyage Docker pour staging/prod
        if ($Environment -ne "dev") {
            docker system prune -f 2>$null
        }
        
        Write-ColorOutput "  ✅ Nettoyage terminé" "Success"
    } catch {
        Write-ColorOutput "  ⚠️  Erreur lors du nettoyage: $_" "Warning"
    }
}

# === SCRIPT PRINCIPAL ===

try {
    if ($Help) {
        Show-Help
        exit 0
    }
    
    Write-ColorOutput "=== DJOBEA ANALYTICS - DÉPLOIEMENT ===" "Header"
    Write-ColorOutput "Environnement: $Environment" "Info"
    Write-ColorOutput "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Info"
    
    if ($DryRun) {
        Write-ColorOutput "⚠️  MODE SIMULATION ACTIVÉ" "Warning"
    }
    
    Write-Host ""
    
    # Étapes du déploiement
    Test-Prerequisites
    Install-Dependencies
    Run-Tests
    Build-Application
    Deploy-ToEnvironment
    Run-PostDeploymentTests
    Send-Notification
    Cleanup
    
    Write-Host ""
    Write-ColorOutput "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!" "Success"
    Write-ColorOutput "Environnement: $Environment" "Info"
    Write-ColorOutput "Durée: $((Get-Date) - $startTime)" "Info"
    
} catch {
    Write-Host ""
    Write-ColorOutput "❌ ÉCHEC DU DÉPLOIEMENT" "Error"
    Write-ColorOutput "Erreur: $_" "Error"
    Write-Host ""
    Write-ColorOutput "💡 Conseils de dépannage:" "Info"
    Write-ColorOutput "  1. Vérifiez les prérequis avec -Help" "Info"
    Write-ColorOutput "  2. Utilisez -DryRun pour simuler" "Info"
    Write-ColorOutput "  3. Utilisez -Force pour ignorer les erreurs" "Info"
    Write-ColorOutput "  4. Consultez les logs détaillés ci-dessus" "Info"
    
    exit 1
}
