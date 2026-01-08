/**
 * Notifications Module
 *
 * Unified notification system for multi-channel delivery
 */

export {
  sendNotification,
  sendInAppNotification,
  notifyStaff,
} from './service'

export type {
  NotificationType,
  NotificationChannel,
  RecipientType,
  NotificationPayload,
  NotificationResult,
  ChannelResult,
  InAppNotification,
  NotificationPreferences,
} from './types'

export { getEmailTemplate } from './templates'
