import type { SupabaseClient } from '@supabase/supabase-js'
import { DeletionRequest, DeleteUserData } from './types'

export class UserRepository {
  constructor(private supabase: SupabaseClient) {}

  async requestDeletion(data: DeleteUserData): Promise<DeletionRequest> {
    const { data: deletionRequest, error } = await this.supabase
      .from('deletion_requests')
      .insert([{
        user_id: data.userId,
        tenant_id: data.tenantId,
        requested_at: new Date(),
      }])
      .select('id, user_id, tenant_id, requested_at, confirmed_at, grace_period_expires_at')
      .single()

    if (error || !deletionRequest) {
      throw new Error('Failed to create deletion request')
    }

    return deletionRequest
  }

  async confirmDeletion(id: string, tenantId: string): Promise<DeletionRequest> {
    const { data: deletionRequest, error } = await this.supabase
      .from('deletion_requests')
      .update({
        id,
        confirmed_at: new Date(),
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('id, user_id, tenant_id, requested_at, confirmed_at, grace_period_expires_at')
      .single()

    if (error || !deletionRequest) {
      throw new Error('Failed to confirm deletion')
    }

    return deletionRequest
  }

  async cancelDeletion(id: string, tenantId: string): Promise<void> {
    const { error } = await this.supabase
      .from('deletion_requests')
      .update({
        confirmed_at: null,
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)

    if (error) {
      throw new Error('Failed to cancel deletion')
    }
  }

  async completeDeletion(id: string, tenantId: string): Promise<void> {
    // Cascade deletion of associated data
    await this.supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)

    await this.supabase
      .from('deletion_requests')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)
  }
}

#### Service