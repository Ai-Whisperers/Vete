/**
 * Referral Code API
 *
 * GET /api/referrals/code - Get tenant's referral code (creates one if doesn't exist)
 * POST /api/referrals/code - Create a new referral code (deactivates old one)
 */

import { NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth/api-wrapper'

export const GET = withApiAuth(
  async ({ profile, supabase }: ApiHandlerContext): Promise<NextResponse> => {
    // Ensure referral code exists (creates if not)
    const { data: codeId, error: ensureError } = await supabase
      .rpc('ensure_referral_code', { p_tenant_id: profile.tenant_id })

    if (ensureError) {
      console.error('Error ensuring referral code:', ensureError)
      return NextResponse.json({ error: 'Error al obtener código de referido' }, { status: 500 })
    }

    // Get the code details
    const { data: code, error: codeError } = await supabase
      .from('referral_codes')
      .select(`
        id,
        code,
        is_active,
        times_used,
        max_uses,
        referrer_discount_percent,
        referred_trial_bonus_days,
        referrer_loyalty_points,
        referred_loyalty_points,
        created_at,
        expires_at
      `)
      .eq('id', codeId)
      .single()

    if (codeError || !code) {
      return NextResponse.json({ error: 'Código no encontrado' }, { status: 404 })
    }

    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://Vetic.com'
    const shareUrl = `${baseUrl}/signup?ref=${code.code}`

    return NextResponse.json({
      ...code,
      share_url: shareUrl,
      share_message: `¡Únete a Vetic usando mi código ${code.code} y obtén ${code.referred_trial_bonus_days} días extra de prueba! ${shareUrl}`,
    })
  }
)

export const POST = withApiAuth(
  async ({ profile, supabase }: ApiHandlerContext): Promise<NextResponse> => {
    // Deactivate existing codes
    await supabase
      .from('referral_codes')
      .update({ is_active: false })
      .eq('tenant_id', profile.tenant_id)
      .eq('is_active', true)

    // Generate new code
    const { data: newCode, error: genError } = await supabase
      .rpc('generate_referral_code', { p_tenant_id: profile.tenant_id })

    if (genError) {
      console.error('Error generating code:', genError)
      return NextResponse.json({ error: 'Error al generar código' }, { status: 500 })
    }

    // Create new code record
    const { data: code, error: createError } = await supabase
      .from('referral_codes')
      .insert({
        tenant_id: profile.tenant_id,
        code: newCode,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating code:', createError)
      return NextResponse.json({ error: 'Error al crear código' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://Vetic.com'
    const shareUrl = `${baseUrl}/signup?ref=${code.code}`

    return NextResponse.json({
      ...code,
      share_url: shareUrl,
      share_message: `¡Únete a Vetic usando mi código ${code.code}! ${shareUrl}`,
    })
  },
  { roles: ['admin'] }
)
