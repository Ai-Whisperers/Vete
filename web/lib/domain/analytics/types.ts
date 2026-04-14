export interface RevenueAnalytics {
  id: string
  tenant_id: string
  month: string
  revenue: number
  appointments: number
  new_clients: number
  repeat_business: number
}

export interface AppointmentAnalytics {
  id: string
  tenant_id: string
  month: string
  total_appointments: number
  completed_appointments: number
  cancelled_appointments: number
}

export interface PatientMetrics {
  id: string
  tenant_id: string
  total_patients: number
  active_patients: number
  new_patients: number
}

export interface ExportReport {
  id: string
  tenant_id: string
  report_type: string
  data: string
}