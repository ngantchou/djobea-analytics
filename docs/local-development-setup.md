# 🚀 Guide de Configuration - Développement Local

Ce guide vous explique comment configurer et lancer le projet Djobea Analytics en développement local.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18.0.0 ou supérieure)
- **npm** (version 8.0.0 ou supérieure) 
- **Docker** et **Docker Compose** (optionnel, pour la base de données)
- **Git**

### Vérification des versions

\`\`\`bash
node --version  # doit être >= 18.0.0
npm --version   # doit être >= 8.0.0
docker --version
docker-compose --version
\`\`\`

## 🛠️ Installation

### 1. Cloner le projet

\`\`\`bash
git clone https://github.com/votre-username/djobea-analytics.git
cd djobea-analytics
\`\`\`

### 2. Installer les dépendances

\`\`\`bash
npm install
\`\`\`

### 3. Configuration de l'environnement

Copiez le fichier d'exemple et configurez vos variables :

\`\`\`bash
cp .env.example .env.local
\`\`\`

Éditez `.env.local` avec vos valeurs :

\`\`\`bash
# Configuration minimale pour le développement
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_WS_PORT=3001

# JWT Secret (générez une clé forte)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Features (activez selon vos besoins)
ENABLE_AI_PREDICTIONS=true
ENABLE_GEOLOCATION=true
ENABLE_REALTIME=true
ENABLE_WHATSAPP=false

# Google Maps (optionnel)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
\`\`\`

## 🗄️ Configuration de la Base de Données

### Option 1 : Avec Docker (Recommandé)

Lancez PostgreSQL et Redis avec Docker :

\`\`\`bash
# Démarrer les services de base de données
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up postgres redis -d

# Vérifier que les services sont actifs
docker-compose ps
\`\`\`

Ajoutez à votre `.env.local` :

\`\`\`bash
DATABASE_URL=postgresql://djobea_user:dev_password@localhost:5432/djobea
REDIS_URL=redis://localhost:6379
\`\`\`

### Option 2 : Installation locale

Si vous préférez installer PostgreSQL et Redis localement :

#### PostgreSQL

\`\`\`bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS avec Homebrew
brew install postgresql
brew services start postgresql

# Créer la base de données
sudo -u postgres createdb djobea
sudo -u postgres createuser djobea_user
sudo -u postgres psql -c "ALTER USER djobea_user WITH PASSWORD 'dev_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE djobea TO djobea_user;"
\`\`\`

#### Redis

\`\`\`bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server

# macOS avec Homebrew
brew install redis
brew services start redis
\`\`\`

### 3. Initialiser la base de données

\`\`\`bash
# Exécuter les migrations
npm run setup:db

# Ou manuellement
npm run migrate
npm run seed
\`\`\`

## 🚀 Lancement du Projet

### Développement simple

\`\`\`bash
npm run dev
\`\`\`

L'application sera accessible sur : http://localhost:3000

### Développement avec Docker

\`\`\`bash
# Lancer tous les services en mode développement
make dev

# Ou avec docker-compose
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
\`\`\`

### Services disponibles

- **Application** : http://localhost:3000
- **API** : http://localhost:3000/api
- **Base de données** : localhost:5432
- **Redis** : localhost:6379

## 🧪 Tests et Vérifications

### Lancer les tests

\`\`\`bash
# Tests unitaires
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage
\`\`\`

### Vérifier la santé de l'application

\`\`\`bash
# Vérifier l'API
curl http://localhost:3000/api/health

# Ou dans le navigateur
open http://localhost:3000/api/health
\`\`\`

### Vérifier la base de données

\`\`\`bash
# Se connecter à PostgreSQL
docker-compose exec postgres psql -U djobea_user -d djobea

# Lister les tables
\dt

# Quitter
\q
\`\`\`

## 🛠️ Commandes Utiles

### Scripts npm disponibles

\`\`\`bash
npm run dev          # Démarrage en mode développement
npm run build        # Construction pour production
npm run start        # Démarrage en mode production
npm run lint         # Vérification du code
npm run type-check   # Vérification TypeScript
npm test             # Tests unitaires
npm run setup:db     # Configuration base de données
npm run migrate      # Migrations
npm run seed         # Données de test
\`\`\`

### Commandes Docker

\`\`\`bash
# Démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Reconstruire les images
docker-compose build --no-cache
\`\`\`

### Commandes Make (si disponible)

\`\`\`bash
make help           # Voir toutes les commandes
make dev            # Mode développement
make build          # Construction
make test           # Tests
make clean          # Nettoyage
\`\`\`

## 🔧 Configuration Avancée

### Variables d'environnement complètes

\`\`\`bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://djobea_user:dev_password@localhost:5432/djobea
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
SESSION_SECRET=your-session-secret-key
SESSION_TIMEOUT=86400

# Features
ENABLE_AI_PREDICTIONS=true
ENABLE_GEOLOCATION=true
ENABLE_REALTIME=true
ENABLE_WHATSAPP=false
ENABLE_NOTIFICATIONS=true

# External Services
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
OPENAI_API_KEY=your_openai_api_key

# Development
NODE_ENV=development
DEBUG=true
VERBOSE_LOGGING=true
NEXT_TELEMETRY_DISABLED=1
\`\`\`

### Configuration VS Code

Créez `.vscode/settings.json` :

\`\`\`json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "node_modules": true,
    ".next": true,
    "dist": true
  }
}
\`\`\`

### Extensions VS Code recommandées

\`\`\`json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
\`\`\`

## 🐛 Dépannage

### Problèmes courants

#### Port déjà utilisé

\`\`\`bash
# Trouver le processus utilisant le port 3000
lsof -i :3000

# Tuer le processus
kill -9 <PID>
\`\`\`

#### Problèmes de base de données

\`\`\`bash
# Réinitialiser la base de données
docker-compose down -v
docker-compose up postgres redis -d
npm run setup:db
\`\`\`

#### Problèmes de cache

\`\`\`bash
# Nettoyer le cache Next.js
rm -rf .next

# Nettoyer node_modules
rm -rf node_modules
npm install
\`\`\`

#### Problèmes Docker

\`\`\`bash
# Nettoyer Docker
docker system prune -f
docker-compose down -v
docker-compose build --no-cache
\`\`\`

### Logs de débogage

\`\`\`bash
# Logs de l'application
npm run dev -- --debug

# Logs Docker
docker-compose logs -f djobea-app

# Logs base de données
docker-compose logs -f postgres
\`\`\`

## 📚 Structure du Projet

\`\`\`
djobea-analytics/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # Routes API
│   ├── analytics/         # Page analytics
│   ├── settings/          # Pages paramètres
│   └── layout.tsx         # Layout principal
├── components/            # Composants React
│   ├── ui/               # Composants UI de base
│   ├── features/         # Composants métier
│   └── layouts/          # Layouts
├── hooks/                # Hooks personnalisés
├── lib/                  # Utilitaires et configuration
├── store/                # État global (Zustand)
├── types/                # Types TypeScript
├── public/               # Fichiers statiques
├── docs/                 # Documentation
├── scripts/              # Scripts utilitaires
└── docker-compose.yml    # Configuration Docker
\`\`\`

## 🔄 Workflow de Développement

### 1. Créer une nouvelle fonctionnalité

\`\`\`bash
# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Développer...
# Tester...

# Commit
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"

# Push
git push origin feature/nouvelle-fonctionnalite
\`\`\`

### 2. Tests avant commit

\`\`\`bash
# Vérifications automatiques
npm run lint
npm run type-check
npm test
npm run build
\`\`\`

### 3. Mise à jour des dépendances

\`\`\`bash
# Vérifier les mises à jour
npm outdated

# Mettre à jour
npm update

# Audit de sécurité
npm audit
npm audit fix
\`\`\`

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** : `docker-compose logs -f`
2. **Consultez la documentation** : `/docs`
3. **Vérifiez les issues** : GitHub Issues
4. **Contactez l'équipe** : support@djobea.com

## 🎯 Prochaines Étapes

Une fois le projet configuré :

1. **Explorez l'interface** : http://localhost:3000
2. **Testez les APIs** : http://localhost:3000/api-docs
3. **Consultez les exemples** : `/docs/examples`
4. **Lisez la documentation** : `/docs`

Bon développement ! 🚀
\`\`\`

```shellscript file="scripts/dev-setup.sh"
#!/bin/bash

# 🚀 Script de Configuration Développement - Djobea Analytics
# Ce script automatise la configuration du projet en développement local

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_NODE="18.0.0"
    
    if ! printf '%s\n%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V -C; then
        log_error "Node.js version $NODE_VERSION détectée. Version $REQUIRED_NODE ou supérieure requise."
        exit 1
    fi
    
    log_success "Node.js version $NODE_VERSION ✓"
    
    # npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé."
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    log_success "npm version $NPM_VERSION ✓"
    
    # Docker (optionnel)
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        log_success "Docker version $DOCKER_VERSION ✓"
        
        if command -v docker-compose &> /dev/null; then
            COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
            log_success "Docker Compose version $COMPOSE_VERSION ✓"
        else
            log_warning "Docker Compose n'est pas installé (optionnel)"
        fi
    else
        log_warning "Docker n'est pas installé (optionnel pour la base de données)"
    fi
}

# Installation des dépendances
install_dependencies() {
    log_info "Installation des dépendances npm..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    log_success "Dépendances installées"
}

# Configuration de l'environnement
setup_environment() {
    log_info "Configuration de l'environnement..."
    
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            log_success "Fichier .env.local créé depuis .env.example"
        else
            log_warning "Fichier .env.example non trouvé, création d'un .env.local minimal"
            cat > .env.local &lt;&lt; EOF
# Configuration développement - Djobea Analytics
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_WS_PORT=3001

# JWT Secret (changez cette valeur en production)
JWT_SECRET=dev-secret-key-change-in-production-minimum-32-chars

# Features
ENABLE_AI_PREDICTIONS=true
ENABLE_GEOLOCATION=true
ENABLE_REALTIME=true
ENABLE_WHATSAPP=false

# Base de données (Docker)
DATABASE_URL=postgresql://djobea_user:dev_password@localhost:5432/djobea
REDIS_URL=redis://localhost:6379

# Debug
DEBUG=true
VERBOSE_LOGGING=true
NEXT_TELEMETRY_DISABLED=1
EOF
        fi
    else
        log_info "Fichier .env.local existe déjà"
    fi
    
    log_warning "N'oubliez pas de configurer vos variables d'environnement dans .env.local"
}

# Configuration Docker
setup_docker() {
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        log_info "Configuration des services Docker..."
        
        # Vérifier si les services sont déjà en cours d'exécution
        if docker-compose ps | grep -q "Up"; then
            log_info "Services Docker déjà en cours d'exécution"
        else
            log_info "Démarrage des services de base de données..."
            docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres redis
            
            # Attendre que les services soient prêts
            log_info "Attente du démarrage des services..."
            sleep 10
            
            # Vérifier la santé des services
            if docker-compose exec postgres pg_isready -U djobea_user -d djobea &> /dev/null; then
                log_success "PostgreSQL est prêt"
            else
                log_warning "PostgreSQL n'est pas encore prêt, cela peut prendre quelques secondes"
            fi
            
            if docker-compose exec redis redis-cli ping &> /dev/null; then
                log_success "Redis est prêt"
            else
                log_warning "Redis n'est pas encore prêt"
            fi
        fi
    else
        log_warning "Docker non disponible, vous devrez configurer PostgreSQL et Redis manuellement"
    fi
}

# Configuration de la base de données
setup_database() {
    log_info "Configuration de la base de données..."
    
    # Vérifier si la base de données est accessible
    if command -v docker &> /dev/null; then
        if docker-compose exec postgres pg_isready -U djobea_user -d djobea &> /dev/null; then
            log_info "Exécution des migrations..."
            npm run setup:db || {
                log_warning "Échec des migrations automatiques, vous devrez les exécuter manuellement"
            }
        else
            log_warning "Base de données non accessible, migrations ignorées"
        fi
    else
        log_warning "Docker non disponible, migrations ignorées"
    fi
}

# Configuration VS Code
setup_vscode() {
    if [ -d ".vscode" ] || command -v code &> /dev/null; then
        log_info "Configuration VS Code..."
        
        mkdir -p .vscode
        
        # Settings
        cat > .vscode/settings.json &lt;&lt; EOF
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "node_modules": true,
    ".next": true,
    "dist": true
  },
  "search.exclude": {
    "node_modules": true,
    ".next": true,
    "dist": true
  }
}
EOF
        
        # Extensions recommandées
        cat > .vscode/extensions.json &lt;&lt; EOF
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
EOF
        
        log_success "Configuration VS Code créée"
    fi
}

# Tests de vérification
run_tests() {
    log_info "Exécution des tests de vérification..."
    
    # Vérification TypeScript
    if npm run type-check &> /dev/null; then
        log_success "Vérification TypeScript ✓"
    else
        log_warning "Erreurs TypeScript détectées"
    fi
    
    # Linting
    if npm run lint &> /dev/null; then
        log_success "Linting ✓"
    else
        log_warning "Erreurs de linting détectées"
    fi
    
    # Build test
    log_info "Test de construction..."
    if npm run build &> /dev/null; then
        log_success "Construction réussie ✓"
        rm -rf .next  # Nettoyer après le test
    else
        log_warning "Échec de la construction"
    fi
}

# Affichage des informations finales
show_final_info() {
    echo ""
    log_success "🎉 Configuration terminée !"
    echo ""
    log_info "Prochaines étapes :"
    echo "  1. Configurez vos variables d'environnement dans .env.local"
    echo "  2. Lancez le serveur de développement : npm run dev"
    echo "  3. Ouvrez http://localhost:3000 dans votre navigateur"
    echo ""
    log_info "Commandes utiles :"
    echo "  npm run dev          - Démarrer en mode développement"
    echo "  npm run build        - Construire pour la production"
    echo "  npm test             - Exécuter les tests"
    echo "  npm run lint         - Vérifier le code"
    echo "  make dev             - Démarrer avec Docker"
    echo "  make help            - Voir toutes les commandes Make"
    echo ""
    log_info "Documentation :"
    echo "  docs/local-development-setup.md - Guide complet"
    echo "  docs/api-documentation.md       - Documentation API"
    echo ""
}

# Menu interactif
interactive_setup() {
    echo ""
    log_info "🚀 Configuration Interactive - Djobea Analytics"
    echo ""
    
    read -p "Voulez-vous installer les dépendances npm ? (y/N): " install_deps
    read -p "Voulez-vous configurer l'environnement ? (y/N): " setup_env
    read -p "Voulez-vous démarrer les services Docker ? (y/N): " setup_dock
    read -p "Voulez-vous configurer la base de données ? (y/N): " setup_db
    read -p "Voulez-vous configurer VS Code ? (y/N): " setup_vs
    read -p "Voulez-vous exécuter les tests ? (y/N): " run_test
    
    echo ""
    
    if [[ $install_deps =~ ^[Yy]$ ]]; then
        install_dependencies
    fi
    
    if [[ $setup_env =~ ^[Yy]$ ]]; then
        setup_environment
    fi
    
    if [[ $setup_dock =~ ^[Yy]$ ]]; then
        setup_docker
    fi
    
    if [[ $setup_db =~ ^[Yy]$ ]]; then
        setup_database
    fi
    
    if [[ $setup_vs =~ ^[Yy]$ ]]; then
        setup_vscode
    fi
    
    if [[ $run_test =~ ^[Yy]$ ]]; then
        run_tests
    fi
}

# Script principal
main() {
    echo ""
    log_info "🚀 Script de Configuration - Djobea Analytics"
    echo ""
    
    check_prerequisites
    
    if [ "$1" = "--interactive" ] || [ "$1" = "-i" ]; then
        interactive_setup
    else
        install_dependencies
        setup_environment
        setup_docker
        setup_database
        setup_vscode
        run_tests
    fi
    
    show_final_info
}

# Gestion des arguments
case "$1" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --interactive, -i    Mode interactif"
        echo "  --help, -h          Afficher cette aide"
        echo ""
        echo "Ce script configure automatiquement le projet Djobea Analytics"
        echo "pour le développement local."
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
