#!/bin/bash

# 🔄 Script de Restauration Production - Djobea Analytics
# Usage: ./scripts/restore.sh [backup_file]

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

BACKUP_FILE=$1
BACKUP_DIR="backups"

# Vérification des paramètres
if [ -z "$BACKUP_FILE" ]; then
    log_error "Usage: $0 <backup_file>"
    echo "Sauvegardes disponibles:"
    ls -la "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "Aucune sauvegarde trouvée"
    exit 1
fi

# Vérification de l'existence du fichier
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Fichier de sauvegarde non trouvé: $BACKUP_FILE"
    exit 1
fi

# Chargement des variables d'environnement
if [ -f ".env.production" ]; then
    source .env.production
fi

# Confirmation
log_warning "⚠️  ATTENTION: Cette opération va écraser les données actuelles!"
read -p "Confirmer la restauration depuis $BACKUP_FILE? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Restauration annulée"
    exit 0
fi

# Sauvegarde de sécurité avant restauration
log_info "Création d'une sauvegarde de sécurité..."
./scripts/backup.sh db

# Arrêt de l'application
log_info "Arrêt de l'application..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml stop djobea-app

# Restauration de la base de données
log_info "Restauration de la base de données..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres psql -U ${POSTGRES_USER:-djobea_user} -d ${POSTGRES_DB:-djobea}
else
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres psql -U ${POSTGRES_USER:-djobea_user} -d ${POSTGRES_DB:-djobea} < "$BACKUP_FILE"
fi

# Redémarrage de l'application
log_info "Redémarrage de l'application..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml start djobea-app

# Vérification
log_info "Vérification de la restauration..."
sleep 10
if curl -f http://localhost:3000/api/health &>/dev/null; then
    log_success "🎉 Restauration terminée avec succès!"
else
    log_error "❌ Problème détecté après restauration"
    exit 1
fi
