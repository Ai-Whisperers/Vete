import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/insurance/policies - List insurance policies
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

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  const isStaff = ['vet', 'admin'].includes(profile.role);
  if (!isStaff) {
    return NextResponse.json({ error: 'Solo el personal puede ver pólizas' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const petId = searchParams.get('pet_id');
  const providerId = searchParams.get('provider_id');

  try {
    let query = supabase
      .from('pet_insurance_policies')
      .select(`
        *,
        pets(id, name, species, breed, owner_id),
        insurance_providers(id, name, code, logo_url, claims_email, claims_phone)
      `)
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (petId) {
      query = query.eq('pet_id', petId);
    }

    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    const { data: policies, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data: policies });
  } catch (e) {
    console.error('Error loading insurance policies:', e);
    return NextResponse.json({ error: 'Error al cargar pólizas' }, { status: 500 });
  }
}

// POST /api/insurance/policies - Create new policy
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
    return NextResponse.json({ error: 'Solo el personal puede crear pólizas' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      pet_id,
      provider_id,
      policy_number,
      group_number,
      member_id,
      policyholder_name,
      policyholder_phone,
      policyholder_email,
      policyholder_address,
      effective_date,
      expiration_date,
      plan_name,
      plan_type,
      annual_limit,
      per_incident_limit,
      lifetime_limit,
      deductible_amount,
      deductible_type,
      coinsurance_percentage,
      copay_amount,
      accident_waiting_period,
      illness_waiting_period,
      orthopedic_waiting_period,
      pre_existing_conditions,
      excluded_conditions,
      coverage_notes,
      status = 'active'
    } = body;

    if (!pet_id || !provider_id || !policy_number || !policyholder_name || !effective_date) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    // Verify pet belongs to clinic
    const { data: pet } = await supabase
      .from('pets')
      .select('id, tenant_id')
      .eq('id', pet_id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (!pet) {
      return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
    }

    // Verify provider exists
    const { data: provider } = await supabase
      .from('insurance_providers')
      .select('id')
      .eq('id', provider_id)
      .single();

    if (!provider) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    const { data: policy, error } = await supabase
      .from('pet_insurance_policies')
      .insert({
        tenant_id: profile.tenant_id,
        pet_id,
        provider_id,
        policy_number,
        group_number,
        member_id,
        policyholder_name,
        policyholder_phone,
        policyholder_email,
        policyholder_address,
        effective_date,
        expiration_date,
        plan_name,
        plan_type,
        annual_limit,
        per_incident_limit,
        lifetime_limit,
        deductible_amount,
        deductible_type,
        coinsurance_percentage,
        copay_amount,
        accident_waiting_period,
        illness_waiting_period,
        orthopedic_waiting_period,
        pre_existing_conditions,
        excluded_conditions,
        coverage_notes,
        status,
        verified_by: user.id,
        verified_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Audit log
    const { logAudit } = await import('@/lib/audit');
    await logAudit('CREATE_INSURANCE_POLICY', `pet_insurance_policies/${policy.id}`, {
      policy_number,
      pet_id,
      provider_id
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (e) {
    console.error('Error creating insurance policy:', e);
    return NextResponse.json({ error: 'Error al crear póliza' }, { status: 500 });
  }
}
