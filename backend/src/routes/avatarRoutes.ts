import { Router } from 'express';
import avatarController from '../controllers/avatarController';
import { uploadAvatar } from '../middleware/upload.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /users/me/avatar:
 *   post:
 *     summary: Upload avatar de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar mis à jour avec succès
 *       400:
 *         description: Fichier invalide
 *       401:
 *         description: Non authentifié
 */
router.post(
  '/me/avatar',
  authenticate,
  uploadAvatar.single('avatar'),
  avatarController.uploadAvatar
);

/**
 * @swagger
 * /users/me/avatar:
 *   delete:
 *     summary: Supprimer l'avatar de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar supprimé avec succès
 *       401:
 *         description: Non authentifié
 */
router.delete('/me/avatar', authenticate, avatarController.deleteAvatar);

export default router;
