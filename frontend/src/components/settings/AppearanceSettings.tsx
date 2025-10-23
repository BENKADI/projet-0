import { useState, useEffect } from 'react';
import { Palette, Save } from 'lucide-react';
import axios from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface AppearanceData {
  theme: string;
  primaryColor: string;
  accentColor: string;
}

export default function AppearanceSettings() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [settings, setSettings] = useState<AppearanceData>({
    theme: 'light',
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/settings/app');
      setSettings({
        theme: response.data?.theme || 'light',
        primaryColor: response.data?.primaryColor || '#3b82f6',
        accentColor: response.data?.accentColor || '#8b5cf6',
      });
    } catch (error) {
      console.error('Erreur lors du chargement', error);
      toast.error("Impossible de charger l'apparence");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error('Seuls les administrateurs peuvent modifier ces paramètres.');
      return;
    }
    setSaving(true);
    try {
      await axios.put('/settings/app', settings);
      toast.success('Apparence enregistrée');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-500" />
          Apparence
        </h3>
      </div>

      {!isAdmin && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
          Vous pouvez consulter l'apparence, mais seules les personnes ayant le rôle administrateur peuvent la modifier.
        </div>
      )}

      <div className="space-y-4">
        {loading && (
          <div className="space-y-3">
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-24 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        )}

        {/* Thème */}
        <div>
          <label className="block text-sm font-medium mb-2">Thème</label>
          <div className="grid grid-cols-3 gap-3">
            {['light', 'dark', 'auto'].map((theme) => (
              <button
                key={theme}
                onClick={() => setSettings({ ...settings, theme })}
                className={`p-3 border-2 rounded-lg transition-all ${
                  settings.theme === theme
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={!isAdmin || loading || saving}
              >
                <div className="text-center">
                  {theme === 'light' && '☀️'}
                  {theme === 'dark' && '🌙'}
                  {theme === 'auto' && '🔄'}
                  <div className="text-sm mt-1 capitalize">{theme}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Couleur primaire */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Couleur Primaire
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
              className="h-10 w-20 cursor-pointer"
              disabled={!isAdmin || loading || saving}
            />
            <input
              type="text"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              disabled={!isAdmin || loading || saving}
            />
          </div>
        </div>

        {/* Couleur d'accent */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Couleur d'Accent
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.accentColor}
              onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
              className="h-10 w-20 cursor-pointer"
              disabled={!isAdmin || loading || saving}
            />
            <input
              type="text"
              value={settings.accentColor}
              onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              disabled={!isAdmin || loading || saving}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="text-sm font-medium mb-2">Prévisualisation</div>
          <div className="flex gap-2">
            <div
              className="h-12 w-12 rounded-lg"
              style={{ backgroundColor: settings.primaryColor }}
            />
            <div
              className="h-12 w-12 rounded-lg"
              style={{ backgroundColor: settings.accentColor }}
            />
          </div>
        </div>

        {/* Bouton Enregistrer */}
        <button
          onClick={handleSave}
          disabled={saving || !isAdmin || loading}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
