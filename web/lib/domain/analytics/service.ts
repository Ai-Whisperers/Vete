import type { SupabaseClient } from '@supabase/supabase-js'
import { AnalyticsRepository } from './repository'
import type {
  RevenueAnalytics,
  AppointmentAnalytics,
  PatientMetrics,
  ExportReport,
} from './types'

export class AnalyticsService {
  private repository: AnalyticsRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new AnalyticsRepository(supabase)
  }

  async getRevenueAnalytics(tenantId: string): Promise<RevenueAnalytics[]> {
    return this.repository.getRevenueAnalytics(tenantId)
  }

  async getAppointmentAnalytics(tenantId: string): Promise<AppointmentAnalytics[]> {
    return this.repository.getAppointmentAnalytics(tenantId)
  }

  async getPatientMetrics(tenantId: string): Promise<PatientMetrics> {
    return this.repository.getPatientMetrics(tenantId)
  }

  async exportReport(tenantId: string, reportType: string): Promise<ExportReport> {
    return this.repository.exportReport(tenantId, reportType)
  }
}