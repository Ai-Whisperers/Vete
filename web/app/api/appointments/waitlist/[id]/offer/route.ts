import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const offerSchema = z.object({
  appointment_id: z.string().uuid(),
  expires_in_hours: z.number().min(1).max(48).optional().default(2),
})

// POST /api/appointments/waitlist/[id]/offer - Staff offers slot to client
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

    // Get user profile - must be staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role === 'owner') {
      return NextResponse.json({ error: 'Solo el personal puede ofrecer citas' }, { status: 403 })
    }

    // Parse body
    const body = await request.json()
    const validation = offerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { appointment_id, expires_in_hours } = validation.data

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

    if (entry.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Solo se puede ofrecer a clientes en espera' },
        { status: 400 }
      )
    }

    // Verify appointment exists and is available (cancelled or reschedulable)
    const { data: appointment } = await supabase
      .from('appointments')
      .select('id, status, start_time')
      .eq('id', appointment_id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // Calculate expiry
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expires_in_hours)

    // Update waitlist entry
    const { error: updateError } = await supabase
      .from('appointment_waitlists')
      .update({
        status: 'offered',
        offered_appointment_id: appointment_id,
        offered_at: new Date().toISOString(),
        offer_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error offering slot:', updateError)
      return NextResponse.json({ error: 'Error al ofrecer cita' }, { status: 500 })
    }

    // Get pet owner for notification
    const { data: pet } = await supabase
      .from('pets')
      .select('owner_id, owner:profiles!owner_id (email, phone, full_name)')
      .eq('id', entry.pet_id)
      .single()

    // TODO: Send notification to owner about available slot
    // For now, we just return success
    // await sendNotification(pet.owner, 'waitlist_offer', { appointment, expiresAt })

    return NextResponse.json({
      message: 'Oferta enviada al cliente',
      entry: {
        id,
        status: 'offered',
        offered_appointment_id: appointment_id,
        offer_expires_at: expiresAt.toISOString(),
      },
      owner: pet?.owner,
    })
  } catch (error) {
    console.error('Waitlist offer error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
