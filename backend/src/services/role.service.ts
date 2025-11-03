import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class RoleService {
  /**
   * Récupérer tous les rôles
   */
  async getAllRoles() {
    return prisma.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: { users: true }
        }
      }
    });
  }

  /**
   * Récupérer un rôle par son ID
   */
  async getRoleById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  /**
   * Récupérer un rôle par son nom
   */
  async getRoleByName(name: string) {
    return prisma.role.findUnique({
      where: { name }
    });
  }

  /**
   * Créer un nouveau rôle
   */
  async createRole(data: { 
    name: string; 
    description?: string; 
    permissions: string[] 
  }) {
    const { permissions: permissionNames, ...roleData } = data;

    // Récupérer les IDs des permissions à partir de leurs noms
    const permissions = await prisma.permission.findMany({
      where: {
        name: {
          in: permissionNames
        }
      }
    });

    return prisma.role.create({
      data: {
        ...roleData,
        permissions: {
          connect: permissions.map(p => ({ id: p.id }))
        }
      },
      include: {
        permissions: true
      }
    });
  }

  /**
   * Mettre à jour un rôle
   */
  async updateRole(id: string, data: { 
    name?: string; 
    description?: string; 
    permissions?: string[] 
  }) {
    const { permissions: permissionNames, ...roleData } = data;

    // Si des permissions sont fournies (même un tableau vide), les mettre à jour
    let permissionsUpdate = {};
    if (permissionNames !== undefined) {
      if (permissionNames.length === 0) {
        // Tableau vide = supprimer toutes les permissions
        permissionsUpdate = {
          permissions: {
            set: []
          }
        };
      } else {
        // Récupérer les permissions par leurs noms
        const permissions = await prisma.permission.findMany({
          where: {
            name: {
              in: permissionNames
            }
          }
        });

        permissionsUpdate = {
          permissions: {
            set: permissions.map(p => ({ id: p.id }))
          }
        };
      }
    }

    return prisma.role.update({
      where: { id },
      data: {
        ...roleData,
        ...permissionsUpdate
      },
      include: {
        permissions: true
      }
    });
  }

  /**
   * Supprimer un rôle
   */
  async deleteRole(id: string) {
    return prisma.role.delete({
      where: { id }
    });
  }

  /**
   * Attribuer un rôle à un utilisateur
   */
  async assignRoleToUser(userId: number, roleId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { id: roleId }
        }
      },
      include: {
        roles: {
          include: {
            permissions: true
          }
        }
      }
    });
  }

  /**
   * Retirer un rôle à un utilisateur
   */
  async removeRoleFromUser(userId: number, roleId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          disconnect: { id: roleId }
        }
      },
      include: {
        roles: {
          include: {
            permissions: true
          }
        }
      }
    });
  }

  /**
   * Obtenir tous les rôles d'un utilisateur
   */
  async getUserRoles(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true
          }
        }
      }
    });

    return user?.roles || [];
  }
}

export default new RoleService();
