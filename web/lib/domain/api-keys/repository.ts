import type { SupabaseClient } from '@supabase/supabase-js'
import type { ApiKey, CreateApiKeyData, UpdateApiKeyData } from './types'

export class ApiKeyRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(data: CreateApiKeyData, tenantId: string): Promise<ApiKey> {
    const { data: created, error } = await this.supabase
      .from('api_keys')
      .insert({
        ...data,
        tenant_id: tenantId,
      })
      .select('id, name, scopes, tenant_id, created_at, updated_at')
      .single()

    if (error) {
      throw error
    }

    return created
  }

  async update(id: string, data: UpdateApiKeyData, tenantId: string): Promise<ApiKey> {
    const { data: updated, error } = await this.supabase
      .from('api_keys')
      .update({
        ...data,
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('id, name, scopes, tenant_id, created_at, updated_at')
      .single()

    if (error) {
      throw error
    }

    return updated
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await this.supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)

    if (error) {
      throw error
    }
  }

  async findAll(tenantId: string): Promise<ApiKey[]> {
    const { data, error } = await this.supabase
      .from('api_keys')
      .select('id, name, scopes, tenant_id, created_at, updated_at')
      .eq('tenant_id', tenantId)

    if (error) {
      throw error
    }

    return data
  }
}

#### Service