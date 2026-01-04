import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * POST /api/appointments/[id]/complete
 * Marks an appointment as completed
 * Staff only - requires vet/admin role
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // 2. Parse optional body for notes
  let notes: string | undefined
  try {
    const body = await request.json()
    notes = body.notes
  } catch {
    // No body is fine
  }

  // 3. Get appointment
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('id, tenant_id, status, notes')
    .eq('id', id)
    .single()

  if (fetchError || !appointment) {
    return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
  }

  // 4. Check staff permission
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  const isStaff =
    profile &&
    ['vet', 'admin'].includes(profile.role) &&
    profile.tenant_id === appointment.tenant_id

  if (!isStaff) {
    return NextResponse.json({ error: 'Solo el personal puede completar citas' }, { status: 403 })
  }

  // 5. Validate appointment status
  if (!['checked_in', 'in_progress'].includes(appointment.status)) {
    return NextResponse.json(
      { error: `No se puede completar una cita con estado: ${appointment.status}` },
      { status: 400 }
    )
  }

  // 6. Update appointment status
  const updateData: Record<string, unknown> = {
    status: 'completed',
    completed_at: new Date().toISOString(),
    completed_by: user.id,
  }

  if (notes) {
    updateData.notes = appointment.notes
      ? `${appointment.notes}\n[Notas de cierre] ${notes}`
      : `[Notas de cierre] ${notes}`
  }

  const { error: updateError } = await supabase.from('appointments').update(updateData).eq('id', id)

  if (updateError) {
    logger.error('Complete appointment error', {
      tenantId: appointment.tenant_id,
      userId: user.id,
      appointmentId: id,
      error: updateError instanceof Error ? updateError.message : String(updateError),
    })
    return NextResponse.json({ error: 'Error al completar la cita' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Cita completada correctamente',
  })
}
