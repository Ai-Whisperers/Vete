import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

// GET /api/insurance/pre-authorizations - List pre-authorizations
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN);
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
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// POST /api/insurance/pre-authorizations - Create pre-authorization
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN);
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
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: { required: ['policy_id', 'pet_id', 'procedure_description', 'diagnosis', 'estimated_cost', 'clinical_justification'] }
      });
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
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { resource: 'policy' }
      });
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
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
