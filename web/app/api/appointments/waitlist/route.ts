import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const joinWaitlistSchema = z.object({
  pet_id: z.string().uuid(),
  service_id: z.string().uuid(),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferred_time_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  preferred_time_end: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  preferred_vet_id: z.string().uuid().optional(),
  is_flexible_date: z.boolean().optional().default(false),
  notify_via: z.array(z.enum(['email', 'whatsapp', 'sms'])).optional(),
  notes: z.string().max(500).optional(),
})

// GET /api/appointments/waitlist - List waitlist entries
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const petId = searchParams.get('pet_id')

    // Build query
    let query = supabase
      .from('appointment_waitlists')
      .select(
        `
        *,
        pet:pets!pet_id (id, name, species, breed, photo_url),
        service:services!service_id (id, name, duration_minutes, base_price),
        preferred_vet:profiles!preferred_vet_id (id, full_name),
        owner:pets!pet_id (owner:profiles!owner_id (id, full_name, email, phone))
      `
      )
      .eq('tenant_id', profile.tenant_id)
      .order('preferred_date', { ascending: true })
      .order('position', { ascending: true })

    // Staff see all, owners see only their pets
    if (profile.role === 'owner') {
      const { data: userPets } = await supabase
        .from('pets')
        .select('id')
        .eq('owner_id', user.id)

      const petIds = userPets?.map((p) => p.id) || []
      query = query.in('pet_id', petIds.length > 0 ? petIds : ['00000000-0000-0000-0000-000000000000'])
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (date) {
      query = query.eq('preferred_date', date)
    }
    if (petId) {
      query = query.eq('pet_id', petId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching waitlist:', error)
      return NextResponse.json({ error: 'Error al cargar lista de espera' }, { status: 500 })
    }

    return NextResponse.json({ waitlist: data })
  } catch (error) {
    console.error('Waitlist GET error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST /api/appointments/waitlist - Join waitlist
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = joinWaitlistSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Verify pet ownership (if not staff)
    const { data: pet } = await supabase
      .from('pets')
      .select('id, owner_id, tenant_id')
      .eq('id', data.pet_id)
      .single()

    if (!pet) {
      return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 })
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userProfile?.role === 'owner' && pet.owner_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado para esta mascota' }, { status: 403 })
    }

    // Check if already on waitlist for same date/service
    const { data: existing } = await supabase
      .from('appointment_waitlists')
      .select('id')
      .eq('tenant_id', profile.tenant_id)
      .eq('pet_id', data.pet_id)
      .eq('service_id', data.service_id)
      .eq('preferred_date', data.preferred_date)
      .eq('status', 'waiting')
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Ya estás en la lista de espera para esta fecha y servicio' },
        { status: 409 }
      )
    }

    // Insert waitlist entry (position is auto-assigned by trigger)
    const { data: waitlistEntry, error: insertError } = await supabase
      .from('appointment_waitlists')
      .insert({
        tenant_id: profile.tenant_id,
        pet_id: data.pet_id,
        service_id: data.service_id,
        preferred_date: data.preferred_date,
        preferred_time_start: data.preferred_time_start || null,
        preferred_time_end: data.preferred_time_end || null,
        preferred_vet_id: data.preferred_vet_id || null,
        is_flexible_date: data.is_flexible_date,
        notify_via: data.notify_via || ['email', 'whatsapp'],
        notes: data.notes || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error joining waitlist:', insertError)
      return NextResponse.json({ error: 'Error al unirse a la lista de espera' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Te has unido a la lista de espera',
      waitlistEntry,
    })
  } catch (error) {
    console.error('Waitlist POST error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
