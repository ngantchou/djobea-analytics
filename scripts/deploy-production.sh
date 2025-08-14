#!/bin/bash

# Djobea Analytics Frontend - Production Deployment Script
# This script handles the complete deployment process for the frontend application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="djobea-analytics"
NODE_VERSION="18"
BUILD_DIR=".next"
BACKUP_DIR="backups"
LOG_FILE="deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

# Check if running as correct user
check_user() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    NODE_CURRENT=$(node -v | sed 's/v//' | cut -d. -f1)
    if [[ $NODE_CURRENT -lt $NODE_VERSION ]]; then
        error "Node.js version $NODE_VERSION or higher is required (current: v$NODE_CURRENT)"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        warning "Git is not installed - version control checks will be skipped"
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        log "Docker is available for containerized deployment"
    else
        warning "Docker is not installed - container deployment will not be available"
    fi
    
    success "Prerequisites check completed"
}

# Backup current deployment
backup_current() {
    if [[ -d $BUILD_DIR ]]; then
        log "Creating backup of current deployment..."
        
        mkdir -p $BACKUP_DIR
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
        
        cp -r $BUILD_DIR "$BACKUP_DIR/$BACKUP_NAME" || warning "Failed to create backup"
        
        # Keep only last 5 backups
        cd $BACKUP_DIR && ls -t | tail -n +6 | xargs -r rm -rf
        cd ..
        
        success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    else
        log "No existing deployment found - skipping backup"
    fi
}

# Check environment variables
check_environment() {
    log "Checking environment variables..."
    
    REQUIRED_VARS=("NODE_ENV" "NEXT_PUBLIC_API_URL")
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [[ -z "${!var}" ]]; then
            MISSING_VARS+=($var)
        else
            log "✓ $var is set"
        fi
    done
    
    if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
        error "Missing required environment variables: ${MISSING_VARS[*]}"
    fi
    
    # Check NODE_ENV
    if [[ "$NODE_ENV" != "production" ]]; then
        warning "NODE_ENV is not set to 'production' (current: $NODE_ENV)"
    fi
    
    success "Environment variables check completed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Check if package-lock.json exists
    if [[ -f "package-lock.json" ]]; then
        npm ci --only=production --silent || error "Failed to install dependencies"
    else
        npm install --only=production --silent || error "Failed to install dependencies"
    fi
    
    success "Dependencies installed successfully"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Check if test script exists
    if npm run | grep -q "test"; then
        npm run test || error "Tests failed"
        success "All tests passed"
    else
        warning "No test script found - skipping tests"
    fi
}

# Type check
type_check() {
    log "Running TypeScript type check..."
    
    if npm run | grep -q "type-check"; then
        npm run type-check || error "Type check failed"
        success "Type check passed"
    else
        warning "No type-check script found - skipping type check"
    fi
}

# Lint code
lint_code() {
    log "Running linter..."
    
    if npm run | grep -q "lint"; then
        npm run lint || warning "Linting issues found - review warnings"
        success "Linting completed"
    else
        warning "No lint script found - skipping linting"
    fi
}

# Build application
build_application() {
    log "Building application for production..."
    
    # Clean previous build
    if [[ -d $BUILD_DIR ]]; then
        rm -rf $BUILD_DIR
        log "Cleaned previous build"
    fi
    
    # Build with optimizations
    npm run build || error "Build failed"
    
    # Verify build output
    if [[ ! -d $BUILD_DIR ]]; then
        error "Build directory not found after build"
    fi
    
    BUILD_SIZE=$(du -sh $BUILD_DIR | cut -f1)
    success "Build completed successfully (Size: $BUILD_SIZE)"
}

# Run health checks
run_health_checks() {
    log "Running health checks..."
    
    if [[ -f "scripts/health-check.js" ]]; then
        node scripts/health-check.js || warning "Health checks failed - review warnings"
    else
        warning "Health check script not found - skipping health checks"
    fi
}

# Optimize assets
optimize_assets() {
    log "Optimizing assets..."
    
    # This would typically involve:
    # - Image compression
    # - Asset optimization
    # - Cache headers setup
    
    # For now, just verify static assets
    if [[ -d "$BUILD_DIR/static" ]]; then
        STATIC_SIZE=$(du -sh "$BUILD_DIR/static" | cut -f1)
        log "Static assets size: $STATIC_SIZE"
    fi
    
    success "Asset optimization completed"
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    case "$DEPLOYMENT_TYPE" in
        "docker")
            deploy_docker
            ;;
        "pm2")
            deploy_pm2
            ;;
        "standalone")
            deploy_standalone
            ;;
        *)
            deploy_standalone
            ;;
    esac
}

# Docker deployment
deploy_docker() {
    log "Deploying with Docker..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Build Docker image
    docker build -t $PROJECT_NAME:latest -f Dockerfile.production . || error "Docker build failed"
    
    # Stop existing container if running
    if docker ps -q -f name=$PROJECT_NAME; then
        log "Stopping existing container..."
        docker stop $PROJECT_NAME
        docker rm $PROJECT_NAME
    fi
    
    # Start new container
    docker run -d \
        --name $PROJECT_NAME \
        --restart unless-stopped \
        -p 3000:3000 \
        -e NODE_ENV=$NODE_ENV \
        -e NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
        $PROJECT_NAME:latest || error "Failed to start Docker container"
    
    success "Docker deployment completed"
}

# PM2 deployment
deploy_pm2() {
    log "Deploying with PM2..."
    
    if ! command -v pm2 &> /dev/null; then
        error "PM2 is not installed. Install with: npm install -g pm2"
    fi
    
    # Stop existing process
    pm2 stop $PROJECT_NAME 2>/dev/null || true
    pm2 delete $PROJECT_NAME 2>/dev/null || true
    
    # Start new process
    pm2 start npm --name $PROJECT_NAME -- start || error "Failed to start with PM2"
    pm2 save || warning "Failed to save PM2 configuration"
    
    success "PM2 deployment completed"
}

# Standalone deployment
deploy_standalone() {
    log "Standalone deployment - application is ready to start"
    log "Start the application with: npm start"
    success "Standalone deployment completed"
}

# Post-deployment verification
verify_deployment() {
    log "Verifying deployment..."
    
    # Wait a moment for the application to start
    sleep 3
    
    # Check if application is responding
    if command -v curl &> /dev/null; then
        HEALTH_URL="http://localhost:3000/api/health"
        if curl -f -s $HEALTH_URL > /dev/null; then
            success "Application is responding to health checks"
        else
            warning "Application health check failed - manual verification required"
        fi
    else
        warning "curl not available - skipping automatic health check"
    fi
    
    log "Manual verification steps:"
    log "1. Open http://localhost:3000 in your browser"
    log "2. Check application logs for errors"
    log "3. Verify all features are working correctly"
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Clean npm cache
    npm cache clean --force 2>/dev/null || true
    
    # Remove old logs (keep last 10)
    if [[ -d "logs" ]]; then
        find logs -name "*.log" -mtime +10 -delete 2>/dev/null || true
    fi
    
    success "Cleanup completed"
}

# Main deployment process
main() {
    log "Starting deployment of $PROJECT_NAME..."
    log "Deployment type: ${DEPLOYMENT_TYPE:-standalone}"
    
    check_user
    check_prerequisites
    backup_current
    check_environment
    install_dependencies
    run_tests
    type_check
    lint_code
    build_application
    optimize_assets
    run_health_checks
    deploy_application
    verify_deployment
    cleanup
    
    success "🎉 Deployment completed successfully!"
    log "Application is ready for production use"
    
    # Display deployment summary
    echo ""
    echo "=================================="
    echo "  DEPLOYMENT SUMMARY"
    echo "=================================="
    echo "Project: $PROJECT_NAME"
    echo "Environment: $NODE_ENV"
    echo "Node Version: $(node -v)"
    echo "Build Size: $(du -sh $BUILD_DIR | cut -f1)"
    echo "Deployment Type: ${DEPLOYMENT_TYPE:-standalone}"
    echo "Timestamp: $(date)"
    echo "=================================="
}

# Handle script arguments
case "${1:-}" in
    --docker)
        DEPLOYMENT_TYPE="docker"
        ;;
    --pm2)
        DEPLOYMENT_TYPE="pm2"
        ;;
    --standalone)
        DEPLOYMENT_TYPE="standalone"
        ;;
    --help)
        echo "Usage: $0 [--docker|--pm2|--standalone|--help]"
        echo ""
        echo "Options:"
        echo "  --docker      Deploy using Docker containers"
        echo "  --pm2         Deploy using PM2 process manager"
        echo "  --standalone  Build only (default)"
        echo "  --help        Show this help message"
        echo ""
        echo "Environment Variables Required:"
        echo "  NODE_ENV              Should be 'production'"
        echo "  NEXT_PUBLIC_API_URL   Backend API URL"
        echo ""
        exit 0
        ;;
    "")
        DEPLOYMENT_TYPE="standalone"
        ;;
    *)
        error "Unknown option: $1. Use --help for usage information."
        ;;
esac

# Run main deployment process
main