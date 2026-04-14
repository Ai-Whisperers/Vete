import { useServer } from 'next/server'
import { AppointmentService } from '@/lib/domain/appointments/service'

export async function GET() {
  const appointmentService = new AppointmentService(createClient())

  const appointments = await appointmentService.getAppointments({}, 'tenant-id')

  return new Response(JSON.stringify(appointments), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}