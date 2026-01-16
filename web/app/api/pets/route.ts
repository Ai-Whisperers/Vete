import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { PetService } from '@/lib/services/pet-service'
import { PET_SPECIES } from '@/lib/schemas/pet'
import { z } from 'zod'

// VALID-004: Schema for API endpoint (simplified for onboarding wizard)
const apiCreatePetSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(50),
  species: z.enum(PET_SPECIES, { message: 'Especie inválida' }),
  breed: z.string().max(100).nullable().optional(),
  clinic: z.string().min(1, 'La clínica es requerida'),
})

/**
 * POST /api/pets - Create a new pet (used by onboarding wizard)
 */
export const POST = withApiAuth(async ({ user, supabase, request }: ApiHandlerContext) => {
  try {
    // Handle FormData or JSON
    const contentType = request.headers.get('content-type') || ''
    let rawData: Record<string, unknown>
    let photoFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      rawData = {
        name: formData.get('name') as string,
        species: formData.get('species') as string,
        breed: (formData.get('breed') as string) || null,
        clinic: formData.get('clinic') as string,
      }
      const photo = formData.get('photo')
      if (photo instanceof File && photo.size > 0) {
        photoFile = photo
      }
    } else {
      const body = await request.json()
      rawData = {
        name: body.name,
        species: body.species,
        breed: body.breed || null,
        clinic: body.clinic,
      }
    }

    // VALID-004: Validate with Zod schema
    const result = apiCreatePetSchema.safeParse(rawData)
    if (!result.success) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: {
          errors: result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
      })
    }

    const { name, species, breed, clinic } = result.data

    // Create PetService instance
    const petService = new PetService(supabase)

    // Create pet using service
    const createResult = await petService.create(user.id, clinic, {
      name,
      species: species as any, // Species enum from validation
      breed: breed || null,
    })

    if (!createResult.success) {
      logger.error('Failed to create pet via service', {
        error: createResult.error,
        userId: user.id,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { message: createResult.error },
      })
    }

    const pet = createResult.data

    // Handle photo upload if provided (after pet creation)
    if (photoFile && pet.id) {
      const uploadResult = await petService.uploadPhoto(pet.id, user.id, photoFile)

      if (!uploadResult.success) {
        logger.warn('Failed to upload pet photo during onboarding', {
          error: uploadResult.error,
          petId: pet.id,
        })
      }
    }

    // Return minimal response for onboarding
    return NextResponse.json(
      {
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        photo_url: pet.photo_url,
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Error in POST /api/pets', {
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}, { rateLimit: 'write' })

/**
 * GET /api/pets - List pets for a user
 */
export const GET = withApiAuth(async ({ user, profile, supabase, request }: ApiHandlerContext) => {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const query = searchParams.get('query')
  const species = searchParams.get('species')

  if (!userId) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { field: 'userId' } })
  }

  // Security check: users can only query their own pets,
  // staff (vet/admin) can query any user's pets within their tenant
  const isStaff = ['vet', 'admin'].includes(profile.role)

  if (userId !== user.id && !isStaff) {
    logger.warn('Unauthorized attempt to access other user pets', {
      requestingUserId: user.id,
      targetUserId: userId,
    })
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
  }

  // If staff, verify the target user belongs to the same tenant
  if (isStaff && userId !== user.id) {
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', userId)
      .single()

    if (!targetProfile || targetProfile.tenant_id !== profile.tenant_id) {
      logger.warn('Staff attempted to access pets from different tenant', {
        staffId: user.id,
        staffTenant: profile.tenant_id,
        targetUserId: userId,
      })
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }
  }

  // Use PetService to list pets
  const petService = new PetService(supabase)
  const result = await petService.list(
    userId,
    profile.tenant_id,
    {
      query: query || undefined,
      species: species as any || undefined,
    },
    isStaff
  )

  if (!result.success) {
    logger.error('Error fetching pets via service', {
      userId,
      error: result.error,
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: result.error },
    })
  }

  // Map to include vaccine status for compatibility with existing API consumers
  const petsWithVaccines = result.data.map((pet) => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    birth_date: pet.birth_date,
    photo_url: pet.photo_url,
    vaccines: [], // TODO: Add vaccine join in service if needed for this endpoint
  }))

  return NextResponse.json(petsWithVaccines, { status: 200 })
})
