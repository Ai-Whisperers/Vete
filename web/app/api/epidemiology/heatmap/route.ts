import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/epidemiology/heatmap
 * Get disease outbreak heatmap data from materialized view
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const species = searchParams.get('species')
  const tenant = searchParams.get('tenant')

  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Query the materialized view
    let query = supabase.from('mv_disease_heatmap').select('*')

    if (species && species !== 'all') {
      query = query.eq('species', species)
    }

    if (tenant) {
      query = query.eq('tenant_id', tenant)
    }

    const { data, error } = await query.order('week', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (e) {
    console.error('Error fetching heatmap:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
