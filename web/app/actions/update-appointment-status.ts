'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAppointmentStatus(appointmentId: string, newStatus: string, clinic: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .update({ status: newStatus })
    .eq('id', appointmentId)

  if (error) {
    console.error('Error updating appointment status:', error)
    return { success: false, error: 'Failed to update appointment status' }
  }

  revalidatePath(`/${clinic}/dashboard`)
  return { success: true }
}