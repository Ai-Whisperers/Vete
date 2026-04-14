import { NextApiRequest, NextApiResponse } from 'next'
import { AnalyticsService } from '@/lib/domain/analytics/service'

const analyticsService = new AnalyticsService(createSupabaseClient())

export async function GET(request: NextApiRequest, response: NextApiResponse) {
  const tenantId = request.query.tenantId as string
  const reportType = request.query.reportType as string

  try {
    const exportReport = await analyticsService.exportReport(tenantId, reportType)

    response.status(200).json(exportReport)
  } catch (error) {
    response.status(500).json({ error: 'Failed to generate export report' })
  }
}

Note: The `createSupabaseClient` function is assumed to be defined elsewhere in the codebase, and is used to create a Supabase client instance.