/**
 * Legacy Notification Service
 *
 * @deprecated Use `@/lib/notifications` instead
 *
 * This file is kept for backwards compatibility.
 * All new code should import from the notifications module.
 */

import { sendNotification, sendInAppNotification } from './notifications'
import { logger } from './logger'

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

// Re-export new functions for easy migration
export { sendNotification, sendInAppNotification }
