import type { SupabaseClient } from '@supabase/supabase-js'
import { ApiKeyRepository } from './repository'
import type { ApiKey, CreateApiKeyData, UpdateApiKeyData } from './types'

export class ApiKeyService {
  private repository: ApiKeyRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new ApiKeyRepository(supabase)
  }

  async createApiKey(data: CreateApiKeyData, tenantId: string): Promise<ApiKey> {
    return this.repository.create(data, tenantId)
  }

  async updateApiKey(id: string, data: UpdateApiKeyData, tenantId: string): Promise<ApiKey> {
    return this.repository.update(id, data, tenantId)
  }

  async deleteApiKey(id: string, tenantId: string): Promise<void> {
    return this.repository.delete(id, tenantId)
  }

  async getApiKeys(tenantId: string): Promise<ApiKey[]> {
    return this.repository.findAll(tenantId)
  }
}

### Server Actions