import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

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

  const { searchParams } = new URL(request.url);
  const petId = searchParams.get('pet_id');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Build query
  let query = supabase
    .from('lab_orders')
    .select(`
      *,
      pets!inner(id, name, species)
    `, { count: 'exact' })
    .eq('tenant_id', profile.clinic_id)
    .order('ordered_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[API] lab_orders GET error:', error);
    return NextResponse.json({ error: 'Error al obtener órdenes' }, { status: 500 });
  }

  return NextResponse.json({ data, count });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile - only vets/admins can create orders
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  if (!['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo veterinarios pueden crear órdenes' }, { status: 403 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const {
    pet_id,
    test_ids,
    panel_ids,
    priority,
    lab_type,
    fasting_status,
    clinical_notes
  } = body;

  // Validate required fields
  if (!pet_id || !test_ids || test_ids.length === 0) {
    return NextResponse.json(
      { error: 'pet_id y test_ids son requeridos' },
      { status: 400 }
    );
  }

  // Verify pet belongs to staff's clinic
  const { data: pet } = await supabase
    .from('pets')
    .select('id, tenant_id')
    .eq('id', pet_id)
    .single();

  if (!pet) {
    return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
  }

  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta mascota' }, { status: 403 });
  }

  // Generate order number (format: LAB-YYYYMMDD-XXXX)
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const { count } = await supabase
    .from('lab_orders')
    .select('id', { count: 'exact', head: true })
    .like('order_number', `LAB-${today}-%`);

  const orderNumber = `LAB-${today}-${String((count || 0) + 1).padStart(4, '0')}`;

  // Insert lab order
  const { data: order, error: orderError } = await supabase
    .from('lab_orders')
    .insert({
      tenant_id: profile.clinic_id,
      pet_id,
      order_number: orderNumber,
      ordered_by: user.id,
      ordered_at: new Date().toISOString(),
      status: 'ordered',
      priority: priority || 'routine',
      lab_type: lab_type || 'in_house',
      fasting_status: fasting_status || null,
      clinical_notes: clinical_notes || null,
      has_critical_values: false
    })
    .select()
    .single();

  if (orderError) {
    console.error('[API] lab_orders POST error:', orderError);
    return NextResponse.json({ error: 'Error al crear orden' }, { status: 500 });
  }

  // Insert order items for each test
  const orderItems = test_ids.map((testId: string) => ({
    order_id: order.id,
    test_id: testId
  }));

  const { error: itemsError } = await supabase
    .from('lab_order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('[API] lab_order_items POST error:', itemsError);
    // Rollback order creation
    await supabase.from('lab_orders').delete().eq('id', order.id);
    return NextResponse.json({ error: 'Error al crear ítems de orden' }, { status: 500 });
  }

  // If panel_ids provided, insert them as well
  if (panel_ids && panel_ids.length > 0) {
    const panelItems = panel_ids.map((panelId: string) => ({
      order_id: order.id,
      panel_id: panelId
    }));

    await supabase.from('lab_order_panels').insert(panelItems);
  }

  return NextResponse.json(order, { status: 201 });
}
