import { useState, useEffect } from 'react';
import { Shield, Save, Lock, Eye, EyeOff, Smartphone, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import axios from '../../lib/axios';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';

export default function SecuritySettings() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);
  const [policy, setPolicy] = useState<'weak' | 'medium' | 'strong'>('medium');
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);

  // Charger la politique de mot de passe et les sessions
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger seulement les paramètres d'application (endpoint qui existe)
        const settingsResp = await axios.get('/settings/app');

        if (settingsResp.data?.passwordPolicy) {
          setPolicy(settingsResp.data.passwordPolicy as 'weak' | 'medium' | 'strong');
        }

        // Utiliser des données mockées pour les sessions (endpoint pas encore implémenté)
        setSessions([{
          id: 'current',
          device: 'Navigateur actuel',
          current: true,
          lastActivity: new Date().toISOString()
        }]);

      } catch {
        // garder les valeurs par défaut
        setPolicy('medium');
        setSessions([{
          id: 'current',
          device: 'Navigateur actuel',
          current: true,
          lastActivity: new Date().toISOString()
        }]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  const getPasswordStrength = (pwd: string): { level: string; color: string; percentage: number } => {
    if (pwd.length === 0) return { level: 'Vide', color: 'bg-gray-200', percentage: 0 };

    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 25;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[a-z]/.test(pwd)) score += 15;
    if (/\d/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15;

    if (score < 40) return { level: 'Faible', color: 'bg-red-500', percentage: score };
    if (score < 70) return { level: 'Moyen', color: 'bg-yellow-500', percentage: score };
    return { level: 'Fort', color: 'bg-green-500', percentage: Math.min(score, 100) };
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
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
        <p className="text-sm text-muted-foreground">
          Gérez vos paramètres de sécurité et vos mots de passe
        </p>
      </div>

      <div className="grid gap-6">
        {/* Changer mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" />
              Changer le mot de passe
            </CardTitle>
            <CardDescription>
              Modifiez votre mot de passe pour maintenir la sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, currentPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    disabled={saving || loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                    disabled={saving || loading}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, newPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    disabled={saving || loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                    disabled={saving || loading}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Indicateur de force du mot de passe */}
                {passwords.newPassword && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Force du mot de passe</span>
                      <span className={`font-medium ${
                        getPasswordStrength(passwords.newPassword).level === 'Faible' ? 'text-red-600' :
                        getPasswordStrength(passwords.newPassword).level === 'Moyen' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {getPasswordStrength(passwords.newPassword).level}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getPasswordStrength(passwords.newPassword).color} transition-all duration-300`}
                        style={{ width: `${getPasswordStrength(passwords.newPassword).percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Politique actuelle: <strong>{policy}</strong>.{' '}
                  {policy === 'weak' && 'Min 6 caractères.'}
                  {policy === 'medium' && 'Min 8 caractères, lettres et chiffres.'}
                  {policy === 'strong' && 'Min 12 caractères, minuscule, majuscule, chiffre et symbole.'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirmPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    disabled={saving || loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                    disabled={saving || loading}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Validation en temps réel */}
                {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                  <p className="text-xs text-red-600">Les mots de passe ne correspondent pas</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={
                saving ||
                loading ||
                !passwords.currentPassword ||
                !passwords.newPassword ||
                validateByPolicy(passwords.newPassword) !== null ||
                passwords.newPassword !== passwords.confirmPassword
              }
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Changement...' : 'Changer le mot de passe'}
            </Button>
          </CardContent>
        </Card>

        {/* Sessions actives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-500" />
              Sessions actives
            </CardTitle>
            <CardDescription>
              Gérez vos sessions actives sur différents appareils
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.length === 0 ? (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Smartphone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Navigateur actuel</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Dernière activité: maintenant
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">Actif</Badge>
              </div>
            ) : (
              sessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{session.device || 'Appareil inconnu'}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.lastActivity || 'Activité récente'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={session.current ? "default" : "secondary"}>
                      {session.current ? 'Actif' : 'Inactif'}
                    </Badge>
                    {!session.current && (
                      <Button variant="outline" size="sm">
                        Révoquer
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Authentification à deux facteurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Authentification à deux facteurs (2FA)
            </CardTitle>
            <CardDescription>
              Ajoutez une couche de sécurité supplémentaire à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Fonctionnalité à venir. L'authentification à deux facteurs vous permettra de sécuriser
                davantage votre compte avec une vérification supplémentaire lors de la connexion.
              </AlertDescription>
            </Alert>

            <div className="mt-4">
              <Button disabled variant="outline" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Bientôt disponible
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informations de sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Conseils de sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p>Utilisez un mot de passe fort avec au moins 12 caractères incluant majuscules, minuscules, chiffres et symboles.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>Changez régulièrement votre mot de passe, idéalement tous les 3 mois.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                <p>Surveillez vos sessions actives et révoquez celles que vous ne reconnaissez pas.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p>Activez l'authentification à deux facteurs dès qu'elle sera disponible.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
