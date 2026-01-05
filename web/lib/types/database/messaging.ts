/**
 * Messaging Database Tables
 * Conversation, Message, MessageTemplate, BroadcastCampaign, CommunicationPreferences
 */

import type {
  NotificationChannel,
  MessageType,
  MessageStatus,
  ConversationStatus,
  ConversationPriority,
} from './enums'

// =============================================================================
// MESSAGING
// =============================================================================

export interface Conversation {
  id: string
  tenant_id: string
  client_id: string
  pet_id: string | null
  subject: string | null
  channel: NotificationChannel
  status: ConversationStatus
  priority: ConversationPriority
  assigned_to: string | null
  assigned_at: string | null
  last_message_at: string | null
  last_client_message_at: string | null
  last_staff_message_at: string | null
  client_last_read_at: string | null
  staff_last_read_at: string | null
  unread_client_count: number
  unread_staff_count: number
  appointment_id: string | null
  medical_record_id: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string | null
  sender_type: 'client' | 'staff' | 'system' | 'bot'
  sender_name: string | null
  message_type: MessageType
  content: string | null
  content_html: string | null
  attachments: Record<string, unknown>[]
  card_data: Record<string, unknown> | null
  reply_to_id: string | null
  status: MessageStatus
  delivered_at: string | null
  read_at: string | null
  failed_reason: string | null
  external_message_id: string | null
  external_channel: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface MessageTemplate {
  id: string
  tenant_id: string | null
  code: string
  name: string
  category:
    | 'appointment'
    | 'reminder'
    | 'follow_up'
    | 'marketing'
    | 'transactional'
    | 'welcome'
    | 'feedback'
    | 'custom'
  subject: string | null
  content: string
  content_html: string | null
  variables: string[]
  channels: string[]
  sms_approved: boolean
  whatsapp_template_id: string | null
  language: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BroadcastCampaign {
  id: string
  tenant_id: string
  name: string
  description: string | null
  template_id: string | null
  subject: string | null
  content: string
  content_html: string | null
  channel: NotificationChannel
  audience_type:
    | 'all_clients'
    | 'pet_species'
    | 'pet_breed'
    | 'last_visit'
    | 'no_visit'
    | 'vaccine_due'
    | 'custom_list'
    | 'segment'
  audience_filter: Record<string, unknown>
  scheduled_at: string | null
  sent_at: string | null
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'failed'
  total_recipients: number
  sent_count: number
  delivered_count: number
  read_count: number
  failed_count: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CommunicationPreferences {
  id: string
  user_id: string
  tenant_id: string | null
  allow_sms: boolean
  allow_whatsapp: boolean
  allow_email: boolean
  allow_in_app: boolean
  allow_push: boolean
  preferred_phone: string | null
  preferred_email: string | null
  whatsapp_number: string | null
  allow_appointment_reminders: boolean
  allow_vaccine_reminders: boolean
  allow_marketing: boolean
  allow_feedback_requests: boolean
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  preferred_language: string
  timezone: string
  unsubscribed_at: string | null
  unsubscribe_reason: string | null
  created_at: string
  updated_at: string
}
