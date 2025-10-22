import { useState, useEffect } from 'react';
import { Bell, Save } from 'lucide-react';
import axios from '../../lib/axios';

interface NotificationData {
  emailNotifications: boolean;
  pushNotifications: boolean;
  emailDigest: string;
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationData>({
    emailNotifications: true,
    pushNotifications: true,
    emailDigest: 'daily',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/settings/preferences');
      setSettings({
        emailNotifications: response.data.emailNotifications,
        pushNotifications: response.data.pushNotifications,
        emailDigest: response.data.emailDigest,
      });
    } catch (error) {
      console.error('Erreur lors du chargement');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/settings/preferences', settings);
      alert('✅ Préférences de notifications enregistrées!');
    } catch (error) {
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const toggleSwitch = (field: keyof NotificationData) => {
    setSettings({ ...settings, [field]: !settings[field] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-yellow-500" />
          Notifications
        </h3>
      </div>

      <div className="space-y-4">
        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <div>
            <div className="font-medium">Notifications par email</div>
            <div className="text-sm text-gray-500">
              Recevoir des notifications par email
            </div>
          </div>
          <button
            onClick={() => toggleSwitch('emailNotifications')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.emailNotifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.emailNotifications ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <div>
            <div className="font-medium">Notifications push</div>
            <div className="text-sm text-gray-500">
              Recevoir des notifications dans le navigateur
            </div>
          </div>
          <button
            onClick={() => toggleSwitch('pushNotifications')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.pushNotifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.pushNotifications ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Email Digest */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Fréquence des résumés par email
          </label>
          <select
            value={settings.emailDigest}
            onChange={(e) => setSettings({ ...settings, emailDigest: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="realtime">⚡ Temps réel</option>
            <option value="daily">📅 Quotidien</option>
            <option value="weekly">📆 Hebdomadaire</option>
            <option value="never">🚫 Jamais</option>
          </select>
        </div>

        {/* Bouton Enregistrer */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
