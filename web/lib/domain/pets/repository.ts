/**
 * Pet repository
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Pet, CreatePetData, UpdatePetData, PetFilters, PetStats } from './types'

export class PetRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Pet | null> {
    const { data, error } = await this.supabase
      .from('pets')
      .select(`
        *,
        profiles!pets_owner_id_fkey (
          id,
          full_name,
          phone,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (error || !data) return null
    return this.transformPet(data)
  }

  async findMany(filters: PetFilters = {}): Promise<Pet[]> {
    let query = this.supabase
      .from('pets')
      .select(`
        *,
        profiles!pets_owner_id_fkey (
          id,
          full_name,
          phone,
          email
        )
      `)

    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }
    if (filters.species?.length) {
      query = query.in('species', filters.species)
    }
    if (filters.breed) {
      query = query.ilike('breed', `%${filters.breed}%`)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    query = query.order('name', { ascending: true })

    const { data, error } = await query
    if (error) throw error

    return data.map(this.transformPet)
  }

  async create(data: CreatePetData, ownerId: string, tenantId: string): Promise<Pet> {
    const { data: pet, error } = await this.supabase
      .from('pets')
      .insert({
        ...data,
        owner_id: ownerId,
        tenant_id: tenantId,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    const result = await this.findById(pet.id)
    if (!result) throw new Error('Failed to create pet')

    return result
  }

  async update(id: string, data: UpdatePetData): Promise<Pet> {
    const { data: pet, error } = await this.supabase
      .from('pets')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    const result = await this.findById(pet.id)
    if (!result) throw new Error('Failed to update pet')

    return result
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('pets')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async getStats(tenantId: string): Promise<PetStats> {
    const { data: pets, error } = await this.supabase
      .from('pets')
      .select('species, is_active')
      .eq('tenant_id', tenantId)

    if (error) throw error

    const stats: PetStats = {
      total: pets.length,
      by_species: { dog: 0, cat: 0, bird: 0, rabbit: 0, other: 0 },
      active: 0,
      inactive: 0
    }

    pets.forEach(pet => {
      stats.by_species[pet.species]++
      if (pet.is_active) {
        stats.active++
      } else {
        stats.inactive++
      }
    })

    return stats
  }

  private transformPet(data: any): Pet {
    return {
      id: data.id,
      tenant_id: data.tenant_id,
      owner_id: data.owner_id,
      name: data.name,
      species: data.species,
      breed: data.breed,
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
      gender: data.gender,
      color: data.color,
      weight_kg: data.weight_kg,
      microchip_number: data.microchip_number,
      photo_url: data.photo_url,
      notes: data.notes,
      is_active: data.is_active,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      owner: data.profiles ? {
        id: data.profiles.id,
        full_name: data.profiles.full_name,
        phone: data.profiles.phone,
        email: data.profiles.email
      } : undefined
    }
  }
}
