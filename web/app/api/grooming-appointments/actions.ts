import { withActionAuth } from '@/lib/auth';
import { actionSuccess, handleActionError } from '@/lib/errors';
import { getDomainFactory } from '@/lib/domain';
import { revalidatePath } from 'next/cache';

export const createGroomingAppointment = withActionAuth(
  async ({ user, profile, supabase }, data: CreateGroomingAppointmentData) => {
    try {
      const domainFactory = getDomainFactory(supabase);
      const appointmentService = domainFactory.createGroomingAppointmentService();

      const appointment = await appointmentService.createGroomingAppointment(
        data,
        user.id,
        profile.tenant_id,
      );

      revalidatePath(`/[clinic]/portal/appointments`);

      return actionSuccess({ appointment }, 'Cita de peluquería creada correctamente');
    } catch (error: unknown) {
      return handleActionError(error, {
        userId: user.id,
        tenantId: profile.tenant_id,
        operation: 'create_grooming_appointment',
      });
    }
  },
);

export const updateGroomingAppointment = withActionAuth(
  async ({ user, profile, supabase }, id: string, data: UpdateGroomingAppointmentData) => {
    try {
      const domainFactory = getDomainFactory(supabase);
      const appointmentService = domainFactory.createGroomingAppointmentService();

      const appointment = await appointmentService.updateGroomingAppointment(
        id,
        data,
        user.id,
        profile.tenant_id,
      );

      revalidatePath(`/[clinic]/portal/appointments`);

      return actionSuccess({ appointment }, 'Cita de peluquería actualizada correctamente');
    } catch (error: unknown) {
      return handleActionError(error, {
        userId: user.id,
        tenantId: profile.tenant_id,
        operation: 'update_grooming_appointment',
      });
    }
  },
);

### Components