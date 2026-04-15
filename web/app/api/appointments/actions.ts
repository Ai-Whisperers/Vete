import { useServer } from 'next/server'
import { AppointmentService } from '../../../lib/domain/appointments/service'
import { createClient } from '../../../lib/supabase/server'

export async function GET({ params, tenantId }: { params: { appointmentId: string }, tenantId: string }) {
  const supabase = createClient()
  const appointmentService = new AppointmentService(supabase)

  const appointment = await appointmentService.getAppointment(params.appointmentId, tenantId)

  return new Response(JSON.stringify(appointment), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export async function POST({ params, tenantId, request }: { params: { appointmentId: string }, tenantId: string, request: Request }) {
  const supabase = createClient()
  const appointmentService = new AppointmentService(supabase)

  const data = await request.json()
  const appointment = await appointmentService.updateAppointment(params.appointmentId, data, tenantId)

  return new Response(JSON.stringify(appointment), { status: 200, headers: { 'Content-Type': 'application/json' } })
}