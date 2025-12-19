import { NextResponse } from 'next/server'
import { withAuth, type AuthContext, type RouteContext } from '@/lib/api/with-auth'

/**
 * POST /api/appointments/[id]/check-in
 * Marks an appointment as checked in (patient has arrived)
 * Staff only - requires vet/admin role
 */
export const POST = withAuth<{ id: string }>(
  async ({ user, profile, supabase }: AuthContext, context: RouteContext<{ id: string }>) => {
  const { id } = await context.params

  // Get appointment
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

  // Check staff permission
  if (profile.tenant_id !== appointment.tenant_id) {
    return NextResponse.json(
      { error: 'Solo el personal puede registrar llegadas' },
      { status: 403 }
    )
  }

  // Validate appointment status
  if (!['pending', 'confirmed'].includes(appointment.status)) {
    return NextResponse.json(
      { error: `No se puede registrar llegada para una cita con estado: ${appointment.status}` },
      { status: 400 }
    )
  }

  // Update appointment status
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
}, { roles: ['vet', 'admin'] })
