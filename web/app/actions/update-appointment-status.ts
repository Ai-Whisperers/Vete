'use server'

import { withActionAuth, actionError, actionSuccess } from '@/lib/actions'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending_scheduling: ['scheduled', 'cancelled'],
  scheduled: ['confirmed', 'cancelled', 'no_show', 'rescheduled'],
  confirmed: ['in_progress', 'cancelled', 'no_show', 'rescheduled'],
  in_progress: ['completed', 'cancelled'],
  waiting: ['in_progress', 'cancelled'],
  completed: [],
  cancelled: ['scheduled'],
  no_show: ['scheduled'],
  rescheduled: ['scheduled', 'cancelled'],
}

/**
 * @deprecated Use specific status transition functions from appointments.ts instead:
 * - startAppointment, completeAppointment, markNoShow, cancelAppointment
 * This file will be removed in a future version.
 */
export const updateAppointmentStatus = withActionAuth(
  async ({ supabase, profile }, appointmentId: string, newStatus: string, clinic: string) => {
    if (clinic !== profile.tenant_id) {
      logger.warn('Tenant mismatch in appointment update', {
        userId: profile.id,
        requestedClinic: clinic,
        actualTenant: profile.tenant_id,
      })
      return actionError('Acceso denegado')
    }

    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('status')
      .eq('id', appointmentId)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (fetchError || !appointment) {
      logger.error('Failed to fetch appointment for status check', {
        error: fetchError,
        appointmentId,
        tenant: clinic,
      })
      return actionError('Cita no encontrada')
    }

    const currentStatus = appointment.status
    const allowed = VALID_TRANSITIONS[currentStatus]

    if (!allowed || !allowed.includes(newStatus)) {
      logger.warn('Invalid appointment status transition', {
        appointmentId,
        currentStatus,
        newStatus,
        tenant: clinic,
      })
      return actionError(`Transición de estado no válida: ${currentStatus} → ${newStatus}`)
    }

    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId)
      .eq('tenant_id', profile.tenant_id)

    if (error) {
      logger.error('Failed to update appointment status', {
        error,
        appointmentId,
        newStatus,
        tenant: clinic,
      })
      return actionError('Error al actualizar el estado de la cita')
    }

    revalidatePath(`/${clinic}/dashboard`)
    return actionSuccess()
  },
  { requireStaff: true }
)
