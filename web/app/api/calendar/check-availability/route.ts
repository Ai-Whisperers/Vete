import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

/**
 * API: Check appointment slot availability
 *
 * POST /api/calendar/check-availability
 *
 * Checks if a time slot is available for booking by detecting overlapping appointments.
 * Uses the database function `check_appointment_overlap` for efficient conflict detection.
 */

// Request validation schema
const checkAvailabilitySchema = z.object({
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  vet_id: z.string().uuid().optional(),
  exclude_appointment_id: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
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

    // Get user's tenant
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Staff check (only vets and admins can check availability for scheduling)
    if (!['vet', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = checkAvailabilitySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { start_time, end_time, vet_id, exclude_appointment_id } = validation.data

    // Validate time range
    const startDate = new Date(start_time)
    const endDate = new Date(end_time)

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'La hora de fin debe ser posterior a la hora de inicio' },
        { status: 400 }
      )
    }

    // Check for overlapping appointments
    let query = supabase
      .from('appointments')
      .select(
        `
        id,
        start_time,
        end_time,
        status,
        vet_id,
        pets (
          name
        )
      `
      )
      .eq('tenant_id', profile.tenant_id)
      .in('status', ['scheduled', 'confirmed', 'in_progress'])
      // Check for time overlap: existing start < new end AND existing end > new start
      .lt('start_time', end_time)
      .gt('end_time', start_time)

    // Filter by vet if specified
    if (vet_id) {
      query = query.eq('vet_id', vet_id)
    }

    // Exclude a specific appointment (useful when rescheduling)
    if (exclude_appointment_id) {
      query = query.neq('id', exclude_appointment_id)
    }

    const { data: conflicts, error: conflictsError } = await query

    if (conflictsError) {
      console.error('Error checking conflicts:', conflictsError)
      return NextResponse.json({ error: 'Error al verificar disponibilidad' }, { status: 500 })
    }

    // Format conflicts for response
    const formattedConflicts =
      conflicts?.map((apt) => {
        const pet = Array.isArray(apt.pets) ? apt.pets[0] : apt.pets
        return {
          id: apt.id,
          start_time: apt.start_time,
          end_time: apt.end_time,
          status: apt.status,
          vet_id: apt.vet_id,
          pet_name: pet?.name || 'Mascota',
        }
      }) || []

    return NextResponse.json({
      available: formattedConflicts.length === 0,
      conflicts: formattedConflicts,
      message:
        formattedConflicts.length === 0
          ? 'Horario disponible'
          : `${formattedConflicts.length} cita(s) en conflicto`,
    })
  } catch (error) {
    console.error('Check availability error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
