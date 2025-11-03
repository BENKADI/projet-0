import { Request, Response } from 'express';
import roleService from '../services/role.service';

export class RoleController {
  /**
   * Récupérer tous les rôles
   */
  async getAllRoles(_req: Request, res: Response): Promise<void> {
    try {
      const roles = await roleService.getAllRoles();
      // Transformer les rôles pour inclure les noms des permissions
      const formattedRoles = roles.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions.map((p: any) => p.name),
        userCount: role._count.users,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      }));
      res.status(200).json(formattedRoles);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la récupération des rôles' });
    }
  }

  /**
   * Récupérer un rôle par son ID
   */
  async getRoleById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id!;
      const role = await roleService.getRoleById(id);
      
      if (!role) {
        res.status(404).json({ message: 'Rôle non trouvé' });
        return;
      }

      // Transformer le rôle pour inclure les noms des permissions
      const formattedRole = {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions.map((p: any) => p.name),
        users: role.users,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      };
      
      res.status(200).json(formattedRole);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la récupération du rôle' });
    }
  }

  /**
   * Créer un nouveau rôle
   */
  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, permissions } = req.body;
      
      // Vérifier si le rôle existe déjà
      const existingRole = await roleService.getRoleByName(name);
      if (existingRole) {
        res.status(400).json({ message: 'Un rôle avec ce nom existe déjà' });
        return;
      }
      
      const role = await roleService.createRole({ 
        name, 
        description, 
        permissions: permissions || [] 
      });

      // Transformer le rôle pour inclure les noms des permissions
      const formattedRole = {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions.map((p: any) => p.name),
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      };

      res.status(201).json(formattedRole);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la création du rôle' });
    }
  }

  /**
   * Mettre à jour un rôle
   */
  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id!;
      const { name, description, permissions } = req.body;
      
      // Vérifier si le rôle existe
      const existingRole = await roleService.getRoleById(id);
      if (!existingRole) {
        res.status(404).json({ message: 'Rôle non trouvé' });
        return;
      }

      // Vérifier si le rôle est un rôle système
      if (existingRole.isSystem) {
        res.status(403).json({ message: 'Les rôles système ne peuvent pas être modifiés' });
        return;
      }
      
      // Si le nom change, vérifier qu'il n'existe pas déjà
      if (name && name !== existingRole.name) {
        const roleWithSameName = await roleService.getRoleByName(name);
        if (roleWithSameName) {
          res.status(400).json({ message: 'Un rôle avec ce nom existe déjà' });
          return;
        }
      }
      
      const role = await roleService.updateRole(id, { name, description, permissions });

      // Transformer le rôle pour inclure les noms des permissions
      const formattedRole = {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions.map((p: any) => p.name),
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      };

      res.status(200).json(formattedRole);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la mise à jour du rôle' });
    }
  }

  /**
   * Supprimer un rôle
   */
  async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id!;
      
      // Vérifier si le rôle existe
      const existingRole = await roleService.getRoleById(id);
      if (!existingRole) {
        res.status(404).json({ message: 'Rôle non trouvé' });
        return;
      }

      // Vérifier si le rôle est un rôle système
      if (existingRole.isSystem) {
        res.status(403).json({ message: 'Les rôles système ne peuvent pas être supprimés' });
        return;
      }
      
      await roleService.deleteRole(id);
      res.status(200).json({ message: 'Rôle supprimé avec succès' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la suppression du rôle' });
    }
  }

  /**
   * Attribuer un rôle à un utilisateur
   */
  async assignRoleToUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId!);
      const { roleId } = req.body;
      
      const result = await roleService.assignRoleToUser(userId, roleId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de l\'attribution du rôle' });
    }
  }

  /**
   * Retirer un rôle à un utilisateur
   */
  async removeRoleFromUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId!);
      const roleId = req.params.roleId!;
      
      const result = await roleService.removeRoleFromUser(userId, roleId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors du retrait du rôle' });
    }
  }

  /**
   * Obtenir tous les rôles d'un utilisateur
   */
  async getUserRoles(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId!);
      const roles = await roleService.getUserRoles(userId);

      // Transformer les rôles pour inclure les noms des permissions
      const formattedRoles = roles.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions.map((p: any) => p.name),
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      }));

      res.status(200).json(formattedRoles);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la récupération des rôles de l\'utilisateur' });
    }
  }
}

export default new RoleController();
