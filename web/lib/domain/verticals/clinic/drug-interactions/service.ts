import type { SupabaseClient } from '@supabase/supabase-js'
import { DrugInteractionRepository } from './repository'
import type {
  DrugInteraction,
  CreateDrugInteractionData,
  UpdateDrugInteractionData,
  DrugInteractionFilters,
} from './types'

export class DrugInteractionService {
  private repository: DrugInteractionRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new DrugInteractionRepository(supabase)
  }

  async create(data: CreateDrugInteractionData, tenantId: string): Promise<DrugInteraction> {
    return this.repository.create(data, tenantId)
  }

  async update(id: string, data: UpdateDrugInteractionData, tenantId: string): Promise<DrugInteraction> {
    return this.repository.update(id, data, tenantId)
  }

  async findMany(filters: DrugInteractionFilters = {}, tenantId: string): Promise<DrugInteraction[]> {
    return this.repository.findMany(filters, tenantId)
  }

  async findById(id: string, tenantId: string): Promise<DrugInteraction | null> {
    return this.repository.findById(id, tenantId)
  }

  async checkInteraction(drug1Id: string, drug2Id: string, tenantId: string): Promise<DrugInteraction | null> {
    const interaction = await this.repository.findMany(
      {
        severity: 'critical',
      },
      tenantId
    )

    const found = interaction.find(
      (i) => (i.drug1_id === drug1Id && i.drug2_id === drug2Id) || (i.drug1_id === drug2Id && i.drug2_id === drug1Id)
    )

    return found || null
  }
}