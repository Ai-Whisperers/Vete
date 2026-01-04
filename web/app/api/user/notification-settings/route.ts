import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/user/notification-settings
 * Get user's notification preferences
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Get clinic from query param
  const { searchParams } = new URL(request.url)
  const clinic = searchParams.get('clinic')

  // Get user's communication preferences
  const { data: prefs, error } = await supabase
    .from('communication_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Error al cargar preferencias' }, { status: 500 })
  }

  // Map to UI format (defaults if no record exists)
  const settings = {
    email_vaccine_reminders: prefs?.allow_vaccine_reminders ?? true,
    email_appointment_reminders: prefs?.allow_appointment_reminders ?? true,
    email_promotions: prefs?.allow_marketing ?? false,
    sms_vaccine_reminders: prefs?.allow_sms ?? false,
    sms_appointment_reminders: prefs?.allow_sms ?? true,
    whatsapp_enabled: prefs?.allow_whatsapp ?? true,
  }

  return NextResponse.json(settings)
}

/**
 * POST /api/user/notification-settings
 * Update user's notification preferences
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { clinic, settings } = body

  if (!settings) {
    return NextResponse.json({ error: 'Faltan configuraciones' }, { status: 400 })
  }

  // Get user's tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  // Map from UI format to DB format
  const prefsData = {
    user_id: user.id,
    tenant_id: profile?.tenant_id || null,
    allow_email: settings.email_vaccine_reminders || settings.email_appointment_reminders,
    allow_sms: settings.sms_vaccine_reminders || settings.sms_appointment_reminders,
    allow_whatsapp: settings.whatsapp_enabled,
    allow_appointment_reminders: settings.email_appointment_reminders || settings.sms_appointment_reminders,
    allow_vaccine_reminders: settings.email_vaccine_reminders || settings.sms_vaccine_reminders,
    allow_marketing: settings.email_promotions,
    updated_at: new Date().toISOString(),
  }

  // Upsert preferences
  const { error } = await supabase.from('communication_preferences').upsert(prefsData, {
    onConflict: 'user_id,tenant_id',
  })

  if (error) {
    console.error('Error saving notification settings:', error)
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
