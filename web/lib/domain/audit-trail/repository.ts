import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuditTrail } from './types'

export class AuditTrailRepository {
  constructor(private supabase: SupabaseClient) {}

  async logEvent(event: Omit<AuditTrail, 'id' | 'created_at'>): Promise<void> {
    const { error } = await this.supabase
      .from('audit_trail')
      .insert([event])

    if (error) {
      throw error
    }
  }
}