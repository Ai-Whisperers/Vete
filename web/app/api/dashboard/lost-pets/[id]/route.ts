/**
 * API Route: /api/dashboard/lost-pets/[id]
 * Individual lost pet report operations
 *
 * @FEAT-015 Lost Pet Management Dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateStatusSchema = z.object({
  status: z.enum(['lost', 'found', 'reunited']),
  notes: z.string().max(1000).optional(),
  found_location: z.string().max(500).optional(),
})

/**
 * GET /api/dashboard/lost-pets/[id]
 * Get detailed report with sightings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    // Get report with related data
    const { data: report, error } = await supabase
      .from('lost_pets')
      .select(
        `
        *,
        pet:pets!inner (
          id,
          name,
          species,
          breed,
          color,
          weight_kg,
          photo_url,
          microchip_id,
          owner:profiles!pets_owner_id_fkey (
            id,
            full_name,
            phone,
            email
          )
        ),
        reported_by_profile:profiles!lost_pets_reported_by_fkey (
          id,
          full_name,
          email
        ),
        found_by_profile:profiles!lost_pets_found_by_fkey (
          id,
          full_name,
          email
        )
      `
      )
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (error || !report) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    // Get sightings for this report
    const { data: sightings } = await supabase
      .from('pet_sightings')
      .select('*')
      .eq('lost_pet_id', id)
      .order('sighting_date', { ascending: false })

    // Get match suggestions
    const { data: matches } = await supabase
      .from('pet_match_suggestions')
      .select(
        `
        *,
        found_report:lost_pets!pet_match_suggestions_found_report_id_fkey (
          id,
          status,
          pet:pets (
            id,
            name,
            species,
            breed,
            photo_url
          )
        )
      `
      )
      .eq('lost_report_id', id)
      .order('confidence_score', { ascending: false })

    return NextResponse.json({
      report,
      sightings: sightings || [],
      matches: matches || [],
    })
  } catch (err) {
    logger.error('Error fetching lost pet report', { error: err instanceof Error ? err : undefined, id })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

/**
 * PUT /api/dashboard/lost-pets/[id]
 * Update report status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validation = updateStatusSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: validation.error.issues }, { status: 400 })
    }

    const { status, notes, found_location } = validation.data

    // Build update object
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (notes) {
      updateData.notes = notes
    }

    // Set resolution fields based on status
    if (status === 'found') {
      updateData.found_at = new Date().toISOString()
      updateData.found_by = user.id
      if (found_location) {
        updateData.found_location = found_location
      }
    } else if (status === 'reunited') {
      // If marking as reunited, set found_at if not already set
      const { data: existingReport } = await supabase
        .from('lost_pets')
        .select('found_at, pet_id')
        .eq('id', id)
        .single()

      if (!existingReport?.found_at) {
        updateData.found_at = new Date().toISOString()
        updateData.found_by = user.id
      }

      // FEAT-015: Notify owner when pet is reunited
      if (existingReport?.pet_id) {
        // Get owner info for notification
        const { data: pet } = await supabase
          .from('pets')
          .select('name, owner:profiles!pets_owner_id_fkey(id, email, full_name)')
          .eq('id', existingReport.pet_id)
          .single()

        // Handle owner which may be returned as array from Supabase join
        const ownerData = pet?.owner as unknown
        const owner = Array.isArray(ownerData) ? ownerData[0] : ownerData
        if (owner && typeof owner === 'object' && 'id' in owner) {
          // Create notification
          await supabase.from('notifications').insert({
            user_id: (owner as { id: string }).id,
            title: '¡Mascota reunida!',
            message: `${pet?.name} ha sido marcado como reunido con su dueño.`,
            type: 'pet_reunited',
            data: { report_id: id, pet_id: existingReport.pet_id },
          })

          logger.info('Pet reunited notification sent', {
            pet_id: existingReport.pet_id,
            owner_id: (owner as { id: string }).id,
          })
        }
      }
    }

    // Update the report
    const { data: report, error } = await supabase
      .from('lost_pets')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
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
      .single()

    if (error) {
      logger.error('Failed to update lost pet status', { error, id })
      return NextResponse.json({ error: 'Error de base de datos' }, { status: 500 })
    }

    // Log to audit
    await supabase.from('audit_logs').insert({
      tenant_id: profile.tenant_id,
      user_id: user.id,
      action: 'lost_pet_status_update',
      resource: 'lost_pets',
      resource_id: id,
      details: { old_status: body.old_status, new_status: status, notes },
    })

    return NextResponse.json({ report })
  } catch (err) {
    logger.error('Error updating lost pet report', { error: err instanceof Error ? err : undefined, id })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
