import { useServer } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { DrugInteractionService } from '@/lib/domain/verticals/clinic/drug-interactions/service'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const service = new DrugInteractionService(supabase)

  const interactions = await service.findMany({}, 'your-tenant-id')

  return new Response(JSON.stringify(interactions), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const service = new DrugInteractionService(supabase)

  const data = await request.json()

  const interaction = await service.create(data, 'your-tenant-id')

  return new Response(JSON.stringify(interaction), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 201,
  })
}