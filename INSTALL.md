# 📦 Guide d'installation rapide

Ce guide vous aidera à démarrer rapidement avec Projet-0.

## 🚀 Méthode 1: Installation Express (Recommandée)

### Étape 1: Cloner le projet
```bash
git clone https://github.com/BENKADI/projet-0.git
cd projet-0
```

### Étape 2: Utiliser le Makefile
```bash
# Configuration automatique
make setup

# Installation des dépendances
make install
```

### Étape 3: Configurer la base de données
1. Créer une base PostgreSQL:
```sql
CREATE DATABASE projet0_db;
```

2. Modifier `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/projet0_db?schema=public"
JWT_SECRET="votre-secret-jwt-super-securise"
```

### Étape 4: Migrer la base de données
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### Étape 5: Démarrer l'application
```bash
# Option 1: Avec Make
make dev

# Option 2: Avec PowerShell (Windows)
.\app-manager.ps1

# Option 3: Manuellement
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 🐳 Méthode 2: Avec Docker (Plus simple)

```bash
# Cloner le projet
git clone https://github.com/BENKADI/projet-0.git
cd projet-0

# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

**C'est tout !** Les services seront disponibles sur:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- PostgreSQL: localhost:5432

## ✅ Vérification de l'installation

Vérifiez que tout fonctionne:

1. **Backend**: http://localhost:3000
   - Vous devriez voir un message de bienvenue JSON

2. **Frontend**: http://localhost:3001
   - L'application React devrait s'afficher

3. **API Docs**: http://localhost:3000/api-docs
   - Interface Swagger interactive

4. **Health Check**: http://localhost:3000/health
   - Status: "ok" si tout va bien

## 🔧 Dépannage

### Problème: Port déjà utilisé
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Problème: Erreur de migration Prisma
```bash
cd backend
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

### Problème: Dépendances manquantes
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📚 Prochaines étapes

1. Lisez le [README.md](README.md) pour comprendre la structure
2. Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour contribuer
3. Explorez la documentation API sur http://localhost:3000/api-docs
4. Personnalisez le projet selon vos besoins

## 💡 Conseils

- Utilisez les scripts PowerShell sur Windows pour une gestion facile
- Le Makefile offre des commandes rapides (make help pour la liste)
- Docker Compose est idéal pour un environnement isolé
- Consultez les logs avec `docker-compose logs -f` si vous utilisez Docker

## 🆘 Besoin d'aide ?

- Ouvrez une issue sur [GitHub](https://github.com/BENKADI/projet-0/issues)
- Consultez la documentation complète dans le README
- Vérifiez le CHANGELOG pour les nouveautés

Bon développement ! 🎉
