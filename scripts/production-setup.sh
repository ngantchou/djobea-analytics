#!/bin/bash

# 🚀 Script de Configuration Production - Djobea Analytics
# Usage: ./scripts/production-setup.sh

set -e

echo "🚀 Démarrage de la configuration production..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérification Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        exit 1
    fi
    
    # Vérification Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    # Vérification des fichiers requis
    if [ ! -f ".env.production" ]; then
        log_error "Fichier .env.production manquant"
        exit 1
    fi
    
    log_success "Prérequis validés"
}

# Configuration des répertoires
setup_directories() {
    log_info "Configuration des répertoires..."
    
    mkdir -p logs/nginx
    mkdir -p ssl
    mkdir -p uploads
    mkdir -p backups
    mkdir -p grafana/dashboards
    mkdir -p grafana/datasources
    
    # Permissions
    chmod 755 logs uploads backups
    chmod 700 ssl
    
    log_success "Répertoires configurés"
}

# Configuration SSL
setup_ssl() {
    log_info "Configuration SSL..."
    
    if [ ! -z "$DOMAIN" ]; then
        log_info "Configuration SSL pour le domaine: $DOMAIN"
        
        # Vérification si les certificats existent
        if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
            log_warning "Certificats SSL non trouvés. Génération avec certbot..."
            
            # Arrêt temporaire des services
            docker-compose down 2>/dev/null || true
            
            # Génération des certificats
            sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL
            
            if [ $? -eq 0 ]; then
                log_success "Certificats SSL générés"
            else
                log_error "Échec de la génération des certificats SSL"
                exit 1
            fi
        else
            log_success "Certificats SSL existants trouvés"
        fi
        
        # Copie des certificats
        sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/
        sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/
        sudo chown $USER:$USER ssl/*.pem
        
    else
        log_warning "Variable DOMAIN non définie, SSL ignoré"
    fi
}

# Configuration de la base de données
setup_database() {
    log_info "Configuration de la base de données..."
    
    # Démarrage temporaire de PostgreSQL
    docker-compose up -d postgres
    
    # Attente que PostgreSQL soit prêt
    log_info "Attente de PostgreSQL..."
    sleep 10
    
    # Vérification de la connexion
    docker-compose exec postgres pg_isready -U ${POSTGRES_USER:-djobea_user} -d ${POSTGRES_DB:-djobea}
    
    if [ $? -eq 0 ]; then
        log_success "Base de données prête"
    else
        log_error "Impossible de se connecter à la base de données"
        exit 1
    fi
}

# Configuration Redis
setup_redis() {
    log_info "Configuration Redis..."
    
    # Démarrage temporaire de Redis
    docker-compose up -d redis
    
    # Attente que Redis soit prêt
    log_info "Attente de Redis..."
    sleep 5
    
    # Vérification de la connexion
    docker-compose exec redis redis-cli ping
    
    if [ $? -eq 0 ]; then
        log_success "Redis prêt"
    else
        log_error "Impossible de se connecter à Redis"
        exit 1
    fi
}

# Déploiement de l'application
deploy_application() {
    log_info "Déploiement de l'application..."
    
    # Construction et démarrage
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d --build
    
    # Attente du démarrage
    log_info "Attente du démarrage de l'application..."
    sleep 30
    
    # Vérification de la santé
    for i in {1..10}; do
        if curl -f http://localhost:3000/api/health &>/dev/null; then
            log_success "Application déployée avec succès"
            return 0
        fi
        log_info "Tentative $i/10 - Attente de l'application..."
        sleep 10
    done
    
    log_error "L'application ne répond pas après 100 secondes"
    docker-compose logs djobea-app
    exit 1
}

# Configuration du monitoring
setup_monitoring() {
    log_info "Configuration du monitoring..."
    
    # Attente de Prometheus
    log_info "Attente de Prometheus..."
    sleep 10
    
    # Vérification Prometheus
    if curl -f http://localhost:9090/-/healthy &>/dev/null; then
        log_success "Prometheus opérationnel"
    else
        log_warning "Prometheus non accessible"
    fi
    
    # Vérification Grafana
    if curl -f http://localhost:3001/api/health &>/dev/null; then
        log_success "Grafana opérationnel"
    else
        log_warning "Grafana non accessible"
    fi
}

# Configuration des sauvegardes
setup_backups() {
    log_info "Configuration des sauvegardes..."
    
    # Création du script de sauvegarde
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash
# Script de sauvegarde automatique

BACKUP_DIR="/opt/djobea-analytics/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Sauvegarde base de données
docker-compose exec -T postgres pg_dump -U ${POSTGRES_USER:-djobea_user} ${POSTGRES_DB:-djobea} > "$BACKUP_DIR/db_backup_$DATE.sql"

# Sauvegarde uploads
tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" uploads/

# Nettoyage des anciennes sauvegardes (garde 7 jours)
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Sauvegarde terminée: $DATE"
EOF
    
    chmod +x scripts/backup.sh
    
    # Configuration cron
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/djobea-analytics/scripts/backup.sh") | crontab -
    
    log_success "Sauvegardes configurées (quotidienne à 2h)"
}

# Tests post-déploiement
run_tests() {
    log_info "Exécution des tests post-déploiement..."
    
    # Test API health
    if curl -f http://localhost:3000/api/health; then
        log_success "✅ API Health OK"
    else
        log_error "❌ API Health FAILED"
    fi
    
    # Test base de données
    if docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-djobea_user} -d ${POSTGRES_DB:-djobea}; then
        log_success "✅ Database OK"
    else
        log_error "❌ Database FAILED"
    fi
    
    # Test Redis
    if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
        log_success "✅ Redis OK"
    else
        log_error "❌ Redis FAILED"
    fi
    
    # Test Nginx
    if curl -f http://localhost/health &>/dev/null; then
        log_success "✅ Nginx OK"
    else
        log_error "❌ Nginx FAILED"
    fi
}

# Affichage des informations finales
show_final_info() {
    log_success "🎉 Déploiement terminé avec succès!"
    echo ""
    echo "📊 Accès aux services:"
    echo "  • Application: https://${DOMAIN:-localhost}"
    echo "  • Prometheus: http://localhost:9090"
    echo "  • Grafana: http://localhost:3001 (admin/admin123)"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "  • Logs: docker-compose logs -f"
    echo "  • Restart: docker-compose restart"
    echo "  • Status: docker-compose ps"
    echo "  • Backup: ./scripts/backup.sh"
    echo ""
    echo "📚 Documentation: docs/production-deployment.md"
}

# Fonction principale
main() {
    log_info "🚀 Configuration Production - Djobea Analytics"
    echo ""
    
    # Chargement des variables d'environnement
    if [ -f ".env.production" ]; then
        source .env.production
    fi
    
    # Exécution des étapes
    check_prerequisites
    setup_directories
    setup_ssl
    setup_database
    setup_redis
    deploy_application
    setup_monitoring
    setup_backups
    run_tests
    show_final_info
    
    log_success "🎯 Configuration production terminée!"
}

# Gestion des erreurs
trap 'log_error "Script interrompu"; exit 1' INT TERM

# Exécution
main "$@"
