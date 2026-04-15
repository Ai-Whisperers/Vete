import { supabase } from '@/lib/supabase/client'
import { Sighting, CreateSightingData, UpdateSightingData, SightingFilters } from './types'

export class SightingRepository {
  async create(data: CreateSightingData, userId: string, tenantId: string): Promise<Sighting> {
    const { data: created, error } = await supabase
      .from('sightings')
      .insert([data])
      .eq('tenant_id', tenantId)
      .select('id, pet_id, type, location, timestamp, status, description, created_at, updated_at')

    if (error || !created) {
      throw new Error('Failed to create sighting')
    }

    return created[0]
  }

  async update(id: string, data: UpdateSightingData, userId: string, tenantId: string): Promise<Sighting> {
    const { data: updated, error } = await supabase
      .from('sightings')
      .update([data])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('id, pet_id, type, location, timestamp, status, description, created_at, updated_at')

    if (error || !updated) {
      throw new Error('Failed to update sighting')
    }

    return updated[0]
  }

  async findMany(filters: SightingFilters = {}, tenantId: string): Promise<Sighting[]> {
    const query = supabase
      .from('sightings')
      .select('id, pet_id, type, location, timestamp, status, description, created_at, updated_at')
      .eq('tenant_id', tenantId)

    if (filters.pet_id) {
      query.eq('pet_id', filters.pet_id)
    }

    if (filters.status) {
      query.eq('status', filters.status)
    }

    if (filters.start_time) {
      query.gte('timestamp', filters.start_time)
    }

    if (filters.end_time) {
      query.lte('timestamp', filters.end_time)
    }

    const { data, error } = await query

    if (error) {
      throw new Error('Failed to fetch sightings')
    }

    return data || []
  }
}