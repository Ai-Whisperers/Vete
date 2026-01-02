import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = await createClient();
  const { id } = await params;

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  // Get user profile and verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN);
  }

  // Parse request body
  const body = await request.json();
  const { status } = body;

  if (!['approved', 'rejected'].includes(status)) {
    return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
      details: { field: 'status', message: 'Estado inválido' }
    });
  }

  // Get the time-off request to verify it belongs to the same tenant
  const { data: timeOffRequest } = await supabase
    .from('staff_time_off')
    .select(`
      id,
      staff_profiles!inner (
        tenant_id
      )
    `)
    .eq('id', id)
    .single();

  if (!timeOffRequest) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND);
  }

  // Verify tenant match (staff_profiles is an object, not array in single query)
  const staffProfile = timeOffRequest.staff_profiles as unknown as { tenant_id: string };
  if (staffProfile.tenant_id !== profile.tenant_id) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN);
  }

  // Update the request
  const { error: updateError } = await supabase
    .from('staff_time_off')
    .update({
      status,
      updated_at: new Date().toISOString(),
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    console.error('Error updating time-off request:', updateError);
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: updateError.message }
    });
  }

  return NextResponse.json({ success: true, status });
}
