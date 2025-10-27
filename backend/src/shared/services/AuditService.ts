import { PrismaClient } from '@prisma/client';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ip?: string;
  userAgent?: string;
  success?: boolean;
  error?: string;
  timestamp?: Date;
}

export interface AuditFilters {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
}

export interface AuditStats {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByResource: Record<string, number>;
  actionsByUser: Record<string, number>;
  successRate: number;
  errorRate: number;
  topActions: Array<{ action: string; count: number }>;
  recentActivity: AuditLogEntry[];
}

export class AuditService {
  constructor(private prisma: PrismaClient) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Sanitize sensitive data
      const sanitizedEntry = this.sanitizeAuditEntry(entry);

      // Store in database
      await this.prisma.auditLog.create({
        data: {
          userId: sanitizedEntry.userId,
          action: sanitizedEntry.action,
          resource: sanitizedEntry.resource,
          resourceId: sanitizedEntry.resourceId,
          oldValues: sanitizedEntry.oldValues ? JSON.stringify(sanitizedEntry.oldValues) : null,
          newValues: sanitizedEntry.newValues ? JSON.stringify(sanitizedEntry.newValues) : null,
          ip: sanitizedEntry.ip,
          userAgent: sanitizedEntry.userAgent,
          success: sanitizedEntry.success ?? true,
          error: sanitizedEntry.error,
          timestamp: sanitizedEntry.timestamp || new Date(),
        },
      });

      // Log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AUDIT] ${entry.action} on ${entry.resource} by user ${entry.userId}`, {
          resourceId: entry.resourceId,
          success: entry.success,
          timestamp: entry.timestamp,
        });
      }
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw error to avoid breaking main flow
    }
  }

  async getAuditLogs(
    filters: AuditFilters = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<{ logs: AuditLogEntry[]; total: number; page: number; limit: number }> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Build filters
    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = { contains: filters.action, mode: 'insensitive' };
    }

    if (filters.resource) {
      where.resource = { contains: filters.resource, mode: 'insensitive' };
    }

    if (filters.resourceId) {
      where.resourceId = filters.resourceId;
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    if (filters.success !== undefined) {
      where.success = filters.success;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    // Transform logs to expected format
    const transformedLogs = logs.map(log => ({
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      oldValues: log.oldValues ? JSON.parse(log.oldValues) : undefined,
      newValues: log.newValues ? JSON.parse(log.newValues) : undefined,
      ip: log.ip,
      userAgent: log.userAgent,
      success: log.success,
      error: log.error,
      timestamp: log.timestamp,
      user: log.user,
    }));

    return {
      logs: transformedLogs,
      total,
      page,
      limit,
    };
  }

  async getAuditStats(period: { start: Date; end: Date }): Promise<AuditStats> {
    const where = {
      timestamp: {
        gte: period.start,
        lte: period.end,
      },
    };

    const [
      totalActions,
      actionsByType,
      actionsByResource,
      actionsByUser,
      successCount,
      errorCount,
      topActions,
      recentActivity,
    ] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
      }),
      
      this.prisma.auditLog.groupBy({
        by: ['resource'],
        where,
        _count: { resource: true },
        orderBy: { _count: { resource: 'desc' } },
      }),
      
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        where,
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
      
      this.prisma.auditLog.count({ where: { ...where, success: true } }),
      this.prisma.auditLog.count({ where: { ...where, success: false } }),
      
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 5,
      }),
      
      this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    const total = totalActions;
    const successRate = total > 0 ? (successCount / total) * 100 : 0;
    const errorRate = total > 0 ? (errorCount / total) * 100 : 0;

    return {
      totalActions: total,
      actionsByType: actionsByType.reduce((acc, item) => {
        acc[item.action] = item._count.action;
        return acc;
      }, {}),
      actionsByResource: actionsByResource.reduce((acc, item) => {
        acc[item.resource] = item._count.resource;
        return acc;
      }, {}),
      actionsByUser: actionsByUser.reduce((acc, item) => {
        acc[item.userId] = item._count.userId;
        return acc;
      }, {}),
      successRate: Math.round(successRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      topActions: topActions.map(item => ({
        action: item.action,
        count: item._count.action,
      })),
      recentActivity: recentActivity.map(log => ({
        userId: log.userId,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        oldValues: log.oldValues ? JSON.parse(log.oldValues) : undefined,
        newValues: log.newValues ? JSON.parse(log.newValues) : undefined,
        ip: log.ip,
        userAgent: log.userAgent,
        success: log.success,
        error: log.error,
        timestamp: log.timestamp,
        user: log.user,
      })),
    };
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<AuditLogEntry[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return logs.map(log => ({
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      oldValues: log.oldValues ? JSON.parse(log.oldValues) : undefined,
      newValues: log.newValues ? JSON.parse(log.newValues) : undefined,
      ip: log.ip,
      userAgent: log.userAgent,
      success: log.success,
      error: log.error,
      timestamp: log.timestamp,
      user: log.user,
    }));
  }

  async getResourceHistory(resource: string, resourceId?: string, limit: number = 50): Promise<AuditLogEntry[]> {
    const where: any = { resource };
    if (resourceId) {
      where.resourceId = resourceId;
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return logs.map(log => ({
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      oldValues: log.oldValues ? JSON.parse(log.oldValues) : undefined,
      newValues: log.newValues ? JSON.parse(log.newValues) : undefined,
      ip: log.ip,
      userAgent: log.userAgent,
      success: log.success,
      error: log.error,
      timestamp: log.timestamp,
      user: log.user,
    }));
  }

  async exportAuditLogs(
    format: 'csv' | 'json' | 'excel',
    filters: AuditFilters = {}
  ): Promise<Buffer> {
    const { logs } = await this.getAuditLogs(filters, { limit: 10000 });

    // Transform for export
    const exportData = logs.map(log => ({
      timestamp: log.timestamp,
      userId: log.userId,
      userEmail: log.user?.email,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      success: log.success,
      error: log.error,
      ip: log.ip,
      userAgent: log.userAgent,
    }));

    switch (format) {
      case 'csv':
        return this.generateCSV(exportData);
      case 'json':
        return Buffer.from(JSON.stringify(exportData, null, 2));
      case 'excel':
        return this.generateExcel(exportData);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Cleaned up ${result.count} old audit logs`);
    return result.count;
  }

  private sanitizeAuditEntry(entry: AuditLogEntry): AuditLogEntry {
    const sanitized = { ...entry };

    // Remove sensitive data from oldValues and newValues
    if (sanitized.oldValues) {
      sanitized.oldValues = this.removeSensitiveFields(sanitized.oldValues);
    }

    if (sanitized.newValues) {
      sanitized.newValues = this.removeSensitiveFields(sanitized.newValues);
    }

    return sanitized;
  }

  private removeSensitiveFields(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey', 'jwt'];
    const sanitized = { ...obj };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.removeSensitiveFields(sanitized[key]);
      }
    }

    return sanitized;
  }

  private generateCSV(data: any[]): Buffer {
    if (data.length === 0) {
      return Buffer.from('');
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      csvRows.push(values.join(','));
    }

    return Buffer.from(csvRows.join('\n'));
  }

  private generateExcel(data: any[]): Buffer {
    // For now, return CSV as placeholder
    // In a real implementation, you would use a library like xlsx
    return this.generateCSV(data);
  }

  // Advanced audit features

  async detectAnomalies(period: { start: Date; end: Date }): Promise<{
    suspiciousUsers: Array<{ userId: string; actionCount: number; errorRate: number }>;
    unusualActions: Array<{ action: string; count: number; averageCount: number }>;
    failedLogins: Array<{ userId: string; ip: string; count: number; lastAttempt: Date }>;
  }> {
    const where = {
      timestamp: {
        gte: period.start,
        lte: period.end,
      },
    };

    // Detect users with high error rates
    const userStats = await this.prisma.auditLog.groupBy({
      by: ['userId', 'success'],
      where,
      _count: { userId: true },
    });

    const userActionCounts = await this.prisma.auditLog.groupBy({
      by: ['userId'],
      where,
      _count: { userId: true },
    });

    const suspiciousUsers = [];
    for (const userStat of userActionCounts) {
      const successCount = userStats.find(s => s.userId === userStat.userId && s.success === true)?._count.userId || 0;
      const errorCount = userStats.find(s => s.userId === userStat.userId && s.success === false)?._count.userId || 0;
      const total = successCount + errorCount;
      const errorRate = total > 0 ? (errorCount / total) * 100 : 0;

      if (total > 100 && errorRate > 50) {
        suspiciousUsers.push({
          userId: userStat.userId,
          actionCount: total,
          errorRate: Math.round(errorRate * 100) / 100,
        });
      }
    }

    // Detect unusual actions (actions with significantly higher counts than average)
    const actionStats = await this.prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: { action: true },
    });

    const averageCount = actionStats.reduce((sum, stat) => sum + stat._count.action, 0) / actionStats.length;

    const unusualActions = actionStats
      .filter(stat => stat._count.action > averageCount * 3)
      .map(stat => ({
        action: stat.action,
        count: stat._count.action,
        averageCount: Math.round(averageCount * 100) / 100,
      }));

    // Detect failed login attempts
    const failedLogins = await this.prisma.auditLog.groupBy({
      by: ['userId', 'ip'],
      where: {
        ...where,
        action: 'login',
        success: false,
      },
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 10,
    });

    const failedLoginDetails = await Promise.all(
      failedLogins.map(async (login) => {
        const lastAttempt = await this.prisma.auditLog.findFirst({
          where: {
            userId: login.userId,
            ip: login.ip,
            action: 'login',
            success: false,
          },
          orderBy: { timestamp: 'desc' },
        });

        return {
          userId: login.userId,
          ip: login.ip,
          count: login._count.userId,
          lastAttempt: lastAttempt?.timestamp || new Date(),
        };
      })
    );

    return {
      suspiciousUsers,
      unusualActions,
      failedLogins: failedLoginDetails,
    };
  }
}
