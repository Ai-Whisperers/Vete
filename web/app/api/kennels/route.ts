import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, { details: { resource: 'profile' } });
  }

  // Only staff can view kennels
  if (!['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN);
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const kennelType = searchParams.get('kennel_type');
  const location = searchParams.get('location');

  // Build query
  let query = supabase
    .from('kennels')
    .select(`
      *,
      current_occupant:hospitalizations!hospitalizations_kennel_id_fkey(
        id,
        hospitalization_number,
        pet:pets(id, name, species, breed)
      )
    `)
    .eq('tenant_id', profile.clinic_id)
    .order('location')
    .order('kennel_number');

  // Apply filters
  if (status) {
    query = query.eq('kennel_status', status);
  }
  if (kennelType) {
    query = query.eq('kennel_type', kennelType);
  }
  if (location) {
    query = query.eq('location', location);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[API] kennels GET error:', error);
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  return NextResponse.json(data);
}
