import { NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth/api-wrapper'
import { apiError, apiSuccess } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

interface TimeSlot {
  time: string
  available: boolean
}

interface SlotsResponse {
  date: string
  clinic: string
  slotDuration: number
  slots: TimeSlot[]
}

/**
 * Public endpoint - authentication required
 * Returns available appointment slots for a clinic
 *
 * @param clinic - Clinic slug from URL
 * @param date - Date to check slots (YYYY-MM-DD)
 * @param service_id - Optional service filter
 * @param vet_id - Optional vet filter
 *
 * Security: Users can only access slots for their own clinic
 */
export const GET = withApiAuth(async ({ request, profile, supabase }: ApiHandlerContext) => {
  const { searchParams } = new URL(request.url)

  const clinicSlug = searchParams.get('clinic')
  const date = searchParams.get('date')
  const serviceId = searchParams.get('service_id')
  const vetId = searchParams.get('vet_id')

  if (!clinicSlug || !date) {
    return apiError('MISSING_FIELDS', 400, {
      details: { required: ['clinic', 'date'] },
    })
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(date)) {
    return apiError('INVALID_FORMAT', 400, {
      details: { field: 'date', expected: 'YYYY-MM-DD' },
    })
  }

  // Verify tenant isolation - users can only access slots for their own clinic
  const isStaff = ['vet', 'admin'].includes(profile.role)
  if (clinicSlug !== profile.tenant_id && !isStaff) {
    return apiError('FORBIDDEN', 403)
  }

  try {
    // Get service duration if service_id provided
    let slotDuration = 30 // default 30 minutes
    if (serviceId) {
      const { data: service } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', serviceId)
        .single()

      if (service?.duration_minutes) {
        slotDuration = service.duration_minutes
      }
    }

    // Define working hours (could be fetched from tenant config in the future)
    const workingHours = {
      start: '08:00',
      end: '18:00',
      breakStart: '12:00',
      breakEnd: '14:00',
    }

    // Use the database function for more reliable overlap checking
    const { data: slotsData, error } = await supabase.rpc('get_available_slots', {
      p_tenant_id: clinicSlug,
      p_date: date,
      p_slot_duration_minutes: slotDuration,
      p_work_start: workingHours.start,
      p_work_end: workingHours.end,
      p_break_start: workingHours.breakStart,
      p_break_end: workingHours.breakEnd,
      p_vet_id: vetId || null,
    })

    if (error) {
      logger.error('Error fetching available slots', {
        tenantId: clinicSlug,
        date,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', 500)
    }

    // Transform database response to API format
    const slots: TimeSlot[] =
      slotsData?.map((slot: { slot_time: string; is_available: boolean }) => ({
        time: slot.slot_time,
        available: slot.is_available,
      })) || []

    return NextResponse.json<SlotsResponse>({
      date,
      clinic: clinicSlug,
      slotDuration,
      slots,
    })
  } catch (e) {
    logger.error('Error generating slots', {
      tenantId: clinicSlug,
      date,
      error: e instanceof Error ? e.message : 'Unknown',
    })
    return apiError('SERVER_ERROR', 500)
  }
})
