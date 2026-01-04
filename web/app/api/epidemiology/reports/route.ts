import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/epidemiology/reports
 * Get disease reports (staff only)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const species = searchParams.get('species')
  const severity = searchParams.get('severity')
  const days = parseInt(searchParams.get('days') || '30')

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Staff check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo personal puede ver reportes' }, { status: 403 })
  }

  try {
    let query = supabase
      .from('disease_reports')
      .select(
        `
        id, species, age_months, is_vaccinated, location_zone,
        reported_date, severity, created_at,
        diagnosis:diagnosis_codes(id, code, term)
      `
      )
      .eq('tenant_id', profile.tenant_id)
      .gte(
        'reported_date',
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      )
      .order('reported_date', { ascending: false })

    if (species && species !== 'all') {
      query = query.eq('species', species)
    }

    if (severity && severity !== 'all') {
      query = query.eq('severity', severity)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data: data || [] })
  } catch (e) {
    console.error('Error fetching disease reports:', e)
    return NextResponse.json({ error: 'Error al cargar reportes' }, { status: 500 })
  }
}

/**
 * POST /api/epidemiology/reports
 * Create a new disease report (staff only)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Staff check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo personal puede crear reportes' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      diagnosis_code_id,
      species,
      age_months,
      is_vaccinated,
      location_zone,
      severity,
      reported_date,
    } = body

    if (!species || !severity) {
      return NextResponse.json({ error: 'Especie y severidad son requeridos' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('disease_reports')
      .insert({
        tenant_id: profile.tenant_id,
        diagnosis_code_id: diagnosis_code_id || null,
        species,
        age_months: age_months || null,
        is_vaccinated: is_vaccinated ?? null,
        location_zone: location_zone || null,
        severity,
        reported_date: reported_date || new Date().toISOString().split('T')[0],
      })
      .select(
        `
        id, species, age_months, is_vaccinated, location_zone,
        reported_date, severity, created_at,
        diagnosis:diagnosis_codes(id, code, term)
      `
      )
      .single()

    if (error) throw error

    // Check for outbreak threshold
    await checkOutbreakAlert(supabase, profile.tenant_id, species, location_zone)

    return NextResponse.json({ data }, { status: 201 })
  } catch (e) {
    console.error('Error creating disease report:', e)
    return NextResponse.json({ error: 'Error al crear reporte' }, { status: 500 })
  }
}

/**
 * Check if we've hit an outbreak threshold and create alert
 */
async function checkOutbreakAlert(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
  species: string,
  locationZone: string | null
): Promise<void> {
  const OUTBREAK_THRESHOLD = 5 // Cases in 7 days
  const ALERT_COOLDOWN_HOURS = 24

  // Count cases in last 7 days for this species/location
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  let query = supabase
    .from('disease_reports')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('species', species)
    .gte('reported_date', weekAgo)

  if (locationZone) {
    query = query.eq('location_zone', locationZone)
  }

  const { count } = await query

  if (count && count >= OUTBREAK_THRESHOLD) {
    // Check if we already sent an alert recently
    const cooldownTime = new Date(Date.now() - ALERT_COOLDOWN_HOURS * 60 * 60 * 1000).toISOString()

    const { data: recentAlert } = await supabase
      .from('notifications')
      .select('id')
      .eq('type', 'outbreak_alert')
      .gte('created_at', cooldownTime)
      .limit(1)
      .maybeSingle()

    if (!recentAlert) {
      // Get all staff for this tenant
      const { data: staff } = await supabase
        .from('profiles')
        .select('id')
        .eq('tenant_id', tenantId)
        .in('role', ['vet', 'admin'])

      if (staff && staff.length > 0) {
        const notifications = staff.map((s) => ({
          user_id: s.id,
          title: '⚠️ Alerta de Brote',
          message: `Se han reportado ${count} casos de ${species} ${locationZone ? `en ${locationZone}` : ''} en los últimos 7 días.`,
          type: 'outbreak_alert',
          data: { species, location_zone: locationZone, case_count: count },
        }))

        await supabase.from('notifications').insert(notifications)
      }
    }
  }
}
