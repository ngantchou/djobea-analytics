#!/bin/bash

# Djobea Analytics Frontend - Environment Setup Script
# This script sets up the environment for different deployment stages

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Environment configurations
setup_development() {
    log "Setting up development environment..."
    
    cat > .env.local << EOF
# Development Environment Configuration
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development flags
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_ENABLE_DEVTOOLS=true

# API Configuration
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_RETRIES=3

# Feature flags for development
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CHAT=true

# Logging
NEXT_PUBLIC_LOG_LEVEL=debug
EOF

    success "Development environment configured"
    log "Backend API expected at: http://localhost:5000"
    log "Frontend will run at: http://localhost:3000"
}

setup_staging() {
    log "Setting up staging environment..."
    
    cat > .env.staging << EOF
# Staging Environment Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api-staging.djobea.com
NEXT_PUBLIC_APP_URL=https://staging.djobea.com

# Staging flags
NEXT_PUBLIC_DEBUG=false
NEXT_PUBLIC_ENABLE_DEVTOOLS=false

# API Configuration
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_API_RETRIES=2

# Feature flags for staging
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CHAT=true

# Logging
NEXT_PUBLIC_LOG_LEVEL=info

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=staging-analytics-id
EOF

    success "Staging environment configured"
    log "Update the URLs to match your actual staging environment"
}

setup_production() {
    log "Setting up production environment..."
    
    cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.djobea.com
NEXT_PUBLIC_APP_URL=https://app.djobea.com

# Production flags
NEXT_PUBLIC_DEBUG=false
NEXT_PUBLIC_ENABLE_DEVTOOLS=false

# API Configuration
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_API_RETRIES=2

# Feature flags for production
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CHAT=true

# Logging
NEXT_PUBLIC_LOG_LEVEL=error

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=production-analytics-id

# Security
NEXT_PUBLIC_SECURE_COOKIES=true
NEXT_PUBLIC_HTTPS_ONLY=true
EOF

    success "Production environment configured"
    warning "Update the URLs to match your actual production environment"
    warning "Replace placeholder analytics ID with your real ID"
}

create_env_template() {
    log "Creating environment template..."
    
    cat > .env.example << EOF
# Djobea Analytics Frontend - Environment Variables Template
# Copy this file to .env.local for development

# Environment
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Settings
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_RETRIES=3

# Development Settings
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_ENABLE_DEVTOOLS=true

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CHAT=true

# Logging
NEXT_PUBLIC_LOG_LEVEL=debug

# Optional: Analytics
# NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Optional: External Services
# NEXT_PUBLIC_MAPS_API_KEY=your-maps-api-key
# NEXT_PUBLIC_NOTIFICATION_SERVICE_URL=your-notification-service-url
EOF

    success "Environment template created (.env.example)"
}

setup_docker_env() {
    log "Setting up Docker environment files..."
    
    # Development Docker environment
    cat > .env.docker.dev << EOF
# Docker Development Environment
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://backend:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Docker-specific settings
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_LOG_LEVEL=debug
EOF

    # Production Docker environment
    cat > .env.docker.prod << EOF
# Docker Production Environment
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://backend:5000
NEXT_PUBLIC_APP_URL=http://frontend:3000

# Docker-specific settings
NEXT_PUBLIC_DEBUG=false
NEXT_PUBLIC_LOG_LEVEL=error
EOF

    success "Docker environment files created"
}

create_gitignore() {
    log "Updating .gitignore for environment files..."
    
    # Add environment files to gitignore if not already there
    cat >> .gitignore << EOF

# Environment files
.env.local
.env.development.local
.env.staging.local
.env.production.local
.env.docker.dev
.env.docker.prod

# Environment-specific builds
.next/
dist/
build/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF

    success ".gitignore updated"
}

validate_environment() {
    log "Validating environment setup..."
    
    local env_file=${1:-.env.local}
    
    if [[ ! -f $env_file ]]; then
        warning "Environment file $env_file not found"
        return 1
    fi
    
    # Check required variables
    local required_vars=("NODE_ENV" "NEXT_PUBLIC_API_URL")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" $env_file; then
            missing_vars+=($var)
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        warning "Missing required variables in $env_file: ${missing_vars[*]}"
        return 1
    fi
    
    success "Environment validation passed for $env_file"
    return 0
}

show_usage() {
    echo "Usage: $0 [ENVIRONMENT]"
    echo ""
    echo "ENVIRONMENT can be:"
    echo "  dev, development    - Setup development environment"
    echo "  staging            - Setup staging environment"
    echo "  prod, production   - Setup production environment"
    echo "  docker            - Setup Docker environment files"
    echo "  template          - Create environment template"
    echo "  validate [file]   - Validate environment file"
    echo "  all               - Setup all environments"
    echo ""
    echo "Examples:"
    echo "  $0 development     - Setup for local development"
    echo "  $0 production     - Setup for production deployment"
    echo "  $0 validate       - Validate .env.local"
    echo "  $0 all            - Create all environment files"
}

main() {
    case "${1:-}" in
        "dev"|"development")
            setup_development
            create_env_template
            create_gitignore
            ;;
        "staging")
            setup_staging
            create_env_template
            create_gitignore
            ;;
        "prod"|"production")
            setup_production
            create_env_template
            create_gitignore
            ;;
        "docker")
            setup_docker_env
            create_env_template
            create_gitignore
            ;;
        "template")
            create_env_template
            create_gitignore
            ;;
        "validate")
            validate_environment "${2:-}"
            ;;
        "all")
            setup_development
            setup_staging
            setup_production
            setup_docker_env
            create_env_template
            create_gitignore
            success "All environment files created"
            ;;
        "help"|"--help"|"-h")
            show_usage
            ;;
        "")
            warning "No environment specified, setting up development by default"
            setup_development
            create_env_template
            create_gitignore
            ;;
        *)
            error "Unknown environment: $1. Use --help for usage information."
            ;;
    esac
    
    echo ""
    log "Environment setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Review and update the environment variables in the created files"
    echo "2. Update API URLs to match your actual backend endpoints"
    echo "3. Add any additional environment variables your application needs"
    echo "4. Test the application with: npm run dev"
    echo ""
    warning "Remember to:"
    warning "- Never commit real environment files to version control"
    warning "- Keep production secrets secure"
    warning "- Use different API keys for different environments"
}

# Run main function with all arguments
main "$@"