import { useState, useEffect, useCallback, useRef } from 'react';
import { History, Download, Trash2, AlertTriangle } from 'lucide-react';
import axios from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface BackupHistoryItem {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  createdBy: string;
}

export default function BackupHistory() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [backups, setBackups] = useState<BackupHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasWarnedRef = useRef(false);

  const fetchBackupHistory = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      setBackups([]);
      setError('Accès restreint — seuls les administrateurs peuvent consulter l\'historique des sauvegardes.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/backup/history');
      setBackups(response.data);
    } catch (err) {
      console.error('Erreur chargement historique:', err);

      if (!hasWarnedRef.current) {
        toast.warning('Impossible de charger l\'historique réel, affichage de données de démonstration.');
        hasWarnedRef.current = true;
      }

      setError('Historique indisponible pour le moment. Les données ci-dessous sont affichées à titre de démonstration.');
      setBackups([
        {
          id: 'demo-backup-1',
          filename: 'backup-demo-1.zip',
          size: 5_242_880,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          createdBy: user?.email || 'Système'
        },
        {
          id: 'demo-backup-2',
          filename: 'backup-demo-2.zip',
          size: 7_340_032,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          createdBy: 'Service automatisé'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user?.email]);

  useEffect(() => {
    fetchBackupHistory();
  }, [fetchBackupHistory]);

  const downloadBackup = async (filename: string) => {
    try {
      const response = await axios.get(`/backup/download/${filename}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Backup téléchargé avec succès');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const deleteBackup = async (filename: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce backup ?')) return;

    setDeleting(filename);
    try {
      await axios.delete(`/backup/history/${filename}`);
      setBackups(backups.filter(b => b.filename !== filename));
      toast.success('Backup supprimé avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
        <p className="text-gray-500">
          Seuls les administrateurs peuvent accéder à l'historique des backups.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-blue-500" />
          Historique des Backups
        </h3>
        <button
          onClick={fetchBackupHistory}
          className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        >
          Actualiser
        </button>
      </div>

      {error && (
        <div className="p-4 border border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-2" />
              <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : backups.length === 0 ? (
        <div className="text-center py-8">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun backup trouvé</p>
          <p className="text-sm text-gray-400">Les backups créés apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {backups.map((backup) => (
            <div key={backup.id} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-sm">{backup.filename}</h4>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {formatSize(backup.size)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Créé le {formatDate(backup.createdAt)}</div>
                    <div>Par {backup.createdBy}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadBackup(backup.filename)}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                    title="Télécharger"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteBackup(backup.filename)}
                    disabled={deleting === backup.filename}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors disabled:opacity-50"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded">
        <strong>💡 Conseil:</strong> Les backups sont automatiquement supprimés après 30 jours. Gardez une copie des backups importants.
      </div>
    </div>
  );
}
