import { NextResponse } from 'next/server'
import { withApiAuth } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

// GET /api/dashboard/today-appointments - Get today's appointments for the clinic
// SEC-FIX: Added authentication and tenant verification
export const GET = withApiAuth(
  async ({ profile, supabase }) => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
        id,
        start_time,
        end_time,
        status,
        reason,
        notes,
        pets (
          id,
          name,
          species,
          breed,
          photo_url,
          owner:profiles!pets_owner_id_fkey (
            id,
            full_name,
            phone
          )
        ),
        vet:profiles!appointments_vet_id_fkey (
          id,
          full_name
        ),
        service:services (
          id,
          name,
          duration_minutes
        )
      `
        )
        .eq('tenant_id', profile.tenant_id)
        .gte('start_time', `${today}T00:00:00`)
        .lt('start_time', `${today}T23:59:59`)
        .is('deleted_at', null)
        .order('start_time', { ascending: true })

      if (error) {
        console.error("Error fetching today's appointments:", error)
        return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
          details: { message: error.message },
        })
      }

      // Enrich data with flattened pet/owner/vet structure
      const enrichedData = (data || []).map((apt) => {
        const pet = Array.isArray(apt.pets) ? apt.pets[0] : apt.pets
        const vet = Array.isArray(apt.vet) ? apt.vet[0] : apt.vet
        const service = Array.isArray(apt.service) ? apt.service[0] : apt.service
        const owner = pet?.owner ? (Array.isArray(pet.owner) ? pet.owner[0] : pet.owner) : undefined

        return {
          id: apt.id,
          start_time: apt.start_time,
          end_time: apt.end_time,
          status: apt.status,
          reason: apt.reason,
          notes: apt.notes,
          pet: pet
            ? {
                id: pet.id,
                name: pet.name,
                species: pet.species,
                breed: pet.breed,
                photo_url: pet.photo_url,
                owner,
              }
            : null,
          vet,
          service,
        }
      })

      return NextResponse.json(enrichedData, { status: 200 })
    } catch (error) {
      console.error('Error in /api/dashboard/today-appointments:', error)
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { message: error instanceof Error ? error.message : 'Unknown error' },
      })
    }
  },
  { roles: ['vet', 'admin'] }
)
