# 🚀 Guide d'Installation des Améliorations

Ce document explique comment installer et utiliser les améliorations apportées au projet.

---

## 📦 Installation des Nouvelles Dépendances

### Backend

```bash
cd backend
npm install
```

**Nouvelles dépendances installées:**
- `jest` - Framework de tests
- `@jest/globals` - Types Jest globaux
- `@types/jest` - Types TypeScript pour Jest
- `ts-jest` - Preset Jest pour TypeScript
- `supertest` - Tests API HTTP
- `@types/supertest` - Types pour Supertest

### Frontend

```bash
cd frontend
npm install
```

**Nouvelles dépendances installées:**
- `vitest` - Framework de tests moderne
- `@vitest/ui` - Interface UI pour Vitest
- `@testing-library/react` - Tests composants React
- `@testing-library/jest-dom` - Matchers personnalisés
- `@testing-library/user-event` - Simulation interactions utilisateur
- `jsdom` - Environnement DOM pour tests

---

## 🧪 Exécution des Tests

### Backend - Jest

```bash
cd backend

# Exécuter tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec coverage
npm test

# Tests pour CI/CD
npm run test:ci
```

### Frontend - Vitest

```bash
cd frontend

# Exécuter tous les tests
npm test

# Tests avec interface UI
npm run test:ui

# Tests avec coverage
npm run test:coverage
```

---

## 🔧 TypeScript - Vérification de Types

```bash
# Backend
cd backend
npm run type-check

# Frontend
cd frontend
npm run type-check
```

---

## 🐳 Docker en Production

### Configuration Docker Production

Trois nouveaux fichiers ont été créés:

1. **docker-compose.prod.yml** - Configuration production
2. **backend/Dockerfile.prod** - Image optimisée backend
3. **frontend/Dockerfile.prod** - Image optimisée frontend avec Nginx

### Démarrer en Production

```bash
# Build et démarrage
docker-compose -f docker-compose.prod.yml up -d --build

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Arrêter
docker-compose -f docker-compose.prod.yml down
```

### Configuration des Secrets

Créer un dossier `secrets` à la racine:

```bash
mkdir secrets
echo "your-secure-database-password" > secrets/db_password.txt
```

### Variables d'Environnement Production

Créer `.env.production` dans le dossier backend:

```bash
cp backend/.env.example backend/.env.production
# Éditer .env.production avec les valeurs de production
```

**⚠️ Important:** Ne JAMAIS commiter `.env.production` ou le dossier `secrets/`

---

## 🔐 Validation des Variables d'Environnement

Un nouveau système de validation a été ajouté: `backend/src/config/env.config.ts`

### Utilisation

```typescript
import env from './config/env.config';

// Accès typé et validé aux variables d'environnement
const port = env.PORT; // number
const jwtSecret = env.JWT_SECRET; // string (min 32 chars)
const nodeEnv = env.NODE_ENV; // 'development' | 'production' | 'test'
```

### Avantages

- ✅ **Validation au démarrage** - Erreur immédiate si config invalide
- ✅ **Types TypeScript** - Autocomplétion et vérification de types
- ✅ **Valeurs par défaut** - Configuration cohérente
- ✅ **Documentation** - Schéma Zod auto-documenté

---

## 📊 Configuration TypeScript Optimisée

### Backend - tsconfig.json

Nouvelles options activées:
- `outDir: "./dist"` - Output organisé
- `rootDir: "./src"` - Source claire
- `sourceMap: true` - Debug facilité
- `noUnusedLocals: true` - Code propre
- `noUnusedParameters: true` - Pas de params inutilisés
- `noImplicitReturns: true` - Returns explicites
- `noUncheckedIndexedAccess: true` - Accès indexés sûrs

### Impact

Le code sera plus strict et détectera plus d'erreurs potentielles.

**Actions recommandées:**

```bash
# Vérifier les erreurs TypeScript
cd backend
npm run type-check

# Fix les erreurs automatiques
npm run format
```

---

## 🏗️ Structure des Tests

### Backend

```
backend/
├── src/
│   ├── __tests__/
│   │   ├── setup.ts           # Configuration globale
│   │   ├── example.test.ts    # Tests d'exemple
│   │   └── integration/       # Tests d'intégration (à créer)
│   ├── controllers/
│   │   └── *.test.ts          # Tests unitaires des controllers
│   └── services/
│       └── *.test.ts          # Tests unitaires des services
└── jest.config.js
```

### Frontend

```
frontend/
├── src/
│   ├── __tests__/
│   │   ├── setup.ts           # Configuration globale
│   │   └── App.test.tsx       # Test d'exemple
│   ├── components/
│   │   └── *.test.tsx         # Tests des composants
│   └── hooks/
│       └── *.test.ts          # Tests des hooks
└── vitest.config.ts
```

---

## 📈 Objectifs de Couverture de Code

### Configuration Actuelle

**Backend (Jest):**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

**Frontend (Vitest):**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Voir le Rapport de Coverage

```bash
# Backend
cd backend
npm test
# Ouvrir: backend/coverage/lcov-report/index.html

# Frontend
cd frontend
npm run test:coverage
# Ouvrir: frontend/coverage/index.html
```

---

## 🔄 Workflow de Développement Recommandé

### 1. Développement TDD (Test-Driven Development)

```bash
# Terminal 1: Tests en watch mode
npm run test:watch

# Terminal 2: Application en mode dev
npm run dev
```

### 2. Avant de Commiter

```bash
# Vérifier le formatage
npm run format

# Vérifier le linting
npm run lint

# Vérifier TypeScript
npm run type-check

# Exécuter les tests
npm test
```

### 3. CI/CD

Les tests sont automatiquement exécutés sur GitHub Actions lors des:
- Push sur `main` et `develop`
- Pull Requests

---

## 🛠️ Makefile - Nouvelles Commandes

```bash
# Tests
make test              # Exécuter tous les tests

# Build optimisé
make build

# Docker production
make docker-prod-up    # À ajouter si besoin
make docker-prod-down  # À ajouter si besoin
```

---

## 📝 Écrire de Nouveaux Tests

### Backend - Test Unitaire

```typescript
// src/services/auth.service.test.ts
import { describe, it, expect, jest } from '@jest/globals';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('should create a JWT token', () => {
    const service = new AuthService();
    const token = service.createToken({ userId: 1 });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });
});
```

### Backend - Test d'Intégration

```typescript
// src/__tests__/integration/auth.test.ts
import request from 'supertest';
import app from '../../index';

describe('POST /auth/login', () => {
  it('should login successfully', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@projet0.com',
        password: 'Admin123!',
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

### Frontend - Test Composant

```typescript
// src/components/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

---

## 🚨 Résolution des Problèmes

### Erreurs TypeScript après installation

**Symptôme:** Erreurs "Cannot find module" ou "Cannot find name 'jest'"

**Solution:**
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Régénérer Prisma Client (backend uniquement)
cd backend
npx prisma generate
```

### Tests qui échouent

**Backend:**
```bash
# Vérifier la configuration Jest
cd backend
npx jest --showConfig

# Exécuter un test spécifique
npx jest src/__tests__/example.test.ts
```

**Frontend:**
```bash
# Vérifier la configuration Vitest
cd frontend
npx vitest --run

# Mode debug
npx vitest --inspect-brk
```

### Problèmes Docker Production

```bash
# Nettoyer les images et volumes
docker-compose -f docker-compose.prod.yml down -v
docker system prune -a

# Rebuild complet
docker-compose -f docker-compose.prod.yml build --no-cache
```

---

## 📚 Ressources Supplémentaires

### Documentation

- [Jest](https://jestjs.io/)
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)

### Fichiers Créés

1. **Backend:**
   - `backend/jest.config.js`
   - `backend/src/__tests__/setup.ts`
   - `backend/src/__tests__/example.test.ts`
   - `backend/src/config/env.config.ts`
   - `backend/Dockerfile.prod`
   - `backend/.env.example` (mis à jour)
   - `backend/tsconfig.json` (optimisé)

2. **Frontend:**
   - `frontend/vitest.config.ts`
   - `frontend/src/__tests__/setup.ts`
   - `frontend/src/__tests__/App.test.tsx`
   - `frontend/Dockerfile.prod`
   - `frontend/nginx.prod.conf`

3. **Root:**
   - `docker-compose.prod.yml`
   - `STACK_ANALYSIS.md`
   - `IMPROVEMENTS_GUIDE.md` (ce fichier)

---

## ✅ Checklist Post-Installation

- [ ] Installer les dépendances backend (`cd backend && npm install`)
- [ ] Installer les dépendances frontend (`cd frontend && npm install`)
- [ ] Exécuter les tests backend (`cd backend && npm test`)
- [ ] Exécuter les tests frontend (`cd frontend && npm test`)
- [ ] Vérifier TypeScript backend (`cd backend && npm run type-check`)
- [ ] Vérifier TypeScript frontend (`cd frontend && npm run type-check`)
- [ ] Mettre à jour `.env` avec les nouvelles variables
- [ ] Tester le build Docker production
- [ ] Créer des secrets pour la production
- [ ] Mettre à jour la CI/CD si nécessaire
- [ ] Documenter les tests spécifiques au projet

---

## 🎯 Prochaines Étapes

1. **Écrire des tests** pour les features existantes
2. **Atteindre 70%+ de coverage**
3. **Ajouter des tests E2E** avec Playwright (optionnel)
4. **Configurer les pre-commit hooks** avec Husky
5. **Implémenter le caching** avec Redis
6. **Ajouter le monitoring** avec Sentry

---

**Mainteneur:** BENKADI  
**Date:** 16 Octobre 2025  
**Version:** 1.0.0
