import { useState, useEffect } from 'react';
import { Bell, BellOff, TestTube, Settings, AlertTriangle } from 'lucide-react';
import { usePushNotifications, useWebSocket } from '../../hooks/usePushNotifications';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

export default function PushNotificationsSettings() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [wsUrl, setWsUrl] = useState('ws://localhost:3000');
  const [serverKey, setServerKey] = useState('');

  const {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  const { isConnected, error: wsError, sendMessage } = useWebSocket(wsUrl);

  useEffect(() => {
    // Charger la configuration depuis les variables d'environnement
    setWsUrl(import.meta.env.VITE_WS_URL || 'ws://localhost:3000');
    setServerKey(import.meta.env.VITE_VAPID_PUBLIC_KEY || '');
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success('Permission de notifications accordée');
    } else {
      toast.error('Permission de notifications refusée');
    }
  };

  const handleSubscribe = async () => {
    const subscription = await subscribe(serverKey);
    if (subscription) {
      toast.success('Abonné aux notifications push');
    } else {
      toast.error('Erreur lors de l\'abonnement');
    }
  };

  const handleUnsubscribe = async () => {
    await unsubscribe();
    toast.success('Désabonné des notifications push');
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
  };

  const handleSendWsTestMessage = () => {
    if (isConnected) {
      sendMessage('test', { message: 'Test WebSocket', userId: user?.id });
      toast.success('Message WebSocket envoyé');
    } else {
      toast.error('WebSocket non connecté');
    }
  };

  if (!isSupported) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Navigateur non compatible</h3>
        <p className="text-gray-500">
          Les notifications push ne sont pas supportées par votre navigateur.
          <br />Utilisez Chrome, Firefox ou Edge pour une meilleure expérience.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-500" />
          Notifications Temps Réel
        </h3>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            WebSocket
          </div>
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
            isSubscribed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-gray-500'}`} />
            Push
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Configuration WebSocket */}
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-purple-500" />
            <h4 className="font-medium">Configuration WebSocket</h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">URL WebSocket</label>
              <input
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="ws://localhost:3000"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 text-sm ${
                isConnected ? 'text-green-600' : 'text-red-600'
              }`}>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </div>

              {wsError && (
                <span className="text-sm text-red-600">{wsError}</span>
              )}
            </div>

            <button
              onClick={handleSendWsTestMessage}
              disabled={!isConnected}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Test WebSocket
            </button>
          </div>
        </div>

        {/* Configuration Push Notifications */}
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-green-500" />
            <h4 className="font-medium">Notifications Push</h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Clé VAPID Publique</label>
              <input
                type="text"
                value={serverKey}
                onChange={(e) => setServerKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono text-sm"
                placeholder="Votre clé VAPID publique"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm font-medium mb-1">Permission</div>
                <div className={`text-sm px-2 py-1 rounded ${
                  permission === 'granted' ? 'bg-green-100 text-green-700' :
                  permission === 'denied' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {permission === 'granted' ? 'Accordée' :
                   permission === 'denied' ? 'Refusée' :
                   'Non demandée'}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Abonnement</div>
                <div className={`text-sm px-2 py-1 rounded ${
                  isSubscribed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {isSubscribed ? 'Activé' : 'Désactivé'}
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {permission !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Demander permission
                </button>
              )}

              {permission === 'granted' && !isSubscribed && (
                <button
                  onClick={handleSubscribe}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  S'abonner
                </button>
              )}

              {isSubscribed && (
                <button
                  onClick={handleUnsubscribe}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Se désabonner
                </button>
              )}

              <button
                onClick={handleTestNotification}
                disabled={!isSubscribed}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                Test Push
              </button>
            </div>
          </div>
        </div>

        {/* Informations et conseils */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Informations importantes
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <div>• <strong>WebSocket:</strong> Permet les notifications temps réel (chat, alertes système)</div>
            <div>• <strong>Push:</strong> Notifications même quand l'app n'est pas ouverte (PWA requise)</div>
            <div>• <strong>VAPID:</strong> Clé nécessaire pour l'authentification des notifications push</div>
            <div>• <strong>HTTPS:</strong> Requis en production pour les notifications push</div>
          </div>
        </div>

        {/* Actions avancées */}
        {isAdmin && (
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <h4 className="font-medium mb-3 text-orange-600">Actions Administrateur</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => sendMessage('broadcast', { message: 'Test broadcast admin', type: 'system' })}
                disabled={!isConnected}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Broadcast Test
              </button>
              <button
                onClick={() => sendMessage('notification', {
                  title: 'Test Admin',
                  body: 'Notification de test envoyée par admin',
                  type: 'success'
                })}
                disabled={!isConnected}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Notif Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
