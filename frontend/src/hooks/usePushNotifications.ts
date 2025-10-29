import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Vérifier le support des notifications
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);

        // Enregistrer le Service Worker
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          setRegistration(reg);

          // Vérifier si déjà abonné
          const subscription = await reg.pushManager.getSubscription();
          setIsSubscribed(!!subscription);

          console.log('Service Worker enregistré:', reg);
        } catch (error) {
          console.error('Erreur enregistrement Service Worker:', error);
        }
      }
    };

    checkSupport();
  }, []);

  // Demander la permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Erreur permission notifications:', error);
      return false;
    }
  }, [isSupported]);

  // S'abonner aux notifications push
  const subscribe = useCallback(async (serverKey?: string) => {
    if (!registration || !isSupported) return null;

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(serverKey || 'BDefaultServerKeyForDevelopment1234567890')
      });

      setIsSubscribed(true);
      console.log('Abonné aux notifications push:', subscription);

      // Ici vous enverriez normalement la subscription au serveur
      // await axios.post('/notifications/subscribe', { subscription });

      return subscription;
    } catch (error) {
      console.error('Erreur abonnement push:', error);
      return null;
    }
  }, [registration, isSupported]);

  // Se désabonner
  const unsubscribe = useCallback(async () => {
    if (!registration) return;

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
        console.log('Désabonné des notifications push');

        // Ici vous enverriez normalement la demande au serveur
        // await axios.post('/notifications/unsubscribe');
      }
    } catch (error) {
      console.error('Erreur désabonnement:', error);
    }
  }, [registration]);

  // Envoyer une notification de test
  const sendTestNotification = useCallback(async () => {
    if (permission !== 'granted' || !isSubscribed) {
      toast.error('Notifications non activées');
      return;
    }

    try {
      const notification = new Notification('Test de notification', {
        body: 'Ceci est une notification de test !',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'test-notification'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      toast.success('Notification de test envoyée');
    } catch (error) {
      console.error('Erreur notification test:', error);
      toast.error('Erreur envoi notification');
    }
  }, [permission, isSubscribed]);

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
};

// Hook pour WebSocket
export const useWebSocket = (url?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (!url) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connecté');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setMessages(prev => [...prev.slice(-49), message]); // Garder les 50 derniers messages

          // Gérer les différents types de messages
          handleMessage(message);
        } catch (e) {
          console.warn('Message WebSocket non JSON:', event.data);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket déconnecté');
        setIsConnected(false);
        wsRef.current = null;

        // Tentative de reconnexion
        if (reconnectAttempts.current < 5) {
          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Tentative de reconnexion ${reconnectAttempts.current}/5`);
            connect();
          }, 2000 * reconnectAttempts.current);
        }
      };

      ws.onerror = (event) => {
        console.error('Erreur WebSocket:', event);
        setError('Erreur de connexion WebSocket');
      };

    } catch (e) {
      console.error('Erreur création WebSocket:', e);
      setError('Impossible de se connecter');
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((type: string, data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
      wsRef.current.send(message);
    } else {
      console.warn('WebSocket non connecté, message non envoyé');
    }
  }, []);

  // Gestionnaire de messages
  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'notification':
        toast.info(message.data.body || 'Nouvelle notification');
        break;
      case 'system_alert':
        toast.warning(message.data.body || 'Alerte système');
        break;
      case 'user_online':
        console.log('Utilisateur en ligne:', message.data);
        break;
      case 'user_offline':
        console.log('Utilisateur hors ligne:', message.data);
        break;
      default:
        console.log('Message WebSocket:', message);
    }
  }, []);

  // Connexion automatique
  useEffect(() => {
    if (url) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);

  return {
    isConnected,
    messages,
    error,
    connect,
    disconnect,
    sendMessage,
  };
};

// Utilitaire pour convertir la clé VAPID
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
