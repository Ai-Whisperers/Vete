import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = await createClient();
  const { id } = await params;

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile and verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden actualizar solicitudes' }, { status: 403 });
  }

  // Parse request body
  const body = await request.json();
  const { status } = body;

  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
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
    return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
  }

  // Verify tenant match (staff_profiles is an object, not array in single query)
  const staffProfile = timeOffRequest.staff_profiles as unknown as { tenant_id: string };
  if (staffProfile.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: 'No autorizado para esta solicitud' }, { status: 403 });
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
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }

  return NextResponse.json({ success: true, status });
}
