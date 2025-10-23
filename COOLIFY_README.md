# 🚀 Déploiement Coolify - Projet-0

## 📦 Fichiers préparés pour Coolify

Votre projet est maintenant prêt pour être déployé sur Coolify ! Les fichiers suivants ont été créés :

### 📄 Fichiers de configuration

| Fichier | Description |
|---------|-------------|
| `docker-compose.coolify.yml` | Configuration Docker Compose optimisée pour Coolify |
| `.env.coolify.example` | Template des variables d'environnement avec documentation |
| `prepare-coolify.ps1` | Script PowerShell interactif de préparation |

### 📚 Documentation

| Fichier | Description |
|---------|-------------|
| `COOLIFY_QUICKSTART.md` | Guide rapide (15 minutes) ⚡ |
| `COOLIFY_DEPLOYMENT.md` | Guide complet et détaillé 📖 |
| `COOLIFY_CHECKLIST.md` | Checklist complète de déploiement ✅ |
| `COOLIFY_README.md` | Ce fichier - Vue d'ensemble 👋 |

## ⚡ Démarrage rapide

### Option 1 : Utiliser le script automatique (Recommandé)

```powershell
# Exécuter le script interactif
.\prepare-coolify.ps1
```

Le script vous guidera pour :
- ✅ Générer les secrets de sécurité
- ✅ Créer le fichier .env pour Coolify
- ✅ Vérifier le statut Git
- ✅ Afficher les instructions de déploiement

### Option 2 : Déploiement manuel en 3 étapes

#### 1. Générer les secrets

```bash
# JWT Secret (64 caractères)
openssl rand -hex 32

# PostgreSQL Password (32 caractères)
openssl rand -base64 32

# Admin Password (utilisez un gestionnaire de mots de passe)
```

#### 2. Configurer les variables d'environnement

Copiez `.env.coolify.example` et remplissez les valeurs :

```env
FRONTEND_DOMAIN=app.votre-domaine.com
BACKEND_DOMAIN=api.votre-domaine.com
POSTGRES_PASSWORD=<généré>
JWT_SECRET=<généré>
ADMIN_PASSWORD=<généré>
CORS_ORIGIN=https://app.votre-domaine.com
VITE_API_URL=https://api.votre-domaine.com
```

#### 3. Déployer sur Coolify

1. Pousser sur Git : `git push origin main`
2. Créer un projet dans Coolify
3. Ajouter un service Docker Compose
4. Configurer les variables d'environnement
5. Déployer !

## 📋 Guides détaillés

### 🎯 Vous êtes pressé ?
➡️ [`COOLIFY_QUICKSTART.md`](./COOLIFY_QUICKSTART.md) - Déploiement en 15 minutes

### 📖 Vous voulez tous les détails ?
➡️ [`COOLIFY_DEPLOYMENT.md`](./COOLIFY_DEPLOYMENT.md) - Guide complet

### ✅ Vous aimez les checklists ?
➡️ [`COOLIFY_CHECKLIST.md`](./COOLIFY_CHECKLIST.md) - Liste complète des étapes

## 🏗️ Architecture de l'application

```
                    Coolify Server
                          │
                    Traefik Proxy
                   (SSL automatique)
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
   Frontend                             Backend
   (React + Vite)                   (Node.js + Express)
   Port: 80                           Port: 3000
   app.domain.com                    api.domain.com
        │                                   │
        └──────────────┬────────────────────┘
                       │
                 PostgreSQL 16
                 (Base de données)
                       │
                  Volumes Docker
              (Données persistantes)
```

## 🔑 Variables d'environnement essentielles

### 🔴 Critiques (obligatoires)

```env
POSTGRES_PASSWORD=<32+ caractères sécurisés>
JWT_SECRET=<64 caractères hexadécimaux>
ADMIN_PASSWORD=<16+ caractères forts>
```

### 🟡 Importantes (configuration)

```env
FRONTEND_DOMAIN=app.prestacoode.com
BACKEND_DOMAIN=api.prestacoode.com
CORS_ORIGIN=https://app.prestacoode.com
VITE_API_URL=https://api.prestacoode.com
```

### 🟢 Optionnelles (avec valeurs par défaut)

```env
POSTGRES_USER=postgres
POSTGRES_DB=projet0_db
LOG_LEVEL=info
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

## 🎯 Services déployés

### 1. PostgreSQL Database
- **Image** : `postgres:16-alpine`
- **Port** : 5432 (interne)
- **Volume** : `postgres_data` (persistant)
- **Health Check** : `pg_isready`

### 2. Backend API
- **Build** : `backend/Dockerfile.prod`
- **Port** : 3000
- **Domaine** : `api.prestacoode.com`
- **Health Check** : `/health/live`
- **Volumes** :
  - `backend_logs` : Logs de l'application
  - `backend_uploads` : Fichiers uploadés

### 3. Frontend
- **Build** : `frontend/Dockerfile.prod`
- **Port** : 80
- **Domaine** : `app.prestacoode.com`
- **Server** : Nginx
- **Health Check** : HTTP GET `/`

## 🔒 Sécurité

### ✅ Fonctionnalités de sécurité activées

- **HTTPS automatique** : Certificats SSL via Let's Encrypt
- **Rate Limiting** : 100 requêtes / 15 minutes
- **CORS** : Configuré strictement
- **Helmet.js** : Headers HTTP sécurisés
- **JWT** : Authentification avec tokens
- **bcrypt** : Hachage des mots de passe
- **Validation** : Zod pour toutes les entrées

### ⚠️ Actions post-déploiement

1. **Changer le mot de passe admin** immédiatement
2. **Configurer les backups** dans Coolify
3. **Activer le monitoring** et les alertes
4. **Vérifier les logs** régulièrement

## 📊 Monitoring et logs

### Dans Coolify

- **Logs en temps réel** : Disponibles pour chaque service
- **Métriques** : CPU, RAM, Network, Disk
- **Health Checks** : Automatiques pour tous les services
- **Alertes** : Configurables dans les paramètres

### Endpoints de santé

```bash
# Backend health check complet
curl https://api.votre-domaine.com/health

# Liveness probe (le service répond-il ?)
curl https://api.votre-domaine.com/health/live

# Readiness probe (le service est-il prêt ?)
curl https://api.votre-domaine.com/health/ready
```

## 🔄 Mises à jour

### Déploiement continu avec Git

```bash
# 1. Faire vos modifications
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# 2. Dans Coolify, cliquer sur "Redeploy"
# Coolify va automatiquement :
# - Pull le code depuis Git
# - Rebuilder les images Docker
# - Redéployer avec zero-downtime
```

### Migrations de base de données

Si vous avez des migrations Prisma :

```bash
# Se connecter au terminal du backend dans Coolify
npx prisma migrate deploy
```

## 🆘 Dépannage rapide

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| Backend ne démarre pas | `DATABASE_URL` incorrecte | Vérifier les variables d'env |
| Frontend 502 Bad Gateway | Backend pas prêt | Attendre que backend soit healthy |
| Erreur CORS | `CORS_ORIGIN` mal configuré | Vérifier qu'il correspond au domaine frontend |
| Base de données vide | Migrations non exécutées | Exécuter `npx prisma migrate deploy` |
| SSL invalide | DNS pas configuré | Vérifier que DNS pointe vers le serveur |

## 📞 Support et ressources

### Documentation

- **Coolify** : https://coolify.io/docs
- **Prisma** : https://www.prisma.io/docs
- **Docker** : https://docs.docker.com
- **React** : https://react.dev
- **Express** : https://expressjs.com

### Projet-0

- **GitHub** : https://github.com/BENKADI/projet-0
- **Issues** : https://github.com/BENKADI/projet-0/issues
- **Discussions** : https://github.com/BENKADI/projet-0/discussions

## 🎉 Prochaines étapes

Après un déploiement réussi :

1. ✅ Tester l'application complètement
2. ✅ Changer le mot de passe admin
3. ✅ Configurer les backups automatiques
4. ✅ Configurer les alertes de monitoring
5. ✅ Ajouter un service de monitoring externe (UptimeRobot, etc.)
6. ✅ Documenter les informations de déploiement
7. ✅ Configurer un CDN (Cloudflare) pour les assets statiques
8. ✅ Ajouter Redis pour le cache (optionnel)

## 💡 Optimisations recommandées

### Performance

- **Redis** : Cache et sessions
- **CDN** : Cloudflare pour assets statiques
- **Image Optimization** : Compression des images
- **Database Indexing** : Optimiser les requêtes

### Scalabilité

- **Horizontal Scaling** : Multiple instances du backend
- **Load Balancer** : Distribution de charge
- **Database Replication** : Read replicas
- **Queue System** : Bull/BullMQ pour jobs async

### Monitoring avancé

- **Sentry** : Tracking des erreurs
- **LogRocket** : Session replay
- **Datadog** : APM et monitoring
- **Prometheus + Grafana** : Métriques custom

## 📝 Changelog

### v1.0.0 - Préparation Coolify (2025-10-23)

- ✅ Création de `docker-compose.coolify.yml`
- ✅ Configuration des variables d'environnement
- ✅ Script PowerShell de préparation
- ✅ Documentation complète du déploiement
- ✅ Checklist de déploiement
- ✅ Quick start guide

## 🙏 Contributions

Les contributions pour améliorer la configuration Coolify sont les bienvenues !

Pour contribuer :
1. Fork le projet
2. Créer une branche feature
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

---

**🚀 Bonne chance avec votre déploiement Coolify !**

Pour toute question, consultez la documentation ou ouvrez une issue sur GitHub.

**Made with ❤️ by BENKADI**
