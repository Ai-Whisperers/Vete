'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const updatePetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100).optional(),
  species: z.enum(['dog', 'cat']).optional(),
  breed: z.string().max(100).optional(),
  weight_kg: z.number().positive().nullable().optional(),
  microchip_id: z.string().max(50).nullable().optional(),
  diet_category: z.string().nullable().optional(),
  diet_notes: z.string().nullable().optional(),
  sex: z.enum(['male', 'female', 'unknown']).optional(),
  is_neutered: z.boolean().optional(),
  color: z.string().max(100).nullable().optional(),
  temperament: z.string().nullable().optional(),
  allergies: z.string().nullable().optional(),
  existing_conditions: z.string().nullable().optional(),
  birth_date: z.string().nullable().optional(),
})

export interface UpdatePetResult {
  success?: boolean
  error?: string
}

export async function updatePet(
  petId: string,
  formData: FormData
): Promise<UpdatePetResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  // Verify ownership or staff access
  const { data: pet } = await supabase
    .from('pets')
    .select('owner_id, tenant_id')
    .eq('id', petId)
    .is('deleted_at', null)
    .single()

  if (!pet) {
    return { error: 'Mascota no encontrada' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  const isOwner = pet.owner_id === user.id
  const isStaff = profile?.role === 'vet' || profile?.role === 'admin'
  const sameTenant = profile?.tenant_id === pet.tenant_id

  if (!isOwner && !(isStaff && sameTenant)) {
    return { error: 'No tienes permiso para editar esta mascota' }
  }

  // Get clinic for revalidation
  const clinic = formData.get('clinic') as string

  // Parse and validate form data
  const rawData = {
    name: formData.get('name') as string || undefined,
    species: formData.get('species') as string || undefined,
    breed: formData.get('breed') as string || undefined,
    weight_kg: formData.get('weight_kg') ? parseFloat(formData.get('weight_kg') as string) : null,
    microchip_id: formData.get('microchip_id') as string || null,
    diet_category: formData.get('diet_category') as string || null,
    diet_notes: formData.get('diet_notes') as string || null,
    sex: formData.get('sex') as string || undefined,
    is_neutered: formData.get('is_neutered') === 'on' || formData.get('is_neutered') === 'true',
    color: formData.get('color') as string || null,
    temperament: formData.get('temperament') as string || null,
    allergies: formData.get('allergies') as string || null,
    existing_conditions: formData.get('existing_conditions') as string || null,
    birth_date: formData.get('birth_date') as string || null,
  }

  const validation = updatePetSchema.safeParse(rawData)
  if (!validation.success) {
    const firstError = validation.error.issues?.[0]
    return { error: firstError?.message || 'Error de validación' }
  }

  // Handle photo upload if provided
  const photo = formData.get('photo') as File
  let photoUrl = formData.get('existing_photo_url') as string | null

  if (photo && photo.size > 0) {
    const fileExt = photo.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('pets')
      .upload(fileName, photo)

    // TICKET-ERR-001: Return error instead of silently continuing
    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: 'No se pudo subir la foto. Por favor intente de nuevo.' }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('pets')
      .getPublicUrl(fileName)
    photoUrl = publicUrl
  }

  // Handle photo removal
  const removePhoto = formData.get('remove_photo') === 'true'
  if (removePhoto) {
    photoUrl = null
  }

  // Prepare updates
  const updates: Record<string, unknown> = {
    ...validation.data,
    photo_url: photoUrl,
  }

  // Remove undefined values
  Object.keys(updates).forEach(key => {
    if (updates[key] === undefined) {
      delete updates[key]
    }
  })

  const { error } = await supabase
    .from('pets')
    .update(updates)
    .eq('id', petId)

  if (error) {
    return { error: 'Error al guardar los cambios' }
  }

  if (clinic) {
    revalidatePath(`/${clinic}/portal/pets/${petId}`)
    revalidatePath(`/${clinic}/portal/dashboard`)
  }

  return { success: true }
}

export interface DeletePetResult {
  success?: boolean
  error?: string
}

export async function deletePet(petId: string): Promise<DeletePetResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  // Verify ownership - only owners can delete their pets
  const { data: pet } = await supabase
    .from('pets')
    .select('owner_id, tenant_id')
    .eq('id', petId)
    .is('deleted_at', null)
    .single()

  if (!pet) {
    return { error: 'Mascota no encontrada' }
  }

  if (pet.owner_id !== user.id) {
    return { error: 'Solo el dueño puede eliminar esta mascota' }
  }

  // Soft delete
  const { error } = await supabase
    .from('pets')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', petId)

  if (error) {
    return { error: 'Error al eliminar la mascota' }
  }

  return { success: true }
}
