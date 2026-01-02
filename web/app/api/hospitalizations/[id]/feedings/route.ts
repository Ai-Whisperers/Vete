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

  // Get user profile - only vets/admins can record feedings
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
    food_type,
    amount_offered,
    amount_consumed,
    appetite_level,
    notes
  } = body;

  // Validate required fields
  if (!food_type || amount_offered === undefined) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
      details: { required: ['food_type', 'amount_offered'] }
    });
  }

  // Insert feeding
  const { data, error } = await supabase
    .from('hospitalization_feedings')
    .insert({
      hospitalization_id: hospitalizationId,
      feeding_time: new Date().toISOString(),
      food_type,
      amount_offered,
      amount_consumed: amount_consumed || 0,
      appetite_level: appetite_level || 'normal',
      notes: notes || null,
      fed_by: user.id,
    })
    .select(`
      *,
      fed_by:profiles!hospitalization_feedings_fed_by_fkey(full_name)
    `)
    .single();

  if (error) {
    console.error('[API] feedings POST error:', error);
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  return NextResponse.json(data, { status: 201 });
}
