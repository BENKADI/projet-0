// Service Worker pour les notifications push
const CACHE_NAME = 'projet-0-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
  // Force l'activation immédiate
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Prendre le contrôle immédiatement
  self.clients.claim();
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('Push message received:', event);

  let data = { title: 'Notification', body: 'Vous avez une nouvelle notification', icon: '/icon-192x192.png' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gestion du clic sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Ouvrir l'application
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
