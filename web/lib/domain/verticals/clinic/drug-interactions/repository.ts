import type { SupabaseClient } from '@supabase/supabase-js'
import type { DrugInteraction, CreateDrugInteractionData, UpdateDrugInteractionData, DrugInteractionFilters } from './types'

export class DrugInteractionRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(data: CreateDrugInteractionData, tenantId: string): Promise<DrugInteraction> {
    const { data: created, error } = await this.supabase
      .from('drug_interactions')
      .insert({
        ...data,
        tenant_id: tenantId,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return created as DrugInteraction
  }

  async update(id: string, data: UpdateDrugInteractionData, tenantId: string): Promise<DrugInteraction> {
    const { data: updated, error } = await this.supabase
      .from('drug_interactions')
      .update({
        ...data,
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return updated as DrugInteraction
  }

  async findMany(filters: DrugInteractionFilters = {}, tenantId: string): Promise<DrugInteraction[]> {
    const query = this.supabase
      .from('drug_interactions')
      .select()
      .eq('tenant_id', tenantId)

    if (filters.severity) {
      query.eq('severity', filters.severity)
    }

    if (filters.type) {
      query.eq('type', filters.type)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data as DrugInteraction[]
  }

  async findById(id: string, tenantId: string): Promise<DrugInteraction | null> {
    const { data, error } = await this.supabase
      .from('drug_interactions')
      .select()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error) {
      throw error
    }

    return data as DrugInteraction | null
  }
}