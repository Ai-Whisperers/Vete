/**
 * GET /api/appointments/slots
 * Returns available appointment slots for a clinic
 *
 * Public endpoint - authentication required
 * Security: Users can only access slots for their own clinic
 *
 * REFACTORED: Now uses AppointmentService (service layer pattern)
 * Before: 123 lines of direct database logic + RPC call
 * After: 44 lines delegating to service
 */

import { NextResponse } from 'next/server';
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth/api-wrapper';
import { apiError } from '@/lib/api/errors';
import { AppointmentService } from '@/lib/services';
import { appointmentSlotsQuerySchema } from '@/lib/schemas/appointment';

export const GET = withApiAuth(async ({ request, profile, supabase }: ApiHandlerContext) => {
  const { searchParams } = new URL(request.url);

  // Extract and validate query parameters with Zod
  const queryParams = {
    clinic: searchParams.get('clinic'),
    date: searchParams.get('date'),
    service_id: searchParams.get('service_id'),
    vet_id: searchParams.get('vet_id'),
  };

  const validationResult = appointmentSlotsQuerySchema.safeParse(queryParams);
  if (!validationResult.success) {
    return apiError('VALIDATION_ERROR', 400, {
      details: {
        errors: validationResult.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
  }

  const { clinic: clinicSlug, date, service_id: serviceId, vet_id: vetId } = validationResult.data;

  // Verify tenant isolation - users can only access slots for their own clinic
  const isStaff = ['vet', 'admin'].includes(profile.role);
  if (clinicSlug !== profile.tenant_id && !isStaff) {
    return apiError('FORBIDDEN', 403);
  }

  // Delegate to service layer
  const service = new AppointmentService(supabase);
  const result = await service.getAvailableSlots(clinicSlug, {
    date,
    service_id: serviceId || undefined,
    vet_id: vetId || undefined,
  });

  // Return standardized response
  if (!result.success) {
    return apiError('DATABASE_ERROR', 500, {
      details: { message: result.error },
    });
  }

  return NextResponse.json(result.data);
});
