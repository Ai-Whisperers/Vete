import type { SupabaseClient } from '@supabase/supabase-js'
import type { Appointment, CreateAppointmentData, UpdateAppointmentData, AppointmentFilters } from './types'

export class AppointmentRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Find appointments by filters with pagination
   */
  async findMany(filters: AppointmentFilters = {}, tenantId: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*, pet_id, vet_id, start_time, end_time, status, reason, notes, created_at, updated_at, deleted_at')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)

    if (error) {
      throw error
    }

    return data
  }

  /**
   * Get appointment by ID
   */
  async findById(id: string, tenantId: string): Promise<Appointment | null> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*, pet_id, vet_id, start_time, end_time, status, reason, notes, created_at, updated_at, deleted_at')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single()

    if (error || !data) return null

    return data
  }

  /**
   * Create new appointment
   */
  async create(data: CreateAppointmentData, userId: string, tenantId: string): Promise<Appointment> {
    const { data: appointment, error } = await this.supabase
      .from('appointments')
      .insert([data])
      .eq('tenant_id', tenantId)
      .select('*, pet_id, vet_id, start_time, end_time, status, reason, notes, created_at, updated_at, deleted_at')

    if (error) {
      throw error
    }

    return appointment[0]
  }

  /**
   * Update existing appointment
   */
  async update(id: string, data: UpdateAppointmentData, userId: string, tenantId: string): Promise<Appointment> {
    const { data: appointment, error } = await this.supabase
      .from('appointments')
      .update([data])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*, pet_id, vet_id, start_time, end_time, status, reason, notes, created_at, updated_at, deleted_at')

    if (error) {
      throw error
    }

    return appointment[0]
  }
}