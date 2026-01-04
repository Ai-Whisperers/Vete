import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/appointments/waitlist/[id]/decline - Owner declines offered slot
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
      .select('*')
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
        { error: 'No hay oferta pendiente para rechazar' },
        { status: 400 }
      )
    }

    // Update to expired (declined) and find next person
    const { error: updateError } = await supabase
      .from('appointment_waitlists')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error declining offer:', updateError)
      return NextResponse.json({ error: 'Error al rechazar' }, { status: 500 })
    }

    // Find next person in queue for same date/service
    const { data: nextEntry } = await supabase
      .from('appointment_waitlists')
      .select('id')
      .eq('tenant_id', profile.tenant_id)
      .eq('preferred_date', entry.preferred_date)
      .eq('service_id', entry.service_id)
      .eq('status', 'waiting')
      .order('position', { ascending: true })
      .limit(1)
      .single()

    if (nextEntry) {
      // Offer to next person
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 2)

      await supabase
        .from('appointment_waitlists')
        .update({
          status: 'offered',
          offered_appointment_id: entry.offered_appointment_id,
          offered_at: new Date().toISOString(),
          offer_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', nextEntry.id)

      // TODO: Notify next person
    }

    return NextResponse.json({
      message: 'Oferta rechazada. Se notificará al siguiente en la lista.',
      next_in_queue: !!nextEntry,
    })
  } catch (error) {
    console.error('Waitlist decline error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
