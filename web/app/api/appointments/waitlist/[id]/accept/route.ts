import { NextResponse } from 'next/server'
import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * POST /api/appointments/waitlist/[id]/accept - Owner accepts offered slot
 */
export const POST = withApiAuthParams(
  async ({ params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const entryId = params.id

    try {
      // Fetch waitlist entry
      const { data: entry } = await supabase
        .from('appointment_waitlists')
        .select('*, service:services!service_id (duration_minutes)')
        .eq('id', entryId)
        .eq('tenant_id', profile.tenant_id)
        .single()

      if (!entry) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
          details: { resource: 'waitlist_entry' },
        })
      }

      // Verify ownership for owners
      if (profile.role === 'owner') {
        const { data: pet } = await supabase
          .from('pets')
          .select('owner_id')
          .eq('id', entry.pet_id)
          .single()

        if (pet?.owner_id !== user.id) {
          return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
        }
      }

      // Must be in offered status
      if (entry.status !== 'offered') {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { message: 'Esta oferta ya no está disponible' },
        })
      }

      // Check if offer expired
      if (entry.offer_expires_at && new Date(entry.offer_expires_at) < new Date()) {
        // Update to expired
        await supabase
          .from('appointment_waitlists')
          .update({ status: 'expired', updated_at: new Date().toISOString() })
          .eq('id', entryId)

        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { message: 'La oferta ha expirado' },
        })
      }

      // Get the offered appointment details
      const { data: offeredAppointment } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', entry.offered_appointment_id)
        .single()

      if (!offeredAppointment) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { message: 'La cita ofrecida ya no está disponible' },
        })
      }

      // Create a new appointment for this pet/client at the same time
      const { data: newAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          tenant_id: profile.tenant_id,
          pet_id: entry.pet_id,
          service_id: entry.service_id,
          vet_id: entry.preferred_vet_id || offeredAppointment.vet_id,
          start_time: offeredAppointment.start_time,
          end_time: offeredAppointment.end_time,
          status: 'scheduled',
          notes: entry.notes || `Reservado desde lista de espera`,
          created_by: user.id,
        })
        .select()
        .single()

      if (appointmentError) {
        logger.error('Error creating appointment from waitlist', {
          tenantId: profile.tenant_id,
          entryId,
          error: appointmentError.message,
        })
        return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }

      // Update waitlist entry to booked
      await supabase
        .from('appointment_waitlists')
        .update({
          status: 'booked',
          updated_at: new Date().toISOString(),
        })
        .eq('id', entryId)

      // TODO: Send confirmation notification

      return NextResponse.json({
        message: 'Cita confirmada exitosamente',
        appointment: newAppointment,
      })
    } catch (error) {
      logger.error('Waitlist accept error', {
        tenantId: profile.tenant_id,
        entryId,
        error: error instanceof Error ? error.message : 'Unknown',
      })
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  }
)
