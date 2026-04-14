import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  GroomingAppointment,
  CreateGroomingAppointmentData,
  UpdateGroomingAppointmentData,
  GroomingAppointmentFilters,
  GroomingService,
  Groomer,
} from './types';

export class GroomingAppointmentRepository {
  constructor(private supabase: SupabaseClient) {}

  async createGroomingAppointment(
    data: CreateGroomingAppointmentData,
    userId: string,
    tenantId: string,
  ): Promise<GroomingAppointment> {
    const { data: appointmentData, error } = await this.supabase
      .from('grooming_appointments')
      .insert([data])
      .eq('tenant_id', tenantId)
      .select();

    if (error || !appointmentData) {
      throw error;
    }

    return appointmentData[0];
  }

  async updateGroomingAppointment(
    id: string,
    data: UpdateGroomingAppointmentData,
    userId: string,
    tenantId: string,
  ): Promise<GroomingAppointment> {
    const { data: appointmentData, error } = await this.supabase
      .from('grooming_appointments')
      .update([data])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select();

    if (error || !appointmentData) {
      throw error;
    }

    return appointmentData[0];
  }

  async getGroomingAppointments(
    filters: GroomingAppointmentFilters = {},
    tenantId: string,
  ): Promise<GroomingAppointment[]> {
    const query = this.supabase
      .from('grooming_appointments')
      .select(
        `
        *,
        pets (
          id,
          name,
          species,
          photo_url,
          owner:profiles!pets_owner_id_fkey (
            id,
            full_name,
            phone
          )
        ),
        grooming_services (
          id,
          name,
          description,
          duration,
          price
        ),
        groomers (
          id,
          name,
          phone_number
        )
      `,
      )
      .eq('tenant_id', tenantId);

    if (filters.petId) {
      query = query.eq('pet_id', filters.petId);
    }

    if (filters.groomingServiceId) {
      query = query.eq('grooming_service_id', filters.groomingServiceId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error || !data) {
      throw error;
    }

    return data;
  }

  async getGroomingServices(tenantId: string): Promise<GroomingService[]> {
    const { data, error } = await this.supabase
      .from('grooming_services')
      .select('id, name, description, duration, price')
      .eq('tenant_id', tenantId);

    if (error || !data) {
      throw error;
    }

    return data;
  }

  async getGroomers(tenantId: string): Promise<Groomer[]> {
    const { data, error } = await this.supabase
      .from('groomers')
      .select('id, name, phone_number')
      .eq('tenant_id', tenantId);

    if (error || !data) {
      throw error;
    }

    return data;
  }
}

#### Service