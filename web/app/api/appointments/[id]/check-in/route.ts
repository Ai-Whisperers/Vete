import { withApiAuthParams } from '@/lib/auth'
import { apiSuccess, handleApiError } from '@/lib/errors'
import { getDomainFactory } from '@/lib/domain'

/**
 * POST /api/appointments/[id]/check-in
 * Marks an appointment as checked in (patient has arrived)
 * Staff only - requires vet/admin role
 */
export const POST = withApiAuthParams(
  async (context, params) => {
    try {
      const { id } = params
      const { profile } = context

      // Get domain service
      const domainFactory = getDomainFactory(context.supabase)
      const appointmentService = domainFactory.createAppointmentService()

      // Check in appointment using domain service
      const appointment = await appointmentService.checkInAppointment(
        id,
        context.user.id,
        profile.tenant_id
      )

      return apiSuccess({ appointment }, 'Llegada registrada correctamente')
    } catch (error) {
      return handleApiError(error, {
        userId: context.user.id,
        tenantId: context.profile.tenant_id,
        operation: 'check_in_appointment',
      })
    }
  },
  {
    roles: ['vet', 'admin'],
    paramName: 'id',
  }
)
