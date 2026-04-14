import { NextApiRequest, NextApiResponse } from 'next'
import { AnalyticsService } from '@/lib/domain/analytics/service'

const analyticsService = new AnalyticsService(createSupabaseClient())

export async function GET(request: NextApiRequest, response: NextApiResponse) {
  const tenantId = request.query.tenantId as string

  try {
    const revenueAnalytics = await analyticsService.getRevenueAnalytics(tenantId)
    const appointmentAnalytics = await analyticsService.getAppointmentAnalytics(tenantId)
    const patientMetrics = await analyticsService.getPatientMetrics(tenantId)

    response.status(200).json({
      revenueAnalytics,
      appointmentAnalytics,
      patientMetrics,
    })
  } catch (error) {
    response.status(500).json({ error: 'Failed to fetch analytics data' })
  }
}