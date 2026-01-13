import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { createPetSchema, PET_SPECIES } from '@/lib/schemas/pet'
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

    // Handle photo upload if provided
    let photoUrl: string | null = null
    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('pets').upload(fileName, photoFile)

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('pets').getPublicUrl(fileName)
        photoUrl = publicUrl
      } else {
        logger.warn('Failed to upload pet photo during onboarding', { error: uploadError.message })
      }
    }

    // Insert pet
    const { data: pet, error: insertError } = await supabase
      .from('pets')
      .insert({
        owner_id: user.id,
        tenant_id: clinic,
        name,
        species,
        breed,
        photo_url: photoUrl,
        is_active: true,
      })
      .select('id, name, species, breed, photo_url')
      .single()

    if (insertError) {
      logger.error('Failed to create pet via API', { error: insertError.message, userId: user.id })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return NextResponse.json(pet, { status: 201 })
  } catch (error) {
    logger.error('Error in POST /api/pets', {
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
})

/**
 * GET /api/pets - List pets for a user
 */
export const GET = withApiAuth(async ({ user, profile, supabase, request }: ApiHandlerContext) => {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const query = searchParams.get('query')

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

  let petsQuery = supabase
    .from('pets')
    .select(
      `
      id,
      name,
      species,
      breed,
      birth_date,
      photo_url,
      vaccines (id, status)
    `
    )
    .eq('owner_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (query) {
    petsQuery = petsQuery.ilike('name', `%${query}%`)
  }

  const { data, error } = await petsQuery

  if (error) {
    logger.error('Error fetching pets', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  return NextResponse.json(data, { status: 200 })
})
