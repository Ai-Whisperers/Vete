import type { SupabaseClient } from '@supabase/supabase-js'
import { DischargePlanningRepository } from './repository'
import type {
  DischargePlan,
  CreateDischargePlanData,
  UpdateDischargePlanData,
} from './types'

export class DischargePlanningService {
  private repository: DischargePlanningRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new DischargePlanningRepository(supabase)
  }

  async createDischargePlan(
    data: CreateDischargePlanData,
    tenantId: string
  ): Promise<DischargePlan> {
    return this.repository.createDischargePlan(data, tenantId)
  }

  async updateDischargePlan(
    id: string,
    data: UpdateDischargePlanData,
    tenantId: string
  ): Promise<DischargePlan> {
    return this.repository.updateDischargePlan(id, data, tenantId)
  }

  async getDischargePlan(
    hospitalizationId: string,
    tenantId: string
  ): Promise<DischargePlan | null> {
    return this.repository.getDischargePlan(hospitalizationId, tenantId)
  }
}