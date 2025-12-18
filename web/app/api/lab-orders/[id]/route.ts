import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const supabase = await createClient();
  const { id } = await params;

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  // Only staff can view lab orders
  if (!['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  // Fetch order with all related data
  const { data: order, error } = await supabase
    .from('lab_orders')
    .select(`
      *,
      pets!inner(id, name, species, breed, date_of_birth, tenant_id),
      profiles!ordered_by(full_name),
      lab_order_items(
        id,
        test_id,
        lab_test_catalog(id, code, name, unit, result_type),
        lab_results(id, value_numeric, value_text, flag, verified_at, verified_by, result_date)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('[API] lab_orders GET by id error:', error);
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
  }

  // Verify order belongs to staff's clinic
  const pet = Array.isArray(order.pets) ? order.pets[0] : order.pets;
  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta orden' }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const supabase = await createClient();
  const { id } = await params;

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile - only vets/admins can update
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo veterinarios pueden modificar órdenes' }, { status: 403 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { status, has_critical_values, specimen_collected_at, completed_at } = body;

  // Verify order belongs to staff's clinic
  const { data: existing } = await supabase
    .from('lab_orders')
    .select('id, pets!inner(tenant_id)')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
  }

  const pet = Array.isArray(existing.pets) ? existing.pets[0] : existing.pets;
  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta orden' }, { status: 403 });
  }

  // Build update
  const updates: Record<string, unknown> = {};
  if (status) {
    updates.status = status;
    if (status === 'specimen_collected' && !specimen_collected_at) {
      updates.specimen_collected_at = new Date().toISOString();
    }
    if (status === 'completed' && !completed_at) {
      updates.completed_at = new Date().toISOString();
    }
  }
  if (has_critical_values !== undefined) updates.has_critical_values = has_critical_values;
  if (specimen_collected_at) updates.specimen_collected_at = specimen_collected_at;
  if (completed_at) updates.completed_at = completed_at;

  const { data, error } = await supabase
    .from('lab_orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[API] lab_orders PATCH error:', error);
    return NextResponse.json({ error: 'Error al actualizar orden' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const supabase = await createClient();
  const { id } = await params;

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Only admins can delete lab orders
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden eliminar órdenes' }, { status: 403 });
  }

  // Verify order belongs to admin's clinic
  const { data: existing } = await supabase
    .from('lab_orders')
    .select('id, pets!inner(tenant_id)')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
  }

  const pet = Array.isArray(existing.pets) ? existing.pets[0] : existing.pets;
  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta orden' }, { status: 403 });
  }

  // Delete order (cascade should handle order items)
  const { error } = await supabase
    .from('lab_orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[API] lab_orders DELETE error:', error);
    return NextResponse.json({ error: 'Error al eliminar orden' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
