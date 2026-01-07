/**
 * POST /api/signup
 *
 * Main clinic self-service signup endpoint.
 * Creates tenant, admin user, and content files atomically.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { signupRequestSchema, generateSlugSuggestion } from '@/lib/signup/schema'
import { RESERVED_SLUGS, TRIAL_CONFIG } from '@/lib/signup/types'
import type { SignupResponse, SignupErrorResponse, SignupErrorCode } from '@/lib/signup/types'
import { generateAllContent, deleteClinicContent } from '@/lib/signup/content-generator'
import { addDays, format } from 'date-fns'
import { createRequestLogger, auditLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// Rate limiting
const signupAttempts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5 // signups per hour per IP
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = signupAttempts.get(ip)

  if (!record || record.resetAt < now) {
    signupAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

function errorResponse(
  code: SignupErrorCode,
  message: string,
  field?: string,
  status: number = 400
): NextResponse<SignupErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      field,
    },
    { status }
  )
}

export async function POST(request: NextRequest): Promise<NextResponse<SignupResponse | SignupErrorResponse>> {
  // Create request-scoped logger
  const clientIp = getClientIp(request)
  const log = createRequestLogger(request, { ip: clientIp })

  // Rate limiting
  if (!checkRateLimit(clientIp)) {
    log.warn('Signup rate limit exceeded', {
      action: 'signup.rate_limited',
      ip: clientIp,
    })
    return errorResponse('RATE_LIMITED', 'Demasiados intentos. Por favor espera antes de intentar nuevamente.', undefined, 429)
  }

  let createdTenantId: string | null = null
  let createdUserId: string | null = null

  try {
    // Parse and validate request body
    const body = await request.json()
    const parseResult = signupRequestSchema.safeParse(body)

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]
      return errorResponse(
        'VALIDATION_ERROR',
        firstError.message,
        firstError.path.join('.')
      )
    }

    const data = parseResult.data

    // Use service client for admin operations
    const supabaseService = await createClient('service_role')

    // =========================================================================
    // STEP 1: Check slug availability
    // =========================================================================

    // Check reserved words
    if (RESERVED_SLUGS.includes(data.slug as typeof RESERVED_SLUGS[number])) {
      const suggestion = generateSlugSuggestion(data.slug, [])
      return errorResponse('RESERVED_SLUG', `El slug "${data.slug}" esta reservado. Prueba: ${suggestion}`, 'slug')
    }

    // Check database
    const { data: existingTenant } = await supabaseService
      .from('tenants')
      .select('id')
      .eq('id', data.slug)
      .maybeSingle()

    if (existingTenant) {
      const { data: existingSlugs } = await supabaseService
        .from('tenants')
        .select('id')
        .like('id', `${data.slug}%`)

      const slugList = existingSlugs?.map((t) => t.id) || []
      const suggestion = generateSlugSuggestion(data.slug, slugList)
      return errorResponse('SLUG_TAKEN', `El slug "${data.slug}" ya esta en uso. Prueba: ${suggestion}`, 'slug')
    }

    // =========================================================================
    // STEP 2: Check if admin email is already registered
    // =========================================================================

    // Check for existing user with this email by listing and filtering
    const { data: listResult } = await supabaseService.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    const existingUser = listResult?.users?.find(
      (u) => u.email?.toLowerCase() === data.adminEmail.toLowerCase()
    )

    if (existingUser) {
      return errorResponse('EMAIL_EXISTS', 'Este email ya esta registrado. Por favor usa otro o inicia sesion.', 'adminEmail')
    }

    // =========================================================================
    // STEP 3: Create tenant record
    // =========================================================================

    const trialStartDate = new Date()
    const trialEndDate = addDays(trialStartDate, TRIAL_CONFIG.durationDays)

    const tenantData = {
      id: data.slug,
      name: data.clinicName,
      legal_name: data.clinicName,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      address: data.address,
      city: data.city,
      country: 'Paraguay',
      ruc: data.ruc,
      logo_url: data.logoUrl,
      settings: {
        currency: 'PYG',
        timezone: 'America/Asuncion',
        locale: 'es-PY',
      },
      features_enabled: TRIAL_CONFIG.features,
      subscription_tier: TRIAL_CONFIG.tier,
      is_trial: true,
      trial_start_date: format(trialStartDate, 'yyyy-MM-dd'),
      trial_end_date: format(trialEndDate, 'yyyy-MM-dd'),
      billing_cycle: 'monthly' as const,
      is_active: true,
    }

    const { error: tenantError } = await supabaseService
      .from('tenants')
      .insert(tenantData)

    if (tenantError) {
      log.error('Error creating tenant', {
        action: 'signup.tenant_create_failed',
        slug: data.slug,
        error: tenantError,
      })
      return errorResponse('DB_ERROR', 'Error al crear la clinica. Por favor intenta nuevamente.', undefined, 500)
    }

    createdTenantId = data.slug

    // =========================================================================
    // STEP 4: Create clinic invite for admin (so trigger assigns tenant/role)
    // =========================================================================

    const { error: inviteError } = await supabaseService
      .from('clinic_invites')
      .insert({
        email: data.adminEmail,
        tenant_id: data.slug,
        role: 'admin',
        status: 'pending',
        expires_at: addDays(new Date(), 7).toISOString(), // 7 days to complete signup
      })

    if (inviteError) {
      log.warn('Error creating invite', {
        action: 'signup.invite_create_failed',
        slug: data.slug,
        email: data.adminEmail,
        error: inviteError,
      })
      // Continue anyway - profile will be created with default role
    }

    // =========================================================================
    // STEP 5: Create admin user via Supabase Auth
    // =========================================================================

    const { data: newUser, error: authError } = await supabaseService.auth.admin.createUser({
      email: data.adminEmail,
      password: data.adminPassword,
      email_confirm: true, // Auto-confirm for smooth onboarding
      user_metadata: {
        full_name: data.adminFullName,
      },
    })

    if (authError || !newUser.user) {
      log.error('Error creating auth user', {
        action: 'signup.auth_create_failed',
        slug: data.slug,
        email: data.adminEmail,
        error: authError,
      })

      // Cleanup tenant
      await supabaseService.from('tenants').delete().eq('id', data.slug)
      createdTenantId = null

      if (authError?.message?.includes('already registered')) {
        return errorResponse('EMAIL_EXISTS', 'Este email ya esta registrado.', 'adminEmail')
      }

      return errorResponse('AUTH_ERROR', 'Error al crear la cuenta. Por favor intenta nuevamente.', undefined, 500)
    }

    createdUserId = newUser.user.id

    // =========================================================================
    // STEP 6: Ensure profile exists with correct tenant (failsafe)
    // =========================================================================

    // The trigger should have created the profile, but let's ensure it has the right tenant
    const { error: profileError } = await supabaseService
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        email: data.adminEmail,
        full_name: data.adminFullName,
        tenant_id: data.slug,
        role: 'admin',
      }, {
        onConflict: 'id',
      })

    if (profileError) {
      log.warn('Error upserting profile', {
        action: 'signup.profile_upsert_failed',
        slug: data.slug,
        userId: newUser.user.id,
        error: profileError,
      })
      // Non-fatal - profile should exist from trigger
    }

    // =========================================================================
    // STEP 7: Generate JSON content files
    // =========================================================================

    try {
      await generateAllContent({
        slug: data.slug,
        clinicName: data.clinicName,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp,
        address: data.address,
        city: data.city,
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
      })
    } catch (contentError) {
      log.warn('Error generating content files', {
        action: 'signup.content_generation_failed',
        slug: data.slug,
        error: contentError instanceof Error ? contentError : new Error(String(contentError)),
      })
      // Non-fatal - clinic can still operate, content can be regenerated
    }

    // =========================================================================
    // SUCCESS
    // =========================================================================

    // Log successful signup with audit logger
    auditLogger.auth('signup', {
      email: data.adminEmail,
      tenant: data.slug,
      ip: clientIp,
      success: true,
    })

    log.info('Clinic signup completed successfully', {
      action: 'signup.success',
      tenant: data.slug,
      userId: newUser.user.id,
    })

    return NextResponse.json({
      success: true,
      tenantId: data.slug,
      redirectUrl: `/${data.slug}/dashboard`,
      message: `¡Bienvenido a Vetic! Tu clinica "${data.clinicName}" ha sido creada.`,
    })
  } catch (error) {
    log.error('Unexpected signup error', {
      action: 'signup.unexpected_error',
      error: error instanceof Error ? error : new Error(String(error)),
    })

    // Cleanup on unexpected error
    if (createdTenantId || createdUserId) {
      try {
        const supabaseService = await createClient('service_role')

        if (createdUserId) {
          await supabaseService.auth.admin.deleteUser(createdUserId)
        }

        if (createdTenantId) {
          await supabaseService.from('tenants').delete().eq('id', createdTenantId)
          await deleteClinicContent(createdTenantId)
        }
      } catch (cleanupError) {
        log.error('Cleanup error during rollback', {
          action: 'signup.cleanup_failed',
          error: cleanupError instanceof Error ? cleanupError : new Error(String(cleanupError)),
        })
      }
    }

    return errorResponse('DB_ERROR', 'Error inesperado. Por favor intenta nuevamente.', undefined, 500)
  }
}
