# 📦 Guide d'Installation Complet - Projet-0 Template

## 🎯 Vue d'Ensemble

Guide complet pour installer et configurer le template Projet-0 avec toutes les fonctionnalités enterprise-grade implémentées.

---

## 📋 Prérequis

### Logiciels Requis
```bash
✅ Node.js >= 20.x
✅ npm >= 10.x ou pnpm >= 8.x
✅ PostgreSQL >= 15.x
✅ Redis >= 7.x (optionnel mais recommandé)
✅ Git >= 2.40
```

### Comptes & Services (Optionnels)
```bash
- SendGrid (notifications email)
- AWS S3 (stockage fichiers)
- Sentry (error tracking)
- Prometheus/Grafana (monitoring)
```

---

## 🚀 Installation Rapide (5 minutes)

### 1. Cloner le Repository

```bash
git clone https://github.com/BENKADI/projet-0.git
cd projet-0
```

### 2. Installer les Dépendances

#### Backend
```bash
cd backend
npm install

# Dépendances additionnelles pour nouvelles features
npm install socket.io
npm install @types/socket.io --save-dev
```

#### Frontend
```bash
cd ../frontend
npm install

# Dépendances pour notifications et i18n
npm install socket.io-client
npm install date-fns
npm install i18next react-i18next i18next-browser-languagedetector
npm install sonner # Pour les toasts
```

### 3. Configuration Environnement

#### Backend `.env`
```bash
cd backend
cp .env.example .env
```

Éditer `.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/projet0"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Redis (Optionnel)
REDIS_URL="redis://localhost:6379"

# Email (Optionnel - SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@your-domain.com"

# Monitoring (Optionnel)
PROMETHEUS_ENABLED="true"
SENTRY_DSN="your-sentry-dsn"

# Server
PORT=3000
NODE_ENV="development"
```

#### Frontend `.env`
```bash
cd ../frontend
cp .env.example .env
```

Éditer `.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
VITE_APP_NAME=Projet-0
```

### 4. Base de Données

```bash
cd backend

# Générer le client Prisma
npx prisma generate

# Créer la base de données
npx prisma db push

# Seed données de test (optionnel)
npm run seed
```

### 5. Démarrage

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

#### Terminal 3 - Redis (si installé localement)
```bash
redis-server
```

### 6. Accès Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

---

## 🔧 Configuration Avancée

### Notifications Temps Réel

#### 1. Ajouter le Provider dans `App.tsx`

```tsx
// frontend/src/App.tsx
import { NotificationProvider } from './providers/NotificationProvider';

function App() {
  return (
    <NotificationProvider>
      {/* Votre application */}
    </NotificationProvider>
  );
}
```

#### 2. Intégrer NotificationBell dans le Layout

```tsx
// frontend/src/layouts/AppLayout.tsx
import { NotificationBell } from '@/components/notifications/NotificationBell';

function AppLayout() {
  return (
    <div>
      <header>
        <nav>
          {/* Autres éléments */}
          <NotificationBell />
        </nav>
      </header>
      {/* Reste du layout */}
    </div>
  );
}
```

#### 3. Configurer WebSocket Backend

```typescript
// backend/src/server.ts
import { Server as SocketIOServer } from 'socket.io';
import { NotificationService } from './modules/notifications/services/NotificationService';

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

const notificationService = new NotificationService(prisma, cacheService, auditService);
notificationService.setSocketIO(io);
```

### Internationalisation (i18n)

#### 1. Initialiser i18n dans `main.tsx`

```tsx
// frontend/src/main.tsx
import './i18n/config';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>
);
```

#### 2. Utiliser les Traductions

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard.welcome', { name: user.name })}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

#### 3. Créer un Sélecteur de Langue

```tsx
// frontend/src/components/LanguageSelector.tsx
import { useTranslation } from 'react-i18next';
import { languages } from '@/i18n/config';

export function LanguageSelector() {
  const { i18n } = useTranslation();

  return (
    <select 
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### Monitoring avec Prometheus & Grafana

#### 1. Démarrer la Stack Monitoring

```bash
# Dans le dossier racine
docker-compose up -d prometheus grafana redis
```

#### 2. Accès aux Services

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **Redis**: localhost:6379

#### 3. Configurer Grafana

1. Aller sur http://localhost:3001
2. Login: admin/admin
3. Ajouter Data Source → Prometheus
4. URL: http://prometheus:9090
5. Save & Test
6. Importer le dashboard depuis `monitoring/grafana/dashboards/`

### Storybook (Component Library)

```bash
cd frontend

# Installer Storybook
npm install --save-dev @storybook/react-vite

# Démarrer Storybook
npm run storybook
```

Accès: http://localhost:6006

---

## 🧪 Tests

### Backend Tests

```bash
cd backend

# Tests unitaires
npm run test

# Tests avec coverage
npm run test:coverage

# Tests E2E
npm run test:e2e
```

### Frontend Tests

```bash
cd frontend

# Tests unitaires
npm run test

# Tests avec UI
npm run test:ui

# Tests E2E avec Playwright
npm run test:e2e
```

---

## 📦 Build Production

### Backend

```bash
cd backend

# Build
npm run build

# Démarrer en production
npm run start
```

### Frontend

```bash
cd frontend

# Build
npm run build

# Preview build
npm run preview
```

---

## 🐳 Docker

### Development avec Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

### Production avec Docker

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Démarrer en production
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Sécurité

### Configuration SSL/TLS (Production)

```bash
# Générer certificats Let's Encrypt
certbot certonly --standalone -d yourdomain.com
```

Configurer nginx ou Caddy comme reverse proxy.

### Variables d'Environnement Sensibles

```bash
# Ne JAMAIS commiter .env
# Utiliser des secrets managers en production
# Ex: AWS Secrets Manager, HashiCorp Vault
```

### CORS Configuration

```typescript
// backend/src/server.ts
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
```

---

## 📊 Monitoring & Logging

### Logs Application

```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend logs (browser console)
# Activé en développement, désactivé en production
```

### Métriques Prometheus

```bash
# Endpoint métriques
curl http://localhost:3000/metrics
```

### Health Checks

```bash
# Application health
curl http://localhost:3000/health

# Liveness probe
curl http://localhost:3000/health/liveness

# Readiness probe
curl http://localhost:3000/health/readiness
```

---

## 🚨 Troubleshooting

### Database Connection Error

```bash
# Vérifier PostgreSQL
pg_isready -h localhost -p 5432

# Vérifier DATABASE_URL
echo $DATABASE_URL

# Recréer base de données
dropdb projet0
createdb projet0
npx prisma db push
```

### Redis Connection Error

```bash
# Vérifier Redis
redis-cli ping
# Devrait retourner: PONG

# Redémarrer Redis
redis-cli shutdown
redis-server
```

### WebSocket Connection Failed

```bash
# Vérifier URL WebSocket
echo $VITE_WS_URL

# Vérifier CORS backend
# Ajouter origin frontend dans cors config

# Vérifier firewall
netstat -an | grep 3000
```

### Build Errors

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

---

## 📚 Scripts Disponibles

### Backend
```json
{
  "dev": "Démarrage développement",
  "build": "Build production",
  "start": "Démarrage production",
  "test": "Tests unitaires",
  "test:e2e": "Tests E2E",
  "lint": "Linter",
  "prisma:generate": "Générer client Prisma",
  "prisma:migrate": "Migrations DB",
  "seed": "Seed données test"
}
```

### Frontend
```json
{
  "dev": "Démarrage développement",
  "build": "Build production",
  "preview": "Preview build",
  "test": "Tests unitaires",
  "test:e2e": "Tests E2E",
  "lint": "Linter",
  "storybook": "Démarrer Storybook"
}
```

---

## 🎯 Prochaines Étapes

### Après Installation

1. ✅ **Tester l'application** - Créer compte, naviguer
2. ✅ **Configurer monitoring** - Prometheus + Grafana
3. ✅ **Activer notifications** - WebSocket + Email
4. ✅ **Configurer i18n** - Tester changement langue
5. ✅ **Personnaliser** - Logo, couleurs, contenu

### Configuration Production

1. **Domaine & DNS** - Configurer domaine
2. **SSL/TLS** - Certificats Let's Encrypt
3. **CDN** - CloudFlare ou similaire
4. **Database** - PostgreSQL managé (AWS RDS, etc.)
5. **Caching** - Redis managé
6. **Monitoring** - Sentry, Datadog
7. **Backup** - Stratégie backup automatique
8. **CI/CD** - GitHub Actions ou GitLab CI

---

## 📞 Support

### Ressources
- **Documentation**: Voir dossier `/docs`
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

### Guides Spécifiques
- [Guide Notifications](./NOTIFICATIONS_GUIDE.md)
- [Guide Features](./FEATURES_GUIDE.md)
- [Guide Utilisateur](./USER_GUIDE.md)

---

## 🎉 Félicitations !

Votre installation de Projet-0 est complète !

**Template enterprise-grade prêt à l'emploi** 🚀✨

Next: Personnaliser et déployer votre application !
