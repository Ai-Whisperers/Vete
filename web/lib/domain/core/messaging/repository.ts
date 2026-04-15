import type { SupabaseClient } from '@supabase/supabase-js'
import { createSearchPattern } from '@/lib/utils/search'
import type {
  Conversation,
  ConversationFilters,
  CreateConversationInput,
  ConversationStatus,
  ConversationPriority,
  Message,
  MessageFilters,
  SendMessageInput,
  MessageTemplate,
  TemplateFilters,
  CreateMessageTemplateInput,
  UpdateMessageTemplateInput,
} from './types'

export class MessagingRepository {
  constructor(private supabase: SupabaseClient) {}

  // ===========================================================================
  // CONVERSATIONS
  // ===========================================================================

  async findConversations(
    tenantId: string,
    filters: ConversationFilters = {}
  ): Promise<Conversation[]> {
    let query = this.supabase
      .from('conversations')
      .select(
        `
        *,
        client:profiles!client_id(id, full_name, email),
        pet:pets(id, name)
      `
      )
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }

    if (filters.channel) {
      query = query.eq('channel', filters.channel)
    }

    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id)
    }

    if (filters.pet_id) {
      query = query.eq('pet_id', filters.pet_id)
    }

    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }

    if (filters.has_unread) {
      query = query.gt('unread_staff_count', 0)
    }

    if (filters.search) {
      const safePattern = createSearchPattern(filters.search)
      query = query.ilike('subject', safePattern)
    }

    const { data, error } = await query

    if (error) throw new Error(`Error al cargar conversaciones: ${error.message}`)
    return (data || []) as Conversation[]
  }

  async findConversationById(
    conversationId: string,
    tenantId: string
  ): Promise<Conversation | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select(
        `
        *,
        client:profiles!client_id(id, full_name, email, phone),
        pet:pets(id, name, species, breed),
        assigned:profiles!assigned_to(id, full_name)
      `
      )
      .eq('id', conversationId)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error al cargar conversación: ${error.message}`)
    }

    return data as Conversation
  }

  async createConversation(tenantId: string, input: CreateConversationInput): Promise<Conversation> {
    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        tenant_id: tenantId,
        client_id: input.client_id,
        pet_id: input.pet_id,
        subject: input.subject,
        channel: input.channel || 'in_app',
        priority: input.priority || 'normal',
        appointment_id: input.appointment_id,
        tags: input.tags,
        status: 'open',
      })
      .select(
        `
        *,
        client:profiles!client_id(id, full_name, email)
      `
      )
      .single()

    if (error) throw new Error(`Error al crear conversación: ${error.message}`)
    return data as Conversation
  }

  async updateConversationStatus(
    conversationId: string,
    tenantId: string,
    status: ConversationStatus
  ): Promise<Conversation> {
    const { data, error } = await this.supabase
      .from('conversations')
      .update({
        status,
      })
      .eq('id', conversationId)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .select(
        `
        *,
        client:profiles!client_id(id, full_name, email),
        pet:pets(id, name)
      `
      )
      .single()

    if (error) throw new Error(`Error al actualizar conversación: ${error.message}`)
    return data as Conversation
  }

  // ===========================================================================
  // MESSAGES
  // ===========================================================================

  async findMessages(
    conversationId: string,
    tenantId: string,
    filters: MessageFilters = {},
    limit: number = 50
  ): Promise<Message[]> {
    let query = this.supabase
      .from('messages')
      .select(
        `
        *,
        sender:profiles!sender_id(id, full_name),
        reply_to:messages!reply_to_id(*)
      `
      )
      .eq('conversation_id', conversationId)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true, nullsFirst: false })
      .limit(limit)

    if (filters.sender_type) {
      query = query.eq('sender_type', filters.sender_type)
    }

    if (filters.message_type) {
      query = query.eq('message_type', filters.message_type)
    }

    if (filters.from_date) {
      query = query.gte('created_at', filters.from_date)
    }

    if (filters.to_date) {
      query = query.lte('created_at', filters.to_date)
    }

    const { data, error } = await query

    if (error) throw new Error(`Error al cargar mensajes: ${error.message}`)
    return (data || []) as Message[]
  }

  async createMessage(
    conversationId: string,
    tenantId: string,
    input: SendMessageInput
  ): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        tenant_id: tenantId,
        sender_id: input.sender_id,
        sender_type: input.sender_type,
        sender_name: input.sender_name,
        message_type: input.message_type,
        content: input.content,
        content_html: input.content_html,
        attachments: input.attachments,
        card_data: input.card_data,
        reply_to_id: input.reply_to_id,
        metadata: input.metadata,
      })
      .select(
        `
        *,
        sender:profiles!sender_id(id, full_name),
        reply_to:messages!reply_to_id(*)
      `
      )
      .single()

    if (error) throw new Error(`Error al crear mensaje: ${error.message}`)
    return data as Message
  }

  // ===========================================================================
  // TEMPLATES
  // ===========================================================================

  async findTemplates(
    tenantId: string,
    filters: TemplateFilters = {}
  ): Promise<MessageTemplate[]> {
    let query = this.supabase
      .from('message_templates')
      .select(
        `
        *,
        variables:json
      `
      )
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('name', { ascending: true, nullsFirst: false })

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.channel) {
      query = query.eq('channels', filters.channel)
    }

    if (filters.is_active) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters.search) {
      const safePattern = createSearchPattern(filters.search)
      query = query.ilike('name', safePattern)
    }

    const { data, error } = await query

    if (error) throw new Error(`Error al cargar plantillas: ${error.message}`)
    return (data || []) as MessageTemplate[]
  }

  async findTemplateById(
    templateId: string,
    tenantId: string
  ): Promise<MessageTemplate | null> {
    const { data, error } = await this.supabase
      .from('message_templates')
      .select(
        `
        *,
        variables:json
      `
      )
      .eq('id', templateId)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error al cargar plantilla: ${error.message}`)
    }

    return data as MessageTemplate
  }

  async createMessageTemplate(tenantId: string, input: CreateMessageTemplateInput): Promise<MessageTemplate> {
    const { data, error } = await this.supabase
      .from('message_templates')
      .insert({
        tenant_id: tenantId,
        code: input.code,
        name: input.name,
        category: input.category,
        subject: input.subject,
        content: input.content,
        content_html: input.content_html,
        variables: input.variables,
        channels: input.channels,
        sms_approved: input.sms_approved,
        whatsapp_template_id: input.whatsapp_template_id,
        language: input.language,
        is_active: input.is_active,
      })
      .select(
        `
        *,
        variables:json
      `
      )
      .single()

    if (error) throw new Error(`Error al crear plantilla: ${error.message}`)
    return data as MessageTemplate
  }

  async updateMessageTemplate(
    templateId: string,
    tenantId: string,
    input: UpdateMessageTemplateInput
  ): Promise<MessageTemplate> {
    const { data, error } = await this.supabase
      .from('message_templates')
      .update({
        name: input.name,
        subject: input.subject,
        content: input.content,
        content_html: input.content_html,
        variables: input.variables,
        channels: input.channels,
        sms_approved: input.sms_approved,
        whatsapp_template_id: input.whatsapp_template_id,
        language: input.language,
        is_active: input.is_active,
      })
      .eq('id', templateId)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .select(
        `
        *,
        variables:json
      `
      )
      .single()

    if (error) throw new Error(`Error al actualizar plantilla: ${error.message}`)
    return data as MessageTemplate
  }
}