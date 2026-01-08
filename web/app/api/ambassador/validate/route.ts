/**
 * Ambassador Code Validation API
 *
 * GET /api/ambassador/validate?code=XXX - Validate an ambassador referral code
 *
 * Used during clinic signup to verify ambassador codes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.json(
      { valid: false, error: 'Código es requerido' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data: ambassador, error } = await supabase
    .from('ambassadors')
    .select('id, full_name, tier, status')
    .eq('referral_code', code.toUpperCase())
    .single()

  if (error || !ambassador) {
    return NextResponse.json({
      valid: false,
      error: 'Código no encontrado',
    })
  }

  if (ambassador.status !== 'active') {
    return NextResponse.json({
      valid: false,
      error: 'Este embajador no está activo',
    })
  }

  // Valid code
  return NextResponse.json({
    valid: true,
    ambassador: {
      name: ambassador.full_name,
      tier: ambassador.tier,
    },
    benefits: {
      trial_bonus_days: 60, // 2 extra months
      welcome_message: `Referido por ${ambassador.full_name} - Obtén 2 meses extra de prueba gratis!`,
    },
  })
}
