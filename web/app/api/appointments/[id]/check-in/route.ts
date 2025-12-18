import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/appointments/[id]/check-in
 * Marks an appointment as checked in (patient has arrived)
 * Staff only - requires vet/admin role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    )
  }

  // 2. Get appointment
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('id, tenant_id, status, start_time')
    .eq('id', id)
    .single()

  if (fetchError || !appointment) {
    return NextResponse.json(
      { error: 'Cita no encontrada' },
      { status: 404 }
    )
  }

  // 3. Check staff permission
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  const isStaff = profile &&
    ['vet', 'admin'].includes(profile.role) &&
    profile.tenant_id === appointment.tenant_id

  if (!isStaff) {
    return NextResponse.json(
      { error: 'Solo el personal puede registrar llegadas' },
      { status: 403 }
    )
  }

  // 4. Validate appointment status
  if (!['pending', 'confirmed'].includes(appointment.status)) {
    return NextResponse.json(
      { error: `No se puede registrar llegada para una cita con estado: ${appointment.status}` },
      { status: 400 }
    )
  }

  // 5. Update appointment status
  const { error: updateError } = await supabase
    .from('appointments')
    .update({
      status: 'checked_in',
      checked_in_at: new Date().toISOString(),
      checked_in_by: user.id
    })
    .eq('id', id)

  if (updateError) {
    console.error('Check-in error:', updateError)
    return NextResponse.json(
      { error: 'Error al registrar llegada' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Llegada registrada correctamente'
  })
}
