'use server'

import { withActionAuth } from '@/lib/auth'
import { actionSuccess, actionError } from '@/lib/errors'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get lost pet reports for a clinic
 */
export const getLostPets = withActionAuth(
  async ({ supabase }, clinicSlug: string, status?: string) => {
    let query = supabase
      .from('lost_pets')
      .select(`
        *,
        pet:pets!inner (
          id,
          name,
          species,
          breed,
          photo_url,
          owner:profiles!pets_owner_id_fkey (
            id,
            full_name,
            phone,
            email
          )
        )
      `)
      .eq('tenant_id', clinicSlug)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Get lost pets error:', error)
      return actionError('Error al obtener reportes de mascotas perdidas')
    }

    return actionSuccess(data || [])
  }
)

/**
 * Update the status of a lost pet report
 */
export const updateLostPetStatus = withActionAuth(
  async ({ profile, supabase }, clinicSlug: string, reportId: string, newStatus: string) => {
    // Only staff can update status for now (or eventually the owner)
    const isStaff = ['vet', 'admin'].includes(profile.role)
    if (!isStaff) return actionError('No tienes permiso para actualizar este reporte')

    const { error } = await supabase
      .from('lost_pets')
      .update({ 
        status: newStatus,
        resolved_at: newStatus === 'reunited' ? new Date().toISOString() : null
      })
      .eq('id', reportId)
      .eq('tenant_id', clinicSlug)

    if (error) {
      console.error('Update lost pet status error:', error)
      return actionError('Error al actualizar el estado del reporte')
    }

    revalidatePath(`/${clinicSlug}/dashboard/lost-pets`)
    return actionSuccess()
  }
)

/**
 * Report a found pet (public action - no auth required for lost pet reports)
 */
export async function reportFoundPet(petId: string, location?: string, contact?: string) {
  const supabase = await createClient()

  try {
    // Create entry in lost_pets
    const { error } = await supabase.from('lost_pets').insert({
      pet_id: petId,
      status: 'found',
      last_seen_location: location || 'Reported via QR Scan',
      last_seen_date: new Date().toISOString(),
      finder_contact: contact,
      reported_by: null, // Public report
    })

    if (error) throw error

    revalidatePath(`/scan/${petId}`)
    return actionSuccess()
  } catch (e) {
    console.error('Error reporting found pet:', e)
    return actionError(e instanceof Error ? e.message : 'Error desconocido')
  }
}
