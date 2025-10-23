# ⚡ Quick Start - Déploiement Coolify

Guide ultra-rapide pour déployer Projet-0 sur Coolify en quelques minutes.

## 🚀 Démarrage en 5 étapes

### 1️⃣ Préparer l'environnement (2 minutes)

```powershell
# Exécuter le script de préparation
.\prepare-coolify.ps1
```

Le script va :
- ✅ Générer les secrets de sécurité (JWT, mots de passe)
- ✅ Créer le fichier `.env.coolify` avec vos configurations
- ✅ Vérifier que tout est prêt pour le déploiement

### 2️⃣ Pousser sur Git (1 minute)

```bash
git add .
git commit -m "Ready for Coolify deployment"
git push origin main
```

### 3️⃣ Créer le projet dans Coolify (3 minutes)

1. Aller sur `https://coolify.prestacoode.com`
2. **Projects** → **+ New Project** → Nom : `Projet-0`
3. **+ New Resource** → **Docker Compose**
4. Configurer :
   - Source : Votre dépôt Git
   - Branch : `main`
   - Fichier : `docker-compose.coolify.yml`

### 4️⃣ Configurer les variables (2 minutes)

Dans Coolify, onglet **Environment Variables** :

**Copier-coller le contenu de `.env.coolify`**

Ou configurer manuellement ces variables essentielles :

```env
# Domaines
FRONTEND_DOMAIN=app.prestacoode.com
BACKEND_DOMAIN=api.prestacoode.com

# Sécurité (GÉNÉRER DES VALEURS SÉCURISÉES !)
POSTGRES_PASSWORD=<généré>
JWT_SECRET=<généré>
ADMIN_PASSWORD=<généré>

# URLs
CORS_ORIGIN=https://app.prestacoode.com
VITE_API_URL=https://api.prestacoode.com
```

### 5️⃣ Déployer et initialiser (5-10 minutes)

1. **Déployer** : Cliquer sur **Deploy** dans Coolify
2. Attendre que tous les services soient **healthy** ✅

3. **Initialiser la DB** : Terminal du service backend
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   ```

## ✅ Vérification rapide

### Tester le backend
```bash
curl https://api.prestacoode.com/health
# Réponse : {"status":"healthy"}
```

### Tester le frontend
Ouvrir : `https://app.prestacoode.com`

### Se connecter
- Email : `admin@projet0.com`
- Password : (celui configuré dans `ADMIN_PASSWORD`)

## 📚 Documentation complète

- **Guide détaillé** : [`COOLIFY_DEPLOYMENT.md`](./COOLIFY_DEPLOYMENT.md)
- **Checklist complète** : [`COOLIFY_CHECKLIST.md`](./COOLIFY_CHECKLIST.md)
- **Configuration** : [`.env.coolify.example`](./.env.coolify.example)

## 🔑 Génération rapide des secrets

### JWT Secret
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

## 🎯 Architecture déployée

```
┌─────────────────────────────────────────┐
│         Coolify + Traefik Proxy         │
│            (Let's Encrypt SSL)          │
└─────────────────────────────────────────┘
              ↓           ↓
    ┌─────────────┐  ┌─────────────┐
    │  Frontend   │  │   Backend   │
    │  (Nginx)    │  │  (Node.js)  │
    │   Port 80   │  │  Port 3000  │
    └─────────────┘  └─────────────┘
                          ↓
                   ┌─────────────┐
                   │ PostgreSQL  │
                   │  Database   │
                   └─────────────┘
```

## ⚠️ Points critiques

1. **DNS** : Assurez-vous que vos domaines pointent vers le serveur Coolify
2. **Secrets** : Ne JAMAIS commiter les fichiers `.env.coolify` ou `.secrets.txt`
3. **Admin** : Changez le mot de passe admin immédiatement après la première connexion
4. **Backups** : Configurez des backups automatiques de PostgreSQL dans Coolify

## 🆘 Problèmes courants

| Problème | Solution |
|----------|----------|
| Backend ne démarre pas | Vérifier `DATABASE_URL` et exécuter `npx prisma generate` |
| Frontend erreur 502 | Vérifier que le backend est healthy et que `VITE_API_URL` est correct |
| Erreur CORS | Vérifier que `CORS_ORIGIN` correspond au domaine frontend |
| Base vide | Exécuter `npx prisma migrate deploy` puis `npx prisma db seed` |

## 📞 Support

- **Coolify Docs** : https://coolify.io/docs
- **Projet-0 Issues** : https://github.com/BENKADI/projet-0/issues
- **Script d'aide** : `.\prepare-coolify.ps1`

---

**🎉 C'est tout ! Votre application devrait être en ligne en moins de 15 minutes !**
