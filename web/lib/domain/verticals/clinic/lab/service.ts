import { LabRepository } from './repository'
import { LabTest, LabOrder, LabResult } from './types'

export class LabService {
  private repository: LabRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new LabRepository(supabase)
  }

  async getLabTest(id: string, tenantId: string): Promise<LabTest | null> {
    return this.repository.getLabTest(id, tenantId)
  }

  async getLabOrders(filters: any = {}, tenantId: string): Promise<LabOrder[]> {
    return this.repository.getLabOrders(filters, tenantId)
  }

  async getLabResults(filters: any = {}, tenantId: string): Promise<LabResult[]> {
    return this.repository.getLabResults(filters, tenantId)
  }
}