import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class PermissionService {
  /**
   * Récupérer toutes les permissions
   */
  async getAllPermissions() {
    return prisma.permission.findMany();
  }

  /**
   * Récupérer une permission par son ID
   */
  async getPermissionById(id: number) {
    return prisma.permission.findUnique({
      where: { id }
    });
  }

  /**
   * Récupérer une permission par son nom
   */
  async getPermissionByName(name: string) {
    return prisma.permission.findUnique({
      where: { name }
    });
  }

  /**
   * Créer une nouvelle permission
   */
  async createPermission(data: { name: string; description?: string }) {
    return prisma.permission.create({
      data
    });
  }

  /**
   * Mettre à jour une permission
   */
  async updatePermission(id: number, data: { name?: string; description?: string }) {
    return prisma.permission.update({
      where: { id },
      data
    });
  }

  /**
   * Supprimer une permission
   */
  async deletePermission(id: number) {
    return prisma.permission.delete({
      where: { id }
    });
  }

  /**
   * Attribuer une permission à un utilisateur
   */
  async assignPermissionToUser(userId: number, permissionId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        permissions: {
          connect: { id: permissionId }
        }
      },
      include: {
        permissions: true
      }
    });
  }

  /**
   * Retirer une permission à un utilisateur
   */
  async removePermissionFromUser(userId: number, permissionId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        permissions: {
          disconnect: { id: permissionId }
        }
      },
      include: {
        permissions: true
      }
    });
  }

  /**
   * Obtenir toutes les permissions d'un utilisateur
   */
  async getUserPermissions(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: true
      }
    });

    return user?.permissions || [];
  }
}

export default new PermissionService();
