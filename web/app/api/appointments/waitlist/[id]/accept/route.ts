import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/appointments/waitlist/[id]/accept - Owner accepts offered slot
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

    // Fetch waitlist entry
    const { data: entry } = await supabase
      .from('appointment_waitlists')
      .select('*, service:services!service_id (duration_minutes)')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!entry) {
      return NextResponse.json({ error: 'Entrada no encontrada' }, { status: 404 })
    }

    // Verify ownership for owners
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

    // Must be in offered status
    if (entry.status !== 'offered') {
      return NextResponse.json(
        { error: 'Esta oferta ya no está disponible' },
        { status: 400 }
      )
    }

    // Check if offer expired
    if (entry.offer_expires_at && new Date(entry.offer_expires_at) < new Date()) {
      // Update to expired
      await supabase
        .from('appointment_waitlists')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', id)

      return NextResponse.json(
        { error: 'La oferta ha expirado' },
        { status: 400 }
      )
    }

    // Get the offered appointment details
    const { data: offeredAppointment } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', entry.offered_appointment_id)
      .single()

    if (!offeredAppointment) {
      return NextResponse.json(
        { error: 'La cita ofrecida ya no está disponible' },
        { status: 400 }
      )
    }

    // Create a new appointment for this pet/client at the same time
    const { data: newAppointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        tenant_id: profile.tenant_id,
        pet_id: entry.pet_id,
        service_id: entry.service_id,
        vet_id: entry.preferred_vet_id || offeredAppointment.vet_id,
        start_time: offeredAppointment.start_time,
        end_time: offeredAppointment.end_time,
        status: 'scheduled',
        notes: entry.notes || `Reservado desde lista de espera`,
        created_by: user.id,
      })
      .select()
      .single()

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError)
      return NextResponse.json(
        { error: 'Error al crear la cita' },
        { status: 500 }
      )
    }

    // Update waitlist entry to booked
    await supabase
      .from('appointment_waitlists')
      .update({
        status: 'booked',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    // TODO: Send confirmation notification
    // await sendNotification(user, 'appointment_confirmed', { appointment: newAppointment })

    return NextResponse.json({
      message: 'Cita confirmada exitosamente',
      appointment: newAppointment,
    })
  } catch (error) {
    console.error('Waitlist accept error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
