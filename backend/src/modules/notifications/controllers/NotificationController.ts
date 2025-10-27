import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/NotificationService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { read, type, priority, page, limit } = req.query;

      const filters = {
        read: read === 'true' ? true : read === 'false' ? false : undefined,
        type: type as string,
        priority: priority as string,
      };

      const pagination = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      };

      const result = await this.notificationService.getNotifications(userId, filters, pagination);

      res.json({
        success: true,
        data: result,
        message: 'Notifications retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const count = await this.notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { unreadCount: count },
        message: 'Unread count retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { notificationId } = req.params;
      await this.notificationService.markAsRead(userId, notificationId);

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async markMultipleAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { notificationIds } = req.body;

      if (!Array.isArray(notificationIds)) {
        res.status(400).json({ 
          success: false, 
          error: 'notificationIds must be an array' 
        });
        return;
      }

      await this.notificationService.markMultipleAsRead(userId, notificationIds);

      res.json({
        success: true,
        message: 'Notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      await this.notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { notificationId } = req.params;
      await this.notificationService.deleteNotification(userId, notificationId);

      res.json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const count = await this.notificationService.deleteAllRead(userId);

      res.json({
        success: true,
        data: { deletedCount: count },
        message: `${count} notifications deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const preferences = await this.notificationService.getUserPreferences(userId);

      res.json({
        success: true,
        data: { preferences },
        message: 'Preferences retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const preferences = await this.notificationService.updateUserPreferences(userId, req.body);

      res.json({
        success: true,
        data: { preferences },
        message: 'Preferences updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { start, end } = req.query;

      if (!start || !end) {
        res.status(400).json({
          success: false,
          error: 'Start and end dates are required',
        });
        return;
      }

      const period = {
        start: new Date(start as string),
        end: new Date(end as string),
      };

      const stats = await this.notificationService.getNotificationStats(userId, period);

      res.json({
        success: true,
        data: stats,
        message: 'Notification stats retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin only endpoints
  async sendNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, notification } = req.body;

      if (!userId || !notification) {
        res.status(400).json({
          success: false,
          error: 'userId and notification are required',
        });
        return;
      }

      const sent = await this.notificationService.sendNotification(userId, notification);

      res.status(201).json({
        success: true,
        data: sent,
        message: 'Notification sent successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async sendBulkNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userIds, notification } = req.body;

      if (!Array.isArray(userIds) || !notification) {
        res.status(400).json({
          success: false,
          error: 'userIds (array) and notification are required',
        });
        return;
      }

      const sent = await this.notificationService.sendBulkNotifications(userIds, notification);

      res.status(201).json({
        success: true,
        data: {
          sentCount: sent.length,
          notifications: sent,
        },
        message: `${sent.length} notifications sent successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  async cleanupOldNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { days } = req.query;
      const daysToKeep = days ? parseInt(days as string) : 30;

      const count = await this.notificationService.cleanupOldNotifications(daysToKeep);

      res.json({
        success: true,
        data: { deletedCount: count },
        message: `${count} old notifications cleaned up`,
      });
    } catch (error) {
      next(error);
    }
  }
}
