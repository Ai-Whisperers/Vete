import type { SupabaseClient } from '@supabase/supabase-js'
import { WebhookEvent } from './types'

export class WebhookRepository {
  constructor(private supabase: SupabaseClient) {}

  async createWebhook(data: CreateWebhookData, tenantId: string): Promise<WebhookEvent> {
    const { data: webhook, error } = await this.supabase
      .from('webhooks')
      .insert([data])
      .eq('tenant_id', tenantId)
      .single()

    if (error || !webhook) {
      throw error
    }

    return webhook
  }

  async getWebhook(id: string, tenantId: string): Promise<WebhookEvent | null> {
    const { data, error } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) {
      return null
    }

    return data
  }

  async updateWebhook(id: string, data: UpdateWebhookData, tenantId: string): Promise<WebhookEvent> {
    const { data: webhook, error } = await this.supabase
      .from('webhooks')
      .update([data])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !webhook) {
      throw error
    }

    return webhook
  }

  async deleteWebhook(id: string, tenantId: string): Promise<void> {
    const { error } = await this.supabase
      .from('webhooks')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error) {
      throw error
    }
  }
}