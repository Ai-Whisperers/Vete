import type { SupabaseClient } from '@supabase/supabase-js'
import { MessagingRepository } from './repository'
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
  MessagingStats,
} from './types'
import { logger } from '@/lib/logger'

export class MessagingService {
  private repository: MessagingRepository

  constructor(private supabase: SupabaseClient) {
    this.repository = new MessagingRepository(supabase)
  }

  // ===========================================================================
  // CONVERSATIONS
  // ===========================================================================

  async listConversations(
    tenantId: string,
    filters?: ConversationFilters
  ): Promise<Conversation[]> {
    return this.repository.findConversations(tenantId, filters)
  }

  async getConversation(
    conversationId: string,
    tenantId: string
  ): Promise<Conversation | null> {
    return this.repository.findConversationById(conversationId, tenantId)
  }

  async createConversation(
    tenantId: string,
    input: CreateConversationInput
  ): Promise<Conversation> {
    const conversation = await this.repository.createConversation(tenantId, input)

    // Send initial message if provided
    if (input.initial_message) {
      await this.sendMessage(conversation.id, tenantId, {
        sender_type: 'client',
        sender_id: input.client_id,
        content: input.initial_message,
      })
    }

    logger.info('[MessagingService] Conversation created', {
      conversationId: conversation.id,
      clientId: input.client_id,
    })

    return conversation
  }

  async updateConversationStatus(
    conversationId: string,
    tenantId: string,
    status: ConversationStatus
  ): Promise<Conversation> {
    const conversation = await this.repository.updateConversationStatus(
      conversationId,
      tenantId,
      status
    )

    logger.info('[MessagingService] Conversation status updated', {
      conversationId,
      status,
    })

    return conversation
  }

  // ===========================================================================
  // MESSAGES
  // ===========================================================================

  async listMessages(
    conversationId: string,
    tenantId: string,
    filters?: MessageFilters,
    limit: number = 50
  ): Promise<Message[]> {
    return this.repository.findMessages(conversationId, tenantId, filters, limit)
  }

  async sendMessage(
    conversationId: string,
    tenantId: string,
    input: SendMessageInput
  ): Promise<Message> {
    const message = await this.repository.createMessage(conversationId, tenantId, input)

    logger.info('[MessagingService] Message sent', {
      conversationId,
      messageId: message.id,
      senderType: input.sender_type,
    })

    return message
  }

  // ===========================================================================
  // TEMPLATES
  // ===========================================================================

  async listTemplates(
    tenantId: string,
    filters?: TemplateFilters
  ): Promise<MessageTemplate[]> {
    return this.repository.findTemplates(tenantId, filters)
  }

  async getTemplate(
    templateId: string,
    tenantId: string
  ): Promise<MessageTemplate | null> {
    return this.repository.findTemplateById(templateId, tenantId)
  }

  async createMessageTemplate(
    tenantId: string,
    input: CreateMessageTemplateInput
  ): Promise<MessageTemplate> {
    const template = await this.repository.createMessageTemplate(tenantId, input)

    logger.info('[MessagingService] Template created', {
      templateId: template.id,
    })

    return template
  }

  async updateMessageTemplate(
    templateId: string,
    tenantId: string,
    input: UpdateMessageTemplateInput
  ): Promise<MessageTemplate> {
    const template = await this.repository.updateMessageTemplate(templateId, tenantId, input)

    logger.info('[MessagingService] Template updated', {
      templateId,
    })

    return template
  }
}