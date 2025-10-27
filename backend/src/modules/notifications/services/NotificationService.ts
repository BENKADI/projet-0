import { PrismaClient, Notification } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import { CacheService } from '../../infrastructure/cache/CacheService';
import { AuditService } from '../../shared/services/AuditService';

export interface CreateNotificationInput {
  type: string;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  sendEmail?: boolean;
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationFilters {
  read?: boolean;
  type?: string;
  priority?: string;
  userId?: string;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  enabledTypes: string[];
  typePreferences: Record<string, boolean>;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export class NotificationService {
  private io: SocketIOServer | null = null;

  constructor(
    private prisma: PrismaClient,
    private cacheService: CacheService,
    private auditService: AuditService
  ) {}

  setSocketIO(io: SocketIOServer): void {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join user-specific room
      socket.on('join', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined their room`);
      });

      // Handle notification read
      socket.on('notification:read', async (data: { userId: string; notificationId: string }) => {
        try {
          await this.markAsRead(data.userId, data.notificationId);
          this.io?.to(`user:${data.userId}`).emit('notification:read:success', { notificationId: data.notificationId });
        } catch (error) {
          socket.emit('notification:read:error', { error: error.message });
        }
      });

      // Handle mark all as read
      socket.on('notifications:read:all', async (userId: string) => {
        try {
          await this.markAllAsRead(userId);
          this.io?.to(`user:${userId}`).emit('notifications:read:all:success');
        } catch (error) {
          socket.emit('notifications:read:all:error', { error: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  async sendNotification(userId: string, notification: CreateNotificationInput): Promise<Notification> {
    // Check user preferences
    const preferences = await this.getUserPreferences(userId);
    
    if (!this.shouldSendNotification(notification, preferences)) {
      console.log(`Notification skipped for user ${userId} due to preferences`);
      return null;
    }

    // Create notification in database
    const savedNotification = await this.prisma.notification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority || 'normal',
        data: notification.data ? JSON.stringify(notification.data) : null,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
        read: false,
      },
    });

    // Invalidate cache
    await this.cacheService.invalidate(`notifications:${userId}*`);
    await this.cacheService.invalidate(`notifications:unread:${userId}`);

    // Send real-time via WebSocket
    if (this.io) {
      this.io.to(`user:${userId}`).emit('notification', savedNotification);
    }

    // Send email if enabled
    if (notification.sendEmail && preferences.emailEnabled) {
      await this.sendEmailNotification(userId, savedNotification);
    }

    // Audit log
    await this.auditService.log({
      userId: 'system',
      action: 'send_notification',
      resource: 'notification',
      resourceId: savedNotification.id,
      newValues: {
        type: notification.type,
        title: notification.title,
        recipientId: userId,
      },
    });

    return savedNotification;
  }

  async sendBulkNotifications(userIds: string[], notification: CreateNotificationInput): Promise<Notification[]> {
    const notifications = [];

    for (const userId of userIds) {
      try {
        const sent = await this.sendNotification(userId, notification);
        if (sent) {
          notifications.push(sent);
        }
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
      }
    }

    return notifications;
  }

  async getNotifications(
    userId: string,
    filters: NotificationFilters = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<PaginatedNotifications> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    // Apply filters
    if (filters.read !== undefined) {
      where.read = filters.read;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const cacheKey = `notifications:unread:${userId}`;

    // Try cache first
    const cached = await this.cacheService.get<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Get from database
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, count, 300);

    return count;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    // Invalidate cache
    await this.cacheService.invalidate(`notifications:${userId}*`);
    await this.cacheService.invalidate(`notifications:unread:${userId}`);

    // Send real-time update
    if (this.io) {
      this.io.to(`user:${userId}`).emit('notification:read', { notificationId });
    }
  }

  async markMultipleAsRead(userId: string, notificationIds: string[]): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    // Invalidate cache
    await this.cacheService.invalidate(`notifications:${userId}*`);
    await this.cacheService.invalidate(`notifications:unread:${userId}`);

    // Send real-time update
    if (this.io) {
      this.io.to(`user:${userId}`).emit('notifications:read:multiple', { notificationIds });
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    // Invalidate cache
    await this.cacheService.invalidate(`notifications:${userId}*`);
    await this.cacheService.invalidate(`notifications:unread:${userId}`);

    // Send real-time update
    if (this.io) {
      this.io.to(`user:${userId}`).emit('notifications:read:all');
    }
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });

    // Invalidate cache
    await this.cacheService.invalidate(`notifications:${userId}*`);
    await this.cacheService.invalidate(`notifications:unread:${userId}`);

    // Send real-time update
    if (this.io) {
      this.io.to(`user:${userId}`).emit('notification:deleted', { notificationId });
    }
  }

  async deleteAllRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: {
        userId,
        read: true,
      },
    });

    // Invalidate cache
    await this.cacheService.invalidate(`notifications:${userId}*`);

    // Send real-time update
    if (this.io) {
      this.io.to(`user:${userId}`).emit('notifications:deleted:all');
    }

    return result.count;
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    const cacheKey = `notification_preferences:${userId}`;

    // Try cache first
    const cached = await this.cacheService.get<NotificationPreferences>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const prefs = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    const preferences: NotificationPreferences = prefs
      ? {
          emailEnabled: prefs.emailEnabled,
          pushEnabled: prefs.pushEnabled,
          enabledTypes: JSON.parse(prefs.enabledTypes || '[]'),
          typePreferences: JSON.parse(prefs.typePreferences || '{}'),
          quietHoursStart: prefs.quietHoursStart,
          quietHoursEnd: prefs.quietHoursEnd,
        }
      : {
          emailEnabled: true,
          pushEnabled: true,
          enabledTypes: [],
          typePreferences: {},
        };

    // Cache for 1 hour
    await this.cacheService.set(cacheKey, preferences, 3600);

    return preferences;
  }

  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const updated = await this.prisma.notificationPreferences.upsert({
      where: { userId },
      create: {
        userId,
        emailEnabled: preferences.emailEnabled ?? true,
        pushEnabled: preferences.pushEnabled ?? true,
        enabledTypes: JSON.stringify(preferences.enabledTypes || []),
        typePreferences: JSON.stringify(preferences.typePreferences || {}),
        quietHoursStart: preferences.quietHoursStart,
        quietHoursEnd: preferences.quietHoursEnd,
      },
      update: {
        ...(preferences.emailEnabled !== undefined && { emailEnabled: preferences.emailEnabled }),
        ...(preferences.pushEnabled !== undefined && { pushEnabled: preferences.pushEnabled }),
        ...(preferences.enabledTypes && { enabledTypes: JSON.stringify(preferences.enabledTypes) }),
        ...(preferences.typePreferences && { typePreferences: JSON.stringify(preferences.typePreferences) }),
        ...(preferences.quietHoursStart && { quietHoursStart: preferences.quietHoursStart }),
        ...(preferences.quietHoursEnd && { quietHoursEnd: preferences.quietHoursEnd }),
      },
    });

    // Invalidate cache
    await this.cacheService.invalidate(`notification_preferences:${userId}`);

    return {
      emailEnabled: updated.emailEnabled,
      pushEnabled: updated.pushEnabled,
      enabledTypes: JSON.parse(updated.enabledTypes || '[]'),
      typePreferences: JSON.parse(updated.typePreferences || '{}'),
      quietHoursStart: updated.quietHoursStart,
      quietHoursEnd: updated.quietHoursEnd,
    };
  }

  private shouldSendNotification(notification: CreateNotificationInput, preferences: NotificationPreferences): boolean {
    // Check if type is enabled
    if (preferences.enabledTypes.length > 0 && !preferences.enabledTypes.includes(notification.type)) {
      return false;
    }

    // Check type-specific preferences
    if (preferences.typePreferences[notification.type] === false) {
      return false;
    }

    // Check quiet hours
    if (preferences.quietHoursStart && preferences.quietHoursEnd) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime >= preferences.quietHoursStart && currentTime <= preferences.quietHoursEnd) {
        // Only send urgent notifications during quiet hours
        if (notification.priority !== 'urgent') {
          return false;
        }
      }
    }

    return true;
  }

  private async sendEmailNotification(userId: string, notification: Notification): Promise<void> {
    // This would integrate with your email service (SendGrid, AWS SES, etc.)
    console.log(`Sending email notification to user ${userId}:`, {
      title: notification.title,
      message: notification.message,
    });

    // Implementation would go here
    // await emailService.send({
    //   to: user.email,
    //   subject: notification.title,
    //   body: notification.message,
    // });
  }

  async getNotificationStats(userId: string, period: { start: Date; end: Date }): Promise<{
    total: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    readRate: number;
  }> {
    const where = {
      userId,
      createdAt: {
        gte: period.start,
        lte: period.end,
      },
    };

    const [total, byType, byPriority, readCount] = await Promise.all([
      this.prisma.notification.count({ where }),
      
      this.prisma.notification.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
      
      this.prisma.notification.groupBy({
        by: ['priority'],
        where,
        _count: { priority: true },
      }),
      
      this.prisma.notification.count({ where: { ...where, read: true } }),
    ]);

    const readRate = total > 0 ? (readCount / total) * 100 : 0;

    return {
      total,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {}),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.priority;
        return acc;
      }, {}),
      readRate: Math.round(readRate * 100) / 100,
    };
  }

  async cleanupOldNotifications(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        read: true,
      },
    });

    console.log(`Cleaned up ${result.count} old notifications`);
    return result.count;
  }
}
