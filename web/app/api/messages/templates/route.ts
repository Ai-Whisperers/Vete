import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/messages/templates - List message templates
export async function GET(request: Request) {
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
    return NextResponse.json({ error: 'Solo el personal puede ver plantillas' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    let query = supabase
      .from('message_templates')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .eq('is_active', true)
      .order('category')
      .order('name');

    if (category) {
      query = query.eq('category', category);
    }

    const { data: templates, error } = await query;

    if (error) throw error;

    return NextResponse.json(templates);
  } catch (e) {
    console.error('Error loading templates:', e);
    return NextResponse.json({ error: 'Error al cargar plantillas' }, { status: 500 });
  }
}

// POST /api/messages/templates - Create template
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

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden crear plantillas' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, category, subject, content, variables } = body;

    if (!name || !category || !content) {
      return NextResponse.json({ error: 'name, category y content son requeridos' }, { status: 400 });
    }

    const { data: template, error } = await supabase
      .from('message_templates')
      .insert({
        tenant_id: profile.tenant_id,
        name,
        category,
        subject,
        content,
        variables: variables || [],
        is_active: true,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(template, { status: 201 });
  } catch (e) {
    console.error('Error creating template:', e);
    return NextResponse.json({ error: 'Error al crear plantilla' }, { status: 500 });
  }
}
