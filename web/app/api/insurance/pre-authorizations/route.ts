import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/insurance/pre-authorizations - List pre-authorizations
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo el personal puede ver pre-autorizaciones' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const petId = searchParams.get('pet_id');

  try {
    let query = supabase
      .from('insurance_pre_authorizations')
      .select(`
        *,
        pets(id, name, species),
        pet_insurance_policies(
          id, policy_number,
          insurance_providers(id, name, logo_url)
        )
      `)
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (petId) {
      query = query.eq('pet_id', petId);
    }

    const { data: preAuths, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data: preAuths });
  } catch (e) {
    console.error('Error loading pre-authorizations:', e);
    return NextResponse.json({ error: 'Error al cargar pre-autorizaciones' }, { status: 500 });
  }
}

// POST /api/insurance/pre-authorizations - Create pre-authorization
export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: 'Solo el personal puede crear pre-autorizaciones' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      policy_id,
      pet_id,
      procedure_description,
      procedure_code,
      diagnosis,
      estimated_cost,
      planned_date,
      clinical_justification,
      status = 'draft'
    } = body;

    if (!policy_id || !pet_id || !procedure_description || !diagnosis || !estimated_cost || !clinical_justification) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    // Verify policy belongs to clinic and pet
    const { data: policy } = await supabase
      .from('pet_insurance_policies')
      .select('id, tenant_id, pet_id')
      .eq('id', policy_id)
      .eq('tenant_id', profile.tenant_id)
      .eq('pet_id', pet_id)
      .single();

    if (!policy) {
      return NextResponse.json({ error: 'Póliza no encontrada o no válida' }, { status: 404 });
    }

    const { data: preAuth, error } = await supabase
      .from('insurance_pre_authorizations')
      .insert({
        tenant_id: profile.tenant_id,
        policy_id,
        pet_id,
        procedure_description,
        procedure_code,
        diagnosis,
        estimated_cost,
        planned_date,
        clinical_justification,
        status,
        requested_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Audit log
    const { logAudit } = await import('@/lib/audit');
    await logAudit('CREATE_PRE_AUTHORIZATION', `insurance_pre_authorizations/${preAuth.id}`, {
      policy_id,
      estimated_cost
    });

    return NextResponse.json(preAuth, { status: 201 });
  } catch (e) {
    console.error('Error creating pre-authorization:', e);
    return NextResponse.json({ error: 'Error al crear pre-autorización' }, { status: 500 });
  }
}
