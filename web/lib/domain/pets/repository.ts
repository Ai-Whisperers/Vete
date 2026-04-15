import type { SupabaseClient } from '@supabase/supabase-js'
import type { Pet, CreatePetData, UpdatePetData, PetFilters } from './types'

export class PetRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Find pets by filters with pagination
   */
  async findMany(filters: PetFilters = {}, tenantId: string): Promise<Pet[]> {
    const { data, error } = await this.supabase
      .from('pets')
      .select('*, owner_id, species, breed, birth_date, weight_kg, microchip_number, photo_url, sex, color, is_neutered, temperament, diet_category, diet_notes, allergies, chronic_conditions, notes, created_at, updated_at, deleted_at')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)

    if (error) {
      throw error
    }

    return data
  }

  /**
   * Get pet by ID
   */
  async findById(id: string, tenantId: string): Promise<Pet | null> {
    const { data, error } = await this.supabase
      .from('pets')
      .select('*, owner_id, species, breed, birth_date, weight_kg, microchip_number, photo_url, sex, color, is_neutered, temperament, diet_category, diet_notes, allergies, chronic_conditions, notes, created_at, updated_at, deleted_at')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single()

    if (error || !data) return null

    return data
  }

  /**
   * Create new pet
   */
  async create(data: CreatePetData, userId: string, tenantId: string): Promise<Pet> {
    const { data: pet, error } = await this.supabase
      .from('pets')
      .insert([data])
      .eq('tenant_id', tenantId)
      .select('*, owner_id, species, breed, birth_date, weight_kg, microchip_number, photo_url, sex, color, is_neutered, temperament, diet_category, diet_notes, allergies, chronic_conditions, notes, created_at, updated_at, deleted_at')

    if (error) {
      throw error
    }

    return pet[0]
  }

  /**
   * Update existing pet
   */
  async update(id: string, data: UpdatePetData, userId: string, tenantId: string): Promise<Pet> {
    const { data: pet, error } = await this.supabase
      .from('pets')
      .update([data])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*, owner_id, species, breed, birth_date, weight_kg, microchip_number, photo_url, sex, color, is_neutered, temperament, diet_category, diet_notes, allergies, chronic_conditions, notes, created_at, updated_at, deleted_at')

    if (error) {
      throw error
    }

    return pet[0]
  }
}