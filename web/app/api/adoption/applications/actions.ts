import { useServer } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { AdoptionService } from '@/lib/domain/adoption/service'
import { CreateAdoptionApplicationData } from '@/lib/domain/adoption/types'

export async function POST({ request }) {
  const supabase = createClient()
  const service = new AdoptionService(supabase)

  const data: CreateAdoptionApplicationData = await request.json()

  try {
    const result = await service.createApplication(data, 'system', 'tenant-id')
    return new Response(JSON.stringify(result), { status: 201 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create application' }), { status: 500 })
  }
}

### Components