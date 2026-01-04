import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

/**
 * GET /api/dashboard/alert-preferences
 * Get current user's alert preferences
 */
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'vet'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN, {
      details: { message: 'Solo staff puede configurar alertas' },
    })
  }

  try {
    // Get user's preferences
    let { data: preferences } = await supabase
      .from('staff_alert_preferences')
      .select('*')
      .eq('profile_id', user.id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    // If no preferences exist, return defaults
    if (!preferences) {
      preferences = {
        id: null,
        profile_id: user.id,
        tenant_id: profile.tenant_id,
        low_stock_alerts: true,
        expiry_alerts: true,
        out_of_stock_alerts: true,
        email_enabled: true,
        whatsapp_enabled: false,
        in_app_enabled: true,
        low_stock_threshold: 5,
        expiry_days_warning: 30,
        notification_email: null,
        notification_phone: null,
        digest_frequency: 'immediate',
        last_digest_sent_at: null,
      }
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Error fetching alert preferences:', error)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

/**
 * POST /api/dashboard/alert-preferences
 * Create or update alert preferences
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'vet'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN, {
      details: { message: 'Solo staff puede configurar alertas' },
    })
  }

  try {
    const body = await request.json()

    const preferences = {
      profile_id: user.id,
      tenant_id: profile.tenant_id,
      low_stock_alerts: body.low_stock_alerts ?? true,
      expiry_alerts: body.expiry_alerts ?? true,
      out_of_stock_alerts: body.out_of_stock_alerts ?? true,
      email_enabled: body.email_enabled ?? true,
      whatsapp_enabled: body.whatsapp_enabled ?? false,
      in_app_enabled: body.in_app_enabled ?? true,
      low_stock_threshold: body.low_stock_threshold ?? 5,
      expiry_days_warning: body.expiry_days_warning ?? 30,
      notification_email: body.notification_email || null,
      notification_phone: body.notification_phone || null,
      digest_frequency: body.digest_frequency || 'immediate',
    }

    // Validate digest_frequency
    if (!['immediate', 'daily', 'weekly'].includes(preferences.digest_frequency)) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'Frecuencia de resumen inválida' },
      })
    }

    // Upsert preferences
    const { data, error } = await supabase
      .from('staff_alert_preferences')
      .upsert(preferences, {
        onConflict: 'profile_id,tenant_id',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      preferences: data,
      message: 'Preferencias guardadas correctamente',
    })
  } catch (error) {
    console.error('Error saving alert preferences:', error)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

/**
 * DELETE /api/dashboard/alert-preferences
 * Delete alert preferences (reset to defaults)
 */
export async function DELETE(): Promise<NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
  }

  try {
    await supabase
      .from('staff_alert_preferences')
      .delete()
      .eq('profile_id', user.id)
      .eq('tenant_id', profile.tenant_id)

    return NextResponse.json({
      success: true,
      message: 'Preferencias restablecidas a valores predeterminados',
    })
  } catch (error) {
    console.error('Error deleting alert preferences:', error)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
