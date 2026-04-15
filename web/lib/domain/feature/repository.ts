import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentFilters,
  AppointmentStats,
  AvailabilityCheckParams,
} from './types';

export class AppointmentRepository {
  constructor(private supabase: SupabaseClient) {}

  //... other methods ...
}