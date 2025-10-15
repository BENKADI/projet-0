# 🚀 Projet-0

**Template professionnel de démarrage pour applications web modernes**

Une base solide et prête pour la production avec backend Node.js/Express, frontend React/Vite, authentification JWT, gestion des permissions, et bien plus.

[![CI/CD Pipeline](https://github.com/BENKADI/projet-0/actions/workflows/ci.yml/badge.svg)](https://github.com/BENKADI/projet-0/actions/workflows/ci.yml)
[![Code Quality](https://github.com/BENKADI/projet-0/actions/workflows/code-quality.yml/badge.svg)](https://github.com/BENKADI/projet-0/actions/workflows/code-quality.yml)

## ✨ Fonctionnalités

### Backend
- ✅ **Express.js** avec TypeScript
- ✅ **Prisma ORM** pour PostgreSQL
- ✅ **Authentification JWT** complète
- ✅ **Système de permissions** granulaire
- ✅ **Validation des données** avec Zod
- ✅ **Documentation API** avec Swagger/OpenAPI
- ✅ **Logging professionnel** avec Winston
- ✅ **Sécurité renforcée** (Helmet, Rate Limiting)
- ✅ **Error handling** centralisé
- ✅ **Health checks** (liveness, readiness)

### Frontend
- ✅ **React 19** avec TypeScript
- ✅ **Vite** pour un build ultra-rapide
- ✅ **TailwindCSS** pour le styling
- ✅ **Radix UI** composants accessibles
- ✅ **React Router** pour la navigation
- ✅ **Context API** pour la gestion d'état
- ✅ **Axios** pour les requêtes API
- ✅ **Theme switching** (light/dark)

### DevOps
- ✅ **Docker & Docker Compose** prêts
- ✅ **GitHub Actions** CI/CD
- ✅ **Prettier & ESLint** configurés
- ✅ **Scripts utilitaires** (Makefile, PowerShell)
- ✅ **Configuration d'environnement** (.env.example)

## 📁 Structure du projet

```
projet-0/
├── backend/
│   ├── prisma/              # Schéma et migrations Prisma
│   ├── src/
│   │   ├── config/          # Configuration (logger, swagger)
│   │   ├── controllers/     # Contrôleurs
│   │   ├── middleware/      # Middlewares personnalisés
│   │   ├── routes/          # Routes API
│   │   ├── services/        # Logique métier
│   │   ├── types/           # Types TypeScript
│   │   ├── utils/           # Utilitaires
│   │   └── index.ts         # Point d'entrée
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── contexts/        # Contexts React
│   │   ├── pages/           # Pages de l'application
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.example
│   └── package.json
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
├── docker-compose.yml
├── Makefile
├── app-manager.ps1          # Script PowerShell de gestion
└── README.md
```

## 📋 Prérequis

- **Node.js** 20 ou supérieur
- **PostgreSQL** 16 ou supérieur
- **Docker** (optionnel, pour le développement conteneurisé)
- **Make** (optionnel, pour utiliser le Makefile)
- **PowerShell** (pour Windows, script de gestion)

## 🛠️ Installation

### Option 1: Installation rapide avec Make

```bash
# Configuration initiale complète
make setup

# Installer toutes les dépendances
make install
```

### Option 2: Installation manuelle

#### 1. Cloner le dépôt
```bash
git clone https://github.com/BENKADI/projet-0.git
cd projet-0
```

#### 2. Configuration Backend
```bash
cd backend
npm install
cp .env.example .env
### Étape 4: Migrer et initialiser la base de données
```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run prisma:seed  # Crée l'admin par défaut
```

**📧 Identifiants Admin par défaut :**
- Email: `admin@projet0.com`
- Mot de passe: `Admin123!`
- ⚠️ **Changez le mot de passe après la première connexion !**

#### 3. Configuration Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Modifier .env si nécessaire
```

### Option 3: Avec Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Les services seront disponibles:
# - Frontend: http://localhost:3001
# - Backend: http://localhost:3000
# - PostgreSQL: localhost:5432
```

## 🚀 Utilisation

### Développement local

#### Avec Make (recommandé)
```bash
make dev              # Démarrer l'environnement de développement
make docker-up        # Démarrer avec Docker Compose
make prisma-studio    # Ouvrir Prisma Studio
make format           # Formater le code
make lint             # Vérifier le code
```

#### Avec le script PowerShell (Windows)
```powershell
.\app-manager.ps1
```

**Menu interactif:**
1. Démarrer l'application (Backend + Frontend)
2. Arrêter l'application
3. Redémarrer l'application
4. Démarrer Prisma Studio
5. Quitter

#### Manuellement

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

**Prisma Studio:**
```bash
cd backend
npm run prisma:studio
```

### 🌐 URLs de l'application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Documentation API (Swagger)**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Prisma Studio**: http://localhost:5555

## 🛡️ Sécurité

Ce template intègre plusieurs bonnes pratiques de sécurité :

- **Helmet.js** - Headers HTTP sécurisés
- **Rate Limiting** - Protection contre les abus
- **CORS** - Configuration stricte
- **Validation des données** - Avec Zod
- **JWT** - Authentification sécurisée
- **bcrypt** - Hachage des mots de passe
- **Error handling** - Sans fuite d'informations sensibles

## 📚 Documentation API

L'API est documentée avec Swagger/OpenAPI.

Accédez à la documentation interactive : http://localhost:3000/api-docs

### Endpoints principaux

**Authentification**
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion

**Utilisateurs**
- `GET /users` - Liste des utilisateurs
- `GET /users/:id` - Détails d'un utilisateur
- `PUT /users/:id` - Modifier un utilisateur
- `DELETE /users/:id` - Supprimer un utilisateur

**Permissions**
- `GET /permissions` - Liste des permissions
- `POST /permissions` - Créer une permission
- `DELETE /permissions/:id` - Supprimer une permission

**Health**
- `GET /health` - Status complet
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📦 Build pour production

```bash
# Avec Make
make build

# Ou manuellement
cd backend && npm run build
cd frontend && npm run build
```

## 🐳 Déploiement Docker

```bash
# Build des images
docker-compose build

# Démarrer en production
docker-compose -f docker-compose.yml up -d
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour plus d'informations.

### Workflow de contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'feat: Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Scripts disponibles

### Backend
```bash
npm run dev              # Mode développement
npm run build            # Build TypeScript
npm start                # Démarrer la version build
npm run format           # Formater le code
npm run lint             # Vérifier le formatage
npm run prisma:generate  # Générer Prisma Client
npm run prisma:migrate   # Exécuter les migrations
npm run prisma:studio    # Ouvrir Prisma Studio
```

### Frontend
```bash
npm run dev              # Mode développement
npm run build            # Build pour production
npm run preview          # Prévisualiser le build
npm run lint             # Linter ESLint
```

## 🔧 Technologies utilisées

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Logging**: Winston
- **Security**: Helmet, express-rate-limit
- **Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)

### Frontend
- **Library**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router DOM

### DevOps
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**: Prettier, ESLint
- **Web Server**: Nginx (production)

## 📄 Licence

ISC

## 👥 Auteurs

- **BENKADI** - [GitHub](https://github.com/BENKADI)

## 🙏 Remerciements

Ce template est conçu pour accélérer le développement d'applications web modernes en fournissant une base solide et scalable.

---

⭐ **N'oubliez pas de mettre une étoile si ce projet vous est utile !**
