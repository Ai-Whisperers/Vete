import { createClient } from '@/lib/supabase/client'
import { Pet, CreatePetData, UpdatePetData } from './types'

export class PetRepository {
  private supabase: any

  constructor(supabase: any) {
    this.supabase = supabase
  }

  async findMany(tenantId: string): Promise<Pet[]> {
    const { data, error } = await this.supabase
      .from('pets')
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)

    if (error) {
      throw error
    }

    return data
  }

  async findById(id: string, tenantId: string): Promise<Pet | null> {
    const { data, error } = await this.supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async create(data: CreatePetData, userId: string, tenantId: string): Promise<Pet> {
    const { data: createdPet, error } = await this.supabase
      .from('pets')
      .insert([data])
      .eq('tenant_id', tenantId)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return createdPet
  }

  async update(id: string, data: UpdatePetData, userId: string, tenantId: string): Promise<Pet> {
    const { data: updatedPet, error } = await this.supabase
      .from('pets')
      .update([data])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return updatedPet
  }
}