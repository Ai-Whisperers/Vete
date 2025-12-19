import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/lost-pets - Get all lost pet reports for clinic
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo el personal puede ver reportes' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    let query = supabase
      .from('lost_pets')
      .select(`
        *,
        pet:pets!inner(
          id, name, species, breed, photo_url, tenant_id,
          owner:profiles!pets_owner_id_fkey(id, full_name, phone, email)
        ),
        reported_by_user:profiles!lost_pets_reported_by_fkey(full_name),
        resolved_by_user:profiles!lost_pets_resolved_by_fkey(full_name)
      `)
      .eq('pet.tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reports, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data: reports || [] });
  } catch (e) {
    console.error('Error fetching lost pets:', e);
    return NextResponse.json({ error: 'Error al cargar reportes' }, { status: 500 });
  }
}

// PATCH /api/lost-pets - Update lost pet report
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo el personal puede actualizar reportes' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Verify report belongs to clinic's pet
    const { data: existing } = await supabase
      .from('lost_pets')
      .select('id, pet:pets!inner(tenant_id)')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
    }

    const petData = Array.isArray(existing.pet) ? existing.pet[0] : existing.pet;
    if (petData.tenant_id !== profile.tenant_id) {
      return NextResponse.json({ error: 'No tienes acceso a este reporte' }, { status: 403 });
    }

    // Build update
    const updates: Record<string, unknown> = {};
    if (status) {
      updates.status = status;
      if (status === 'reunited') {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = user.id;
      }
    }
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from('lost_pets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Notify owner when pet is found or reunited
    if (status === 'found' || status === 'reunited') {
      const { data: reportData } = await supabase
        .from('lost_pets')
        .select('pet:pets!inner(id, name, owner_id)')
        .eq('id', id)
        .single();

      if (reportData) {
        const pet = Array.isArray(reportData.pet) ? reportData.pet[0] : reportData.pet;
        await supabase.from('notifications').insert({
          user_id: pet.owner_id,
          title: status === 'reunited' ? '🎉 ¡Tu mascota está reunida!' : '📍 ¡Tu mascota fue encontrada!',
          message: status === 'reunited'
            ? `${pet.name} ha sido marcado como reunido con su familia.`
            : `Alguien reportó haber encontrado a ${pet.name}. Revisa los detalles.`,
          type: 'lost_pet',
          link: `/portal/pets/${pet.id}`,
          data: { lost_pet_id: id, status }
        });
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('Error updating lost pet:', e);
    return NextResponse.json({ error: 'Error al actualizar reporte' }, { status: 500 });
  }
}
