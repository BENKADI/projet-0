import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import fs from 'fs';
import path from 'path';
import logger from '../config/logger';

const prisma = new PrismaClient();

interface BackupData {
  version: string;
  timestamp: string;
  data: {
    users?: any[];
    userPreferences?: any[];
    permissions?: any[];
    appSettings?: any[];
  };
  meta?: any;
}

class BackupController {
  /**
   * Créer un backup de la base de données (export JSON)
   * GET /backup/create
   */
  async createBackup(_req: Request, res: Response): Promise<void> {
    try {
      logger.info('📦 Création du backup de la base de données...');

      // Récupérer toutes les données
      const users = await prisma.user.findMany({
        include: {
          permissions: true,
        },
      });

      const userPreferences = await prisma.userPreferences.findMany();

      const permissions = await prisma.permission.findMany();
      const appSettings = await prisma.appSettings.findMany();

      // Créer l'objet de backup
      const backup = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: {
          users: users.map(u => ({
            ...u,
            password: '[REDACTED]', // Ne pas exposer les mots de passe
          })),
          userPreferences,
          permissions,
          appSettings,
        },
        meta: {
          userCount: users.length,
          permissionCount: permissions.length,
          preferencesCount: userPreferences.length,
        },
      };

      // Créer le dossier backups s'il n'existe pas
      const backupDir = path.join(__dirname, '../../backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Nom du fichier avec timestamp
      const filename = `backup-${Date.now()}.json`;
      const filepath = path.join(backupDir, filename);

      // Écrire le fichier
      fs.writeFileSync(filepath, JSON.stringify(backup, null, 2), 'utf-8');

      logger.info('✅ Backup créé', { filename });

      // Envoyer le fichier en téléchargement
      res.download(filepath, filename, (err) => {
        if (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          const errorStack = err instanceof Error ? err.stack : undefined;
          logger.error('❌ Erreur lors du téléchargement', { error: errorMessage, stack: errorStack });
          if (!res.headersSent) {
            res.status(500).json({ message: 'Erreur lors du téléchargement du backup' });
          }
        }
        // Supprimer le fichier après téléchargement
        setTimeout(() => {
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            logger.info('🗑️ Fichier de backup supprimé', { filename });
          }
        }, 5000);
      });
    } catch (error: any) {
      logger.error('❌ Erreur lors de la création du backup', { error: error.message, stack: error.stack });
      res.status(500).json({
        message: error.message || 'Erreur lors de la création du backup',
      });
    }
  }

  /**
   * Obtenir des statistiques système
   * GET /backup/stats
   */
  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const userCount = await prisma.user.count();
      const permissionCount = await prisma.permission.count();
      const settingsCount = await prisma.appSettings.count();

      // Uptime du serveur en secondes
      const uptime = process.uptime();
      const uptimeHours = Math.floor(uptime / 3600);
      const uptimeMinutes = Math.floor((uptime % 3600) / 60);

      const stats = {
        users: {
          total: userCount,
          admins: await prisma.user.count({ where: { role: 'admin' } }),
          regular: await prisma.user.count({ where: { role: 'user' } }),
        },
        permissions: permissionCount,
        settings: settingsCount,
        system: {
          uptime: `${uptimeHours}h ${uptimeMinutes}m`,
          uptimeSeconds: Math.floor(uptime),
          nodeVersion: process.version,
          platform: process.platform,
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          },
        },
      };

      res.status(200).json(stats);
    } catch (error: any) {
      logger.error('❌ Erreur lors de la récupération des stats', { error: error.message, stack: error.stack });
      res.status(500).json({
        message: error.message || 'Erreur lors de la récupération des statistiques',
      });
    }
  }

  /**
   * Restaurer la base de données depuis un backup
   * POST /backup/restore
   */
  async restoreBackup(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📥 Restauration du backup...');

      // Vérifier qu'un fichier a été envoyé
      if (!req.file) {
        res.status(400).json({ message: 'Aucun fichier de backup fourni' });
        return;
      }

      // Lire le contenu du fichier
      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      let backup: BackupData;

      try {
        backup = JSON.parse(fileContent);
      } catch (parseError) {
        res.status(400).json({ message: 'Fichier JSON invalide' });
        // Supprimer le fichier upload
        fs.unlinkSync(req.file.path);
        return;
      }

      // Valider la structure du backup
      if (!backup.version || !backup.data) {
        res.status(400).json({ message: 'Structure de backup invalide' });
        fs.unlinkSync(req.file.path);
        return;
      }

      logger.info('✅ Backup valide, début de la restauration...');

      // Compter les éléments à restaurer
      let restored = {
        users: 0,
        userPreferences: 0,
        permissions: 0,
        appSettings: 0,
      };

      // Restaurer les permissions (d'abord car référencées par users)
      if (backup.data.permissions && Array.isArray(backup.data.permissions)) {
        for (const perm of backup.data.permissions) {
          await prisma.permission.upsert({
            where: { name: perm.name },
            update: { description: perm.description },
            create: {
              name: perm.name,
              description: perm.description,
            },
          });
          restored.permissions++;
        }
        logger.info('Permissions restaurées', { count: restored.permissions });
      }

      // Restaurer les paramètres d'application
      if (backup.data.appSettings && Array.isArray(backup.data.appSettings)) {
        for (const setting of backup.data.appSettings) {
          const { id, createdAt, updatedAt, ...settingData } = setting;
          await prisma.appSettings.upsert({
            where: { id: setting.id || 1 },
            update: settingData,
            create: settingData,
          });
          restored.appSettings++;
        }
        logger.info('Paramètres restaurés', { count: restored.appSettings });
      }

      // Note: On ne restaure PAS les utilisateurs pour éviter de verrouiller les admins
      // et d'écraser les mots de passe (qui sont [REDACTED] dans le backup)
      logger.warn('⚠️ Utilisateurs non restaurés (sécurité)');

      // Restaurer les préférences utilisateur
      if (backup.data.userPreferences && Array.isArray(backup.data.userPreferences)) {
        for (const pref of backup.data.userPreferences) {
          try {
            const { id, createdAt, updatedAt, ...prefData } = pref;
            await prisma.userPreferences.upsert({
              where: { userId: pref.userId },
              update: prefData,
              create: prefData,
            });
            restored.userPreferences++;
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            logger.warn('Préférence utilisateur ignorée', { error: errorMessage });
          }
        }
        logger.info('Préférences restaurées', { count: restored.userPreferences });
      }

      // Supprimer le fichier uploadé
      fs.unlinkSync(req.file.path);

      logger.info('✅ Restauration terminée avec succès');

      res.status(200).json({
        message: 'Backup restauré avec succès',
        restored,
        warnings: [
          'Les utilisateurs n\'ont pas été restaurés pour des raisons de sécurité',
          'Seuls les paramètres, permissions et préférences ont été restaurés',
        ],
      });
    } catch (error: any) {
      logger.error('❌ Erreur lors de la restauration', { error: error.message, stack: error.stack });
      // Nettoyer le fichier si présent
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        message: error.message || 'Erreur lors de la restauration du backup',
      });
    }
  }
}

export default new BackupController();
