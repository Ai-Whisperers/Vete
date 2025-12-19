import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/reminders/rules
 * Get reminder rules for the tenant
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden ver reglas' }, { status: 403 });
  }

  try {
    const { data, error } = await supabase
      .from('reminder_rules')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('type')
      .order('days_offset');

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (e) {
    console.error('Error fetching reminder rules:', e);
    return NextResponse.json({ error: 'Error al cargar reglas' }, { status: 500 });
  }
}

/**
 * POST /api/reminders/rules
 * Create a new reminder rule
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden crear reglas' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, type, days_offset, time_of_day, channels, conditions, is_active } = body;

    if (!name || !type || days_offset === undefined) {
      return NextResponse.json({ error: 'name, type y days_offset son requeridos' }, { status: 400 });
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
        is_active: is_active ?? true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    console.error('Error creating reminder rule:', e);
    return NextResponse.json({ error: 'Error al crear regla' }, { status: 500 });
  }
}

/**
 * PATCH /api/reminders/rules
 * Update a reminder rule
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden editar reglas' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reminder_rules')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (e) {
    console.error('Error updating reminder rule:', e);
    return NextResponse.json({ error: 'Error al actualizar regla' }, { status: 500 });
  }
}

/**
 * DELETE /api/reminders/rules
 * Delete a reminder rule
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
  }

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden eliminar reglas' }, { status: 403 });
  }

  try {
    const { error } = await supabase
      .from('reminder_rules')
      .delete()
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error deleting reminder rule:', e);
    return NextResponse.json({ error: 'Error al eliminar regla' }, { status: 500 });
  }
}
