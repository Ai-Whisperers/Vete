import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { HealthTimelineService } from '@/lib/domain/health-timeline/service'

export async function GET(request: Request) {
  const supabase = createClient()
  const service = new HealthTimelineService(supabase)

  const petId = request.nextUrl.searchParams.get('petId')
  const filter: any = {}

  if (!petId) {
    return NextResponse.json({ error: 'Pet ID is required' }, { status: 400 })
  }

  try {
    const events = await service.getHealthTimeline(petId, filter, 'tenant-id')
    return NextResponse.json(events, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve health timeline' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createClient()
  const service = new HealthTimelineService(supabase)

  const { event } = await request.json()

  try {
    const createdEvent = await service.createHealthTimelineEvent(event, 'user-id', 'tenant-id')
    return NextResponse.json(createdEvent, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create health timeline event' }, { status: 500 })
  }
}

Note: This implementation assumes that you have already set up the necessary tables in your Supabase database. You will need to create the `health_timeline` table with the required columns (`id`, `pet_id`, `event_type`, `event_date`, `description`, `tenant_id`) for this code to work. Additionally, you should replace the hardcoded `tenant-id` and `user-id` values with the actual values from your application.