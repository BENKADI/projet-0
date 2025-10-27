import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import path from 'path';
import fs from 'fs';
import logger from '../config/logger';

const prisma = new PrismaClient();

// Dossier pour stocker les avatars (en développement)
const UPLOAD_DIR = path.join(__dirname, '../../uploads/avatars');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

class AvatarController {
  /**
   * Upload avatar pour l'utilisateur connecté
   * POST /users/me/avatar
   */
  async uploadAvatar(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      // Vérifier si un fichier a été uploadé
      if (!req.file) {
        res.status(400).json({ message: 'Aucun fichier fourni' });
        return;
      }

      // Construire l'URL de l'avatar
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // Récupérer l'ancien avatar pour le supprimer
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatarUrl: true },
      });

      // Supprimer l'ancien fichier si existant
      if (user?.avatarUrl) {
        // Assurer un chemin relatif (enlever le slash initial)
        const relativeOld = user.avatarUrl.replace(/^\/+/, '');
        const oldFilePath = path.join(__dirname, '../..', relativeOld);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Mettre à jour l'utilisateur avec la nouvelle URL
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
          provider: true,
          createdAt: true,
        },
      });

      res.status(200).json({
        message: 'Avatar mis à jour avec succès',
        user: updatedUser,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error('Erreur upload avatar', { error: errorMessage, stack: errorStack });
      res.status(500).json({
        message: 'Erreur lors de l\'upload de l\'avatar',
      });
    }
  }

  /**
   * Supprimer l'avatar de l'utilisateur connecté
   * DELETE /users/me/avatar
   */
  async deleteAvatar(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatarUrl: true },
      });

      // Supprimer le fichier physique
      if (user?.avatarUrl) {
        const relative = user.avatarUrl.replace(/^\/+/, '');
        const filePath = path.join(__dirname, '../..', relative);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Mettre à jour l'utilisateur
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: null },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
        },
      });

      res.status(200).json({
        message: 'Avatar supprimé avec succès',
        user: updatedUser,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error('Erreur suppression avatar', { error: errorMessage, stack: errorStack });
      res.status(500).json({
        message: 'Erreur lors de la suppression de l\'avatar',
      });
    }
  }
}

export default new AvatarController();
