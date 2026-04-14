import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuditLog, AuditFilter } from './types'

export class AuditRepository {
  constructor(private supabase: SupabaseClient) {}

  async findMany(filters: AuditFilter = {}, tenantId: string): Promise<AuditLog[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }

  async findById(id: string, tenantId: string): Promise<AuditLog | null> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error) {
      throw error
    }

    return data || null
  }
}