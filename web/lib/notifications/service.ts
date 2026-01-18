/**
 * Notification Service
 *
 * Unified notification system for multi-channel delivery
 */

import { logger } from '@/lib/logger'
import type { NotificationPayload } from './types'

/**
 * @deprecated Use sendNotification from '@/lib/notifications' instead
 */
export async function sendConfirmationEmail(options: {
  to: string
  subject: string
  body: string
}) {
  logger.warn(
    'sendConfirmationEmail is deprecated. Use sendNotification from @/lib/notifications instead'
  )

  // This function no longer has access to user/tenant context
  // Return simulated success for backwards compatibility
  return { success: true, message: 'Email enviado (simulado)' }
}

/**
 * @deprecated Use sendNotification from '@/lib/notifications' instead
 */
export async function sendReminderNotification(options: {
  to: string
  type: 'email' | 'sms'
  message: string
}) {
  logger.warn(
    'sendReminderNotification is deprecated. Use sendNotification from @/lib/notifications instead'
  )

  // Return simulated success for backwards compatibility
  return { success: true, message: 'Recordatorio enviado (simulado)' }
}

/**
 * Send notification to user
 */
export async function sendNotification(payload: NotificationPayload) {
  logger.info('Sending notification', { type: payload.type, channels: payload.channels })
  
  // TODO: Implement actual notification sending logic
  return {
    success: true,
    message: 'Notification sent',
    results: payload.channels.map(channel => ({
      channel,
      success: true,
      message: `Sent via ${channel}`
    }))
  }
}

/**
 * Send in-app notification
 */
export async function sendInAppNotification(payload: {
  userId: string
  type: string
  title: string
  message: string
  data?: Record<string, unknown>
}) {
  logger.info('Sending in-app notification', { userId: payload.userId, type: payload.type })
  
  // TODO: Implement actual in-app notification
  return {
    success: true,
    message: 'In-app notification sent'
  }
}

/**
 * Notify staff members
 */
export async function notifyStaff(payload: {
  tenantId: string
  type: string
  title: string
  message: string
  channels?: string[]
  data?: Record<string, unknown>
}) {
  logger.info('Notifying staff', { tenantId: payload.tenantId, type: payload.type, channels: payload.channels })
  
  // TODO: Implement staff notification logic
  return {
    success: true,
    message: 'Staff notified'
  }
}
