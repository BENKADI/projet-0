# ✅ Checklist de Déploiement Coolify - Projet-0

Checklist rapide pour déployer Projet-0 sur Coolify.

## 📋 Avant le déploiement

### 1. Préparation du projet

- [ ] Le code est sur un dépôt Git (GitHub, GitLab, Bitbucket, etc.)
- [ ] La branche principale (main/master) est à jour
- [ ] Les fichiers `docker-compose.coolify.yml` et `COOLIFY_DEPLOYMENT.md` sont présents
- [ ] Les Dockerfiles sont présents dans `/backend` et `/frontend`

### 2. Prérequis Coolify

- [ ] Accès à une instance Coolify fonctionnelle
- [ ] Un serveur configuré dans Coolify (localhost ou distant)
- [ ] DNS configurés pour vos domaines
  - [ ] Frontend : `app.votre-domaine.com` → IP du serveur Coolify
  - [ ] Backend : `api.votre-domaine.com` → IP du serveur Coolify

### 3. Génération des secrets

Exécutez le script de préparation :
```powershell
.\prepare-coolify.ps1
```

Ou générez manuellement :

- [ ] `JWT_SECRET` (64 caractères) - **CRITIQUE**
  ```bash
  # Linux/Mac
  openssl rand -hex 32
  ```

- [ ] `POSTGRES_PASSWORD` (32 caractères) - **CRITIQUE**
  ```bash
  # Linux/Mac
  openssl rand -base64 32
  ```

- [ ] `ADMIN_PASSWORD` (16+ caractères) - **CRITIQUE**
  ```
  Utilisez un gestionnaire de mots de passe
  ```

## 🚀 Déploiement dans Coolify

### Étape 1 : Créer le projet

- [ ] Se connecter à Coolify : `https://coolify.votre-domaine.com`
- [ ] Aller dans **Projects** → **+ New Project**
- [ ] Nom du projet : `Projet-0` ou `projet-0-production`
- [ ] Environnement : `production`

### Étape 2 : Ajouter le service Docker Compose

- [ ] Cliquer sur **+ New Resource**
- [ ] Sélectionner **Docker Compose**
- [ ] Configuration :
  - [ ] **Name** : `projet0`
  - [ ] **Source** : Sélectionner votre dépôt Git
  - [ ] **Branch** : `main` (ou votre branche de production)
  - [ ] **Docker Compose Location** : `docker-compose.coolify.yml`

### Étape 3 : Configurer les variables d'environnement

Dans Coolify, section **Environment Variables**, ajouter :

#### 🔐 Variables critiques (à configurer en premier)

- [ ] `POSTGRES_PASSWORD` - Mot de passe PostgreSQL généré
- [ ] `JWT_SECRET` - Secret JWT généré
- [ ] `ADMIN_PASSWORD` - Mot de passe admin initial

#### 🌐 Variables de domaine

- [ ] `FRONTEND_DOMAIN` - ex: `app.prestacoode.com`
- [ ] `BACKEND_DOMAIN` - ex: `api.prestacoode.com`
- [ ] `CORS_ORIGIN` - ex: `https://app.prestacoode.com`
- [ ] `VITE_API_URL` - ex: `https://api.prestacoode.com`

#### 📊 Variables de base de données

- [ ] `POSTGRES_USER` - `postgres` (par défaut)
- [ ] `POSTGRES_DB` - `projet0_db` (par défaut)

#### 👤 Variables admin

- [ ] `ADMIN_EMAIL` - ex: `admin@projet0.com`
- [ ] `ADMIN_USERNAME` - `admin` (par défaut)

#### 🔑 Variables JWT

- [ ] `JWT_EXPIRES_IN` - `7d` (recommandé)
- [ ] `JWT_REFRESH_EXPIRES_IN` - `30d` (recommandé)

#### 🔧 Variables optionnelles

- [ ] `LOG_LEVEL` - `info` (par défaut)
- [ ] `RATE_LIMIT_WINDOW_MS` - `900000` (15 minutes)
- [ ] `RATE_LIMIT_MAX` - `100` (requêtes max)

#### 🔗 Google OAuth (si utilisé)

- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_CALLBACK_URL` - ex: `https://api.prestacoode.com/auth/google/callback`

### Étape 4 : Configurer les domaines dans Coolify

#### Backend

- [ ] Aller dans le service **backend**
- [ ] Section **Domains**
- [ ] Ajouter : `api.prestacoode.com` (ou votre domaine)
- [ ] Port : `3000`
- [ ] Path : `/`
- [ ] Enable HTTPS (Let's Encrypt)

#### Frontend

- [ ] Aller dans le service **frontend**
- [ ] Section **Domains**
- [ ] Ajouter : `app.prestacoode.com` (ou votre domaine)
- [ ] Port : `80`
- [ ] Path : `/`
- [ ] Enable HTTPS (Let's Encrypt)

### Étape 5 : Configurer les volumes persistants

Vérifier que ces volumes sont créés automatiquement :

- [ ] `postgres_data` - Données PostgreSQL
- [ ] `backend_logs` - Logs du backend
- [ ] `backend_uploads` - Fichiers uploadés (avatars, etc.)

### Étape 6 : Lancer le déploiement

- [ ] Cliquer sur **Deploy** dans Coolify
- [ ] Attendre la fin du build (5-10 minutes pour le premier déploiement)
- [ ] Vérifier que tous les services sont **healthy** ✅

### Étape 7 : Initialiser la base de données

Après le premier déploiement :

- [ ] Aller dans le service **backend**
- [ ] Ouvrir le **Terminal** (ou utiliser SSH)
- [ ] Exécuter les commandes suivantes :

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# Créer l'utilisateur admin
npx prisma db seed
```

- [ ] Vérifier que les commandes se sont exécutées sans erreur

## ✅ Vérification du déploiement

### Tests de santé

- [ ] **Backend Health Check**
  ```bash
  curl https://api.votre-domaine.com/health
  ```
  Réponse attendue : Status 200, `"status": "healthy"`

- [ ] **Backend Liveness**
  ```bash
  curl https://api.votre-domaine.com/health/live
  ```
  Réponse attendue : Status 200, `"status": "healthy"`

- [ ] **Backend Readiness**
  ```bash
  curl https://api.votre-domaine.com/health/ready
  ```
  Réponse attendue : Status 200, `"database": "connected"`

### Tests de l'application

- [ ] Ouvrir `https://app.votre-domaine.com`
- [ ] Vérifier que la page de connexion s'affiche
- [ ] Tester la connexion avec le compte admin :
  - Email : `admin@projet0.com`
  - Password : (celui configuré dans `ADMIN_PASSWORD`)
- [ ] Vérifier que le dashboard s'affiche après connexion

### Tests de l'API

- [ ] Documentation Swagger disponible :
  ```
  https://api.votre-domaine.com/api-docs
  ```

- [ ] Test d'inscription (optionnel) :
  ```bash
  curl -X POST https://api.votre-domaine.com/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "Test123!",
      "username": "testuser"
    }'
  ```

- [ ] Test de connexion :
  ```bash
  curl -X POST https://api.votre-domaine.com/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@projet0.com",
      "password": "VOTRE_ADMIN_PASSWORD"
    }'
  ```

### Vérification des logs

- [ ] Consulter les logs du **backend** dans Coolify
- [ ] Consulter les logs du **frontend** dans Coolify
- [ ] Consulter les logs de **PostgreSQL** dans Coolify
- [ ] Vérifier qu'il n'y a pas d'erreurs critiques

### Vérification SSL

- [ ] Les certificats SSL sont actifs
- [ ] Pas d'avertissement de sécurité dans le navigateur
- [ ] HTTPS fonctionne pour frontend et backend

## 🔒 Post-déploiement - Sécurité

### Immédiatement après le déploiement

- [ ] **CRITIQUE** : Changer le mot de passe admin par défaut
  - Se connecter avec le compte admin
  - Aller dans Paramètres → Profil
  - Changer le mot de passe

- [ ] Vérifier que les secrets ne sont pas exposés dans les logs

- [ ] Tester le rate limiting :
  ```bash
  # Faire plusieurs requêtes rapidement
  for i in {1..150}; do curl https://api.votre-domaine.com/health; done
  ```
  Devrait retourner une erreur 429 après 100 requêtes

### Configuration des backups

- [ ] Configurer les backups automatiques de PostgreSQL dans Coolify
- [ ] Tester une restauration de backup
- [ ] Documenter la procédure de backup/restore

### Monitoring

- [ ] Configurer les alertes dans Coolify
  - Alertes si un service est down
  - Alertes si l'utilisation CPU/RAM est élevée
  - Alertes si l'espace disque est faible

- [ ] Configurer un monitoring externe (optionnel)
  - UptimeRobot
  - Pingdom
  - StatusCake

## 📊 Métriques à surveiller

- [ ] CPU usage < 70%
- [ ] RAM usage < 80%
- [ ] Disk usage < 80%
- [ ] Response time < 500ms (moyenne)
- [ ] Uptime > 99.9%

## 🔄 Pour les futures mises à jour

- [ ] Pousser les changements sur Git :
  ```bash
  git add .
  git commit -m "Update: description"
  git push origin main
  ```

- [ ] Dans Coolify, cliquer sur **Redeploy**

- [ ] Si des migrations Prisma sont nécessaires :
  ```bash
  npx prisma migrate deploy
  ```

- [ ] Vérifier que l'application fonctionne après le redéploiement

## 🆘 En cas de problème

### Backend ne démarre pas

1. [ ] Vérifier les logs du backend dans Coolify
2. [ ] Vérifier que `DATABASE_URL` est correct
3. [ ] Vérifier que PostgreSQL est running et healthy
4. [ ] Exécuter `npx prisma generate` dans le terminal du backend

### Frontend ne peut pas se connecter au backend

1. [ ] Vérifier que `VITE_API_URL` est correct
2. [ ] Vérifier que `CORS_ORIGIN` dans le backend correspond au domaine frontend
3. [ ] Tester l'accès direct au backend : `curl https://api.votre-domaine.com/health`

### Base de données vide

1. [ ] Vérifier que les migrations ont été exécutées : `npx prisma migrate deploy`
2. [ ] Vérifier que le seed a été exécuté : `npx prisma db seed`
3. [ ] Si nécessaire, réexécuter le seed

### Certificats SSL invalides

1. [ ] Vérifier que les DNS pointent correctement vers le serveur
2. [ ] Attendre quelques minutes pour la propagation DNS
3. [ ] Dans Coolify, forcer le renouvellement du certificat

## 📞 Support

- Documentation Coolify : https://coolify.io/docs
- Documentation Projet-0 : `COOLIFY_DEPLOYMENT.md`
- Script de préparation : `.\prepare-coolify.ps1`

---

**✅ Déploiement terminé avec succès !**

N'oubliez pas de :
- Changer le mot de passe admin
- Configurer les backups
- Surveiller les métriques
- Documenter les informations de connexion dans un endroit sûr
