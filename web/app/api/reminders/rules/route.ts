import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

/**
 * GET /api/reminders/rules
 * Get reminder rules for the tenant
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    const { data, error } = await supabase
      .from('reminder_rules')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('type')
      .order('days_offset')

    if (error) throw error

    return NextResponse.json({ data: data || [] })
  } catch (e) {
    console.error('Error fetching reminder rules:', e)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

/**
 * POST /api/reminders/rules
 * Create a new reminder rule
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    const body = await request.json()
    const { name, type, days_offset, time_of_day, channels, conditions, is_active } = body

    if (!name || !type || days_offset === undefined) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: { required: ['name', 'type', 'days_offset'] },
      })
    }

    const { data, error } = await supabase
      .from('reminder_rules')
      .insert({
        tenant_id: profile.tenant_id,
        name,
        type,
        days_offset,
        time_of_day: time_of_day || '09:00:00',
        channels: channels || ['sms'],
        conditions: conditions || null,
        is_active: is_active ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (e) {
    console.error('Error creating reminder rule:', e)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

/**
 * PATCH /api/reminders/rules
 * Update a reminder rule
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { required: ['id'] } })
    }

    const { data, error } = await supabase
      .from('reminder_rules')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (e) {
    console.error('Error updating reminder rule:', e)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

/**
 * DELETE /api/reminders/rules
 * Delete a reminder rule
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { required: ['id'] } })
  }

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    const { error } = await supabase
      .from('reminder_rules')
      .delete()
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Error deleting reminder rule:', e)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
