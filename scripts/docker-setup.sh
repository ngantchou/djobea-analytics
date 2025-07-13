#!/bin/bash

# Djobea Analytics Frontend - Docker Setup Script
set -e

echo "🚀 Djobea Analytics Frontend - Docker Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_step "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed ✅"
}

# Check if Docker daemon is running
check_docker_daemon() {
    print_step "Checking Docker daemon..."
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    print_status "Docker daemon is running ✅"
}

# Setup environment file
setup_environment() {
    print_step "Setting up environment file..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_status "Created .env file from .env.example"
        else
            cat > .env << EOF
# Djobea Analytics Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:8001
NEXT_PUBLIC_WS_PORT=8001

# Feature flags
ENABLE_AI_PREDICTIONS=true
ENABLE_GEOLOCATION=true
ENABLE_REALTIME=true
ENABLE_WHATSAPP=false

# Google Maps (optional)
GOOGLE_MAPS_API_KEY=

# Environment
NODE_ENV=development
EOF
            print_status "Created default .env file"
        fi
        
        print_warning "Please edit .env file with your backend URL before starting"
    else
        print_status ".env file already exists ✅"
    fi
}

# Create necessary directories
create_directories() {
    print_step "Creating necessary directories..."
    
    mkdir -p logs/nginx
    mkdir -p ssl
    
    print_status "Directories created ✅"
}

# Build Docker images
build_images() {
    print_step "Building Docker images..."
    
    # Build production image
    print_status "Building production image..."
    docker-compose build
    
    # Build development image
    print_status "Building development image..."
    docker-compose -f docker-compose.dev.yml build
    
    print_status "Docker images built successfully ✅"
}

# Function to start development environment
start_development() {
    print_step "Starting development environment..."
    
    docker-compose -f docker-compose.dev.yml up -d
    
    print_status "Development environment started ✅"
    print_status "Frontend available at: http://localhost:3000"
}

# Function to start production environment
start_production() {
    print_step "Starting production environment..."
    
    docker-compose up -d
    
    print_status "Production environment started ✅"
    print_status "Frontend available at: http://localhost"
}

# Show usage
show_usage() {
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  dev, development    Setup and start development environment"
    echo "  prod, production    Setup and start production environment"
    echo "  build              Build Docker images only"
    echo "  setup              Setup environment only"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev             # Setup and start development"
    echo "  $0 prod            # Setup and start production"
    echo "  $0 build           # Build images only"
    echo ""
}

# Main execution
main() {
    case "${1:-dev}" in
        "dev"|"development")
            check_docker
            check_docker_daemon
            setup_environment
            create_directories
            build_images
            start_development
            
            echo ""
            print_status "🎉 Development setup completed!"
            print_warning "📝 Don't forget to edit .env with your backend URL"
            print_status "🌐 Frontend: http://localhost:3000"
            print_status "📊 Logs: docker-compose -f docker-compose.dev.yml logs -f"
            ;;
            
        "prod"|"production")
            check_docker
            check_docker_daemon
            setup_environment
            create_directories
            build_images
            start_production
            
            echo ""
            print_status "🎉 Production setup completed!"
            print_warning "📝 Don't forget to edit .env with your backend URL"
            print_status "🌐 Frontend: http://localhost"
            print_status "📊 Logs: docker-compose logs -f"
            ;;
            
        "build")
            check_docker
            check_docker_daemon
            setup_environment
            create_directories
            build_images
            
            echo ""
            print_status "🎉 Build completed!"
            print_status "🚀 Start development: make dev"
            print_status "🚀 Start production: make prod"
            ;;
            
        "setup")
            setup_environment
            create_directories
            
            echo ""
            print_status "🎉 Setup completed!"
            print_status "🔨 Build images: make build"
            print_status "🚀 Start development: make dev"
            ;;
            
        "help"|"-h"|"--help")
            show_usage
            ;;
            
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
