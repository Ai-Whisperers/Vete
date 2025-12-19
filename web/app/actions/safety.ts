'use server'

import { actionSuccess, actionError } from '@/lib/actions'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
