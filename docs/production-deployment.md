# 🚀 Guide de Déploiement en Production - Djobea Analytics

## 📋 Prérequis

### Serveur de Production
- **OS** : Ubuntu 20.04+ ou CentOS 8+
- **RAM** : Minimum 4GB (Recommandé 8GB+)
- **CPU** : Minimum 2 cores (Recommandé 4+ cores)
- **Stockage** : Minimum 50GB SSD
- **Docker** : Version 20.10+
- **Docker Compose** : Version 2.0+

### Domaine et SSL
- Nom de domaine configuré
- Certificat SSL (Let's Encrypt recommandé)
- DNS pointant vers votre serveur

---

## 🔧 Étape 1 : Préparation du Serveur

### Installation des Dépendances
\`\`\`bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installation Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Installation des outils
sudo apt install -y git nginx certbot python3-certbot-nginx htop curl wget
\`\`\`

### Configuration du Firewall
\`\`\`bash
# Configuration UFW
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
\`\`\`

---

## 🔐 Étape 2 : Configuration SSL avec Let's Encrypt

### Obtention du Certificat SSL
\`\`\`bash
# Arrêt temporaire de Nginx si actif
sudo systemctl stop nginx

# Obtention du certificat
sudo certbot certonly --standalone -d votre-domaine.com -d www.votre-domaine.com

# Redémarrage de Nginx
sudo systemctl start nginx
\`\`\`

---

## 📁 Étape 3 : Déploiement du Code

### Clonage et Configuration
\`\`\`bash
# Création du répertoire de production
sudo mkdir -p /opt/djobea-analytics
sudo chown $USER:$USER /opt/djobea-analytics
cd /opt/djobea-analytics

# Clonage du projet (remplacez par votre repo)
git clone https://github.com/votre-username/djobea-analytics.git .

# Copie de la configuration d'environnement
cp .env.example .env.production
\`\`\`

---

## ⚙️ Étape 4 : Configuration des Variables d'Environnement

### Fichier .env.production
\`\`\`bash
# Édition du fichier d'environnement
nano .env.production
\`\`\`

---

## 🐳 Étape 5 : Déploiement avec Docker

### Lancement en Production
\`\`\`bash
# Construction et démarrage
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d

# Vérification des services
docker-compose ps

# Vérification des logs
docker-compose logs -f djobea-app
\`\`\`

---

## 🔍 Étape 6 : Vérification du Déploiement

### Tests de Santé
\`\`\`bash
# Test de l'application
curl -f http://localhost:3000/api/health

# Test via Nginx
curl -f https://votre-domaine.com/api/health

# Vérification des métriques
curl -f http://localhost:9090/metrics
\`\`\`

---

## 📊 Étape 7 : Configuration du Monitoring

### Accès aux Dashboards
- **Application** : https://votre-domaine.com
- **Prometheus** : http://votre-serveur:9090
- **Grafana** : http://votre-serveur:3001

### Configuration Grafana
1. Connexion avec admin/admin123 (changez le mot de passe)
2. Ajout de la source de données Prometheus
3. Import des dashboards de monitoring

---

## 🔄 Étape 8 : Sauvegarde et Maintenance

### Script de Sauvegarde Automatique
\`\`\`bash
# Création du script de sauvegarde
sudo nano /opt/djobea-analytics/scripts/backup.sh
chmod +x /opt/djobea-analytics/scripts/backup.sh

# Configuration cron pour sauvegarde quotidienne
crontab -e
# Ajouter : 0 2 * * * /opt/djobea-analytics/scripts/backup.sh
\`\`\`

### Mise à Jour
\`\`\`bash
# Script de mise à jour
sudo nano /opt/djobea-analytics/scripts/update.sh
chmod +x /opt/djobea-analytics/scripts/update.sh
\`\`\`

---

## 🚨 Étape 9 : Sécurité Avancée

### Configuration Fail2Ban
\`\`\`bash
# Installation
sudo apt install fail2ban

# Configuration
sudo nano /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
\`\`\`

---

## 📈 Étape 10 : Optimisations Performance

### Configuration Système
\`\`\`bash
# Optimisations kernel
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
echo 'fs.file-max=65536' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
\`\`\`

---

## 🔧 Commandes de Maintenance

### Commandes Utiles
\`\`\`bash
# Redémarrage de l'application
make restart

# Mise à jour
make update

# Sauvegarde
make backup

# Restauration
make restore

# Logs
make logs

# Nettoyage
make clean
\`\`\`

---

## 📞 Support et Dépannage

### Logs Importants
\`\`\`bash
# Logs application
docker-compose logs djobea-app

# Logs Nginx
sudo tail -f /var/log/nginx/error.log

# Logs système
sudo journalctl -u docker

# Métriques système
htop
df -h
free -h
\`\`\`

### Contacts d'Urgence
- **Admin Système** : admin@djobea.com
- **Développeur** : dev@djobea.com
- **Support** : support@djobea.com

---

## ✅ Checklist de Déploiement

- [ ] Serveur configuré et sécurisé
- [ ] SSL/HTTPS configuré
- [ ] Variables d'environnement définies
- [ ] Base de données initialisée
- [ ] Application déployée et fonctionnelle
- [ ] Monitoring configuré
- [ ] Sauvegardes automatiques
- [ ] Tests de charge effectués
- [ ] Documentation mise à jour
- [ ] Équipe formée

---

## 🎯 Post-Déploiement

### Actions Immédiates
1. **Test complet** de toutes les fonctionnalités
2. **Configuration des alertes** de monitoring
3. **Formation de l'équipe** sur les outils de production
4. **Documentation** des procédures spécifiques
5. **Plan de reprise d'activité** en cas de panne

### Surveillance Continue
- Monitoring des performances
- Surveillance des logs d'erreur
- Vérification des sauvegardes
- Mise à jour de sécurité régulières
- Optimisation continue des performances
