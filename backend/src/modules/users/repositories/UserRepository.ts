import { PrismaClient, User, UserRole, Permission } from '@prisma/client';

export interface UserFilters {
  search?: string;
  role?: UserRole;
}

export interface UserFindManyOptions {
  skip?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRange {
  start: Date;
  end: Date;
}

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    provider?: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data,
      include: {
        permissions: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        permissions: true,
      },
    });
  }

  async findMany(
    filters: UserFilters = {},
    options: UserFindManyOptions = {}
  ): Promise<User[]> {
    const { skip, take, sortBy, sortOrder } = options;
    const { search, role } = filters;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (role) {
      where.role = role;
    }

    return this.prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' },
      include: {
        permissions: true,
      },
    });
  }

  async count(filters: UserFilters = {}): Promise<number> {
    const { search, role } = filters;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    return this.prisma.user.count({ where });
  }

  async update(id: string, data: Partial<{
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    avatar?: string;
    password?: string;
  }>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        permissions: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async countActiveUsers(period: DateRange): Promise<number> {
    return this.prisma.user.count({
      where: {
        lastLoginAt: {
          gte: period.start,
          lte: period.end,
        },
      },
    });
  }

  async countNewUsers(period: DateRange): Promise<number> {
    return this.prisma.user.count({
      where: {
        createdAt: {
          gte: period.start,
          lte: period.end,
        },
      },
    });
  }

  async countByRole(): Promise<Record<UserRole, number>> {
    const results = await this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    return results.reduce((acc, result) => {
      acc[result.role as UserRole] = result._count.role;
      return acc;
    }, {} as Record<UserRole, number>);
  }

  async search(query: string, limit: number = 10): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        permissions: true,
      },
    });
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: true,
      },
    });

    if (!user) {
      return [];
    }

    // Get role-based permissions
    const rolePermissions = await this.getRolePermissions(user.role);

    // Get user-specific permissions
    const userPermissions = user.permissions.map(p => p.name);

    // Combine and deduplicate
    return [...new Set([...rolePermissions, ...userPermissions])];
  }

  private async getRolePermissions(role: UserRole): Promise<string[]> {
    // Define default permissions for each role
    const rolePermissionsMap = {
      [UserRole.USER]: [
        'read:profile',
        'update:profile',
        'read:settings',
        'update:settings',
      ],
      [UserRole.ADMIN]: [
        'create:users',
        'read:users',
        'update:users',
        'delete:users',
        'create:permissions',
        'read:permissions',
        'update:permissions',
        'delete:permissions',
        'read:settings',
        'update:settings',
        'read:analytics',
        'export:users',
        'export:permissions',
      ],
    };

    return rolePermissionsMap[role] || [];
  }

  async addPermissionToUser(userId: string, permissionId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        permissions: {
          connect: { id: permissionId },
        },
      },
    });
  }

  async removePermissionFromUser(userId: string, permissionId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        permissions: {
          disconnect: { id: permissionId },
        },
      },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async getUsersWithExpiringPasswords(days: number = 7): Promise<User[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return this.prisma.user.findMany({
      where: {
        passwordUpdatedAt: {
          lt: expiryDate,
        },
        provider: 'local', // Only for local users
      },
      include: {
        permissions: true,
      },
    });
  }

  async getInactiveUsers(days: number = 30): Promise<User[]> {
    const inactiveDate = new Date();
    inactiveDate.setDate(inactiveDate.getDate() - days);

    return this.prisma.user.findMany({
      where: {
        lastLoginAt: {
          lt: inactiveDate,
        },
      },
      include: {
        permissions: true,
      },
    });
  }

  async getUserStats(): Promise<{
    total: number;
    byRole: Record<UserRole, number>;
    byProvider: Record<string, number>;
    recentlyActive: number;
    newThisMonth: number;
  }> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      total,
      byRole,
      byProvider,
      recentlyActive,
      newThisMonth,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.countByRole(),
      this.getCountByProvider(),
      this.countActiveUsers({ start: thirtyDaysAgo, end: now }),
      this.countNewUsers({ start: monthStart, end: now }),
    ]);

    return {
      total,
      byRole,
      byProvider,
      recentlyActive,
      newThisMonth,
    };
  }

  private async getCountByProvider(): Promise<Record<string, number>> {
    const results = await this.prisma.user.groupBy({
      by: ['provider'],
      _count: {
        provider: true,
      },
    });

    return results.reduce((acc, result) => {
      acc[result.provider] = result._count.provider;
      return acc;
    }, {} as Record<string, number>);
  }

  async bulkCreate(users: Array<{
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
  }>): Promise<User[]> {
    // Hash passwords for all users
    const bcrypt = require('bcryptjs');
    const usersWithHashedPasswords = await Promise.all(
      users.map(async user => ({
        ...user,
        password: await bcrypt.hash(user.password, 12),
      }))
    );

    return this.prisma.user.createMany({
      data: usersWithHashedPasswords,
    });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { role },
      include: {
        permissions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProvider(provider: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { provider },
      include: {
        permissions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
