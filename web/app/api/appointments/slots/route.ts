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

    // Build query for existing appointments
    let query = supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('tenant_id', clinicSlug)
      .gte('start_time', `${date}T00:00:00`)
      .lt('start_time', `${date}T23:59:59`)
      .not('status', 'in', '("cancelled","no_show")')

    if (vetId) {
      query = query.eq('vet_id', vetId)
    }

    const { data: existingAppointments, error } = await query

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json(
        { error: 'Error al obtener citas' },
        { status: 500 }
      )
    }

    // Extract booked time ranges
    const bookedRanges = existingAppointments?.map(apt => ({
      start: new Date(apt.start_time).toTimeString().substring(0, 5),
      end: new Date(apt.end_time).toTimeString().substring(0, 5)
    })) || []

    // Generate all possible slots
    const slots: TimeSlot[] = []
    let currentMinutes = timeToMinutes(workingHours.start)
    const endMinutes = timeToMinutes(workingHours.end)
    const breakStartMinutes = timeToMinutes(workingHours.breakStart)
    const breakEndMinutes = timeToMinutes(workingHours.breakEnd)

    while (currentMinutes + slotDuration <= endMinutes) {
      const currentTime = minutesToTime(currentMinutes)
      const slotEndMinutes = currentMinutes + slotDuration

      // Skip if slot overlaps with break
      const overlapsBreak =
        (currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes) ||
        (slotEndMinutes > breakStartMinutes && slotEndMinutes <= breakEndMinutes) ||
        (currentMinutes < breakStartMinutes && slotEndMinutes > breakEndMinutes)

      if (!overlapsBreak) {
        // Check if slot overlaps with any existing appointment
        const slotEndTime = minutesToTime(slotEndMinutes)
        const isBooked = bookedRanges.some(range => {
          const rangeStart = timeToMinutes(range.start)
          const rangeEnd = timeToMinutes(range.end)
          return (
            (currentMinutes >= rangeStart && currentMinutes < rangeEnd) ||
            (slotEndMinutes > rangeStart && slotEndMinutes <= rangeEnd) ||
            (currentMinutes <= rangeStart && slotEndMinutes >= rangeEnd)
          )
        })

        slots.push({
          time: currentTime,
          available: !isBooked
        })
      }

      currentMinutes += slotDuration
    }

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

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}
