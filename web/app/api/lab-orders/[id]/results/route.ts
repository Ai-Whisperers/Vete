import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient()
  const { id: orderId } = await params

  // Authentication check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Get user profile - only vets/admins can enter results
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
  }

  if (!['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json(
      { error: 'Solo veterinarios pueden ingresar resultados' },
      { status: 403 }
    )
  }

  // Parse body
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { results, specimen_quality, specimen_issues } = body

  if (!results || !Array.isArray(results)) {
    return NextResponse.json({ error: 'results es requerido y debe ser un array' }, { status: 400 })
  }

  // Verify order belongs to staff's clinic
  const { data: order } = await supabase
    .from('lab_orders')
    .select('id, pets!inner(tenant_id)')
    .eq('id', orderId)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
  }

  const pet = Array.isArray(order.pets) ? order.pets[0] : order.pets
  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta orden' }, { status: 403 })
  }

  // Insert or update results
  let hasCriticalValues = false
  const resultPromises = results.map(
    async (result: {
      order_item_id: string
      value_numeric?: number | null
      value_text?: string | null
      flag?: string
    }) => {
      if (result.flag === 'critical_low' || result.flag === 'critical_high') {
        hasCriticalValues = true
      }

      // Check if result already exists
      const { data: existing } = await supabase
        .from('lab_results')
        .select('id')
        .eq('order_item_id', result.order_item_id)
        .single()

      if (existing) {
        // Update existing result
        return supabase
          .from('lab_results')
          .update({
            value_numeric: result.value_numeric,
            value_text: result.value_text,
            flag: result.flag || 'normal',
            result_date: new Date().toISOString(),
            entered_by: user.id,
          })
          .eq('id', existing.id)
      } else {
        // Insert new result
        return supabase.from('lab_results').insert({
          order_item_id: result.order_item_id,
          value_numeric: result.value_numeric,
          value_text: result.value_text,
          flag: result.flag || 'normal',
          result_date: new Date().toISOString(),
          entered_by: user.id,
        })
      }
    }
  )

  try {
    await Promise.all(resultPromises)
  } catch (error) {
    console.error('[API] lab_results POST error:', error)
    return NextResponse.json({ error: 'Error al guardar resultados' }, { status: 500 })
  }

  // Update order with specimen quality and critical values flag
  const { error: updateError } = await supabase
    .from('lab_orders')
    .update({
      specimen_quality: specimen_quality || 'acceptable',
      specimen_issues: specimen_issues || null,
      has_critical_values: hasCriticalValues,
      status: 'in_progress', // Move to in_progress when results are entered
    })
    .eq('id', orderId)

  if (updateError) {
    console.error('[API] lab_orders update error:', updateError)
  }

  return NextResponse.json({ success: true, has_critical_values: hasCriticalValues })
}
