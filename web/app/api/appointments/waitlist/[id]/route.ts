import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/appointments/waitlist/[id] - Get single waitlist entry
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

    // Fetch waitlist entry
    const { data: entry, error } = await supabase
      .from('appointment_waitlists')
      .select(
        `
        *,
        pet:pets!pet_id (id, name, species, breed, photo_url),
        service:services!service_id (id, name, duration_minutes, base_price),
        preferred_vet:profiles!preferred_vet_id (id, full_name),
        offered_appointment:appointments!offered_appointment_id (id, start_time, end_time)
      `
      )
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (error || !entry) {
      return NextResponse.json({ error: 'Entrada no encontrada' }, { status: 404 })
    }

    // Check ownership for owners
    if (profile.role === 'owner') {
      const { data: pet } = await supabase
        .from('pets')
        .select('owner_id')
        .eq('id', entry.pet_id)
        .single()

      if (pet?.owner_id !== user.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Waitlist GET error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE /api/appointments/waitlist/[id] - Leave waitlist
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

    // Fetch entry first to verify ownership
    const { data: entry } = await supabase
      .from('appointment_waitlists')
      .select('id, pet_id, status')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!entry) {
      return NextResponse.json({ error: 'Entrada no encontrada' }, { status: 404 })
    }

    // Check ownership for owners
    if (profile.role === 'owner') {
      const { data: pet } = await supabase
        .from('pets')
        .select('owner_id')
        .eq('id', entry.pet_id)
        .single()

      if (pet?.owner_id !== user.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }
    }

    // Can only cancel if waiting or offered
    if (!['waiting', 'offered'].includes(entry.status)) {
      return NextResponse.json(
        { error: 'No se puede cancelar esta entrada' },
        { status: 400 }
      )
    }

    // Update to cancelled
    const { error: updateError } = await supabase
      .from('appointment_waitlists')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      console.error('Error cancelling waitlist entry:', updateError)
      return NextResponse.json({ error: 'Error al cancelar' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Has salido de la lista de espera' })
  } catch (error) {
    console.error('Waitlist DELETE error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
