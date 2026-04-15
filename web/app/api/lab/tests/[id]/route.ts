// New file for lab test catalog API route
import { LabService } from '@/lib/domain/verticals/clinic/lab/service'
import { createServerClient } from '@supabase/ssr'
import { env } from '@/lib/env'

export async function GET(request: Request) {
  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })

  const labService = new LabService(supabase)
  const id = request.nextUrl.pathname.split('/').pop()

  const labTest = await labService.getLabTestById(id)

  if (!labTest) {
    return new Response('Lab test not found', {
      status: 404,
    })
  }

  return new Response(JSON.stringify(labTest), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}