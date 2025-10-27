# 🔔 Guide des Notifications Temps Réel

## 📋 Vue d'Ensemble

Le système de notifications temps réel de Projet-0 offre une solution complète pour communiquer avec les utilisateurs via WebSocket, avec support email optionnel et gestion avancée des préférences.

---

## ✨ Fonctionnalités

### 🎯 **Fonctionnalités Principales**
- ✅ **Notifications temps réel** via WebSocket (Socket.IO)
- ✅ **Notifications email** optionnelles
- ✅ **Préférences utilisateur** personnalisables
- ✅ **Heures de silence** (quiet hours)
- ✅ **Priorités** (low, normal, high, urgent)
- ✅ **Types multiples** (system, user, order, payment, etc.)
- ✅ **Actions cliquables** avec URL et texte
- ✅ **Badge de compteur** non lues
- ✅ **Marquer comme lu** individuel ou en masse
- ✅ **Suppression** individuelle ou en masse
- ✅ **Statistiques** et analytics

---

## 🏗️ Architecture

### Backend
```
backend/src/modules/notifications/
├── dto/NotificationDTO.ts           # Types et validation
├── services/NotificationService.ts  # Business logic + WebSocket
├── controllers/NotificationController.ts # API endpoints
└── routes/notificationRoutes.ts     # Routes Express
```

### Frontend
```
frontend/src/
├── hooks/useNotifications.ts        # Hook React principal
└── components/notifications/
    ├── NotificationBell.tsx         # Icon avec badge
    └── NotificationList.tsx         # Liste notifications
```

---

## 🚀 Utilisation Backend

### 1. Initialiser le Service

```typescript
import { NotificationService } from './modules/notifications/services/NotificationService';
import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';

const prisma = new PrismaClient();
const io = new SocketIOServer(server);

const notificationService = new NotificationService(
  prisma,
  cacheService,
  auditService
);

// Configurer WebSocket
notificationService.setSocketIO(io);
```

### 2. Envoyer une Notification

```typescript
// Notification simple
await notificationService.sendNotification(userId, {
  type: 'system',
  title: 'Bienvenue !',
  message: 'Votre compte a été créé avec succès.',
  priority: 'normal',
  sendEmail: true,
});

// Notification avec action
await notificationService.sendNotification(userId, {
  type: 'order_created',
  title: 'Nouvelle commande',
  message: 'Votre commande #1234 a été créée.',
  priority: 'high',
  actionUrl: '/orders/1234',
  actionText: 'Voir la commande',
  data: { orderId: '1234', amount: 99.99 },
});
```

### 3. Notifications en Masse

```typescript
// Envoyer à plusieurs utilisateurs
await notificationService.sendBulkNotifications(
  ['user1', 'user2', 'user3'],
  {
    type: 'system',
    title: 'Maintenance programmée',
    message: 'Une maintenance aura lieu ce soir à 22h.',
    priority: 'high',
  }
);
```

### 4. Routes API Disponibles

```typescript
// Récupérer notifications
GET /api/notifications
GET /api/notifications/unread-count
GET /api/notifications/stats?start=2025-01-01&end=2025-12-31

// Gérer notifications
PUT /api/notifications/:id/read
POST /api/notifications/read          // Multiple
POST /api/notifications/read/all      // Toutes
DELETE /api/notifications/:id
DELETE /api/notifications/read/all

// Préférences
GET /api/notifications/preferences
PUT /api/notifications/preferences

// Admin
POST /api/notifications/send          // Envoyer à un user
POST /api/notifications/send/bulk     // Envoyer en masse
POST /api/notifications/cleanup       // Nettoyer anciennes
```

---

## 🎨 Utilisation Frontend

### 1. Hook useNotifications

```tsx
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const {
    notifications,      // Liste notifications
    unreadCount,        // Nombre non lues
    loading,            // État chargement
    error,              // Erreur éventuelle
    markAsRead,         // Marquer comme lu
    markAllAsRead,      // Tout marquer
    deleteNotification, // Supprimer
    preferences,        // Préférences
    updatePreferences,  // Mettre à jour préfs
  } = useNotifications();

  return (
    <div>
      <h2>Notifications ({unreadCount})</h2>
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. NotificationBell Component

```tsx
import { NotificationBell } from '@/components/notifications/NotificationBell';

function AppLayout() {
  return (
    <header>
      <nav>
        {/* Autres éléments */}
        <NotificationBell />
      </nav>
    </header>
  );
}
```

Le composant affiche automatiquement :
- ✅ Icône de cloche
- ✅ Badge avec nombre de non lues
- ✅ Dropdown avec liste des notifications
- ✅ Bouton "Mark all as read"
- ✅ Lien vers page notifications complète

### 3. NotificationList Component

```tsx
import { NotificationList } from '@/components/notifications/NotificationList';

function NotificationsPage() {
  const { notifications, markAsRead, deleteNotification } = useNotifications();

  return (
    <div>
      <h1>Toutes les notifications</h1>
      <NotificationList
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
        compact={false}
      />
    </div>
  );
}
```

---

## ⚙️ Configuration Préférences

### Types de Préférences

```typescript
interface NotificationPreferences {
  emailEnabled: boolean;              // Activer emails
  pushEnabled: boolean;               // Activer push
  enabledTypes: string[];             // Types à recevoir
  typePreferences: Record<string, boolean>; // Préfs par type
  quietHoursStart?: string;           // Début heures silence
  quietHoursEnd?: string;             // Fin heures silence
}
```

### Exemple d'Utilisation

```typescript
// Mettre à jour préférences
await updatePreferences({
  emailEnabled: true,
  pushEnabled: true,
  enabledTypes: ['system', 'order_created', 'payment_success'],
  typePreferences: {
    'inventory_alert': false,  // Désactiver ces notifs
  },
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
});
```

### Respect des Préférences

Le système respecte automatiquement :
- ✅ Types de notifications désactivés
- ✅ Préférences spécifiques par type
- ✅ Heures de silence (sauf priorité "urgent")
- ✅ Préférences email/push

---

## 🎯 Types de Notifications

### Types Disponibles

```typescript
enum NotificationType {
  SYSTEM = 'system',                    // Notifications système
  USER = 'user',                        // Liées au compte
  WELCOME = 'welcome',                  // Bienvenue
  PASSWORD_CHANGED = 'password_changed', // Mot de passe changé
  ROLE_CHANGE = 'role_change',          // Rôle modifié
  ACCOUNT_DELETED = 'account_deleted',  // Compte supprimé
  INVENTORY_ALERT = 'inventory_alert',  // Stock faible
  ORDER_CREATED = 'order_created',      // Commande créée
  ORDER_UPDATED = 'order_updated',      // Commande mise à jour
  ORDER_COMPLETED = 'order_completed',  // Commande terminée
  PAYMENT_SUCCESS = 'payment_success',  // Paiement réussi
  PAYMENT_FAILED = 'payment_failed',    // Paiement échoué
}
```

### Priorités

```typescript
enum NotificationPriority {
  LOW = 'low',        // Priorité basse (gris)
  NORMAL = 'normal',  // Priorité normale (bleu)
  HIGH = 'high',      // Priorité haute (orange)
  URGENT = 'urgent',  // Priorité urgente (rouge)
}
```

---

## 📊 Statistiques & Analytics

### Obtenir les Stats

```typescript
const stats = await notificationService.getNotificationStats(userId, {
  start: new Date('2025-01-01'),
  end: new Date('2025-12-31'),
});

console.log(stats);
// {
//   total: 150,
//   byType: {
//     system: 20,
//     order_created: 50,
//     payment_success: 80
//   },
//   byPriority: {
//     normal: 100,
//     high: 40,
//     urgent: 10
//   },
//   readRate: 85.5
// }
```

---

## 🔧 Maintenance

### Nettoyer Anciennes Notifications

```typescript
// Supprimer notifications > 30 jours (lues seulement)
const deletedCount = await notificationService.cleanupOldNotifications(30);
console.log(`${deletedCount} notifications supprimées`);
```

### Tâche Cron Recommandée

```typescript
// Exécuter tous les jours à 2h du matin
cron.schedule('0 2 * * *', async () => {
  await notificationService.cleanupOldNotifications(90); // 90 jours
});
```

---

## 🎨 Personnalisation UI

### Couleurs par Priorité

```typescript
// NotificationList applique automatiquement :
priority === 'urgent'  → Rouge
priority === 'high'    → Orange
priority === 'normal'  → Bleu
priority === 'low'     → Gris
```

### Icônes par Type

```typescript
type === 'system'          → Bell
type === 'user'            → UserCheck
type === 'password_changed'→ Shield
type === 'inventory_alert' → Package
type === 'order_created'   → ShoppingCart
type === 'order_completed' → CheckCircle
type === 'payment_success' → CreditCard (vert)
type === 'payment_failed'  → AlertCircle (rouge)
```

---

## 🔒 Sécurité

### Authentification WebSocket

```typescript
// Le hook useNotifications envoie automatiquement le token
const socket = io(WS_URL, {
  auth: {
    token: localStorage.getItem('token'),
  },
});
```

### Isolation Utilisateur

- ✅ Chaque utilisateur rejoint sa propre room
- ✅ Notifications envoyées uniquement à la room appropriée
- ✅ Vérification userId sur toutes les requêtes API
- ✅ Audit trail de toutes les actions

---

## 📦 Installation Dépendances

### Backend

```bash
npm install socket.io
npm install @types/socket.io --save-dev
```

### Frontend

```bash
npm install socket.io-client
npm install date-fns
```

---

## 🧪 Tests

### Test Backend

```typescript
describe('NotificationService', () => {
  it('should send notification successfully', async () => {
    const notification = await notificationService.sendNotification(userId, {
      type: 'system',
      title: 'Test',
      message: 'Test message',
    });

    expect(notification).toBeDefined();
    expect(notification.userId).toBe(userId);
    expect(notification.read).toBe(false);
  });
});
```

### Test Frontend

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useNotifications } from '@/hooks/useNotifications';

test('should load notifications', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useNotifications());

  await waitForNextUpdate();

  expect(result.current.notifications).toHaveLength(5);
  expect(result.current.unreadCount).toBe(3);
});
```

---

## 📚 Exemples Complets

### Exemple 1: Notification de Bienvenue

```typescript
// Lors de l'inscription
const newUser = await userService.createUser(data);

await notificationService.sendNotification(newUser.id, {
  type: 'welcome',
  title: 'Bienvenue sur Projet-0 !',
  message: 'Merci de rejoindre notre communauté. Découvrez toutes les fonctionnalités.',
  priority: 'normal',
  sendEmail: true,
  actionUrl: '/dashboard',
  actionText: 'Commencer',
});
```

### Exemple 2: Alerte Stock Faible

```typescript
// Dans ProductService
if (product.inventory <= product.lowStockThreshold) {
  const admins = await userService.getAdminUsers();
  
  await notificationService.sendBulkNotifications(
    admins.map(a => a.id),
    {
      type: 'inventory_alert',
      title: 'Stock faible',
      message: `Le produit "${product.name}" a un stock faible (${product.inventory} unités)`,
      priority: 'high',
      actionUrl: `/products/${product.id}`,
      actionText: 'Voir le produit',
      data: {
        productId: product.id,
        currentStock: product.inventory,
        threshold: product.lowStockThreshold,
      },
    }
  );
}
```

### Exemple 3: Confirmation Commande

```typescript
// Lors de la création d'une commande
const order = await orderService.createOrder(orderData);

await notificationService.sendNotification(order.userId, {
  type: 'order_created',
  title: 'Commande confirmée',
  message: `Votre commande #${order.id} a été créée avec succès. Montant: ${order.total}€`,
  priority: 'high',
  sendEmail: true,
  actionUrl: `/orders/${order.id}`,
  actionText: 'Suivre ma commande',
  data: {
    orderId: order.id,
    amount: order.total,
    items: order.items.length,
  },
});
```

---

## 🎯 Bonnes Pratiques

### 1. **Utiliser les Types Appropriés**
```typescript
✅ Utiliser 'system' pour messages généraux
✅ Utiliser types spécifiques pour actions métier
✅ Choisir priorité en fonction de l'urgence
```

### 2. **Messages Clairs et Concis**
```typescript
✅ Titre court et descriptif (max 50 caractères)
✅ Message informatif mais concis (max 200 caractères)
✅ Ajouter actionText si action disponible
```

### 3. **Respect des Préférences**
```typescript
✅ Toujours vérifier les préférences utilisateur
✅ Ne pas spammer avec trop de notifications
✅ Respecter les quiet hours sauf urgence
```

### 4. **Performance**
```typescript
✅ Utiliser bulk notifications pour groupes
✅ Nettoyer régulièrement anciennes notifications
✅ Éviter d'envoyer trop de data dans payload
```

---

## 🐛 Troubleshooting

### WebSocket ne se connecte pas
```typescript
// Vérifier URL WebSocket
console.log(process.env.VITE_WS_URL);

// Vérifier token
console.log(localStorage.getItem('token'));

// Vérifier logs serveur
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});
```

### Notifications non reçues
```typescript
// Vérifier que l'utilisateur a rejoint la room
socket.emit('join', userId);

// Vérifier les préférences
const prefs = await notificationService.getUserPreferences(userId);
console.log(prefs);
```

### Badge count incorrect
```typescript
// Rafraîchir le count manuellement
await refreshNotifications();

// Vérifier dans la DB
SELECT COUNT(*) FROM notifications 
WHERE userId = ? AND read = false;
```

---

## 📖 Ressources

- **Socket.IO Documentation**: https://socket.io/docs/
- **React Hooks Best Practices**: https://react.dev/reference/react
- **WebSocket Security**: https://owasp.org/www-community/vulnerabilities/WebSocket_Security

---

*Notifications temps réel prêtes pour production !* 🔔✨
