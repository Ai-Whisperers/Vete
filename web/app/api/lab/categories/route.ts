// New file for lab test categories API route
import { LabService } from '@/lib/domain/verticals/clinic/lab/service'
import { createServerClient } from '@supabase/ssr'
import { env } from '@/lib/env'

export async function GET(request: Request) {
  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })

  const labService = new LabService(supabase)
  const tenantId = request.nextUrl.searchParams.get('tenantId')

  const categories = await labService.getLabTestCategories(tenantId)

  return new Response(JSON.stringify(categories), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}