import { z } from 'zod';

export enum NotificationType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  LAB_RESULTS_READY = 'lab_results_ready',
  LAB_CRITICAL_RESULT = 'lab_critical_result',
  LOW_STOCK_ALERT = 'low_stock_alert',
  ORDER_CONFIRMATION = 'order_confirmation',
  SUBSCRIPTION_RENEWAL = 'subscription_renewal',
  WAITLIST_SLOT_AVAILABLE = 'waitlist_slot_available',
}

export enum NotificationChannel {
  EMAIL = 'email',
  IN_APP = 'in_app',
  PUSH = 'push',
}

export interface NotificationPayload {
  type: NotificationType;
  recipientId: string;
  recipientType: 'owner' | 'staff';
  tenantId: string;
  title: string;
  message: string;
  channels: NotificationChannel[];
  priority: 'normal' | 'urgent';
  actionUrl?: string;
  data?: Record<string, unknown>;
}

export interface NotificationResult {
  success: boolean;
  channels: ChannelResult[];
  errors?: string[];
}

export interface ChannelResult {
  channel: NotificationChannel;
  success: boolean;
  message?: string;
}

export interface InAppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: Date;
}

export const NotificationPreferencesSchema = z.object({
  email: z.boolean(),
  inApp: z.boolean(),
  push: z.boolean(),
  types: z.record(NotificationType, z.array(NotificationChannel)),
});