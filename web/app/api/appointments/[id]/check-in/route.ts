import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth'
import { apiError, apiSuccess, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

type Params = { id: string }

/**
 * POST /api/appointments/[id]/check-in
 * Marks an appointment as checked in (patient has arrived)
 * Staff only - requires vet/admin role
 */
export const POST = withApiAuthParams<Params>(
  async ({ params, user, profile, supabase }: ApiHandlerContextWithParams<Params>) => {
    const { id } = params

    // 1. Get appointment (tenant-isolated)
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, tenant_id, status')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (fetchError || !appointment) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
    }

    // 2. Validate appointment status
    if (appointment.status !== 'confirmed' && appointment.status !== 'scheduled') {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { reason: `No se puede registrar llegada para una cita con estado: ${appointment.status}` },
      })
    }

    // 3. Update appointment status to checked_in
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
        checked_in_by: user.id,
      })
      .eq('id', id)

    if (updateError) {
      logger.error('Check-in appointment error', {
        tenantId: profile.tenant_id,
        userId: user.id,
        appointmentId: id,
        error: updateError instanceof Error ? updateError.message : String(updateError),
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return apiSuccess({ id }, 'Llegada registrada correctamente')
  },
  { roles: ['vet', 'admin'], rateLimit: 'write' }
)
