import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/staff/time-off/types
 * Fetches available time off types
 * Query params:
 *   - clinic (optional): tenant_id to get tenant-specific types
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const clinicSlug = searchParams.get('clinic')

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Get global types and tenant-specific types if clinic provided
    let query = supabase
      .from('time_off_types')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (clinicSlug) {
      // Get global (tenant_id IS NULL) and tenant-specific types
      query = query.or(`tenant_id.is.null,tenant_id.eq.${clinicSlug}`)
    } else {
      // Just global types
      query = query.is('tenant_id', null)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching time off types:', error)
      return NextResponse.json(
        { error: 'Error al obtener tipos de ausencia' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: data || []
    })
  } catch (e) {
    console.error('Error in time-off types GET:', e)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
