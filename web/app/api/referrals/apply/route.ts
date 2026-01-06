/**
 * Apply Referral Code API
 *
 * POST /api/referrals/apply - Apply a referral code to a new tenant signup
 *
 * Body:
 * - code: string - The referral code
 * - tenant_id: string - The new tenant's ID
 * - utm_source?: string
 * - utm_medium?: string
 * - utm_campaign?: string
 *
 * This endpoint is called after tenant creation to link the referral.
 * Should be called from the signup flow with service role.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for this endpoint
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { code, tenant_id, utm_source, utm_medium, utm_campaign } = body

    if (!code || !tenant_id) {
      return NextResponse.json(
        { error: 'Código y tenant_id son requeridos' },
        { status: 400 }
      )
    }

    // Use service role client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the tenant exists
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('id', tenant_id)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant no encontrado' },
        { status: 404 }
      )
    }

    // Apply the referral using the database function
    const { data: referralId, error: applyError } = await supabase.rpc(
      'process_referral_signup',
      {
        p_referral_code: code.toUpperCase(),
        p_new_tenant_id: tenant_id,
        p_utm_source: utm_source || null,
        p_utm_medium: utm_medium || null,
        p_utm_campaign: utm_campaign || null,
      }
    )

    if (applyError) {
      console.error('Error applying referral:', applyError)

      // Handle specific errors
      if (applyError.message.includes('Invalid or expired')) {
        return NextResponse.json(
          { error: 'Código de referido inválido o expirado' },
          { status: 400 }
        )
      }
      if (applyError.message.includes('already been referred')) {
        return NextResponse.json(
          { error: 'Esta clínica ya tiene un referido asociado' },
          { status: 400 }
        )
      }
      if (applyError.message.includes('Cannot refer yourself')) {
        return NextResponse.json(
          { error: 'No puedes referirte a ti mismo' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Error al aplicar código de referido' },
        { status: 500 }
      )
    }

    // Get the referral details
    const { data: referral } = await supabase
      .from('referrals')
      .select(`
        id,
        status,
        referred_trial_bonus_days,
        referred_points_amount,
        referrer_tenant:referrer_tenant_id (
          name
        )
      `)
      .eq('id', referralId)
      .single()

    const rawReferrerTenant = referral?.referrer_tenant
    const referrerData = (Array.isArray(rawReferrerTenant) ? rawReferrerTenant[0] : rawReferrerTenant) as { name: string } | null

    return NextResponse.json({
      success: true,
      referral_id: referralId,
      message: 'Código de referido aplicado exitosamente',
      benefits: {
        trial_bonus_days: referral?.referred_trial_bonus_days || 60,
        loyalty_points: referral?.referred_points_amount || 500,
        referrer_name: referrerData?.name,
      },
    })
  } catch (e) {
    console.error('Error in apply referral:', e)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
