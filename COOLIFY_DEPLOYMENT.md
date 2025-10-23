# 🚀 Guide de Déploiement Coolify - Projet-0

Guide complet pour déployer votre application Projet-0 sur Coolify.

## 📋 Prérequis

- ✅ Instance Coolify opérationnelle
- ✅ Accès à un serveur configuré dans Coolify
- ✅ Nom de domaine configuré (ex: `app.prestacoode.com`)
- ✅ Dépôt Git accessible (GitHub, GitLab, etc.)

## 🏗️ Architecture de l'application

Votre application est composée de 3 services :

1. **PostgreSQL** - Base de données
2. **Backend** - API Node.js/Express (port 3000)
3. **Frontend** - Application React/Vite avec Nginx (port 80)

## 📦 Méthode 1 : Déploiement avec Docker Compose (Recommandé)

### Étape 1 : Préparer le dépôt Git

Assurez-vous que votre projet est poussé sur un dépôt Git accessible :

```bash
git add .
git commit -m "Préparation pour déploiement Coolify"
git push origin main
```

### Étape 2 : Créer un nouveau projet dans Coolify

1. Connectez-vous à votre instance Coolify : `https://coolify.prestacoode.com`
2. Allez dans **Projects** > **+ New Project**
3. Donnez un nom : `Projet-0` ou `projet-0-production`
4. Sélectionnez l'environnement : `production`

### Étape 3 : Ajouter un service Docker Compose

1. Dans votre projet, cliquez sur **+ New Resource**
2. Sélectionnez **Docker Compose**
3. Configurez :
   - **Name**: `projet-0`
   - **Source**: Sélectionnez votre dépôt Git
   - **Branch**: `main` (ou votre branche de production)
   - **Docker Compose Location**: `docker-compose.prod.yml`

### Étape 4 : Configurer les variables d'environnement

Dans Coolify, allez dans la section **Environment Variables** et ajoutez :

#### Variables PostgreSQL
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<GENERER_MOT_DE_PASSE_SECURISE>
POSTGRES_DB=projet0_db
```

#### Variables Backend
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:<POSTGRES_PASSWORD>@postgres:5432/projet0_db?schema=public

# JWT
JWT_SECRET=<GENERER_SECRET_JWT_64_CARACTERES>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://votre-domaine.com

# Google OAuth (si utilisé)
GOOGLE_CLIENT_ID=<VOTRE_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<VOTRE_GOOGLE_CLIENT_SECRET>
GOOGLE_CALLBACK_URL=https://votre-domaine.com/api/auth/google/callback

# Admin par défaut
ADMIN_EMAIL=admin@projet0.com
ADMIN_PASSWORD=<CHANGER_MOT_DE_PASSE_ADMIN>
ADMIN_USERNAME=admin
```

#### Variables Frontend
```env
VITE_API_URL=https://api.votre-domaine.com
```

### Étape 5 : Configurer les domaines

1. **Backend API** : 
   - Domaine : `api.prestacoode.com` ou `votre-domaine.com/api`
   - Port : 3000
   - Path : `/`

2. **Frontend** :
   - Domaine : `app.prestacoode.com` ou `votre-domaine.com`
   - Port : 80
   - Path : `/`

### Étape 6 : Configurer les volumes persistants

Dans Coolify, assurez-vous que ces volumes sont configurés :
- `postgres_data` : `/var/lib/postgresql/data`
- `backend_logs` : `/app/logs`
- `backend_uploads` : `/app/uploads`

### Étape 7 : Déployer l'application

1. Cliquez sur **Deploy** dans Coolify
2. Surveillez les logs de déploiement
3. Attendez que tous les services soient **healthy**

### Étape 8 : Initialiser la base de données

Après le premier déploiement, vous devez exécuter les migrations Prisma :

1. Allez dans le service **backend** dans Coolify
2. Ouvrez le **Terminal**
3. Exécutez :
```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

## 🔒 Génération des secrets

### JWT Secret (64 caractères)
```bash
# Linux/Mac
openssl rand -hex 32

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Mot de passe PostgreSQL
```bash
# Linux/Mac
openssl rand -base64 32

# PowerShell
Add-Type -AssemblyName System.Web
[System.Web.Security.Membership]::GeneratePassword(32, 10)
```

## 📦 Méthode 2 : Déploiement avec Services Séparés

Si vous préférez déployer chaque service séparément :

### 1. PostgreSQL Database

1. Dans Coolify, créez une **PostgreSQL Database**
2. Notez les informations de connexion
3. Créez la base de données `projet0_db`

### 2. Backend (Node.js)

1. Créez une nouvelle **Application**
2. Type : **Dockerfile**
3. Source : Votre dépôt Git
4. Build Pack : `Dockerfile.prod` dans le dossier `backend`
5. Port : `3000`
6. Variables d'environnement : (voir section ci-dessus)

### 3. Frontend (React + Nginx)

1. Créez une nouvelle **Application**
2. Type : **Dockerfile**
3. Source : Votre dépôt Git
4. Build Pack : `Dockerfile.prod` dans le dossier `frontend`
5. Port : `80`
6. Variables d'environnement :
   ```env
   VITE_API_URL=https://api.votre-domaine.com
   ```

## 🔧 Configuration Nginx (Optionnel)

Si vous utilisez Coolify avec un proxy inverse, ajoutez cette configuration dans **Custom Nginx Configuration** :

```nginx
# Proxy pour l'API
location /api {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Frontend
location / {
    proxy_pass http://frontend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## 🔍 Vérification du déploiement

### 1. Health Checks

Vérifiez que tous les services sont en bonne santé :

```bash
# Backend
curl https://api.votre-domaine.com/health

# Response attendue :
{
  "status": "healthy",
  "timestamp": "2025-10-23T12:00:00.000Z",
  "uptime": 123.45,
  "database": "connected"
}
```

### 2. Test de connexion

1. Ouvrez `https://votre-domaine.com`
2. Testez la page de connexion
3. Identifiants admin par défaut :
   - Email : `admin@projet0.com`
   - Mot de passe : (celui que vous avez défini dans `ADMIN_PASSWORD`)

### 3. Documentation API

Accédez à la documentation Swagger :
```
https://api.votre-domaine.com/api-docs
```

## 📊 Monitoring

### Logs

Dans Coolify, vous pouvez consulter les logs en temps réel :
1. Allez dans votre service
2. Cliquez sur **Logs**
3. Filtrez par service (backend, frontend, postgres)

### Métriques

Coolify fournit des métriques de base :
- CPU usage
- Memory usage
- Network I/O
- Disk usage

## 🔄 Mise à jour de l'application

Pour mettre à jour votre application :

1. Poussez vos changements sur Git :
   ```bash
   git add .
   git commit -m "Update: description des changements"
   git push origin main
   ```

2. Dans Coolify, cliquez sur **Redeploy** dans votre projet

3. Coolify va :
   - Récupérer les derniers changements
   - Rebuilder les images Docker
   - Redémarrer les services avec zero-downtime

## 🛠️ Dépannage

### Problème : Backend ne démarre pas

**Vérifiez les logs :**
```bash
# Dans le terminal Coolify du service backend
tail -f /app/logs/error.log
```

**Causes communes :**
- Variables d'environnement manquantes
- `DATABASE_URL` incorrecte
- Migrations Prisma non exécutées

**Solution :**
```bash
npx prisma migrate deploy
npx prisma generate
```

### Problème : Frontend ne peut pas se connecter au Backend

**Vérifiez :**
1. `VITE_API_URL` est correctement définie
2. CORS est configuré dans le backend pour accepter votre domaine frontend
3. Le backend est accessible depuis l'extérieur

### Problème : Base de données non accessible

**Vérifiez :**
1. Le service PostgreSQL est en cours d'exécution
2. Les credentials sont corrects
3. Le réseau Docker permet la communication entre services

## 🔐 Sécurité

### Checklist de sécurité avant le déploiement

- [ ] Tous les secrets sont générés de manière sécurisée
- [ ] Le mot de passe admin par défaut a été changé
- [ ] CORS est configuré avec les domaines corrects
- [ ] HTTPS est activé (Coolify le fait automatiquement avec Let's Encrypt)
- [ ] Les variables d'environnement sensibles ne sont pas dans le code
- [ ] Rate limiting est activé dans le backend
- [ ] Les logs ne contiennent pas d'informations sensibles

## 📝 Backup et Restauration

### Backup de la base de données

Coolify offre des backups automatiques, mais vous pouvez aussi créer des backups manuels :

```bash
# Dans le terminal du service postgres
pg_dump -U postgres projet0_db > /backups/backup-$(date +%Y%m%d).sql
```

### Restauration

```bash
# Dans le terminal du service postgres
psql -U postgres projet0_db < /backups/backup-20251023.sql
```

## 🚀 Optimisations recommandées

1. **CDN** : Utilisez Cloudflare pour servir les assets statiques
2. **Redis** : Ajoutez Redis pour le cache et les sessions
3. **Load Balancer** : Si forte charge, utilisez plusieurs instances
4. **Monitoring** : Intégrez Sentry pour le tracking des erreurs

## 📞 Support

En cas de problème :
1. Consultez les logs dans Coolify
2. Vérifiez la documentation Coolify : https://coolify.io/docs
3. Consultez les issues GitHub du projet

---

**✅ Votre application devrait maintenant être déployée avec succès sur Coolify !**

Pour toute question, consultez la documentation ou créez une issue sur GitHub.
