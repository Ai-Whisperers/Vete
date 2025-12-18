'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const schema = z.object({
  pet_id: z.string().uuid(),
  start_time: z.string(), // ISO string from datetime-local
  reason: z.string().min(3, "El motivo es muy corto"),
  notes: z.string().optional(),
})

export async function createAppointment(prevState: any, formData: FormData) {
  const supabase = await createClient()
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Debes iniciar sesión' }
  }

  // 2. Parse Data
  const rawData = {
    pet_id: formData.get('pet_id'),
    start_time: formData.get('start_time'),
    reason: formData.get('reason'),
    notes: formData.get('notes'),
  }

  const validated = schema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { pet_id, start_time, reason, notes } = validated.data
  const clinic = formData.get('clinic') as string // passed as hidden field

  // 3. Verify Pet Ownership
  const { data: pet } = await supabase
    .from('pets')
    .select('id, owner_id, tenant_id')
    .eq('id', pet_id)
    .single()
  
  if (!pet || pet.owner_id !== user.id) {
     return { error: 'No tienes permisos sobre esta mascota' }
  }

  // 4. Calculate End Time (Default 30 mins)
  const start = new Date(start_time)
  const end = new Date(start.getTime() + 30 * 60000)

  // 5. Insert Appointment
  const { error } = await supabase.from('appointments').insert({
    tenant_id: pet.tenant_id,
    pet_id: pet_id,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    status: 'pending',
    reason: reason,
    notes: notes,
    created_by: user.id
  })

  if (error) {
    console.error('Appointment Error:', error)
    return { error: 'Error al agendar la cita. Intenta nuevamente.' }
  }

  revalidatePath(`/${clinic}/portal/dashboard`)
  redirect(`/${clinic}/portal/dashboard?msg=cita_creada`)
}
