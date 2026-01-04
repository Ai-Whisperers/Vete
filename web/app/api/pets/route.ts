import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

// POST - Create a new pet (used by onboarding wizard)
export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  try {
    // Handle FormData or JSON
    const contentType = request.headers.get('content-type') || ''
    let name: string
    let species: string
    let breed: string | null = null
    let clinic: string
    let photoFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      name = formData.get('name') as string
      species = formData.get('species') as string
      breed = (formData.get('breed') as string) || null
      clinic = formData.get('clinic') as string
      const photo = formData.get('photo')
      if (photo instanceof File && photo.size > 0) {
        photoFile = photo
      }
    } else {
      const body = await request.json()
      name = body.name
      species = body.species
      breed = body.breed || null
      clinic = body.clinic
    }

    // Validate required fields
    if (!name || !species || !clinic) {
      const missing: string[] = []
      if (!name) missing.push('name')
      if (!species) missing.push('species')
      if (!clinic) missing.push('clinic')
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: { missing },
      })
    }

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
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const query = searchParams.get('query')

  if (!userId) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { field: 'userId' } })
  }

  const supabase = await createClient()

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
}
