import { PrismaClient, User, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CreateUserDTO, UpdateUserDTO, ChangePasswordDTO, UserQueryDTO } from '../dto/UserDTO';
import { UserRepository } from '../repositories/UserRepository';
import { CacheService } from '../../infrastructure/cache/CacheService';
import { AuditService } from '../../shared/services/AuditService';
import { NotificationService } from '../notifications/services/NotificationService';

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  usersByRole: Record<UserRole, number>;
}

export class UserService {
  constructor(
    private prisma: PrismaClient,
    private userRepository: UserRepository,
    private cacheService: CacheService,
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

  async createUser(data: CreateUserDTO): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    // Cache user data
    await this.cacheService.set(`user:${user.id}`, user, 3600);

    // Audit log
    await this.auditService.log({
      userId: user.id,
      action: 'create',
      resource: 'user',
      resourceId: user.id,
      oldValues: null,
      newValues: { email: user.email, role: user.role },
    });

    // Send welcome notification
    await this.notificationService.sendNotification(user.id, {
      type: 'welcome',
      title: 'Welcome to Projet-0!',
      message: 'Your account has been created successfully.',
      sendEmail: true,
    });

    return user;
  }

  async getUsers(query: UserQueryDTO): Promise<PaginatedUsers> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    // Build filters
    const filters = {
      search: query.search,
      role: query.role,
    };

    // Get users and total count
    const [users, total] = await Promise.all([
      this.userRepository.findMany(filters, {
        skip,
        take: limit,
        sortBy: query.sortBy || 'createdAt',
        sortOrder: query.sortOrder || 'desc',
      }),
      this.userRepository.count(filters),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string): Promise<User | null> {
    // Try cache first
    const cachedUser = await this.cacheService.get<User>(`user:${id}`);
    if (cachedUser) {
      return cachedUser;
    }

    // Get from database
    const user = await this.userRepository.findById(id);
    if (user) {
      await this.cacheService.set(`user:${id}`, user, 3600);
    }

    return user;
  }

  async updateUser(id: string, data: UpdateUserDTO, updatedBy: string): Promise<User> {
    // Get current user for audit
    const currentUser = await this.userRepository.findById(id);
    if (!currentUser) {
      throw new Error('User not found');
    }

    // Update user
    const updatedUser = await this.userRepository.update(id, data);

    // Update cache
    await this.cacheService.set(`user:${id}`, updatedUser, 3600);
    await this.cacheService.invalidate(`user:*permissions:${id}`);

    // Audit log
    await this.auditService.log({
      userId: updatedBy,
      action: 'update',
      resource: 'user',
      resourceId: id,
      oldValues: {
        email: currentUser.email,
        role: currentUser.role,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
      },
      newValues: data,
    });

    // Send notification if role changed
    if (data.role && data.role !== currentUser.role) {
      await this.notificationService.sendNotification(id, {
        type: 'role_change',
        title: 'Role Updated',
        message: `Your role has been changed to ${data.role}`,
        sendEmail: true,
      });
    }

    return updatedUser;
  }

  async deleteUser(id: string, deletedBy: string): Promise<void> {
    // Get user for audit
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete user
    await this.userRepository.delete(id);

    // Clear cache
    await this.cacheService.invalidate(`user:${id}`);
    await this.cacheService.invalidate(`user:*permissions:${id}`);

    // Audit log
    await this.auditService.log({
      userId: deletedBy,
      action: 'delete',
      resource: 'user',
      resourceId: id,
      oldValues: {
        email: user.email,
        role: user.role,
      },
      newValues: null,
    });

    // Send notification to user (if possible)
    await this.notificationService.sendNotification(id, {
      type: 'account_deleted',
      title: 'Account Deleted',
      message: 'Your account has been deleted by an administrator.',
      sendEmail: true,
    });
  }

  async changePassword(id: string, data: ChangePasswordDTO): Promise<void> {
    // Get user
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Verify new passwords match
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('New passwords do not match');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 12);

    // Update password
    await this.userRepository.update(id, { password: hashedPassword });

    // Clear cache
    await this.cacheService.invalidate(`user:${id}`);

    // Audit log
    await this.auditService.log({
      userId: id,
      action: 'password_change',
      resource: 'user',
      resourceId: id,
      oldValues: { password: '[REDACTED]' },
      newValues: { password: '[REDACTED]' },
    });

    // Send notification
    await this.notificationService.sendNotification(id, {
      type: 'password_changed',
      title: 'Password Changed',
      message: 'Your password has been changed successfully.',
      sendEmail: true,
    });
  }

  async getUserMetrics(period: { start: Date; end: Date }): Promise<UserMetrics> {
    const cacheKey = `user_metrics:${period.start.toISOString()}:${period.end.toISOString()}`;
    
    // Try cache first
    const cachedMetrics = await this.cacheService.get<UserMetrics>(cacheKey);
    if (cachedMetrics) {
      return cachedMetrics;
    }

    // Calculate metrics
    const [totalUsers, activeUsers, newUsers, usersByRole] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.countActiveUsers(period),
      this.userRepository.countNewUsers(period),
      this.userRepository.countByRole(),
    ]);

    const previousPeriodUsers = await this.userRepository.countNewUsers({
      start: new Date(period.start.getTime() - (period.end.getTime() - period.start.getTime())),
      end: period.start,
    });

    const userGrowth = previousPeriodUsers > 0 
      ? ((newUsers - previousPeriodUsers) / previousPeriodUsers) * 100 
      : 0;

    const metrics: UserMetrics = {
      totalUsers,
      activeUsers,
      newUsers,
      userGrowth,
      usersByRole,
    };

    // Cache metrics for 5 minutes
    await this.cacheService.set(cacheKey, metrics, 300);

    return metrics;
  }

  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    const cacheKey = `user_search:${query}:${limit}`;
    
    // Try cache first
    const cachedResults = await this.cacheService.get<User[]>(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    // Search users
    const users = await this.userRepository.search(query, limit);

    // Cache results for 2 minutes
    await this.cacheService.set(cacheKey, users, 120);

    return users;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const cacheKey = `user_permissions:${userId}`;
    
    // Try cache first
    const cachedPermissions = await this.cacheService.get<string[]>(cacheKey);
    if (cachedPermissions) {
      return cachedPermissions;
    }

    // Get user permissions
    const permissions = await this.userRepository.getUserPermissions(userId);

    // Cache permissions for 30 minutes
    await this.cacheService.set(cacheKey, permissions, 1800);

    return permissions;
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  async bulkUpdateUsers(userIds: string[], data: Partial<UpdateUserDTO>, updatedBy: string): Promise<User[]> {
    const updatedUsers = [];

    for (const userId of userIds) {
      try {
        const updatedUser = await this.updateUser(userId, data, updatedBy);
        updatedUsers.push(updatedUser);
      } catch (error) {
        console.error(`Failed to update user ${userId}:`, error);
      }
    }

    return updatedUsers;
  }

  async exportUsers(format: 'csv' | 'excel' | 'json', filters?: UserQueryDTO): Promise<Buffer> {
    const users = await this.userRepository.findMany(filters || {}, {
      // Get all users for export
      take: 10000,
    });

    // Transform data for export
    const exportData = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      provider: user.provider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    // Generate export based on format
    switch (format) {
      case 'csv':
        return this.generateCSV(exportData);
      case 'excel':
        return this.generateExcel(exportData);
      case 'json':
        return Buffer.from(JSON.stringify(exportData, null, 2));
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private generateCSV(data: any[]): Buffer {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    return Buffer.from(csv);
  }

  private generateExcel(data: any[]): Buffer {
    // Implementation would use a library like xlsx
    // For now, return CSV as placeholder
    return this.generateCSV(data);
  }
}
