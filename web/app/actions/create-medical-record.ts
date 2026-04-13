'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const medicalRecordSchema = z.object({
  petId: z.string().uuid('ID de mascota inválido'),
  type: z.string().min(1, 'El tipo es obligatorio'),
  title: z.string().min(1, 'El título es obligatorio').max(200),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
})

interface ActionState {
  error?: string
  success?: boolean
}

export async function createMedicalRecord(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Debe iniciar sesión' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'vet' && profile.role !== 'admin')) {
    return { error: 'Acceso denegado. Solo personal médico.' }
  }

  const clinic = formData.get('clinic') as string
  const petId = formData.get('petId') as string
  const type = formData.get('type') as string
  const title = formData.get('title') as string
  const diagnosis = formData.get('diagnosis') as string
  const notes = formData.get('notes') as string

  const validatedData = medicalRecordSchema.safeParse({ petId, type, title, diagnosis, notes })
  if (!validatedData.success) {
    const firstError = validatedData.error.errors[0]
    return { error: firstError.message }
  }

  const { data: pet } = await supabase.from('pets').select('tenant_id').eq('id', validatedData.data.petId).single()
  if (!pet || pet.tenant_id !== profile.tenant_id) {
    return { error: 'Mascota no encontrada o acceso denegado' }
  }

  try {
    const { error } = await supabase.from('medical_records').insert({
      tenant_id: profile.tenant_id,
      pet_id: validatedData.data.petId,
      performed_by: user.id,
      type: validatedData.data.type,
      title: validatedData.data.title,
      diagnosis: validatedData.data.diagnosis ?? null,
      notes: validatedData.data.notes ?? null,
      attachments: [],
    })

    if (error) throw error
  } catch (error) {
    logger.error('Failed to create medical record', {
      error: error instanceof Error ? error : undefined,
      userId: user.id,
      tenant: profile.tenant_id,
      petId,
    })
    const message = error instanceof Error ? error.message : 'Error al guardar registro'
    return { error: message }
  }

  revalidatePath(`/${clinic}/portal/pets/${petId}`)
  redirect(`/${clinic}/portal/pets/${petId}`)
}
