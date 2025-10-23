import { Router } from 'express';
import settingsController from '../controllers/settings.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { uploadLogo } from '../middleware/upload.middleware';

const router = Router();

// ==================== ROUTES PARAMÈTRES GÉNÉRAUX (Admin uniquement) ====================

/**
 * @swagger
 * /settings/app:
 *   get:
 *     summary: Récupérer les paramètres de l'application
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paramètres récupérés avec succès
 */
router.get('/app', authenticate, settingsController.getAppSettings);

/**
 * @swagger
 * /settings/app:
 *   put:
 *     summary: Mettre à jour les paramètres de l'application (Admin)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paramètres mis à jour avec succès
 */
router.put('/app', authenticate, isAdmin, settingsController.updateAppSettings);

/**
 * @swagger
 * /settings/logo:
 *   post:
 *     summary: Upload du logo de l'application (Admin)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logo uploadé avec succès
 */
router.post('/logo', authenticate, isAdmin, uploadLogo.single('logo'), settingsController.uploadLogo);

// ==================== ROUTES PRÉFÉRENCES UTILISATEUR ====================

/**
 * @swagger
 * /settings/preferences:
 *   get:
 *     summary: Récupérer les préférences de l'utilisateur connecté
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Préférences récupérées avec succès
 */
router.get('/preferences', authenticate, settingsController.getUserPreferences);

/**
 * @swagger
 * /settings/preferences:
 *   put:
 *     summary: Mettre à jour les préférences de l'utilisateur connecté
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Préférences mises à jour avec succès
 */
router.put('/preferences', authenticate, settingsController.updateUserPreferences);

export default router;
