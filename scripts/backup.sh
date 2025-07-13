#!/bin/bash

# 💾 Script de Sauvegarde Production - Djobea Analytics
# Usage: ./scripts/backup.sh [type]

set -e

# Configuration
BACKUP_DIR="/opt/djobea-analytics/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}
BACKUP_TYPE=${1:-"full"}

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

# Création du répertoire de sauvegarde
mkdir -p "$BACKUP_DIR"

# Chargement des variables d'environnement
if [ -f ".env.production" ]; then
    source .env.production
fi

# Sauvegarde de la base de données
backup_database() {
    log_info "Sauvegarde de la base de données..."
    
    local db_backup="$BACKUP_DIR/db_backup_$DATE.sql"
    
    docker-compose exec -T postgres pg_dump \
        -U ${POSTGRES_USER:-djobea_user} \
        -h localhost \
        -p 5432 \
        --verbose \
        --clean \
        --no-owner \
        --no-privileges \
        ${POSTGRES_DB:-djobea} > "$db_backup"
    
    # Compression
    gzip "$db_backup"
    
    log_success "Base de données sauvegardée: ${db_backup}.gz"
}

# Sauvegarde des fichiers uploadés
backup_uploads() {
    log_info "Sauvegarde des fichiers uploadés..."
    
    if [ -d "uploads" ] && [ "$(ls -A uploads)" ]; then
        local uploads_backup="$BACKUP_DIR/uploads_backup_$DATE.tar.gz"
        
        tar -czf "$uploads_backup" uploads/
        
        log_success "Uploads sauvegardés: $uploads_backup"
    else
        log_info "Aucun fichier à sauvegarder dans uploads/"
    fi
}

# Sauvegarde des logs
backup_logs() {
    log_info "Sauvegarde des logs..."
    
    if [ -d "logs" ] && [ "$(ls -A logs)" ]; then
        local logs_backup="$BACKUP_DIR/logs_backup_$DATE.tar.gz"
        
        tar -czf "$logs_backup" logs/
        
        log_success "Logs sauvegardés: $logs_backup"
    else
        log_info "Aucun log à sauvegarder"
    fi
}

# Sauvegarde de la configuration
backup_config() {
    log_info "Sauvegarde de la configuration..."
    
    local config_backup="$BACKUP_DIR/config_backup_$DATE.tar.gz"
    
    tar -czf "$config_backup" \
        .env.production \
        docker-compose.yml \
        docker-compose.prod.yml \
        nginx.prod.conf \
        prometheus.yml \
        redis.conf \
        2>/dev/null || true
    
    log_success "Configuration sauvegardée: $config_backup"
}

# Sauvegarde complète du système
backup_system() {
    log_info "Sauvegarde complète du système..."
    
    local system_backup="$BACKUP_DIR/system_backup_$DATE.tar.gz"
    
    # Exclusions
    tar -czf "$system_backup" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='backups' \
        --exclude='*.log' \
        --exclude='tmp' \
        . 2>/dev/null || true
    
    log_success "Système sauvegardé: $system_backup"
}

# Sauvegarde vers S3 (optionnel)
backup_to_s3() {
    if [ ! -z "$BACKUP_S3_BUCKET" ] && [ ! -z "$AWS_ACCESS_KEY_ID" ]; then
        log_info "Synchronisation vers S3..."
        
        # Installation d'AWS CLI si nécessaire
        if ! command -v aws &> /dev/null; then
            log_warning "AWS CLI non installé, synchronisation S3 ignorée"
            return
        fi
        
        # Synchronisation
        aws s3 sync "$BACKUP_DIR" "s3://$BACKUP_S3_BUCKET/djobea-analytics/" \
            --exclude "*" \
            --include "*_$DATE.*" \
            --storage-class STANDARD_IA
        
        log_success "Sauvegarde synchronisée vers S3"
    fi
}

# Nettoyage des anciennes sauvegardes
cleanup_old_backups() {
    log_info "Nettoyage des anciennes sauvegardes (>${RETENTION_DAYS} jours)..."
    
    # Suppression locale
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    
    # Nettoyage S3
    if [ ! -z "$BACKUP_S3_BUCKET" ] && command -v aws &> /dev/null; then
        aws s3 ls "s3://$BACKUP_S3_BUCKET/djobea-analytics/" | \
        while read -r line; do
            createDate=$(echo "$line" | awk '{print $1" "$2}')
            createDate=$(date -d "$createDate" +%s)
            olderThan=$(date -d "${RETENTION_DAYS} days ago" +%s)
            if [[ $createDate -lt $olderThan ]]; then
                fileName=$(echo "$line" | awk '{print $4}')
                if [[ $fileName != "" ]]; then
                    aws s3 rm "s3://$BACKUP_S3_BUCKET/djobea-analytics/$fileName"
                fi
            fi
        done 2>/dev/null || true
    fi
    
    log_success "Nettoyage terminé"
}

# Vérification de l'intégrité
verify_backup() {
    log_info "Vérification de l'intégrité des sauvegardes..."
    
    local errors=0
    
    # Vérification des fichiers créés
    for file in "$BACKUP_DIR"/*_$DATE.*; do
        if [ -f "$file" ]; then
            if [ -s "$file" ]; then
                log_success "✅ $(basename "$file") - OK"
            else
                log_error "❌ $(basename "$file") - VIDE"
                ((errors++))
            fi
        fi
    done
    
    # Test de décompression pour les .gz
    for file in "$BACKUP_DIR"/*_$DATE.*.gz; do
        if [ -f "$file" ]; then
            if gzip -t "$file" 2>/dev/null; then
                log_success "✅ $(basename "$file") - Compression OK"
            else
                log_error "❌ $(basename "$file") - Compression CORROMPUE"
                ((errors++))
            fi
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log_success "Toutes les sauvegardes sont intègres"
    else
        log_error "$errors erreur(s) détectée(s)"
        return 1
    fi
}

# Génération du rapport
generate_report() {
    local report_file="$BACKUP_DIR/backup_report_$DATE.txt"
    
    cat > "$report_file" << EOF
===========================================
RAPPORT DE SAUVEGARDE - DJOBEA ANALYTICS
===========================================

Date: $(date)
Type: $BACKUP_TYPE
Répertoire: $BACKUP_DIR

FICHIERS CRÉÉS:
$(ls -lh "$BACKUP_DIR"/*_$DATE.* 2>/dev/null || echo "Aucun fichier créé")

ESPACE DISQUE:
$(df -h "$BACKUP_DIR")

STATISTIQUES:
- Taille totale: $(du -sh "$BACKUP_DIR" | cut -f1)
- Nombre de fichiers: $(ls "$BACKUP_DIR" | wc -l)
- Rétention: ${RETENTION_DAYS} jours

STATUS: SUCCESS
===========================================
EOF
    
    log_success "Rapport généré: $report_file"
}

# Notification
send_notification() {
    local status=$1
    local message="Sauvegarde Djobea Analytics: $status (Type: $BACKUP_TYPE, Date: $DATE)"
    
    # Slack
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" &>/dev/null || true
    fi
    
    # Discord
    if [ ! -z "$DISCORD_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"content\":\"$message\"}" \
            "$DISCORD_WEBHOOK_URL" &>/dev/null || true
    fi
}

# Fonction principale
main() {
    log_info "💾 Sauvegarde Production - Djobea Analytics"
    log_info "Type: $BACKUP_TYPE"
    log_info "Date: $DATE"
    echo ""
    
    case $BACKUP_TYPE in
        "db"|"database")
            backup_database
            ;;
        "files"|"uploads")
            backup_uploads
            ;;
        "config")
            backup_config
            ;;
        "logs")
            backup_logs
            ;;
        "system")
            backup_system
            ;;
        "full"|*)
            backup_database
            backup_uploads
            backup_logs
            backup_config
            ;;
    esac
    
    # Actions communes
    backup_to_s3
    cleanup_old_backups
    
    if verify_backup; then
        generate_report
        send_notification "SUCCESS"
        log_success "🎉 Sauvegarde terminée avec succès!"
    else
        send_notification "FAILED"
        log_error "❌ Erreurs détectées dans la sauvegarde"
        exit 1
    fi
}

# Gestion des erreurs
trap 'log_error "Sauvegarde interrompue"; send_notification "INTERRUPTED"; exit 1' INT TERM

# Exécution
main "$@"
