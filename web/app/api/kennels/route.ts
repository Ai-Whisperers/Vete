import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
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

  // Only staff can view kennels
  if (!['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo el personal puede ver jaulas' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const kennelType = searchParams.get('kennel_type');
  const location = searchParams.get('location');

  // Build query
  let query = supabase
    .from('kennels')
    .select(`
      *,
      current_occupant:hospitalizations!hospitalizations_kennel_id_fkey(
        id,
        hospitalization_number,
        pet:pets(id, name, species, breed)
      )
    `)
    .eq('tenant_id', profile.clinic_id)
    .order('location')
    .order('kennel_number');

  // Apply filters
  if (status) {
    query = query.eq('kennel_status', status);
  }
  if (kennelType) {
    query = query.eq('kennel_type', kennelType);
  }
  if (location) {
    query = query.eq('location', location);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[API] kennels GET error:', error);
    return NextResponse.json({ error: 'Error al obtener jaulas' }, { status: 500 });
  }

  return NextResponse.json(data);
}
