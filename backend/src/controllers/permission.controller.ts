import { Request, Response } from 'express';
import permissionService from '../services/permission.service';

export class PermissionController {
  /**
   * Récupérer toutes les permissions
   */
  async getAllPermissions(req: Request, res: Response): Promise<void> {
    try {
      const permissions = await permissionService.getAllPermissions();
      res.status(200).json(permissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la récupération des permissions' });
    }
  }

  /**
   * Récupérer une permission par son ID
   */
  async getPermissionById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const permission = await permissionService.getPermissionById(id);
      
      if (!permission) {
        res.status(404).json({ message: 'Permission non trouvée' });
        return;
      }
      
      res.status(200).json(permission);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la récupération de la permission' });
    }
  }

  /**
   * Créer une nouvelle permission
   */
  async createPermission(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      
      // Vérifier si la permission existe déjà
      const existingPermission = await permissionService.getPermissionByName(name);
      if (existingPermission) {
        res.status(400).json({ message: 'Une permission avec ce nom existe déjà' });
        return;
      }
      
      const permission = await permissionService.createPermission({ name, description });
      res.status(201).json(permission);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la création de la permission' });
    }
  }

  /**
   * Mettre à jour une permission
   */
  async updatePermission(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { name, description } = req.body;
      
      // Vérifier si la permission existe
      const existingPermission = await permissionService.getPermissionById(id);
      if (!existingPermission) {
        res.status(404).json({ message: 'Permission non trouvée' });
        return;
      }
      
      // Si le nom change, vérifier qu'il n'existe pas déjà
      if (name && name !== existingPermission.name) {
        const permissionWithSameName = await permissionService.getPermissionByName(name);
        if (permissionWithSameName) {
          res.status(400).json({ message: 'Une permission avec ce nom existe déjà' });
          return;
        }
      }
      
      const permission = await permissionService.updatePermission(id, { name, description });
      res.status(200).json(permission);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la mise à jour de la permission' });
    }
  }

  /**
   * Supprimer une permission
   */
  async deletePermission(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      // Vérifier si la permission existe
      const existingPermission = await permissionService.getPermissionById(id);
      if (!existingPermission) {
        res.status(404).json({ message: 'Permission non trouvée' });
        return;
      }
      
      await permissionService.deletePermission(id);
      res.status(200).json({ message: 'Permission supprimée avec succès' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la suppression de la permission' });
    }
  }

  /**
   * Attribuer une permission à un utilisateur
   */
  async assignPermissionToUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const permissionId = parseInt(req.params.permissionId);
      
      const result = await permissionService.assignPermissionToUser(userId, permissionId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de l\'attribution de la permission' });
    }
  }

  /**
   * Retirer une permission à un utilisateur
   */
  async removePermissionFromUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const permissionId = parseInt(req.params.permissionId);
      
      const result = await permissionService.removePermissionFromUser(userId, permissionId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors du retrait de la permission' });
    }
  }

  /**
   * Obtenir toutes les permissions d'un utilisateur
   */
  async getUserPermissions(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const permissions = await permissionService.getUserPermissions(userId);
      res.status(200).json(permissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la récupération des permissions de l\'utilisateur' });
    }
  }
}

export default new PermissionController();
