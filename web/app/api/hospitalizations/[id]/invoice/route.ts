import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateHospitalizationInvoice } from '@/lib/billing/hospitalization';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/hospitalizations/[id]/invoice - Generate invoice from hospitalization
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
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo el personal puede generar facturas' }, { status: 403 });
  }

  try {
    const result = await generateHospitalizationInvoice(
      supabase,
      id,
      profile.tenant_id,
      user.id
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Audit log (using the shared logic logic implicitly or explicit here if not in lib)
    // The previous implementation had logAudit. The lib doesn't have it to keep it pure business logic.
    // So we invoke it here.
    
    const { logAudit } = await import('@/lib/audit');
    await logAudit('CREATE_INVOICE_FROM_HOSPITALIZATION', `invoices/${result.invoice.id}`, {
      invoice_number: result.invoice.invoice_number,
      hospitalization_id: id,
      total: result.invoice.total
    });

    return NextResponse.json({
      success: true,
      invoice: result.invoice,
      message: 'Factura generada exitosamente'
    }, { status: 201 });

  } catch (e) {
    console.error('Error generating hospitalization invoice:', e);
    return NextResponse.json({ error: 'Error al generar factura' }, { status: 500 });
  }
}
