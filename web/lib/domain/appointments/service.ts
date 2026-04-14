import { createClient } from '@/lib/supabase/server'
import { AppointmentRepository } from './repository'
import { Appointment, CreateAppointmentData, UpdateAppointmentData, AppointmentFilters } from './types'

export class AppointmentService {
  private repository: AppointmentRepository

  constructor(supabase: any) {
    this.repository = new AppointmentRepository(supabase)
  }

  async getAppointments(filters: AppointmentFilters = {}, tenantId: string): Promise<Appointment[]> {
    return this.repository.findMany(filters, tenantId)
  }

  async getAppointment(id: string, tenantId: string): Promise<Appointment | null> {
    return this.repository.findById(id, tenantId)
  }

  async createAppointment(data: CreateAppointmentData, userId: string, tenantId: string): Promise<Appointment> {
    return this.repository.create(data, userId, tenantId)
  }

  async updateAppointment(id: string, data: UpdateAppointmentData, userId: string, tenantId: string): Promise<Appointment> {
    return this.repository.update(id, data, userId, tenantId)
  }
}