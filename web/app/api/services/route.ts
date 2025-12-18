import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/services - List services for a clinic
export async function GET(request: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');
  const category = searchParams.get('category');
  const active = searchParams.get('active') !== 'false'; // Default to active only

  if (!clinic) {
    return NextResponse.json({ error: 'Falta parámetro clinic' }, { status: 400 });
  }

  try {
    let query = supabase
      .from('services')
      .select('*')
      .eq('tenant_id', clinic)
      .order('category')
      .order('name');

    if (active) {
      query = query.eq('is_active', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: services, error } = await query;

    if (error) throw error;

    return NextResponse.json(services);
  } catch (e) {
    console.error('Error loading services:', e);
    return NextResponse.json({ error: 'Error al cargar servicios' }, { status: 500 });
  }
}

// POST /api/services - Create service (staff only)
export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo el personal puede crear servicios' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, description, category, base_price, duration_minutes, is_active } = body;

    if (!name || !category || base_price === undefined) {
      return NextResponse.json({ error: 'name, category y base_price son requeridos' }, { status: 400 });
    }

    const { data: service, error } = await supabase
      .from('services')
      .insert({
        tenant_id: profile.tenant_id,
        name,
        description,
        category,
        base_price,
        duration_minutes: duration_minutes || 30,
        is_active: is_active !== false
      })
      .select()
      .single();

    if (error) throw error;

    const { logAudit } = await import('@/lib/audit');
    await logAudit('CREATE_SERVICE', `services/${service.id}`, { name, category, base_price });

    return NextResponse.json(service, { status: 201 });
  } catch (e) {
    console.error('Error creating service:', e);
    return NextResponse.json({ error: 'Error al crear servicio' }, { status: 500 });
  }
}
