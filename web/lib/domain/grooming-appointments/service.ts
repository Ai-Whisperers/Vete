import type { SupabaseClient } from '@supabase/supabase-js';
import { GroomingAppointmentRepository } from './repository';
import type {
  GroomingAppointment,
  CreateGroomingAppointmentData,
  UpdateGroomingAppointmentData,
  GroomingAppointmentFilters,
} from './types';

export class GroomingAppointmentService {
  private repository: GroomingAppointmentRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new GroomingAppointmentRepository(supabase);
  }

  async createGroomingAppointment(
    data: CreateGroomingAppointmentData,
    userId: string,
    tenantId: string,
  ): Promise<GroomingAppointment> {
    return this.repository.createGroomingAppointment(data, userId, tenantId);
  }

  async updateGroomingAppointment(
    id: string,
    data: UpdateGroomingAppointmentData,
    userId: string,
    tenantId: string,
  ): Promise<GroomingAppointment> {
    return this.repository.updateGroomingAppointment(id, data, userId, tenantId);
  }

  async getGroomingAppointments(
    filters: GroomingAppointmentFilters = {},
    tenantId: string,
  ): Promise<GroomingAppointment[]> {
    return this.repository.getGroomingAppointments(filters, tenantId);
  }
}

### Server Actions