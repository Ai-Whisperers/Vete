import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface TimeSlot {
  time: string
  available: boolean
}

/**
 * GET /api/appointments/slots
 * Returns available appointment slots for a given date
 * Query params: clinic, date, service_id (optional), vet_id (optional)
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const clinicSlug = searchParams.get('clinic')
  const date = searchParams.get('date')
  const serviceId = searchParams.get('service_id')
  const vetId = searchParams.get('vet_id')

  if (!clinicSlug || !date) {
    return NextResponse.json(
      { error: 'Faltan parámetros requeridos (clinic, date)' },
      { status: 400 }
    )
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(date)) {
    return NextResponse.json(
      { error: 'Formato de fecha inválido. Use YYYY-MM-DD' },
      { status: 400 }
    )
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
      breakEnd: '14:00'
    }

    // Use the database function for more reliable overlap checking
    const { data: slotsData, error } = await supabase
      .rpc('get_available_slots', {
        p_tenant_id: clinicSlug,
        p_date: date,
        p_slot_duration_minutes: slotDuration,
        p_work_start: workingHours.start,
        p_work_end: workingHours.end,
        p_break_start: workingHours.breakStart,
        p_break_end: workingHours.breakEnd,
        p_vet_id: vetId || null
      })

    if (error) {
      console.error('Error fetching available slots:', error)
      return NextResponse.json(
        { error: 'Error al obtener horarios disponibles' },
        { status: 500 }
      )
    }

    // Transform database response to API format
    const slots: TimeSlot[] = slotsData?.map((slot: {
      slot_time: string
      is_available: boolean
    }) => ({
      time: slot.slot_time,
      available: slot.is_available
    })) || []

    return NextResponse.json({
      date,
      clinic: clinicSlug,
      slotDuration,
      slots
    })
  } catch (e) {
    console.error('Error generating slots:', e)
    return NextResponse.json(
      { error: 'Error al generar horarios disponibles' },
      { status: 500 }
    )
  }
}
