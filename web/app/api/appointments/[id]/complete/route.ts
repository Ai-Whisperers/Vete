import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth'
import { apiError, apiSuccess, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

type Params = { id: string }

/**
 * POST /api/appointments/[id]/complete
 * Marks an appointment as completed
 * Staff only - requires vet/admin role
 */
export const POST = withApiAuthParams<Params>(
  async ({ request, params, user, profile, supabase }: ApiHandlerContextWithParams<Params>) => {
    const { id } = params
    // 1. Parse optional body for notes
    let notes: string | undefined
    try {
      const body = await request.json()
      notes = body.notes
    } catch {
      // No body is fine
    }

    // 2. Get appointment (tenant-isolated)
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, tenant_id, status, notes')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (fetchError || !appointment) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
    }

    // 3. Check staff permission
    const isStaff = ['vet', 'admin'].includes(profile.role)
    if (!isStaff) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN, {
        details: { reason: 'Solo el personal puede completar citas' },
      })
    }

    // 4. Validate appointment status
    if (!['checked_in', 'in_progress'].includes(appointment.status)) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { reason: `No se puede completar una cita con estado: ${appointment.status}` },
      })
    }

    // 5. Update appointment status
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

    const { error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      logger.error('Complete appointment error', {
        tenantId: profile.tenant_id,
        userId: user.id,
        appointmentId: id,
        error: updateError instanceof Error ? updateError.message : String(updateError),
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return apiSuccess({ id }, 'Cita completada correctamente')
  },
  { roles: ['vet', 'admin'], rateLimit: 'write' }
)
