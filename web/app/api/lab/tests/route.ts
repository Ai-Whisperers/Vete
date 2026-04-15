// New file for lab test catalog API route
import { LabService } from '@/lib/domain/verticals/clinic/lab/service'
import { createServerClient } from '@supabase/ssr'
import { env } from '@/lib/env'

export async function GET(request: Request) {
  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })

  const labService = new LabService(supabase)
  const tenantId = request.nextUrl.searchParams.get('tenantId')
  const filters: TestFilters = {
    category: request.nextUrl.searchParams.get('category'),
    sample_type: request.nextUrl.searchParams.get('sampleType'),
    is_active: request.nextUrl.searchParams.get('isActive') === 'true',
    search: request.nextUrl.searchParams.get('search'),
  }

  const labTests = await labService.getLabTests(tenantId, filters)

  return new Response(JSON.stringify(labTests), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}