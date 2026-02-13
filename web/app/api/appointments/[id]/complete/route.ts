/**
 * POST /api/appointments/[id]/complete
 * Marks an appointment as completed
 * Staff only - requires vet/admin role
 *
 * REFACTORED: Now uses AppointmentService (service layer pattern)
 * Before: 83 lines of direct database logic
 * After: 28 lines delegating to service
 */

import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth';
import { apiError, apiSuccess, HTTP_STATUS } from '@/lib/api/errors';
import { AppointmentService } from '@/lib/services';
import { completeAppointmentSchema } from '@/lib/schemas/appointment';

type Params = { id: string };

export const POST = withApiAuthParams<Params>(
  async ({ request, params, user, profile, supabase }: ApiHandlerContextWithParams<Params>) => {
    const { id } = params;

    // 1. Parse and validate optional body for notes
    let notes: string | undefined;
    try {
      const body = await request.json();
      const validation = completeAppointmentSchema.safeParse(body);
      
      if (!validation.success) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: {
            message: 'Datos inválidos',
            errors: validation.error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }
      
      notes = validation.data.notes;
    } catch (_error: unknown) {
      // No body is fine
    }

    // 2. Delegate to service layer
    const service = new AppointmentService(supabase);
    const result = await service.complete(id, profile.tenant_id, user.id, notes);

    // 3. Return standardized response
    if (!result.success) {
      const statusCode = result.code === 'NOT_FOUND' ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.BAD_REQUEST;
      return apiError('VALIDATION_ERROR', statusCode, {
        details: { reason: result.error },
      });
    }

    return apiSuccess({ id: result.data.id }, 'Cita completada correctamente');
  },
  { roles: ['vet', 'admin'], rateLimit: 'write' }
);
