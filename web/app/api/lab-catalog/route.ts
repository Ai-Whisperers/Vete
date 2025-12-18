import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const includeInactive = searchParams.get('include_inactive') === 'true';

  // Build query for test catalog
  let query = supabase
    .from('lab_test_catalog')
    .select('*')
    .order('category')
    .order('name');

  if (!includeInactive) {
    query = query.eq('active', true);
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data: tests, error: testsError } = await query;

  if (testsError) {
    console.error('[API] lab_test_catalog GET error:', testsError);
    return NextResponse.json({ error: 'Error al obtener catálogo' }, { status: 500 });
  }

  // Fetch panels
  let panelsQuery = supabase
    .from('lab_test_panels')
    .select(`
      id,
      name,
      description,
      category,
      lab_test_panel_items(
        test_id,
        lab_test_catalog(id, code, name)
      )
    `)
    .order('category')
    .order('name');

  if (!includeInactive) {
    panelsQuery = panelsQuery.eq('active', true);
  }

  if (category) {
    panelsQuery = panelsQuery.eq('category', category);
  }

  const { data: panels, error: panelsError } = await panelsQuery;

  if (panelsError) {
    console.error('[API] lab_test_panels GET error:', panelsError);
    return NextResponse.json({ error: 'Error al obtener paneles' }, { status: 500 });
  }

  return NextResponse.json({ tests, panels });
}
