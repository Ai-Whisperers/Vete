import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const supabase = await createClient();
  const { id } = await params;

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { action, details } = body;

  // Validate action
  const validActions = ['viewed', 'downloaded', 'emailed', 'printed'];
  if (!action || !validActions.includes(action)) {
    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  }

  // Verify consent exists and user has access
  const { data: consent } = await supabase
    .from('consent_documents')
    .select(`
      id,
      owner_id,
      pet:pets!inner(tenant_id)
    `)
    .eq('id', id)
    .single();

  if (!consent) {
    return NextResponse.json({ error: 'Consentimiento no encontrado' }, { status: 404 });
  }

  // Authorization check
  const petData = Array.isArray(consent.pet) ? consent.pet[0] : consent.pet;
  const pet = petData as { tenant_id: string };

  const isStaff = ['vet', 'admin'].includes(profile.role);
  const isOwner = consent.owner_id === user.id;

  if (isStaff) {
    if (pet.tenant_id !== profile.clinic_id) {
      return NextResponse.json({ error: 'No tienes acceso a este consentimiento' }, { status: 403 });
    }
  } else if (!isOwner) {
    return NextResponse.json({ error: 'No tienes acceso a este consentimiento' }, { status: 403 });
  }

  // Create audit log entry
  const { data: auditEntry, error: auditError } = await supabase
    .from('consent_audit_log')
    .insert({
      consent_document_id: id,
      action,
      performed_by: user.id,
      performed_by_name: profile.full_name,
      details: details || {},
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent')
    })
    .select()
    .single();

  if (auditError) {
    console.error('[API] audit log error:', auditError);
    return NextResponse.json({ error: 'Error al registrar acción' }, { status: 500 });
  }

  return NextResponse.json(auditEntry);
}
