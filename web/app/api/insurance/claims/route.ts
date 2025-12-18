import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface ClaimItem {
  service_date?: string;
  service_code?: string;
  description: string;
  quantity: number;
  unit_price: number;
  invoice_item_id?: string;
  service_id?: string;
}

// GET /api/insurance/claims - List insurance claims
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
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  // Only staff can access insurance claims
  const isStaff = ['vet', 'admin'].includes(profile.role);
  if (!isStaff) {
    return NextResponse.json({ error: 'Solo el personal puede ver reclamos' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const petId = searchParams.get('pet_id');
  const policyId = searchParams.get('policy_id');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('insurance_claims')
      .select(`
        *,
        pets(id, name, species),
        pet_insurance_policies(
          id, policy_number, plan_name,
          insurance_providers(id, name, logo_url)
        ),
        insurance_claim_items(id, description, total_price, approved_amount),
        insurance_eob(id, paid_amount)
      `, { count: 'exact' })
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (petId) {
      query = query.eq('pet_id', petId);
    }

    if (policyId) {
      query = query.eq('policy_id', policyId);
    }

    if (search) {
      query = query.or(`claim_number.ilike.%${search}%,provider_claim_number.ilike.%${search}%,diagnosis.ilike.%${search}%`);
    }

    const { data: claims, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: claims,
      total: count || 0,
      page,
      limit
    });
  } catch (e) {
    console.error('Error loading insurance claims:', e);
    return NextResponse.json({ error: 'Error al cargar reclamos' }, { status: 500 });
  }
}

// POST /api/insurance/claims - Create new insurance claim
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
    return NextResponse.json({ error: 'Solo el personal puede crear reclamos' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      policy_id,
      pet_id,
      invoice_id,
      claim_type,
      date_of_service,
      diagnosis,
      diagnosis_code,
      treatment_description,
      items,
      status = 'draft'
    } = body;

    if (!policy_id || !pet_id || !claim_type || !date_of_service || !diagnosis || !treatment_description) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    // Verify policy belongs to clinic and pet
    const { data: policy } = await supabase
      .from('pet_insurance_policies')
      .select('id, tenant_id, pet_id, provider_id')
      .eq('id', policy_id)
      .eq('tenant_id', profile.tenant_id)
      .eq('pet_id', pet_id)
      .single();

    if (!policy) {
      return NextResponse.json({ error: 'Póliza no encontrada o no válida' }, { status: 404 });
    }

    // Generate claim number
    const { data: claimNumber } = await supabase
      .rpc('generate_claim_number', { p_tenant_id: profile.tenant_id });

    // Calculate totals from items
    let totalCharges = 0;
    let claimedAmount = 0;

    if (items && Array.isArray(items)) {
      items.forEach((item: ClaimItem) => {
        const itemTotal = item.quantity * item.unit_price;
        totalCharges += itemTotal;
        claimedAmount += itemTotal;
      });
    }

    // Create claim
    const { data: claim, error: claimError } = await supabase
      .from('insurance_claims')
      .insert({
        tenant_id: profile.tenant_id,
        policy_id,
        pet_id,
        invoice_id,
        claim_number: claimNumber || `CLM-${Date.now()}`,
        claim_type,
        date_of_service,
        diagnosis,
        diagnosis_code,
        treatment_description,
        total_charges: totalCharges,
        claimed_amount: claimedAmount,
        status,
        submitted_by: user.id
      })
      .select()
      .single();

    if (claimError) throw claimError;

    // Create claim items
    if (items && Array.isArray(items) && items.length > 0) {
      const claimItems = items.map((item: ClaimItem) => ({
        claim_id: claim.id,
        service_date: item.service_date || date_of_service,
        service_code: item.service_code,
        description: item.description,
        quantity: item.quantity || 1,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        invoice_item_id: item.invoice_item_id,
        service_id: item.service_id
      }));

      const { error: itemsError } = await supabase
        .from('insurance_claim_items')
        .insert(claimItems);

      if (itemsError) throw itemsError;
    }

    // Audit log
    const { logAudit } = await import('@/lib/audit');
    await logAudit('CREATE_INSURANCE_CLAIM', `insurance_claims/${claim.id}`, {
      claim_number: claim.claim_number,
      policy_id,
      claimed_amount: claimedAmount
    });

    return NextResponse.json(claim, { status: 201 });
  } catch (e) {
    console.error('Error creating insurance claim:', e);
    return NextResponse.json({ error: 'Error al crear reclamo' }, { status: 500 });
  }
}
