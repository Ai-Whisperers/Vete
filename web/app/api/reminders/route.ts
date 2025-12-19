import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/reminders
 * Get pending and recent reminders for the tenant
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '50');

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Staff check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo personal puede ver recordatorios' }, { status: 403 });
  }

  try {
    let query = supabase
      .from('reminders')
      .select(`
        id, type, reference_type, reference_id, scheduled_at,
        status, attempts, error_message, created_at,
        client:profiles!reminders_client_id_fkey(id, full_name, email, phone),
        pet:pets(id, name)
      `)
      .eq('tenant_id', profile.tenant_id)
      .order('scheduled_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (e) {
    console.error('Error fetching reminders:', e);
    return NextResponse.json({ error: 'Error al cargar recordatorios' }, { status: 500 });
  }
}

/**
 * POST /api/reminders
 * Create a manual reminder
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Staff check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo personal puede crear recordatorios' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      client_id,
      pet_id,
      type,
      scheduled_at,
      custom_subject,
      custom_body
    } = body;

    if (!client_id || !type || !scheduled_at) {
      return NextResponse.json({
        error: 'client_id, type y scheduled_at son requeridos'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        tenant_id: profile.tenant_id,
        client_id,
        pet_id: pet_id || null,
        type,
        scheduled_at,
        custom_subject: custom_subject || null,
        custom_body: custom_body || null,
        status: 'pending'
      })
      .select(`
        id, type, scheduled_at, status,
        client:profiles!reminders_client_id_fkey(id, full_name),
        pet:pets(id, name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    console.error('Error creating reminder:', e);
    return NextResponse.json({ error: 'Error al crear recordatorio' }, { status: 500 });
  }
}
