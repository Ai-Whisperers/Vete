import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const supabase = await createClient();
  const { id: hospitalizationId } = await params;

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  // Get user profile - only vets/admins can record vitals
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, { details: { resource: 'profile' } });
  }

  if (!['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN);
  }

  // Verify hospitalization exists and belongs to clinic
  const { data: hospitalization } = await supabase
    .from('hospitalizations')
    .select('id, pet:pets!inner(tenant_id)')
    .eq('id', hospitalizationId)
    .single();

  if (!hospitalization) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, { details: { resource: 'hospitalization' } });
  }

  const petData = Array.isArray(hospitalization.pet) ? hospitalization.pet[0] : hospitalization.pet;
  const pet = petData as { tenant_id: string };
  if (pet.tenant_id !== profile.clinic_id) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN);
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST);
  }

  const {
    temperature,
    heart_rate,
    respiratory_rate,
    weight,
    blood_pressure_systolic,
    blood_pressure_diastolic,
    mucous_membrane_color,
    capillary_refill_time,
    pain_score,
    notes
  } = body;

  // Insert vitals
  const { data, error } = await supabase
    .from('hospitalization_vitals')
    .insert({
      hospitalization_id: hospitalizationId,
      recorded_at: new Date().toISOString(),
      temperature: temperature || null,
      heart_rate: heart_rate || null,
      respiratory_rate: respiratory_rate || null,
      weight: weight || null,
      blood_pressure_systolic: blood_pressure_systolic || null,
      blood_pressure_diastolic: blood_pressure_diastolic || null,
      mucous_membrane_color: mucous_membrane_color || null,
      capillary_refill_time: capillary_refill_time || null,
      pain_score: pain_score || null,
      notes: notes || null,
      recorded_by: user.id,
    })
    .select(`
      *,
      recorded_by:profiles!hospitalization_vitals_recorded_by_fkey(full_name)
    `)
    .single();

  if (error) {
    console.error('[API] vitals POST error:', error);
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  return NextResponse.json(data, { status: 201 });
}
