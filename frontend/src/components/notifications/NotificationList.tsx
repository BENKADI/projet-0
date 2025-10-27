import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Package, 
  ShoppingCart,
  CreditCard,
  UserCheck,
  Shield,
  X
} from 'lucide-react';
import { Notification } from '../../hooks/useNotifications';
import { Button } from '../ui/Button/Button';
import { cn } from '../../lib/utils';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
  compact?: boolean;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  compact = false,
}) => {
  const getIcon = (type: string, priority: string) => {
    const iconClass = cn(
      'h-5 w-5',
      priority === 'urgent' && 'text-red-500',
      priority === 'high' && 'text-orange-500',
      priority === 'normal' && 'text-blue-500',
      priority === 'low' && 'text-gray-500'
    );

    switch (type) {
      case 'system':
        return <Bell className={iconClass} />;
      case 'welcome':
      case 'user':
        return <UserCheck className={iconClass} />;
      case 'password_changed':
      case 'role_change':
        return <Shield className={iconClass} />;
      case 'inventory_alert':
        return <Package className={iconClass} />;
      case 'order_created':
      case 'order_updated':
        return <ShoppingCart className={iconClass} />;
      case 'order_completed':
        return <CheckCircle className={iconClass} />;
      case 'payment_success':
        return <CreditCard className={cn(iconClass, 'text-green-500')} />;
      case 'payment_failed':
        return <AlertCircle className={cn(iconClass, 'text-red-500')} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50/50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50/50';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50/50';
      default:
        return 'border-l-blue-500';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
        <p>No notifications</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', !compact && 'p-2')}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'relative border-l-4 p-3 rounded-r-lg transition-colors cursor-pointer group',
            getPriorityColor(notification.priority),
            !notification.read && 'bg-blue-50/70 hover:bg-blue-100/70',
            notification.read && 'opacity-60 hover:opacity-80',
            compact && 'p-2'
          )}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              {getIcon(notification.type, notification.priority)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className={cn(
                    'font-medium text-sm',
                    !notification.read && 'font-semibold'
                  )}>
                    {notification.title}
                  </h4>
                  <p className={cn(
                    'text-sm text-muted-foreground mt-0.5',
                    compact && 'line-clamp-2'
                  )}>
                    {notification.message}
                  </p>
                </div>

                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(notification.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>

                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                )}

                {notification.actionText && notification.actionUrl && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notification);
                    }}
                  >
                    {notification.actionText}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
