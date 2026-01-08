/**
 * Unified Notification Service
 *
 * Handles multi-channel notification delivery:
 * - Email (via Resend)
 * - In-app (database notifications table)
 * - SMS (via Twilio - future)
 * - Push (via service worker - future)
 */

import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/email/client'
import { logger } from '@/lib/logger'
import type {
  NotificationPayload,
  NotificationResult,
  ChannelResult,
  NotificationChannel,
} from './types'
import { getEmailTemplate } from './templates'

// =============================================================================
// Main Service
// =============================================================================

/**
 * Send a notification through specified channels
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<NotificationResult> {
  const {
    type,
    recipientId,
    tenantId,
    title,
    message,
    channels,
    data,
    email,
    actionUrl,
  } = payload

  const results: ChannelResult[] = []
  const errors: string[] = []

  // Get recipient email if needed for email channel
  let recipientEmail: string | null = null
  if (channels.includes('email')) {
    recipientEmail = await getRecipientEmail(recipientId, tenantId)
    if (!recipientEmail) {
      results.push({
        channel: 'email',
        success: false,
        error: 'No se encontró email del destinatario',
      })
      errors.push('Email recipient not found')
    }
  }

  // Process each channel
  for (const channel of channels) {
    try {
      const result = await deliverToChannel(channel, {
        type,
        recipientId,
        recipientEmail,
        tenantId,
        title,
        message,
        data,
        email,
        actionUrl,
      })
      results.push(result)
      if (!result.success && result.error) {
        errors.push(`${channel}: ${result.error}`)
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido'
      results.push({
        channel,
        success: false,
        error: errorMessage,
      })
      errors.push(`${channel}: ${errorMessage}`)
    }
  }

  // Log the notification attempt
  await logNotification({
    type,
    recipientId,
    tenantId,
    channels,
    results,
  })

  const success = results.some((r) => r.success)

  return {
    success,
    notificationId: `notif-${Date.now()}`,
    channels: results,
    errors: errors.length > 0 ? errors : undefined,
  }
}

// =============================================================================
// Channel Delivery
// =============================================================================

interface DeliveryParams {
  type: NotificationPayload['type']
  recipientId: string
  recipientEmail: string | null
  tenantId: string
  title: string
  message: string
  data?: Record<string, unknown>
  email?: NotificationPayload['email']
  actionUrl?: string
}

async function deliverToChannel(
  channel: NotificationChannel,
  params: DeliveryParams
): Promise<ChannelResult> {
  switch (channel) {
    case 'email':
      return deliverEmail(params)
    case 'in_app':
      return deliverInApp(params)
    case 'sms':
      return deliverSms(params)
    case 'push':
      return deliverPush(params)
    default:
      return {
        channel,
        success: false,
        error: `Canal no soportado: ${channel}`,
      }
  }
}

/**
 * Deliver notification via email
 */
async function deliverEmail(params: DeliveryParams): Promise<ChannelResult> {
  const { type, recipientEmail, tenantId, title, message, data, email, actionUrl } =
    params

  if (!recipientEmail) {
    return {
      channel: 'email',
      success: false,
      error: 'No se encontró email del destinatario',
    }
  }

  // Get email template for this notification type
  const template = await getEmailTemplate(type, {
    title,
    message,
    data,
    actionUrl,
    tenantId,
  })

  const result = await sendEmail({
    to: recipientEmail,
    subject: email?.subject || title,
    html: template.html,
    text: template.text,
    replyTo: email?.replyTo,
  })

  return {
    channel: 'email',
    success: result.success,
    error: result.error,
    messageId: result.messageId,
  }
}

/**
 * Deliver notification via in-app (database)
 */
async function deliverInApp(params: DeliveryParams): Promise<ChannelResult> {
  const { type, recipientId, tenantId, title, message, data, actionUrl } = params

  const supabase = await createServiceClient()

  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: recipientId,
      tenant_id: tenantId,
      type,
      title,
      message,
      data: data || null,
      action_url: actionUrl || null,
    })
    .select('id')
    .single()

  if (error) {
    logger.error('Failed to create in-app notification', {
      error: error.message,
      recipientId,
      type,
    })
    return {
      channel: 'in_app',
      success: false,
      error: error.message,
    }
  }

  return {
    channel: 'in_app',
    success: true,
    messageId: notification.id,
  }
}

/**
 * Deliver notification via SMS (future implementation)
 */
async function deliverSms(params: DeliveryParams): Promise<ChannelResult> {
  // TODO: Implement SMS delivery via Twilio
  logger.info('SMS delivery not yet implemented', {
    recipientId: params.recipientId,
    type: params.type,
  })
  return {
    channel: 'sms',
    success: false,
    error: 'SMS no implementado aún',
  }
}

/**
 * Deliver notification via push (future implementation)
 */
async function deliverPush(params: DeliveryParams): Promise<ChannelResult> {
  // TODO: Implement push notifications via service worker
  logger.info('Push delivery not yet implemented', {
    recipientId: params.recipientId,
    type: params.type,
  })
  return {
    channel: 'push',
    success: false,
    error: 'Push no implementado aún',
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get recipient email address from database
 */
async function getRecipientEmail(
  recipientId: string,
  tenantId: string
): Promise<string | null> {
  const supabase = await createServiceClient()

  // Try profiles table first (staff)
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', recipientId)
    .eq('tenant_id', tenantId)
    .maybeSingle()

  if (profile?.email) {
    return profile.email
  }

  // Try auth.users as fallback
  const { data: user } = await supabase.auth.admin.getUserById(recipientId)

  return user?.user?.email || null
}

/**
 * Log notification for audit trail
 */
async function logNotification(params: {
  type: string
  recipientId: string
  tenantId: string
  channels: NotificationChannel[]
  results: ChannelResult[]
}): Promise<void> {
  try {
    const supabase = await createServiceClient()
    const successfulChannels = params.results
      .filter((r) => r.success)
      .map((r) => r.channel)

    await supabase.from('audit_logs').insert({
      tenant_id: params.tenantId,
      action: 'notification.sent',
      resource: 'notification',
      details: {
        type: params.type,
        recipientId: params.recipientId,
        channels: params.channels,
        successfulChannels,
        errors: params.results
          .filter((r) => !r.success)
          .map((r) => ({ channel: r.channel, error: r.error })),
      },
    })
  } catch (error) {
    // Don't fail the notification if audit logging fails
    logger.warn('Failed to log notification', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
  }
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Send a simple in-app notification
 */
export async function sendInAppNotification(params: {
  recipientId: string
  tenantId: string
  title: string
  message: string
  type?: NotificationPayload['type']
  data?: Record<string, unknown>
  actionUrl?: string
}): Promise<NotificationResult> {
  return sendNotification({
    type: params.type || 'custom',
    recipientId: params.recipientId,
    recipientType: 'user',
    tenantId: params.tenantId,
    title: params.title,
    message: params.message,
    channels: ['in_app'],
    data: params.data,
    actionUrl: params.actionUrl,
  })
}

/**
 * Send notification to all staff of a tenant
 */
export async function notifyStaff(params: {
  tenantId: string
  title: string
  message: string
  type?: NotificationPayload['type']
  channels?: NotificationChannel[]
  data?: Record<string, unknown>
  roles?: ('vet' | 'admin')[]
}): Promise<NotificationResult[]> {
  const supabase = await createServiceClient()

  // Get staff profiles
  let query = supabase
    .from('profiles')
    .select('id')
    .eq('tenant_id', params.tenantId)

  if (params.roles && params.roles.length > 0) {
    query = query.in('role', params.roles)
  } else {
    query = query.in('role', ['vet', 'admin'])
  }

  const { data: staff, error } = await query

  if (error || !staff || staff.length === 0) {
    logger.warn('No staff found to notify', { tenantId: params.tenantId })
    return []
  }

  // Send to each staff member
  const results = await Promise.all(
    staff.map((s) =>
      sendNotification({
        type: params.type || 'custom',
        recipientId: s.id,
        recipientType: 'staff',
        tenantId: params.tenantId,
        title: params.title,
        message: params.message,
        channels: params.channels || ['in_app'],
        data: params.data,
      })
    )
  )

  return results
}
