import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/insurance/claims/[id] - Get claim detail
export async function GET(request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient();
  const { id } = await params;

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
    return NextResponse.json({ error: 'Solo el personal puede ver reclamos' }, { status: 403 });
  }

  try {
    const { data: claim, error } = await supabase
      .from('insurance_claims')
      .select(`
        *,
        pets(id, name, species, breed, date_of_birth),
        pet_insurance_policies(
          id, policy_number, plan_name, deductible_amount, coinsurance_percentage,
          insurance_providers(id, name, logo_url, claims_email, claims_phone)
        ),
        insurance_claim_items(
          id, service_date, service_code, description, quantity,
          unit_price, total_price, approved_amount, denial_reason
        ),
        insurance_claim_documents(
          id, document_type, title, file_url, sent_to_insurance, sent_at, created_at
        ),
        insurance_claim_communications(
          id, direction, channel, subject, content, contact_name,
          created_at, requires_follow_up, follow_up_date
        ),
        insurance_eob(
          id, eob_number, eob_date, billed_amount, allowed_amount,
          deductible_amount, coinsurance_amount, paid_amount, patient_responsibility
        )
      `)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (error) throw error;

    if (!claim) {
      return NextResponse.json({ error: 'Reclamo no encontrado' }, { status: 404 });
    }

    return NextResponse.json(claim);
  } catch (e) {
    console.error('Error loading claim detail:', e);
    return NextResponse.json({ error: 'Error al cargar reclamo' }, { status: 500 });
  }
}

// PATCH /api/insurance/claims/[id] - Update claim
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient();
  const { id } = await params;

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
    return NextResponse.json({ error: 'Solo el personal puede actualizar reclamos' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      status,
      provider_claim_number,
      approved_amount,
      paid_amount,
      denial_reason,
      denial_code,
      internal_notes,
      provider_notes,
      submission_method,
      confirmation_number,
      payment_method,
      payment_reference
    } = body;

    // Verify claim belongs to clinic
    const { data: existingClaim } = await supabase
      .from('insurance_claims')
      .select('id, tenant_id, status')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (!existingClaim) {
      return NextResponse.json({ error: 'Reclamo no encontrado' }, { status: 404 });
    }

    // Build update object
    // TICKET-TYPE-004: Use proper interface instead of any
    interface ClaimUpdates {
      status?: string;
      provider_claim_number?: string;
      approved_amount?: number;
      paid_amount?: number;
      denial_reason?: string;
      denial_code?: string;
      internal_notes?: string;
      provider_notes?: string;
      submission_method?: string;
      confirmation_number?: string;
      payment_method?: string;
      payment_reference?: string;
      processed_by?: string;
    }
    const updates: ClaimUpdates = {};
    if (status !== undefined) updates.status = status;
    if (provider_claim_number !== undefined) updates.provider_claim_number = provider_claim_number;
    if (approved_amount !== undefined) updates.approved_amount = approved_amount;
    if (paid_amount !== undefined) updates.paid_amount = paid_amount;
    if (denial_reason !== undefined) updates.denial_reason = denial_reason;
    if (denial_code !== undefined) updates.denial_code = denial_code;
    if (internal_notes !== undefined) updates.internal_notes = internal_notes;
    if (provider_notes !== undefined) updates.provider_notes = provider_notes;
    if (submission_method !== undefined) updates.submission_method = submission_method;
    if (confirmation_number !== undefined) updates.confirmation_number = confirmation_number;
    if (payment_method !== undefined) updates.payment_method = payment_method;
    if (payment_reference !== undefined) updates.payment_reference = payment_reference;

    // Set processed_by if approving/denying
    if (status && ['approved', 'partially_approved', 'denied'].includes(status)) {
      updates.processed_by = user.id;
    }

    const { data: claim, error } = await supabase
      .from('insurance_claims')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Audit log
    const { logAudit } = await import('@/lib/audit');
    await logAudit('UPDATE_INSURANCE_CLAIM', `insurance_claims/${id}`, {
      updates: Object.keys(updates),
      new_status: status
    });

    return NextResponse.json(claim);
  } catch (e) {
    console.error('Error updating claim:', e);
    return NextResponse.json({ error: 'Error al actualizar reclamo' }, { status: 500 });
  }
}
