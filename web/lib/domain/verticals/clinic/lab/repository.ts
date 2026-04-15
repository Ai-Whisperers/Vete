import { SupabaseClient } from '@supabase/supabase-js'
import { LabTest, LabOrder, LabResult } from './types'

export class LabRepository {
  constructor(private supabase: SupabaseClient) {}

  async getLabTest(id: string, tenantId: string): Promise<LabTest | null> {
    const { data, error } = await this.supabase
      .from('lab_test_catalog')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) return null

    return data
  }

  async getLabOrders(filters: any = {}, tenantId: string): Promise<LabOrder[]> {
    const { data, error } = await this.supabase
      .from('lab_orders')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('ordered_at', { ascending: false })

    if (error) throw error

    return data || []
  }

  async getLabResults(filters: any = {}, tenantId: string): Promise<LabResult[]> {
    const { data, error } = await this.supabase
      .from('lab_results')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('entered_at', { ascending: false })

    if (error) throw error

    return data || []
  }
}