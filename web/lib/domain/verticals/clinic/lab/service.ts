// New file for lab test catalog service
import { LabRepository } from './repository'
import type { LabTest, TestFilters } from './types'

export class LabService {
  private repository: LabRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new LabRepository(supabase)
  }

  async getLabTests(tenantId: string, filters: TestFilters = {}): Promise<LabTest[]> {
    return this.repository.findManyTests(tenantId, filters)
  }

  async getLabTestById(id: string): Promise<LabTest | null> {
    return this.repository.findTestById(id)
  }

  async getLabTestCategories(tenantId: string): Promise<string[]> {
    return this.repository.getTestCategories(tenantId)
  }
}