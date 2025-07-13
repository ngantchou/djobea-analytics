#!/bin/bash

# 🔄 Script de Mise à Jour Production - Djobea Analytics
# Usage: ./scripts/update.sh [version]

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

VERSION=${1:-"latest"}
BACKUP_DIR="backups/pre-update-$(date +%Y%m%d_%H%M%S)"

# Fonction de sauvegarde pré-mise à jour
backup_before_update() {
    log_info "Création de la sauvegarde pré-mise à jour..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Sauvegarde base de données
    docker-compose exec -T postgres pg_dump -U ${POSTGRES_USER:-djobea_user} ${POSTGRES_DB:-djobea} > "$BACKUP_DIR/database.sql"
    
    # Sauvegarde uploads
    tar -czf "$BACKUP_DIR/uploads.tar.gz" uploads/ 2>/dev/null || true
    
    # Sauvegarde configuration
    cp .env.production "$BACKUP_DIR/"
    cp docker-compose.yml "$BACKUP_DIR/"
    cp docker-compose.prod.yml "$BACKUP_DIR/" 2>/dev/null || true
    
    log_success "Sauvegarde créée dans $BACKUP_DIR"
}

# Test de santé avant mise à jour
health_check() {
    log_info "Vérification de l'état du système..."
    
    if ! curl -f http://localhost:3000/api/health &>/dev/null; then
        log_error "L'application n'est pas en état de santé"
        exit 1
    fi
    
    log_success "Système en bonne santé"
}

# Mise à jour du code
update_code() {
    log_info "Mise à jour du code source..."
    
    # Sauvegarde des modifications locales
    git stash push -m "Pre-update stash $(date)"
    
    # Récupération des dernières modifications
    git fetch origin
    
    if [ "$VERSION" = "latest" ]; then
        git checkout main
        git pull origin main
    else
        git checkout "tags/$VERSION"
    fi
    
    log_success "Code source mis à jour vers $VERSION"
}

# Mise à jour des dépendances
update_dependencies() {
    log_info "Mise à jour des dépendances..."
    
    # Reconstruction des images Docker
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache djobea-app
    
    log_success "Dépendances mises à jour"
}

# Migration de la base de données
migrate_database() {
    log_info "Exécution des migrations de base de données..."
    
    # Vérification s'il y a des migrations à exécuter
    if [ -d "migrations" ] && [ "$(ls -A migrations)" ]; then
        docker-compose exec djobea-app npm run migrate
        log_success "Migrations exécutées"
    else
        log_info "Aucune migration à exécuter"
    fi
}

# Déploiement avec stratégie blue-green
blue_green_deploy() {
    log_info "Déploiement Blue-Green..."
    
    # Démarrage de la nouvelle version (green)
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale djobea-app=2
    
    # Attente que la nouvelle instance soit prête
    log_info "Attente de la nouvelle instance..."
    sleep 30
    
    # Test de santé de la nouvelle instance
    for i in {1..10}; do
        if curl -f http://localhost:3000/api/health &>/dev/null; then
            log_success "Nouvelle instance opérationnelle"
            break
        fi
        if [ $i -eq 10 ]; then
            log_error "La nouvelle instance ne répond pas"
            rollback
            exit 1
        fi
        sleep 10
    done
    
    # Arrêt de l'ancienne instance
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale djobea-app=1
    
    log_success "Déploiement Blue-Green terminé"
}

# Déploiement standard
standard_deploy() {
    log_info "Déploiement standard..."
    
    # Arrêt gracieux
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml stop djobea-app
    
    # Démarrage de la nouvelle version
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d djobea-app
    
    # Attente du démarrage
    log_info "Attente du démarrage..."
    sleep 30
    
    # Vérification
    for i in {1..10}; do
        if curl -f http://localhost:3000/api/health &>/dev/null; then
            log_success "Application redémarrée avec succès"
            return 0
        fi
        log_info "Tentative $i/10..."
        sleep 10
    done
    
    log_error "L'application ne répond pas après le redémarrage"
    rollback
    exit 1
}

# Fonction de rollback
rollback() {
    log_warning "Rollback en cours..."
    
    # Restauration de la base de données
    if [ -f "$BACKUP_DIR/database.sql" ]; then
        docker-compose exec -T postgres psql -U ${POSTGRES_USER:-djobea_user} -d ${POSTGRES_DB:-djobea} < "$BACKUP_DIR/database.sql"
    fi
    
    # Restauration des uploads
    if [ -f "$BACKUP_DIR/uploads.tar.gz" ]; then
        tar -xzf "$BACKUP_DIR/uploads.tar.gz"
    fi
    
    # Redémarrage des services
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart
    
    log_success "Rollback terminé"
}

# Tests post-déploiement
post_deploy_tests() {
    log_info "Exécution des tests post-déploiement..."
    
    # Test API
    if curl -f http://localhost:3000/api/health; then
        log_success "✅ API Health OK"
    else
        log_error "❌ API Health FAILED"
        return 1
    fi
    
    # Test base de données
    if docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-djobea_user} -d ${POSTGRES_DB:-djobea}; then
        log_success "✅ Database OK"
    else
        log_error "❌ Database FAILED"
        return 1
    fi
    
    # Test fonctionnalités critiques
    if curl -f http://localhost:3000/api/dashboard &>/dev/null; then
        log_success "✅ Dashboard API OK"
    else
        log_error "❌ Dashboard API FAILED"
        return 1
    fi
    
    log_success "Tous les tests post-déploiement réussis"
}

# Nettoyage
cleanup() {
    log_info "Nettoyage des ressources..."
    
    # Suppression des images Docker inutilisées
    docker image prune -f
    
    # Suppression des volumes inutilisés
    docker volume prune -f
    
    log_success "Nettoyage terminé"
}

# Notification
send_notification() {
    local status=$1
    local message="Mise à jour Djobea Analytics: $status (Version: $VERSION)"
    
    # Slack notification
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" &>/dev/null || true
    fi
    
    # Discord notification
    if [ ! -z "$DISCORD_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"content\":\"$message\"}" \
            "$DISCORD_WEBHOOK_URL" &>/dev/null || true
    fi
}

# Fonction principale
main() {
    log_info "🔄 Mise à jour Production - Djobea Analytics"
    log_info "Version cible: $VERSION"
    echo ""
    
    # Chargement des variables d'environnement
    if [ -f ".env.production" ]; then
        source .env.production
    fi
    
    # Confirmation
    read -p "Confirmer la mise à jour vers $VERSION? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Mise à jour annulée"
        exit 0
    fi
    
    # Exécution des étapes
    health_check
    backup_before_update
    update_code
    update_dependencies
    migrate_database
    
    # Choix de la stratégie de déploiement
    if [ "$BLUE_GREEN_ENABLED" = "true" ]; then
        blue_green_deploy
    else
        standard_deploy
    fi
    
    # Tests et finalisation
    if post_deploy_tests; then
        cleanup
        send_notification "SUCCESS"
        log_success "🎉 Mise à jour terminée avec succès!"
    else
        rollback
        send_notification "FAILED"
        log_error "❌ Mise à jour échouée, rollback effectué"
        exit 1
    fi
}

# Gestion des erreurs
trap 'log_error "Mise à jour interrompue"; rollback; exit 1' INT TERM

# Exécution
main "$@"
