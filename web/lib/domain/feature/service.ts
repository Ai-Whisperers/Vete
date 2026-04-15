import { createClient } from '@/lib/supabase/client';
import { AppointmentRepository } from './repository';
import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentFilters,
  AppointmentStats,
  AppointmentStatus,
  AvailabilityCheckParams,
  StatusTransition,
} from './types';

export class AppointmentService {
  private repository: AppointmentRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new AppointmentRepository(supabase);
  }

  //... other methods ...
}