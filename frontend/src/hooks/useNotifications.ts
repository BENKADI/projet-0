import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  readAt?: Date;
  data?: any;
  actionUrl?: string;
  actionText?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  enabledTypes: string[];
  typePreferences: Record<string, boolean>;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markMultipleAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  preferences: NotificationPreferences | null;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export const useNotifications = (): UseNotificationsReturn => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) {
      // Cleanup when user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Create socket connection
    const socket = io(WS_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Join user room
    socket.emit('join', user.id);

    // Listen for new notifications
    socket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show toast notification
      showToastNotification(notification);
    });

    // Listen for read updates
    socket.on('notification:read', ({ notificationId }: { notificationId: string }) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    // Listen for multiple read updates
    socket.on('notifications:read:multiple', ({ notificationIds }: { notificationIds: string[] }) => {
      setNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n.id) ? { ...n, read: true, readAt: new Date() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
    });

    // Listen for read all updates
    socket.on('notifications:read:all', () => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    });

    // Listen for deleted notification
    socket.on('notification:deleted', ({ notificationId }: { notificationId: string }) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    });

    // Listen for deleted all notifications
    socket.on('notifications:deleted:all', () => {
      setNotifications((prev) => prev.filter((n) => !n.read));
    });

    // Handle connection errors
    socket.on('connect_error', (err: Error) => {
      console.error('WebSocket connection error:', err);
      setError('Failed to connect to notification service');
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [user]);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user || !socketRef.current) return;

    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Emit to server via WebSocket
      socketRef.current.emit('notification:read', { userId: user.id, notificationId });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Revert optimistic update on error
      await refreshNotifications();
    }
  }, [user, refreshNotifications]);

  const markMultipleAsRead = useCallback(async (notificationIds: string[]) => {
    if (!user) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/notifications/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n.id) ? { ...n, read: true, readAt: new Date() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
    } catch (err) {
      console.error('Error marking multiple notifications as read:', err);
      toast.error('Failed to mark notifications as read');
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user || !socketRef.current) return;

    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date() }))
      );
      setUnreadCount(0);

      // Emit to server via WebSocket
      socketRef.current.emit('notifications:read:all', user.id);

      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Revert optimistic update on error
      await refreshNotifications();
      toast.error('Failed to mark all as read');
    }
  }, [user, refreshNotifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Update local state
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  }, [user]);

  const deleteAllRead = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/notifications/read/all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete read notifications');
      }

      // Update local state
      setNotifications((prev) => prev.filter((n) => !n.read));
      toast.success('All read notifications deleted');
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      toast.error('Failed to delete notifications');
    }
  }, [user]);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/notifications/preferences`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      setPreferences(data.preferences);
    } catch (err) {
      console.error('Error fetching notification preferences:', err);
    }
  }, [user]);

  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    if (!user) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(prefs),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const data = await response.json();
      setPreferences(data.preferences);
      toast.success('Notification preferences updated');
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      toast.error('Failed to update preferences');
    }
  }, [user]);

  const showToastNotification = (notification: Notification) => {
    const toastOptions = {
      duration: 5000,
      action: notification.actionUrl
        ? {
            label: notification.actionText || 'View',
            onClick: () => {
              window.location.href = notification.actionUrl!;
            },
          }
        : undefined,
    };

    switch (notification.priority) {
      case 'urgent':
        toast.error(notification.message, { ...toastOptions, duration: 10000 });
        break;
      case 'high':
        toast.warning(notification.message, toastOptions);
        break;
      case 'low':
        toast.info(notification.message, toastOptions);
        break;
      default:
        toast(notification.message, toastOptions);
    }
  };

  // Fetch initial notifications and preferences when user is available
  useEffect(() => {
    if (user) {
      refreshNotifications();
      fetchPreferences();
    }
  }, [user, refreshNotifications, fetchPreferences]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    refreshNotifications,
    preferences,
    updatePreferences,
  };
};
