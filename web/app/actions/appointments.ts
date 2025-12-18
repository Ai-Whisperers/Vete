'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CancelAppointmentResult, RescheduleAppointmentResult } from '@/lib/types/appointments'

/**
 * Cancel an appointment
 * Can be used by pet owners (for their pets) or staff (for any appointment in their tenant)
 */
export async function cancelAppointment(
  appointmentId: string,
  reason?: string
): Promise<CancelAppointmentResult> {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  // 2. Get appointment with pet to verify ownership
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select(`
      id,
      tenant_id,
      start_time,
      status,
      pets!inner(owner_id)
    `)
    .eq('id', appointmentId)
    .single()

  if (fetchError || !appointment) {
    return { error: 'Cita no encontrada' }
  }

  // Transform pets array to single object (Supabase returns array from join)
  const pet = Array.isArray(appointment.pets) ? appointment.pets[0] : appointment.pets

  // 3. Authorization: Check if user is pet owner or staff
  const isOwner = pet.owner_id === user.id

  if (!isOwner) {
    // Check if staff member of this tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single()

    const isStaff = profile &&
      ['vet', 'admin'].includes(profile.role) &&
      profile.tenant_id === appointment.tenant_id

    if (!isStaff) {
      return { error: 'No tienes permiso para cancelar esta cita' }
    }
  }

  // 4. Check if appointment is in the future
  const appointmentDateTime = new Date(appointment.start_time)
  if (appointmentDateTime < new Date()) {
    return { error: 'No se puede cancelar una cita pasada' }
  }

  // 5. Check if already cancelled or completed
  if (['cancelled', 'completed', 'no_show'].includes(appointment.status)) {
    return { error: 'Esta cita ya no puede ser cancelada' }
  }

  // 6. Update appointment status
  const { error: updateError } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      notes: reason
        ? `[Cancelado] ${reason}`
        : appointment.status === 'pending'
          ? '[Cancelado por el cliente]'
          : '[Cancelado]'
    })
    .eq('id', appointmentId)

  if (updateError) {
    console.error('Cancel appointment error:', updateError)
    return { error: 'Error al cancelar la cita' }
  }

  // 7. Revalidate paths
  revalidatePath(`/[clinic]/portal/appointments`)
  revalidatePath(`/[clinic]/portal/dashboard`)
  revalidatePath(`/[clinic]/portal/schedule`)

  return { success: true }
}

/**
 * Reschedule an appointment to a new date/time
 * Only pet owners can reschedule their own appointments
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newDate: string,
  newTime: string
): Promise<RescheduleAppointmentResult> {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  // 2. Get appointment with pet to verify ownership
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select(`
      id,
      tenant_id,
      start_time,
      end_time,
      status,
      pets!inner(owner_id)
    `)
    .eq('id', appointmentId)
    .single()

  if (fetchError || !appointment) {
    return { error: 'Cita no encontrada' }
  }

  // Transform pets array to single object (Supabase returns array from join)
  const pet = Array.isArray(appointment.pets) ? appointment.pets[0] : appointment.pets

  // 3. Check ownership
  if (pet.owner_id !== user.id) {
    // Staff can also reschedule
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single()

    const isStaff = profile &&
      ['vet', 'admin'].includes(profile.role) &&
      profile.tenant_id === appointment.tenant_id

    if (!isStaff) {
      return { error: 'No tienes permiso para reprogramar esta cita' }
    }
  }

  // 4. Check if appointment can be rescheduled
  if (['cancelled', 'completed', 'no_show'].includes(appointment.status)) {
    return { error: 'Esta cita no puede ser reprogramada' }
  }

  // 5. Parse and validate new date/time
  const newDateTime = new Date(`${newDate}T${newTime}`)
  if (isNaN(newDateTime.getTime())) {
    return { error: 'Fecha u hora inválida' }
  }

  if (newDateTime < new Date()) {
    return { error: 'La nueva fecha debe ser en el futuro' }
  }

  // 6. Calculate original duration and new end time
  const originalStart = new Date(appointment.start_time)
  const originalEnd = new Date(appointment.end_time)
  const durationMs = originalEnd.getTime() - originalStart.getTime()
  const newEndDateTime = new Date(newDateTime.getTime() + durationMs)

  // 7. TODO: Check slot availability (for now, we allow overlaps)
  // This would integrate with a more complete booking system

  // 8. Update appointment
  const { error: updateError } = await supabase
    .from('appointments')
    .update({
      start_time: newDateTime.toISOString(),
      end_time: newEndDateTime.toISOString(),
      status: 'pending' // Reset to pending for re-confirmation
    })
    .eq('id', appointmentId)

  if (updateError) {
    console.error('Reschedule appointment error:', updateError)
    return { error: 'Error al reprogramar la cita' }
  }

  // 9. Revalidate paths
  revalidatePath(`/[clinic]/portal/appointments`)
  revalidatePath(`/[clinic]/portal/dashboard`)
  revalidatePath(`/[clinic]/portal/schedule`)

  return {
    success: true,
    newDate: newDate,
    newTime: newTime
  }
}

/**
 * Get appointments for the current user (pet owner)
 * Returns both upcoming and past appointments
 */
export async function getOwnerAppointments(clinicSlug: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado', data: null }
  }

  // Get all appointments for pets owned by this user in this clinic
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      tenant_id,
      start_time,
      end_time,
      status,
      reason,
      notes,
      pets!inner(
        id,
        name,
        species,
        photo_url,
        owner_id
      )
    `)
    .eq('tenant_id', clinicSlug)
    .eq('pets.owner_id', user.id)
    .order('start_time', { ascending: false })

  if (error) {
    console.error('Get appointments error:', error)
    return { error: 'Error al obtener las citas', data: null }
  }

  // Transform pets array to single pet object (Supabase returns array from join)
  const transformedAppointments = appointments?.map(a => ({
    ...a,
    pets: Array.isArray(a.pets) ? a.pets[0] : a.pets
  })) || []

  // Split into upcoming and past
  const now = new Date()
  const upcoming = transformedAppointments
    .filter(a => new Date(a.start_time) >= now && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  const past = transformedAppointments
    .filter(a => new Date(a.start_time) < now || a.status === 'cancelled')
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())

  return {
    data: { upcoming, past },
    error: null
  }
}

// =============================================================================
// STAFF ACTIONS - Appointment Workflow Management
// =============================================================================

/**
 * Check in a patient (mark as arrived)
 * Staff only
 */
export async function checkInAppointment(appointmentId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  // Get appointment
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('id, tenant_id, status')
    .eq('id', appointmentId)
    .single()

  if (fetchError || !appointment) {
    return { error: 'Cita no encontrada' }
  }

  // Check staff permission
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  const isStaff = profile &&
    ['vet', 'admin'].includes(profile.role) &&
    profile.tenant_id === appointment.tenant_id

  if (!isStaff) {
    return { error: 'Solo el personal puede registrar llegadas' }
  }

  // Validate status
  if (!['pending', 'confirmed'].includes(appointment.status)) {
    return { error: `No se puede registrar llegada para estado: ${appointment.status}` }
  }

  // Update
  const { error: updateError } = await supabase
    .from('appointments')
    .update({
      status: 'checked_in',
      checked_in_at: new Date().toISOString(),
      checked_in_by: user.id
    })
    .eq('id', appointmentId)

  if (updateError) {
    console.error('Check-in error:', updateError)
    return { error: 'Error al registrar llegada' }
  }

  revalidatePath('/[clinic]/dashboard/appointments')
  revalidatePath('/[clinic]/portal/appointments')
  return { success: true }
}

/**
 * Start an appointment (mark as in progress)
 * Staff only
 */
export async function startAppointment(appointmentId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, tenant_id, status')
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return { error: 'Cita no encontrada' }
  }

  // Check staff permission
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  const isStaff = profile &&
    ['vet', 'admin'].includes(profile.role) &&
    profile.tenant_id === appointment.tenant_id

  if (!isStaff) {
    return { error: 'Solo el personal puede iniciar consultas' }
  }

  if (appointment.status !== 'checked_in') {
    return { error: 'El paciente debe estar registrado para iniciar la consulta' }
  }

  const { error: updateError } = await supabase
    .from('appointments')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', appointmentId)

  if (updateError) {
    console.error('Start appointment error:', updateError)
    return { error: 'Error al iniciar consulta' }
  }

  revalidatePath('/[clinic]/dashboard/appointments')
  return { success: true }
}

/**
 * Complete an appointment
 * Staff only
 */
export async function completeAppointment(
  appointmentId: string,
  notes?: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, tenant_id, status, notes')
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return { error: 'Cita no encontrada' }
  }

  // Check staff permission
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  const isStaff = profile &&
    ['vet', 'admin'].includes(profile.role) &&
    profile.tenant_id === appointment.tenant_id

  if (!isStaff) {
    return { error: 'Solo el personal puede completar citas' }
  }

  if (!['checked_in', 'in_progress'].includes(appointment.status)) {
    return { error: `No se puede completar una cita con estado: ${appointment.status}` }
  }

  const updateData: Record<string, unknown> = {
    status: 'completed',
    completed_at: new Date().toISOString(),
    completed_by: user.id
  }

  if (notes) {
    updateData.notes = appointment.notes
      ? `${appointment.notes}\n[Notas de cierre] ${notes}`
      : `[Notas de cierre] ${notes}`
  }

  const { error: updateError } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)

  if (updateError) {
    console.error('Complete appointment error:', updateError)
    return { error: 'Error al completar la cita' }
  }

  revalidatePath('/[clinic]/dashboard/appointments')
  revalidatePath('/[clinic]/portal/appointments')
  return { success: true }
}

/**
 * Mark a patient as no-show
 * Staff only
 */
export async function markNoShow(appointmentId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, tenant_id, status')
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return { error: 'Cita no encontrada' }
  }

  // Check staff permission
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  const isStaff = profile &&
    ['vet', 'admin'].includes(profile.role) &&
    profile.tenant_id === appointment.tenant_id

  if (!isStaff) {
    return { error: 'Solo el personal puede marcar no presentados' }
  }

  if (!['pending', 'confirmed'].includes(appointment.status)) {
    return { error: 'Solo se puede marcar como no presentado a citas pendientes o confirmadas' }
  }

  const { error: updateError } = await supabase
    .from('appointments')
    .update({
      status: 'no_show',
      notes: '[No se presentó]'
    })
    .eq('id', appointmentId)

  if (updateError) {
    console.error('Mark no-show error:', updateError)
    return { error: 'Error al marcar no presentado' }
  }

  revalidatePath('/[clinic]/dashboard/appointments')
  revalidatePath('/[clinic]/portal/appointments')
  return { success: true }
}

/**
 * Get today's appointments for staff dashboard
 * Staff only
 */
export async function getStaffAppointments(
  clinicSlug: string,
  date?: string,
  statusFilter?: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado', data: null }
  }

  // Check staff permission
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinicSlug) {
    return { error: 'Solo el personal puede ver esta información', data: null }
  }

  const targetDate = date || new Date().toISOString().split('T')[0]

  let query = supabase
    .from('appointments')
    .select(`
      id,
      tenant_id,
      start_time,
      end_time,
      status,
      reason,
      notes,
      checked_in_at,
      started_at,
      pets (
        id,
        name,
        species,
        photo_url,
        owner:profiles!pets_owner_id_fkey (
          id,
          full_name,
          phone
        )
      )
    `)
    .eq('tenant_id', clinicSlug)
    .gte('start_time', `${targetDate}T00:00:00`)
    .lt('start_time', `${targetDate}T23:59:59`)
    .order('start_time', { ascending: true })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: appointments, error } = await query

  if (error) {
    console.error('Get staff appointments error:', error)
    return { error: 'Error al obtener citas', data: null }
  }

  // Transform the nested data
  const transformedAppointments = appointments?.map(apt => ({
    ...apt,
    pets: Array.isArray(apt.pets) ? apt.pets[0] : apt.pets
  })) || []

  return { data: transformedAppointments, error: null }
}
