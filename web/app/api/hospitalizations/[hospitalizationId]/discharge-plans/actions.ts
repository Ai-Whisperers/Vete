import { NextRequest } from 'next/server'
import { DischargePlanningService } from '@/lib/domain/verticals/clinic/hospitalizations/service'
import { createClient } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { searchParams }: { searchParams: { [key: string]: string } }
) {
  const hospitalizationId = searchParams.hospitalizationId
  const tenantId = searchParams.tenantId

  const supabase = createClient()
  const service = new DischargePlanningService(supabase)

  const dischargePlan = await service.getDischargePlan(
    hospitalizationId,
    tenantId
  )

  return new Response(JSON.stringify(dischargePlan), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function POST(
  request: NextRequest,
  { searchParams }: { searchParams: { [key: string]: string } }
) {
  const hospitalizationId = searchParams.hospitalizationId
  const tenantId = searchParams.tenantId
  const data = await request.json()

  const supabase = createClient()
  const service = new DischargePlanningService(supabase)

  const dischargePlan = await service.createDischargePlan(data, tenantId)

  return new Response(JSON.stringify(dischargePlan), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function PATCH(
  request: NextRequest,
  { searchParams }: { searchParams: { [key: string]: string } }
) {
  const hospitalizationId = searchParams.hospitalizationId
  const tenantId = searchParams.tenantId
  const data = await request.json()

  const supabase = createClient()
  const service = new DischargePlanningService(supabase)

  const dischargePlan = await service.updateDischargePlan(
    hospitalizationId,
    data,
    tenantId
  )

  return new Response(JSON.stringify(dischargePlan), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}