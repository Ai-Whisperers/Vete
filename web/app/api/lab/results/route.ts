import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/client'
import { LabService } from '@/lib/domain/verticals/clinic/lab/service'

const labService = new LabService(createClient())

export async function GET(request: NextApiRequest, response: NextApiResponse) {
  const { id } = request.query
  const tenantId = request.cookies['tenantId']

  if (!id || !tenantId) {
    return response.status(400).json({ error: 'Invalid request' })
  }

  const labTest = await labService.getLabTest(id as string, tenantId)

  if (!labTest) {
    return response.status(404).json({ error: 'Lab test not found' })
  }

  const labOrders = await labService.getLabOrders({ testId: id }, tenantId)
  const labResults = await labService.getLabResults({ testId: id }, tenantId)

  return response.json({ labTest, labOrders, labResults })
}
Note: The above files are generated based on the provided specification. You may need to adjust them according to your project's specific requirements. Additionally, you might need to create more files or modify existing ones to fully implement the feature.