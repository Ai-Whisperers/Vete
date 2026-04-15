// ... existing types

export type ReminderType =
  | 'vaccine_reminder'
  | 'vaccine_overdue'
  | 'appointment_reminder'
  | 'appointment_confirmation'
  | 'appointment_cancelled'
  | 'invoice_sent'
  | 'payment_received'
  | 'payment_overdue'
  | 'birthday'
  | 'follow_up'
  | 'lab_results_ready'
  | 'hospitalization_update'
  | 'custom'
  | 'appointment_reminder' // Added type for appointment reminders

export interface ReminderRule {
  id: string
  tenant_id: string
  name: string
  description: string | null
  type: RuleType
  days_offset: number
  hours_offset: number | null
  time_of_day: string
  channels: NotificationChannel[]
  template_id: string | null
  conditions: Record<string, unknown> | null
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  tenant_id: string
  client_id: string
  pet_id: string | null
  type: ReminderType
  reference_type: string | null
  reference_id: string | null
  scheduled_at: string
  status: ReminderStatus
  attempts: number
  max_attempts: number
  last_attempt_at: string | null
  next_attempt_at: string | null
  error_message: string | null
  custom_subject: string | null
  custom_body: string | null
  created_at: string
  updated_at: string
}

export interface CreateReminderInput {
  client_id: string
  pet_id?: string
  type: ReminderType
  reference_type?: string
  reference_id?: string
  scheduled_at: string
  custom_subject?: string
  custom_body?: string
}

export interface UpdateReminderInput extends Partial<CreateReminderInput> {
  status?: ReminderStatus
}

export interface ReminderFilters {
  client_id?: string
  pet_id?: string
  type?: ReminderType
  status?: ReminderStatus
  from_date?: string
  to_date?: string
  pending_only?: boolean
}

export interface ReminderStats {
  pending_count: number
  sent_today: number
  failed_count: number
  success_rate: number
  by_type: Record<string, number>
}