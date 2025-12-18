import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/insurance/providers - List insurance providers
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('active_only') === 'true';

  try {
    let query = supabase
      .from('insurance_providers')
      .select('*')
      .order('name', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: providers, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data: providers });
  } catch (e) {
    console.error('Error loading insurance providers:', e);
    return NextResponse.json({ error: 'Error al cargar proveedores' }, { status: 500 });
  }
}
