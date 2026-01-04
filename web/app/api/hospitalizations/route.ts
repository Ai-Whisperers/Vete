import { NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

export const GET = withApiAuth(
  async ({ request, profile, supabase }) => {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const kennelId = searchParams.get('kennel_id')
    const petId = searchParams.get('pet_id')

    // Build query
    let query = supabase
      .from('hospitalizations')
      .select(
        `
      *,
      pet:pets!inner(id, name, species, breed, owner_id, profiles!pets_owner_id_fkey(full_name, phone)),
      kennel:kennels(id, kennel_number, kennel_type, location),
      admitted_by:profiles!hospitalizations_admitted_by_fkey(full_name),
      discharged_by:profiles!hospitalizations_discharged_by_fkey(full_name)
    `
      )
      .eq('pet.tenant_id', profile.tenant_id)
      .order('admission_date', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (kennelId) {
      query = query.eq('kennel_id', kennelId)
    }
    if (petId) {
      query = query.eq('pet_id', petId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[API] hospitalizations GET error:', error)
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return NextResponse.json(data)
  },
  { roles: ['vet', 'admin'] }
)

export const POST = withApiAuth(
  async ({ request, user, profile, supabase }: ApiHandlerContext) => {
    // Parse body
    let body
    try {
      body = await request.json()
    } catch {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
    }

    const {
      pet_id,
      kennel_id,
      hospitalization_type,
      admission_diagnosis,
      treatment_plan,
      diet_instructions,
      acuity_level,
      estimated_discharge_date,
      emergency_contact_name,
      emergency_contact_phone,
    } = body

    // Validate required fields
    if (!pet_id || !kennel_id || !hospitalization_type || !admission_diagnosis) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: {
          required: ['pet_id', 'kennel_id', 'hospitalization_type', 'admission_diagnosis'],
        },
      })
    }

    // Verify pet belongs to staff's clinic
    const { data: pet } = await supabase
      .from('pets')
      .select('id, tenant_id, name')
      .eq('id', pet_id)
      .single()

    if (!pet) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, { details: { resource: 'pet' } })
    }

    if (pet.tenant_id !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    // Verify kennel is available
    const { data: kennel } = await supabase
      .from('kennels')
      .select('id, kennel_status, tenant_id')
      .eq('id', kennel_id)
      .single()

    if (!kennel) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, { details: { resource: 'kennel' } })
    }

    if (kennel.tenant_id !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    if (kennel.kennel_status !== 'available') {
      return apiError('CONFLICT', HTTP_STATUS.CONFLICT, {
        details: { reason: 'kennel_not_available' },
      })
    }

    // Generate hospitalization number
    const { data: lastHospitalization } = await supabase
      .from('hospitalizations')
      .select('hospitalization_number')
      .like('hospitalization_number', `H-${new Date().getFullYear()}-%`)
      .order('hospitalization_number', { ascending: false })
      .limit(1)
      .single()

    let nextNumber = 1
    if (lastHospitalization?.hospitalization_number) {
      const match = lastHospitalization.hospitalization_number.match(/H-\d{4}-(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1
      }
    }

    const hospitalizationNumber = `H-${new Date().getFullYear()}-${String(nextNumber).padStart(4, '0')}`

    // Insert hospitalization
    const { data: hospitalization, error: hospError } = await supabase
      .from('hospitalizations')
      .insert({
        hospitalization_number: hospitalizationNumber,
        pet_id,
        kennel_id,
        hospitalization_type,
        admission_date: new Date().toISOString(),
        admission_diagnosis,
        treatment_plan: treatment_plan || null,
        diet_instructions: diet_instructions || null,
        acuity_level: acuity_level || 'routine',
        status: 'active',
        estimated_discharge_date: estimated_discharge_date || null,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
        admitted_by: user.id,
      })
      .select(
        `
      *,
      pet:pets(id, name, species, breed),
      kennel:kennels(id, kennel_number, kennel_type, location)
    `
      )
      .single()

    if (hospError) {
      console.error('[API] hospitalizations POST error:', hospError)
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    // Update kennel status to occupied
    await supabase.from('kennels').update({ kennel_status: 'occupied' }).eq('id', kennel_id)

    return NextResponse.json(hospitalization, { status: 201 })
  },
  { roles: ['vet', 'admin'] }
)

export const PATCH = withApiAuth(
  async ({ request, user, profile, supabase }: ApiHandlerContext) => {
    // Parse body
    let body
    try {
      body = await request.json()
    } catch {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
    }

    const {
      id,
      status,
      treatment_plan,
      diet_instructions,
      discharge_notes,
      discharge_instructions,
      acuity_level,
    } = body

    if (!id) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { required: ['id'] } })
    }

    // Verify hospitalization belongs to staff's clinic
    const { data: existing } = await supabase
      .from('hospitalizations')
      .select(
        `
      id,
      kennel_id,
      pet:pets!inner(tenant_id)
    `
      )
      .eq('id', id)
      .single()

    if (!existing) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { resource: 'hospitalization' },
      })
    }

    const petData = Array.isArray(existing.pet) ? existing.pet[0] : existing.pet
    const pet = petData as { tenant_id: string }
    if (pet.tenant_id !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    // Build update
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (treatment_plan !== undefined) updates.treatment_plan = treatment_plan
    if (diet_instructions !== undefined) updates.diet_instructions = diet_instructions
    if (acuity_level !== undefined) updates.acuity_level = acuity_level

    if (status) {
      updates.status = status
      if (status === 'discharged') {
        updates.discharge_date = new Date().toISOString()
        updates.discharged_by = user.id
        if (discharge_notes) updates.discharge_notes = discharge_notes
        if (discharge_instructions) updates.discharge_instructions = discharge_instructions

        // Free up the kennel
        if (existing.kennel_id) {
          await supabase
            .from('kennels')
            .update({ kennel_status: 'available' })
            .eq('id', existing.kennel_id)
        }
      }
    }

    const { data, error } = await supabase
      .from('hospitalizations')
      .update(updates)
      .eq('id', id)
      .select(
        `
      *,
      pet:pets(id, name, species, breed),
      kennel:kennels(id, kennel_number, kennel_type, location)
    `
      )
      .single()

    if (error) {
      console.error('[API] hospitalizations PATCH error:', error)
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return NextResponse.json(data)
  },
  { roles: ['vet', 'admin'] }
)
