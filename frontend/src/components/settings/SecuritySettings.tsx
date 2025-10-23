import { useState, useEffect } from 'react';
import { Shield, Save, Lock } from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

export default function SecuritySettings() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [policy, setPolicy] = useState<'weak' | 'medium' | 'strong'>('medium');
  const [loading, setLoading] = useState(true);

  // Charger la politique de mot de passe
  useEffect(() => {
    (async () => {
      try {
        const resp = await axios.get('/settings/app');
        if (resp.data?.passwordPolicy) {
          setPolicy(resp.data.passwordPolicy as 'weak' | 'medium' | 'strong');
        }
      } catch {
        // garder la valeur par défaut
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const validateByPolicy = (pwd: string): string | null => {
    if (policy === 'weak') {
      if (pwd.length < 6) return 'Au moins 6 caractères requis.';
      return null;
    }
    if (policy === 'medium') {
      const hasLen = pwd.length >= 8;
      const hasLetter = /[A-Za-z]/.test(pwd);
      const hasDigit = /\d/.test(pwd);
      if (!hasLen) return 'Au moins 8 caractères requis.';
      if (!(hasLetter && hasDigit)) return 'Doit contenir des lettres et des chiffres.';
      return null;
    }
    // strong
    const hasLen = pwd.length >= 12;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
    if (!hasLen) return 'Au moins 12 caractères requis.';
    if (!(hasLower && hasUpper && hasDigit && hasSymbol)) return 'Doit contenir minuscule, majuscule, chiffre et symbole.';
    return null;
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    const policyError = validateByPolicy(passwords.newPassword);
    if (policyError) {
      toast.error(policyError);
      return;
    }

    setSaving(true);
    try {
      // Note: Vous devrez créer cet endpoint dans le backend
      await axios.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Mot de passe modifié avec succès');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-500" />
          Sécurité
        </h3>
      </div>

      <div className="space-y-4">
        {/* Changer mot de passe */}
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-red-500" />
            <h4 className="font-medium">Changer le mot de passe</h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, currentPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="••••••••"
                disabled={saving || loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="••••••••"
                disabled={saving || loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Politique actuelle: <strong>{policy}</strong>.{' '}
                {policy === 'weak' && 'Min 6 caractères.'}
                {policy === 'medium' && ' Min 8 caractères, lettres et chiffres.'}
                {policy === 'strong' && ' Min 12, minuscule, majuscule, chiffre et symbole.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirmPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="••••••••"
                disabled={saving || loading}
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={
                saving ||
                loading ||
                !passwords.currentPassword ||
                !passwords.newPassword ||
                validateByPolicy(passwords.newPassword) !== null ||
                passwords.newPassword !== passwords.confirmPassword
              }
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Changement...' : 'Changer le mot de passe'}
            </button>
          </div>
        </div>

        {/* Sessions actives */}
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <h4 className="font-medium mb-2">Sessions actives</h4>
          <div className="text-sm text-gray-500 mb-3">
            Vous êtes connecté sur cet appareil
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <div>
              <div className="font-medium text-sm">🖥️ Navigateur actuel</div>
              <div className="text-xs text-gray-500">Dernière activité: maintenant</div>
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
              Actif
            </span>
          </div>
        </div>

        {/* Authentification à deux facteurs */}
        <div className="p-4 border border-yellow-300 dark:border-yellow-600 rounded-lg bg-yellow-50 dark:bg-yellow-950">
          <h4 className="font-medium mb-2">🔐 Authentification à deux facteurs (2FA)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Fonctionnalité à venir. Ajoutez une couche de sécurité supplémentaire.
          </p>
          <button
            disabled
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
          >
            Bientôt disponible
          </button>
        </div>
      </div>
    </div>
  );
}
