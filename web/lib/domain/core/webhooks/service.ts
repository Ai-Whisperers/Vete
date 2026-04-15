import type { SupabaseClient } from '@supabase/supabase-js'
import { WebhookRepository } from './repository'
import { WebhookEvent, CreateWebhookData, UpdateWebhookData } from './types'

export class WebhookService {
  private repository: WebhookRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new WebhookRepository(supabase)
  }

  async createWebhook(data: CreateWebhookData, tenantId: string): Promise<WebhookEvent> {
    return this.repository.createWebhook(data, tenantId)
  }

  async getWebhook(id: string, tenantId: string): Promise<WebhookEvent | null> {
    return this.repository.getWebhook(id, tenantId)
  }

  async updateWebhook(id: string, data: UpdateWebhookData, tenantId: string): Promise<WebhookEvent> {
    return this.repository.updateWebhook(id, data, tenantId)
  }

  async deleteWebhook(id: string, tenantId: string): Promise<void> {
    return this.repository.deleteWebhook(id, tenantId)
  }
}