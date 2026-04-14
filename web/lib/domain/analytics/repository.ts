import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  RevenueAnalytics,
  AppointmentAnalytics,
  PatientMetrics,
  ExportReport,
} from './types'

export class AnalyticsRepository {
  constructor(private supabase: SupabaseClient) {}

  async getRevenueAnalytics(tenantId: string): Promise<RevenueAnalytics[]> {
    const { data, error } = await this.supabase
      .from('revenue_analytics')
      .select('*')
      .eq('tenant_id', tenantId)

    if (error) {
      throw error
    }

    return data
  }

  async getAppointmentAnalytics(tenantId: string): Promise<AppointmentAnalytics[]> {
    const { data, error } = await this.supabase
      .from('appointment_analytics')
      .select('*')
      .eq('tenant_id', tenantId)

    if (error) {
      throw error
    }

    return data
  }

  async getPatientMetrics(tenantId: string): Promise<PatientMetrics> {
    const { data, error } = await this.supabase
      .from('patient_metrics')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async exportReport(tenantId: string, reportType: string): Promise<ExportReport> {
    const { data, error } = await this.supabase
      .from('export_reports')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('report_type', reportType)
      .single()

    if (error) {
      throw error
    }

    return data
  }
}