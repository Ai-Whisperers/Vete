import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth'
import { apiSuccess, handleApiError } from '@/lib/errors'
import { getDomainFactory } from '@/lib/domain'

/**
 * POST /api/appointments/[id]/check-in
 * Marks an appointment as checked in (patient has arrived)
 * Staff only - requires vet/admin role
 */
export const POST = withApiAuthParams(
  async ({ params, profile, supabase, user }: ApiHandlerContextWithParams<{ id: string }>) => {
    try {
      const { id } = params

      // Get domain service
      const domainFactory = getDomainFactory(supabase)
      const appointmentService = domainFactory.createAppointmentService()

      // Check in appointment using domain service
      const appointment = await appointmentService.checkInAppointment(
        id,
        user.id,
        profile.tenant_id
      )

      return apiSuccess({ appointment }, 'Llegada registrada correctamente')
    } catch (error) {
      return handleApiError(error, {
        userId: user.id,
        tenantId: profile.tenant_id,
        operation: 'check_in_appointment',
      })
    }
  },
  {
    roles: ['vet', 'admin'],
    paramName: 'id',
  }
)
