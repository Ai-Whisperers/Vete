import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const pauseSchema = z.object({
  paused_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

// POST /api/appointments/recurrences/[id]/pause - Pause recurrence
export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Parse body
    const body = await request.json()
    const validation = pauseSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Fecha inválida', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    // Verify recurrence exists
    const { data: recurrence } = await supabase
      .from('appointment_recurrences')
      .select('*, pet:pets!pet_id (owner_id)')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!recurrence) {
      return NextResponse.json({ error: 'Recurrencia no encontrada' }, { status: 404 })
    }

    // Check ownership for owners
    if (profile.role === 'owner' && recurrence.pet.owner_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Update paused_until
    const { data: updated, error: updateError } = await supabase
      .from('appointment_recurrences')
      .update({
        paused_until: validation.data.paused_until,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error pausing recurrence:', updateError)
      return NextResponse.json({ error: 'Error al pausar' }, { status: 500 })
    }

    // Cancel scheduled appointments until pause date
    const { data: cancelled } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('recurrence_id', id)
      .eq('status', 'scheduled')
      .gte('start_time', new Date().toISOString())
      .lt('start_time', validation.data.paused_until + 'T23:59:59')
      .select('id')

    return NextResponse.json({
      message: `Recurrencia pausada hasta ${validation.data.paused_until}`,
      recurrence: updated,
      appointments_cancelled: cancelled?.length || 0,
    })
  } catch (error) {
    console.error('Pause error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE /api/appointments/recurrences/[id]/pause - Resume (unpause) recurrence
export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Verify recurrence exists
    const { data: recurrence } = await supabase
      .from('appointment_recurrences')
      .select('*, pet:pets!pet_id (owner_id)')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!recurrence) {
      return NextResponse.json({ error: 'Recurrencia no encontrada' }, { status: 404 })
    }

    // Check ownership for owners
    if (profile.role === 'owner' && recurrence.pet.owner_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Clear paused_until
    const { data: updated, error: updateError } = await supabase
      .from('appointment_recurrences')
      .update({
        paused_until: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error resuming recurrence:', updateError)
      return NextResponse.json({ error: 'Error al reanudar' }, { status: 500 })
    }

    // Generate upcoming appointments
    await supabase.rpc('generate_recurring_appointments', { p_days_ahead: 30 })

    return NextResponse.json({
      message: 'Recurrencia reanudada',
      recurrence: updated,
    })
  } catch (error) {
    console.error('Resume error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
