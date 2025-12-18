'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAppointmentStatus(appointmentId: string, newStatus: string, clinic: string) {
  const supabase = await createClient()
  
  // 1. Auth Check (Staff Only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single()
  
  // Strict check: Must be staff of the clinic
  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
      return { error: 'No tienes permisos para gestionar citas.' }
  }

  // 2. Update
  const { error } = await supabase
    .from('appointments')
    .update({ status: newStatus })
    .eq('id', appointmentId)

  if (error) {
    return { error: 'Error al actualizar.' }
  }

  revalidatePath(`/${clinic}/portal/schedule`)
  revalidatePath(`/${clinic}/portal/dashboard`)
  return { success: true }
}
