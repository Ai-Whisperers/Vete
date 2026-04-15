import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  DischargePlan,
  CreateDischargePlanData,
  UpdateDischargePlanData,
} from './types'

export class DischargePlanningRepository {
  constructor(private supabase: SupabaseClient) {}

  async createDischargePlan(
    data: CreateDischargePlanData,
    tenantId: string
  ): Promise<DischargePlan> {
    const { data: dischargePlan, error } = await this.supabase
      .from('discharge_plans')
      .insert([data])
      .eq('tenant_id', tenantId)

    if (error || !dischargePlan) {
      throw error
    }

    return dischargePlan[0]
  }

  async updateDischargePlan(
    id: string,
    data: UpdateDischargePlanData,
    tenantId: string
  ): Promise<DischargePlan> {
    const { data: dischargePlan, error } = await this.supabase
      .from('discharge_plans')
      .update([data])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !dischargePlan) {
      throw error
    }

    return dischargePlan
  }

  async getDischargePlan(
    hospitalizationId: string,
    tenantId: string
  ): Promise<DischargePlan | null> {
    const { data, error } = await this.supabase
      .from('discharge_plans')
      .select('*')
      .eq('hospitalization_id', hospitalizationId)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) {
      return null
    }

    return data
  }
}