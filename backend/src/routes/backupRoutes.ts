import { Router } from 'express';
import backupController from '../controllers/backup.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { uploadBackup } from '../middleware/upload-backup.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification admin
router.use(authenticate, isAdmin);

/**
 * @swagger
 * /backup/create:
 *   get:
 *     summary: Créer un backup de la base de données
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup créé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin requis)
 */
router.get('/create', backupController.createBackup);

/**
 * @swagger
 * /backup/stats:
 *   get:
 *     summary: Obtenir les statistiques système
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin requis)
 */
router.get('/stats', backupController.getStats);

/**
 * @swagger
 * /backup/restore:
 *   post:
 *     summary: Restaurer la base de données depuis un backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               backup:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Backup restauré avec succès
 *       400:
 *         description: Fichier invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin requis)
 */
router.post('/restore', uploadBackup.single('backup'), backupController.restoreBackup);

export default router;
