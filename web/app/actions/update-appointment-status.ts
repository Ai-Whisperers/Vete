'use server'

import { withActionAuth, actionError, actionSuccess } from '@/lib/actions'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

/**
 * REF-005: Migrated to withActionAuth
 * Note: This is a simpler version that doesn't enforce state transitions.
 * For full state machine validation, use updateAppointmentStatus from update-appointment.ts
 */
export const updateAppointmentStatus = withActionAuth(
  async ({ supabase }, appointmentId: string, newStatus: string, clinic: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId)

    if (error) {
      logger.error('Failed to update appointment status', {
        error,
        appointmentId,
        newStatus,
        tenant: clinic,
      })
      return actionError('Failed to update appointment status')
    }

    revalidatePath(`/${clinic}/dashboard`)
    return actionSuccess()
  },
  { requireStaff: true }
)
