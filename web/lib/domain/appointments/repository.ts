/**
 * Appointment repository
 * Handles all database operations for appointments
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentFilters,
  AppointmentStats,
  AvailabilityCheckParams,
} from './types'

export class AppointmentRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get the Supabase client for complex queries in the service layer
   */
  getClient(): SupabaseClient {
    return this.supabase
  }

  /**
   * Find appointment by ID with full relations
   */
  async findById(id: string, tenantId: string): Promise<Appointment | null> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(
        `
        *,
        pets (
          id,
          name,
          species,
          breed,
          owner_id,
          profiles!pets_owner_id_fkey (
            id,
            full_name,
            phone,
            email
          )
        ),
        profiles!appointments_vet_id_fkey (
          id,
          full_name
        )
      `
      )
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) return null

    return this.transformAppointment(data)
  }

  /**
   * Find appointments with filters
   */
  async findMany(filters: AppointmentFilters = {}, tenantId: string): Promise<Appointment[]> {
    let query = this.supabase.from('appointments').select(`
        *,
        pets (
          id,
          name,
          species,
          breed,
          owner_id,
          profiles!pets_owner_id_fkey (
            id,
            full_name,
            phone,
            email
          )
        ),
        profiles!appointments_vet_id_fkey (
          id,
          full_name
        )
      `)

    query = query.eq('tenant_id', tenantId)

    // Apply filters
    if (filters.status?.length) {
      query = query.in('status', filters.status)
    }
    if (filters.vet_id) {
      query = query.eq('vet_id', filters.vet_id)
    }
    if (filters.pet_id) {
      query = query.eq('pet_id', filters.pet_id)
    }
    if (filters.date_from) {
      query = query.gte('start_time', filters.date_from.toISOString())
    }
    if (filters.date_to) {
      query = query.lte('start_time', filters.date_to.toISOString())
    }

    // Order by start time
    query = query.order('start_time', { ascending: false })

    const { data, error } = await query

    if (error) throw error

    return data.map(this.transformAppointment)
  }

  /**
   * Create new appointment
   */
  async create(
    data: CreateAppointmentData,
    created_by: string,
    tenant_id: string
  ): Promise<Appointment> {
    const { data: result, error } = await this.supabase.rpc('create_appointment_atomic', {
      p_tenant_id: tenant_id,
      p_pet_id: data.pet_id,
      p_start_time: data.start_time.toISOString(),
      p_end_time: data.end_time.toISOString(),
      p_reason: data.reason || null,
      p_notes: null,
      p_created_by: created_by,
      p_vet_id: data.vet_id || null,
    })

    if (error) throw error

    const appointmentId = (result as Record<string, unknown>).id as string
    const appointment = await this.findById(appointmentId, tenant_id)
    if (!appointment) throw new Error('Failed to create appointment')

    return appointment
  }

  /**
   * Update appointment
   */
  async update(id: string, data: UpdateAppointmentData, updated_by: string): Promise<Appointment> {
    const { data: appointment, error } = await this.supabase
      .from('appointments')
      .update({
        ...data,
        updated_by,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    const result = await this.findById(appointment.id, appointment.tenant_id as string)
    if (!result) throw new Error('Failed to update appointment')

    return result
  }

  /**
   * Delete appointment
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('appointments').delete().eq('id', id)

    if (error) throw error
  }

  /**
   * Check if appointment slot is available
   */
  async checkSlotAvailability(params: AvailabilityCheckParams): Promise<boolean> {
    const startTime = `${params.date}T${params.work_start || '08:00'}:00`
    const endTime = `${params.date}T${params.work_end || '18:00'}:00`

    const { data, error } = await this.supabase.rpc('is_slot_available', {
      p_tenant_id: params.tenant_id,
      p_start_time: startTime,
      p_end_time: endTime,
      p_vet_id: params.vet_id || null,
    })

    if (error) throw error

    return data as boolean
  }

  /**
   * Get appointment statistics
   */
  async getStats(tenant_id: string): Promise<AppointmentStats> {
    // Use optimized database function instead of fetching all records
    const { data, error } = await this.supabase.rpc('get_appointment_stats_optimized', {
      p_tenant_id: tenant_id
    })

    if (error) throw error

    // The function returns a JSON object with the stats
    return data as AppointmentStats
  }

  /**
   * Transform raw database result to domain object
   */
  private transformAppointment(data: Record<string, unknown>): Appointment {
    const pets = data.pets as Record<string, unknown> | null
    const profiles = data.profiles as Record<string, unknown> | null
    const petProfiles = pets?.profiles as Record<string, unknown> | null

    return {
      id: data.id as string,
      tenant_id: data.tenant_id as string,
      pet_id: data.pet_id as string,
      vet_id: (data.vet_id as string | null) ?? undefined,
      start_time: new Date(data.start_time as string),
      end_time: new Date(data.end_time as string),
      status: data.status as Appointment['status'],
      reason: (data.reason as string | null) ?? undefined,
      notes: (data.notes as string | null) ?? undefined,
      created_by: data.created_by as string,
      updated_by: (data.updated_by as string | null) ?? undefined,
      created_at: new Date(data.created_at as string),
      updated_at: new Date(data.updated_at as string),
      pet: pets
        ? {
            id: pets.id as string,
            name: pets.name as string,
            species: pets.species as string,
            breed: (pets.breed as string | null) ?? undefined,
            owner_id: pets.owner_id as string,
            owner: petProfiles
              ? {
                  id: petProfiles.id as string,
                  full_name: petProfiles.full_name as string,
                  phone: (petProfiles.phone as string | null) ?? undefined,
                  email: (petProfiles.email as string | null) ?? undefined,
                }
              : undefined,
          }
        : undefined,
      vet: profiles
        ? {
            id: profiles.id as string,
            full_name: profiles.full_name as string,
          }
        : undefined,
    }
  }
}
