'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// TICKET-TYPE-002: Define proper return type
interface ActionResult {
  error?: string
  success?: boolean
}

// TICKET-BIZ-010: Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  scheduled: ['confirmed', 'cancelled'],
  pending: ['confirmed', 'cancelled'],
  confirmed: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['in_progress', 'no_show'],
  in_progress: ['completed', 'no_show'],
  completed: [],
  cancelled: [],
  no_show: [],
}

export async function updateAppointmentStatus(
  appointmentId: string,
  newStatus: string,
  clinic: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // 1. Auth Check (Staff Only)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  // Strict check: Must be staff of the clinic
  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
    return { error: 'No tienes permisos para gestionar citas.' }
  }

  // 2. Get current appointment status
  const { data: appointment } = await supabase
    .from('appointments')
    .select('status')
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return { error: 'Cita no encontrada.' }
  }

  // 3. TICKET-BIZ-010: Validate status transition
  const currentStatus = appointment.status
  const allowed = VALID_TRANSITIONS[currentStatus] || []

  if (!allowed.includes(newStatus)) {
    return { error: `No se puede cambiar de "${currentStatus}" a "${newStatus}"` }
  }

  // 4. Update
  const { error } = await supabase
    .from('appointments')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', appointmentId)

  if (error) {
    return { error: 'Error al actualizar.' }
  }

  revalidatePath(`/${clinic}/portal/schedule`)
  revalidatePath(`/${clinic}/portal/dashboard`)
  return { success: true }
}
