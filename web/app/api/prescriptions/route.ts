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

  const { searchParams } = new URL(request.url);
  const petId = searchParams.get('pet_id');

  // Build query based on role
  let query = supabase
    .from('prescriptions')
    .select(`
      *,
      pet:pets!inner(id, name, owner_id, tenant_id),
      vet:profiles!vet_id(id, full_name)
    `)
    .order('created_at', { ascending: false });

  if (['vet', 'admin'].includes(profile.role)) {
    // Staff sees all clinic prescriptions
    query = query.eq('pet.tenant_id', profile.clinic_id);
  } else {
    // Owners see only their pets' prescriptions
    query = query.eq('pet.owner_id', user.id);
  }

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[API] prescriptions GET error:', error);
    return NextResponse.json({ error: 'Error al obtener recetas' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Apply rate limiting for write endpoints (20 requests per minute)
  const { rateLimit } = await import('@/lib/rate-limit');
  const rateLimitResult = await rateLimit(request, 'write', user.id);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  // Get user profile - only vets/admins can create prescriptions
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  if (!['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo veterinarios pueden crear recetas' }, { status: 403 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { pet_id, drugs, notes, signature_hash, qr_code_url } = body;

  // Validate required fields
  if (!pet_id || !drugs || drugs.length === 0) {
    return NextResponse.json({ error: 'pet_id y drugs son requeridos' }, { status: 400 });
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

  // Insert prescription with authenticated vet
  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      pet_id,
      vet_id: user.id, // Use authenticated user, not body param
      drugs,
      notes: notes || null,
      digital_signature_hash: signature_hash || null,
      qr_code_url: qr_code_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[API] prescriptions POST error:', error);
    return NextResponse.json({ error: 'Error al crear receta' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Apply rate limiting for write endpoints (20 requests per minute)
  const { rateLimit } = await import('@/lib/rate-limit');
  const rateLimitResult = await rateLimit(request, 'write', user.id);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  // Get user profile - only vets/admins can update
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo veterinarios pueden modificar recetas' }, { status: 403 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { id, drugs, notes, status } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
  }

  // Verify prescription belongs to staff's clinic
  const { data: existing } = await supabase
    .from('prescriptions')
    .select('id, pet:pets!inner(tenant_id)')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Receta no encontrada' }, { status: 404 });
  }

  const petData = Array.isArray(existing.pet) ? existing.pet[0] : existing.pet;
  const pet = petData as { tenant_id: string };
  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta receta' }, { status: 403 });
  }

  // Build update
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (drugs) updates.drugs = drugs;
  if (notes !== undefined) updates.notes = notes;
  if (status) updates.status = status;

  const { data, error } = await supabase
    .from('prescriptions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[API] prescriptions PUT error:', error);
    return NextResponse.json({ error: 'Error al actualizar receta' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Only admins can delete prescriptions
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden eliminar recetas' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
  }

  // Verify prescription belongs to admin's clinic
  const { data: existing } = await supabase
    .from('prescriptions')
    .select('id, pet:pets!inner(tenant_id)')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Receta no encontrada' }, { status: 404 });
  }

  const petData = Array.isArray(existing.pet) ? existing.pet[0] : existing.pet;
  const pet = petData as { tenant_id: string };
  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta receta' }, { status: 403 });
  }

  const { error } = await supabase
    .from('prescriptions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[API] prescriptions DELETE error:', error);
    return NextResponse.json({ error: 'Error al eliminar receta' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
