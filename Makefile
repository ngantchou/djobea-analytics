# Djobea Analytics Frontend - Docker Commands

.PHONY: help build dev prod clean logs status

# Default target
help:
	@echo "🚀 Djobea Analytics Frontend - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-build    - Build and start development"
	@echo "  make dev-logs     - Show development logs"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-build   - Build and start production"
	@echo "  make prod-logs    - Show production logs"
	@echo ""
	@echo "Management:"
	@echo "  make build        - Build all images"
	@echo "  make clean        - Clean containers and images"
	@echo "  make clean-all    - Clean everything including volumes"
	@echo "  make status       - Show containers status"
	@echo "  make logs         - Show all logs"
	@echo ""
	@echo "Utils:"
	@echo "  make shell        - Access container shell"
	@echo "  make restart      - Restart all services"

# Development commands
dev:
	@echo "🔧 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Development started at http://localhost:3000"

dev-build:
	@echo "🔧 Building and starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d --build
	@echo "✅ Development started at http://localhost:3000"

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Production commands
prod:
	@echo "🚀 Starting production environment..."
	docker-compose up -d
	@echo "✅ Production started at http://localhost"

prod-build:
	@echo "🚀 Building and starting production environment..."
	docker-compose up -d --build
	@echo "✅ Production started at http://localhost"

prod-logs:
	docker-compose logs -f

# Build commands
build:
	@echo "🔨 Building all Docker images..."
	docker-compose build
	docker-compose -f docker-compose.dev.yml build

# Management commands
clean:
	@echo "🧹 Cleaning containers and images..."
	docker-compose down --rmi all
	docker-compose -f docker-compose.dev.yml down --rmi all
	docker system prune -f

clean-all:
	@echo "🧹 Cleaning everything..."
	docker-compose down -v --rmi all
	docker-compose -f docker-compose.dev.yml down -v --rmi all
	docker system prune -af
	docker volume prune -f

status:
	@echo "📊 Container status:"
	docker-compose ps
	@echo ""
	@echo "📊 Development status:"
	docker-compose -f docker-compose.dev.yml ps

logs:
	docker-compose logs -f --tail=100

# Utility commands
shell:
	@echo "🐚 Accessing container shell..."
	docker-compose exec djobea-frontend sh

restart:
	@echo "🔄 Restarting all services..."
	docker-compose restart
	docker-compose -f docker-compose.dev.yml restart

# Environment setup
setup-env:
	@echo "⚙️ Setting up environment..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "📝 Created .env file from .env.example"; \
		echo "🔧 Please edit .env with your backend URL"; \
	else \
		echo "✅ .env file already exists"; \
	fi

# Quick start
quick-start: setup-env dev
	@echo "🎉 Quick start completed!"
	@echo "📝 Edit .env file with your backend URL"
	@echo "🌐 Frontend: http://localhost:3000"

# Production deployment
deploy: setup-env prod-build
	@echo "🚀 Production deployment completed!"
	@echo "🌐 Frontend: http://localhost"
