import type { SupabaseClient } from '@supabase/supabase-js'
import { AdoptionApplication } from './types'

export class AdoptionRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(data: CreateAdoptionApplicationData, userId: string, tenantId: string): Promise<AdoptionApplication> {
    const { data: createdData, error } = await this.supabase
      .from('adoption_applications')
      .insert([data])
      .eq('tenant_id', tenantId)
      .select('*')

    if (error || !createdData) {
      throw error
    }

    return createdData[0]
  }

  async findByPetId(petId: string, tenantId: string): Promise<AdoptionApplication | null> {
    const { data, error } = await this.supabase
      .from('adoption_applications')
      .select('*')
      .eq('pet_id', petId)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) {
      return null
    }

    return data
  }
}

#### Service