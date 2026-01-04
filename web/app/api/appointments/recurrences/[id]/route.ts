import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateRecurrenceSchema = z.object({
  vet_id: z.string().uuid().nullable().optional(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'custom']).optional(),
  interval_value: z.number().min(1).max(12).optional(),
  day_of_week: z.array(z.number().min(0).max(6)).nullable().optional(),
  day_of_month: z.number().min(1).max(31).nullable().optional(),
  preferred_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  max_occurrences: z.number().min(1).nullable().optional(),
  is_active: z.boolean().optional(),
  notes: z.string().max(500).nullable().optional(),
})

// GET /api/appointments/recurrences/[id]
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
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

    // Fetch recurrence with related data
    const { data: recurrence, error } = await supabase
      .from('appointment_recurrences')
      .select(
        `
        *,
        pet:pets!pet_id (id, name, species, breed, photo_url, owner_id),
        service:services!service_id (id, name, duration_minutes, base_price),
        vet:profiles!vet_id (id, full_name)
      `
      )
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (error || !recurrence) {
      return NextResponse.json({ error: 'Recurrencia no encontrada' }, { status: 404 })
    }

    // Check ownership for owners
    if (profile.role === 'owner' && recurrence.pet.owner_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Get generated appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select('id, start_time, end_time, status, recurrence_index')
      .eq('recurrence_id', id)
      .order('start_time', { ascending: true })

    return NextResponse.json({
      recurrence,
      appointments: appointments || [],
    })
  } catch (error) {
    console.error('Recurrence GET error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PUT /api/appointments/recurrences/[id]
export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
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

    // Fetch recurrence
    const { data: existing } = await supabase
      .from('appointment_recurrences')
      .select('*, pet:pets!pet_id (owner_id)')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Recurrencia no encontrada' }, { status: 404 })
    }

    // Check ownership for owners
    if (profile.role === 'owner' && existing.pet.owner_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = updateRecurrenceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    // Update recurrence
    const { data: updated, error: updateError } = await supabase
      .from('appointment_recurrences')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating recurrence:', updateError)
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Recurrencia actualizada',
      recurrence: updated,
    })
  } catch (error) {
    console.error('Recurrence PUT error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE /api/appointments/recurrences/[id]
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

    // Fetch recurrence
    const { data: existing } = await supabase
      .from('appointment_recurrences')
      .select('*, pet:pets!pet_id (owner_id)')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Recurrencia no encontrada' }, { status: 404 })
    }

    // Check ownership for owners
    if (profile.role === 'owner' && existing.pet.owner_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const cancelFuture = searchParams.get('cancel_future') === 'true'

    // Soft delete by setting is_active to false
    await supabase
      .from('appointment_recurrences')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    // Optionally cancel future appointments
    if (cancelFuture) {
      await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('recurrence_id', id)
        .gte('start_time', new Date().toISOString())
        .eq('status', 'scheduled')
    }

    return NextResponse.json({
      message: 'Recurrencia cancelada',
      future_appointments_cancelled: cancelFuture,
    })
  } catch (error) {
    console.error('Recurrence DELETE error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
