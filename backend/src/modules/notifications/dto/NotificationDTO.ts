import { IsString, IsBoolean, IsOptional, IsEnum, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  SYSTEM = 'system',
  USER = 'user',
  WELCOME = 'welcome',
  PASSWORD_CHANGED = 'password_changed',
  ROLE_CHANGE = 'role_change',
  ACCOUNT_DELETED = 'account_deleted',
  INVENTORY_ALERT = 'inventory_alert',
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  ORDER_COMPLETED = 'order_completed',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class CreateNotificationDTO {
  @ApiProperty({ example: NotificationType.SYSTEM, enum: NotificationType, description: 'Notification type' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ example: 'Welcome to Projet-0!', description: 'Notification title' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Your account has been created successfully.', description: 'Notification message' })
  @IsString()
  @MaxLength(1000)
  message: string;

  @ApiPropertyOptional({ example: NotificationPriority.NORMAL, enum: NotificationPriority, description: 'Notification priority' })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.NORMAL;

  @ApiPropertyOptional({ example: true, description: 'Send email notification' })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean = false;

  @ApiPropertyOptional({ example: { orderId: '123', amount: 100 }, description: 'Additional notification data' })
  @IsOptional()
  data?: Record<string, any>;

  @ApiPropertyOptional({ example: '/orders/123', description: 'Action URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  actionUrl?: string;

  @ApiPropertyOptional({ example: 'View Order', description: 'Action button text' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  actionText?: string;
}

export class SendNotificationDTO extends CreateNotificationDTO {
  @ApiProperty({ example: 'user_123', description: 'User ID to send notification to' })
  @IsString()
  userId: string;
}

export class BulkNotificationDTO {
  @ApiProperty({ example: ['user_123', 'user_456'], description: 'Array of user IDs' })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty({ type: CreateNotificationDTO, description: 'Notification data' })
  notification: CreateNotificationDTO;
}

export class NotificationQueryDTO {
  @ApiPropertyOptional({ example: 'false', description: 'Filter by read status' })
  @IsOptional()
  @IsString()
  read?: string;

  @ApiPropertyOptional({ example: NotificationType.SYSTEM, enum: NotificationType, description: 'Filter by type' })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ example: NotificationPriority.HIGH, enum: NotificationPriority, description: 'Filter by priority' })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({ example: '1', description: 'Page number' })
  @IsOptional()
  @IsString()
  page?: string = '1';

  @ApiPropertyOptional({ example: '20', description: 'Items per page' })
  @IsOptional()
  @IsString()
  limit?: string = '20';

  @ApiPropertyOptional({ example: 'createdAt', description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', description: 'Sort order' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class MarkAsReadDTO {
  @ApiProperty({ example: ['notif_123', 'notif_456'], description: 'Array of notification IDs to mark as read' })
  @IsArray()
  @IsString({ each: true })
  notificationIds: string[];
}

export class NotificationPreferencesDTO {
  @ApiPropertyOptional({ example: true, description: 'Enable email notifications' })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Enable push notifications' })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiPropertyOptional({ example: [NotificationType.SYSTEM], description: 'Notification types to receive' })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  enabledTypes?: NotificationType[];

  @ApiPropertyOptional({ example: { inventory_alert: false }, description: 'Type-specific preferences' })
  @IsOptional()
  typePreferences?: Record<string, boolean>;

  @ApiPropertyOptional({ example: '09:00', description: 'Quiet hours start time' })
  @IsOptional()
  @IsString()
  quietHoursStart?: string;

  @ApiPropertyOptional({ example: '22:00', description: 'Quiet hours end time' })
  @IsOptional()
  @IsString()
  quietHoursEnd?: string;
}
