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
  async findById(id: string): Promise<Appointment | null> {
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
      .single()

    if (error || !data) return null

    return this.transformAppointment(data)
  }

  /**
   * Find appointments with filters
   */
  async findMany(filters: AppointmentFilters = {}): Promise<Appointment[]> {
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
    const { data: appointment, error } = await this.supabase
      .from('appointments')
      .insert({
        ...data,
        tenant_id,
        created_by,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    const result = await this.findById(appointment.id)
    if (!result) throw new Error('Failed to create appointment')

    return result
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

    const result = await this.findById(appointment.id)
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
    const { data, error } = await this.supabase.rpc('check_appointment_overlap', {
      p_tenant_id: params.tenant_id,
      p_date: params.date,
      p_start_time: params.work_start || '08:00',
      p_end_time: params.work_end || '18:00',
      p_vet_id: params.vet_id || null,
    })

    if (error) throw error

    return !data // If no overlap, slot is available
  }

  /**
   * Get appointment statistics
   */
  async getStats(tenant_id: string): Promise<AppointmentStats> {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    // Get all appointments for stats
    const { data: appointments, error } = await this.supabase
      .from('appointments')
      .select('status, start_time')
      .eq('tenant_id', tenant_id)
      .gte('start_time', `${today}T00:00:00`)

    if (error) throw error

    const stats: AppointmentStats = {
      total: appointments.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
      today_count: 0,
      this_week_count: 0,
    }

    appointments.forEach((apt) => {
      // Count by status
      switch (apt.status) {
        case 'pending':
          stats.pending++
          break
        case 'confirmed':
          stats.confirmed++
          break
        case 'completed':
          stats.completed++
          break
        case 'cancelled':
          stats.cancelled++
          break
        case 'no_show':
          stats.no_show++
          break
      }

      // Count today's appointments
      if (apt.start_time.startsWith(today)) {
        stats.today_count++
      }

      // Count this week's appointments
      if (apt.start_time.split('T')[0] <= weekFromNow) {
        stats.this_week_count++
      }
    })

    return stats
  }

  /**
   * Transform raw database result to domain object
   */
  private transformAppointment(data: Record<string, unknown>): Appointment {
    return {
      id: data.id,
      tenant_id: data.tenant_id,
      pet_id: data.pet_id,
      vet_id: data.vet_id,
      start_time: new Date(data.start_time),
      end_time: new Date(data.end_time),
      status: data.status,
      reason: data.reason,
      notes: data.notes,
      created_by: data.created_by,
      updated_by: data.updated_by,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      pet: data.pets
        ? {
            id: data.pets.id,
            name: data.pets.name,
            species: data.pets.species,
            breed: data.pets.breed,
            owner_id: data.pets.owner_id,
            owner: data.pets.profiles
              ? {
                  id: data.pets.profiles.id,
                  full_name: data.pets.profiles.full_name,
                  phone: data.pets.profiles.phone,
                  email: data.pets.profiles.email,
                }
              : undefined,
          }
        : undefined,
      vet: data.profiles
        ? {
            id: data.profiles.id,
            full_name: data.profiles.full_name,
          }
        : undefined,
    }
  }
}
