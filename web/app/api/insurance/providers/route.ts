import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

// GET /api/insurance/providers - List insurance providers
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  const { searchParams } = new URL(request.url)
  const activeOnly = searchParams.get('active_only') === 'true'

  try {
    let query = supabase.from('insurance_providers').select('*').order('name', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: providers, error } = await query

    if (error) throw error

    return NextResponse.json({ data: providers })
  } catch (e) {
    console.error('Error loading insurance providers:', e)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
