import { createClient } from '@/lib/supabase/server'
import { Appointment, AppointmentFilters } from './types'

export class AppointmentRepository {
  private supabase: any

  constructor(supabase: any) {
    this.supabase = supabase
  }

  async findMany(filters: AppointmentFilters = {}, tenantId: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)

    if (error) {
      throw error
    }

    return data as Appointment[]
  }

  async findById(id: string, tenantId: string): Promise<Appointment | null> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single()

    if (error) {
      throw error
    }

    return data as Appointment | null
  }

  async create(data: any, userId: string, tenantId: string): Promise<Appointment> {
    const { data: createdData, error } = await this.supabase
      .from('appointments')
      .insert([data])
      .eq('tenant_id', tenantId)
      .select('*')

    if (error) {
      throw error
    }

    return createdData[0] as Appointment
  }

  async update(id: string, data: any, userId: string, tenantId: string): Promise<Appointment> {
    const { data: updatedData, error } = await this.supabase
      .from('appointments')
      .update([data])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')

    if (error) {
      throw error
    }

    return updatedData[0] as Appointment
  }
}