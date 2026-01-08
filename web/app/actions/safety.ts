'use server'

import { withActionAuth } from '@/lib/auth'
import { actionSuccess, actionError } from '@/lib/errors'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { checkActionRateLimit, ACTION_RATE_LIMITS } from '@/lib/auth/action-rate-limit'

/**
 * FEAT-015: Lost Pet Management Dashboard
 * Server actions for managing lost, found, and reunited pet reports
 */

/**
 * Get lost pet reports for a clinic
 */
export const getLostPets = withActionAuth(
  async ({ supabase }, clinicSlug: string, status?: string) => {
    let query = supabase
      .from('lost_pets')
      .select(
        `
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
      `
      )
      .eq('tenant_id', clinicSlug)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to get lost pets', {
        error,
        tenant: clinicSlug,
        status,
      })
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
        resolved_at: newStatus === 'reunited' ? new Date().toISOString() : null,
      })
      .eq('id', reportId)
      .eq('tenant_id', clinicSlug)

    if (error) {
      logger.error('Failed to update lost pet status', {
        error,
        tenant: clinicSlug,
        reportId,
        newStatus,
      })
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
  // SEC-011: Rate limit public pet reports to prevent abuse
  const rateLimitResult = await checkActionRateLimit(ACTION_RATE_LIMITS.foundPetReport.type)
  if (!rateLimitResult.success) {
    return actionError(rateLimitResult.message || 'Demasiados reportes. Espera un momento.')
  }

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
    logger.error('Failed to report found pet', {
      error: e instanceof Error ? e : undefined,
      petId,
    })
    return actionError(e instanceof Error ? e.message : 'Error desconocido')
  }
}
