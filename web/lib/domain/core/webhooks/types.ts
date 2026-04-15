import { z } from 'zod'

export const WebhookEventType = z.enum([
  'appointment_created',
  'appointment_updated',
  'invoice_sent',
  'payment_received',
  'payment_failed',
])

export const WebhookEvent = z.object({
  id: z.string(),
  type: WebhookEventType,
  url: z.string().url(),
  secret: z.string(),
  events: z.array(WebhookEventType),
  enabled: z.boolean(),
})

export const CreateWebhookData = z.object({
  url: z.string().url(),
  secret: z.string(),
  events: z.array(WebhookEventType),
})

export const UpdateWebhookData = z.object({
  url: z.string().url().optional(),
  secret: z.string().optional(),
  events: z.array(WebhookEventType).optional(),
})