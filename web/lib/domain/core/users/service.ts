import type { SupabaseClient } from '@supabase/supabase-js'
import { UserRepository } from './repository'
import { DeleteUserData, DeletionRequest, DeletionStatus } from './types'

export class UserService {
  private repository: UserRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new UserRepository(supabase)
  }

  async requestDeletion(data: DeleteUserData): Promise<DeletionRequest> {
    return this.repository.requestDeletion(data)
  }

  async confirmDeletion(id: string, tenantId: string): Promise<DeletionRequest> {
    return this.repository.confirmDeletion(id, tenantId)
  }

  async cancelDeletion(id: string, tenantId: string): Promise<void> {
    return this.repository.cancelDeletion(id, tenantId)
  }

  async completeDeletion(id: string, tenantId: string): Promise<void> {
    return this.repository.completeDeletion(id, tenantId)
  }
}

### Server Actions