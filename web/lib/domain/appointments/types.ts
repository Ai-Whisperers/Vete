import { z } from 'zod'

export enum AppointmentStatus {
  Scheduled = 'scheduled',
  Confirmed = 'confirmed',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
  NoShow = 'no_show',
}

export const AppointmentStatusSchema = z.enum(AppointmentStatus)

export interface Appointment {
  id: string
  tenant_id: string
  pet_id: string
  vet_id: string
  start_time: Date
  end_time: Date
  status: AppointmentStatus
  reason: string
  notes: string
  created_at: Date
  updated_at: Date
}

export const AppointmentSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  pet_id: z.string(),
  vet_id: z.string(),
  start_time: z.date(),
  end_time: z.date(),
  status: AppointmentStatusSchema,
  reason: z.string(),
  notes: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
})

export interface CreateAppointmentData {
  pet_id: string
  vet_id: string
  start_time: Date
  end_time: Date
  reason: string
  notes: string
}

export const CreateAppointmentDataSchema = z.object({
  pet_id: z.string(),
  vet_id: z.string(),
  start_time: z.date(),
  end_time: z.date(),
  reason: z.string(),
  notes: z.string(),
})

export interface UpdateAppointmentData {
  start_time?: Date
  end_time?: Date
  reason?: string
  notes?: string
  status?: AppointmentStatus
}

export const UpdateAppointmentDataSchema = z.object({
  start_time: z.date().optional(),
  end_time: z.date().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  status: AppointmentStatusSchema.optional(),
})

export interface AppointmentFilters {
  status?: AppointmentStatus
  start_time?: Date
  end_time?: Date
  pet_id?: string
  vet_id?: string
}

export const AppointmentFiltersSchema = z.object({
  status: AppointmentStatusSchema.optional(),
  start_time: z.date().optional(),
  end_time: z.date().optional(),
  pet_id: z.string().optional(),
  vet_id: z.string().optional(),
})