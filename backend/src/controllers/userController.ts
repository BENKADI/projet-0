import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { hashPassword } from '../utils/authUtils';

const prisma = new PrismaClient();

class UserController {
  // Obtenir tous les utilisateurs
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          permissions: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        }
      });
      
      res.status(200).json(users);
      return;
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la récupération des utilisateurs' });
      return;
    }
  }

  // Obtenir un utilisateur par son ID
  async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: Number(id)
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          permissions: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        }
      });
      
      if (!user) {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
        return;
      }
      
      res.status(200).json(user);
      return;
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la récupération de l\'utilisateur' });
      return;
    }
  }

  // Créer un nouvel utilisateur
  async createUser(req: Request, res: Response): Promise<void> {
    const { email, password, firstName, lastName, role, permissionIds } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ message: 'Email et mot de passe sont requis' });
      return;
    }
    
    try {
      // Vérifier si l'email est déjà utilisé
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        res.status(400).json({ message: 'Cet email est déjà utilisé' });
        return;
      }
      
      const hashedPassword = await hashPassword(password);
      
      // Création d'un nouvel utilisateur
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: role || 'user',
          ...(permissionIds && {
            permissions: {
              connect: permissionIds.map((id: number) => ({ id }))
            }
          })
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          permissions: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        }
      });
      
      res.status(201).json(newUser);
      return;
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la création de l\'utilisateur' });
      return;
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { email, firstName, lastName, role, permissionIds, password } = req.body;
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(id) }
      });
      
      if (!user) {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
        return;
      }
      
      // Préparer les données de mise à jour
      const updateData: any = {};
      
      if (email !== undefined) updateData.email = email;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (role !== undefined) updateData.role = role;
      
      // Gestion du mot de passe si fourni
      if (password) {
        updateData.password = await hashPassword(password);
      }
      
      // Mise à jour des permissions si fournies
      const permissionsUpdate = permissionIds ? {
        set: [], // Retire toutes les permissions existantes
        connect: permissionIds.map((id: number) => ({ id })) // Connecte les nouvelles
      } : undefined;
      
      // Mettre à jour l'utilisateur
      const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          ...updateData,
          ...(permissionsUpdate && { permissions: permissionsUpdate })
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          permissions: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        }
      });
      
      res.status(200).json(updatedUser);
      return;
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la mise à jour de l\'utilisateur' });
      return;
    }
  }

  // Supprimer un utilisateur
  async deleteUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: { role: true }
      });
      
      if (!user) {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
        return;
      }
      
      // Empêcher la suppression du dernier admin
      if (user.role === 'admin') {
        const adminCount = await prisma.user.count({
          where: { role: 'admin' }
        });
        
        if (adminCount <= 1) {
          res.status(400).json({ message: 'Impossible de supprimer le dernier administrateur' });
          return;
        }
      }
      
      // Supprimer l'utilisateur
      await prisma.user.delete({
        where: { id: Number(id) }
      });
      
      res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
      return;
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur lors de la suppression de l\'utilisateur' });
      return;
    }
  }
}

export default new UserController();
