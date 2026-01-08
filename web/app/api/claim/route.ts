import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { trialConfig } from '@/lib/pricing/tiers'

/**
 * Claim Website API
 *
 * Allows clinic owners to claim a pre-generated website.
 * This is part of the "Your website is already live" outreach strategy.
 *
 * Flow:
 * 1. Clinic receives WhatsApp/email with link to their pre-generated site
 * 2. They click "Claim" and provide their contact info
 * 3. We create their account, start trial, and give them access
 */

const claimSchema = z.object({
  clinicSlug: z.string().min(1, 'Clinic slug is required'),
  ownerName: z.string().min(2, 'Nombre es requerido'),
  ownerEmail: z.string().email('Email inválido'),
  ownerPhone: z.string().min(8, 'Teléfono es requerido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
})

interface ClaimResponse {
  success: boolean
  message: string
  clinicId?: string
  redirectUrl?: string
}

/**
 * GET /api/claim?slug=clinic-name
 * Check if a clinic is available to claim
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json(
      { available: false, message: 'Clinic slug is required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    const { data: clinic, error } = await supabase
      .from('tenants')
      .select('id, name, status, is_pregenerated, claimed_at, clinic_type, zone')
      .eq('id', slug)
      .single()

    if (error || !clinic) {
      return NextResponse.json({
        available: false,
        message: 'Clínica no encontrada',
      })
    }

    // Check if already claimed
    if (clinic.status === 'claimed' || clinic.status === 'active' || clinic.claimed_at) {
      return NextResponse.json({
        available: false,
        message: 'Esta clínica ya fue reclamada',
        clinic: {
          name: clinic.name,
          status: clinic.status,
        },
      })
    }

    // Available to claim
    return NextResponse.json({
      available: true,
      clinic: {
        name: clinic.name,
        type: clinic.clinic_type,
        zone: clinic.zone,
        isPregenerated: clinic.is_pregenerated,
      },
    })
  } catch (error) {
    logger.error('Error checking clinic availability', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return NextResponse.json(
      { available: false, message: 'Error al verificar disponibilidad' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/claim
 * Claim a pre-generated clinic website
 */
export async function POST(request: NextRequest): Promise<NextResponse<ClaimResponse>> {
  const supabase = await createClient()

  try {
    const body = await request.json()

    // Validate input
    const parseResult = claimSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.issues[0].message,
        },
        { status: 400 }
      )
    }

    const { clinicSlug, ownerName, ownerEmail, ownerPhone, password } = parseResult.data

    // Check if clinic exists and is available
    const { data: clinic, error: clinicError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', clinicSlug)
      .single()

    if (clinicError || !clinic) {
      return NextResponse.json(
        { success: false, message: 'Clínica no encontrada' },
        { status: 404 }
      )
    }

    // Check if already claimed
    if (clinic.status === 'claimed' || clinic.status === 'active' || clinic.claimed_at) {
      return NextResponse.json(
        { success: false, message: 'Esta clínica ya fue reclamada por otro usuario' },
        { status: 409 }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', ownerEmail)
      .single()

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Este email ya está registrado. Por favor iniciá sesión o usá otro email.',
        },
        { status: 409 }
      )
    }

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: ownerEmail,
      password: password,
      options: {
        data: {
          full_name: ownerName,
          phone: ownerPhone,
          tenant_id: clinicSlug,
          role: 'admin',
        },
      },
    })

    if (authError || !authData.user) {
      logger.error('Error creating user for claim', {
        clinicSlug,
        email: ownerEmail,
        error: authError?.message,
      })
      return NextResponse.json(
        { success: false, message: 'Error al crear cuenta. Intentá de nuevo.' },
        { status: 500 }
      )
    }

    // Calculate trial end date
    const trialEndDate = new Date()
    trialEndDate.setMonth(trialEndDate.getMonth() + trialConfig.freeMonths)

    // Update clinic to claimed status
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        status: 'claimed',
        claimed_at: new Date().toISOString(),
        claimed_by: authData.user.id,
        email: ownerEmail,
        phone: ownerPhone,
        plan: trialConfig.trialTier,
        plan_expires_at: trialEndDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', clinicSlug)

    if (updateError) {
      logger.error('Error updating clinic claim status', {
        clinicSlug,
        userId: authData.user.id,
        error: updateError.message,
      })
      // Don't fail the request, user is created
    }

    // Create profile for the owner
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      tenant_id: clinicSlug,
      email: ownerEmail,
      full_name: ownerName,
      phone: ownerPhone,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      logger.error('Error creating profile for claim', {
        clinicSlug,
        userId: authData.user.id,
        error: profileError.message,
      })
      // Don't fail - profile might be created by trigger
    }

    logger.info('Clinic claimed successfully', {
      clinicSlug,
      ownerEmail,
      userId: authData.user.id,
      trialEnds: trialEndDate.toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: '¡Felicitaciones! Tu clínica fue reclamada exitosamente.',
      clinicId: clinicSlug,
      redirectUrl: `/${clinicSlug}/dashboard`,
    })
  } catch (error) {
    logger.error('Claim error', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
