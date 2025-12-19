import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    // Get hospitalization with all billing details
    const { data: hospitalization, error: hospError } = await supabase
      .from('hospitalizations')
      .select(`
        *,
        pet:pets!inner(
          id, name, species, breed, tenant_id,
          owner:profiles!pets_owner_id_fkey(id, full_name, email, phone)
        ),
        kennel:kennels(id, kennel_number, kennel_type, daily_rate, icu_surcharge),
        treatments:hospitalization_treatments(
          id, treatment_type, medication_name, dosage,
          administered_at, status, unit_cost
        ),
        vitals:hospitalization_vitals(id)
      `)
      .eq('id', id)
      .eq('pet.tenant_id', profile.tenant_id)
      .single();

    if (hospError || !hospitalization) {
      return NextResponse.json({ error: 'Hospitalización no encontrada' }, { status: 404 });
    }

    // Check if already invoiced
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('hospitalization_id', id)
      .single();

    if (existingInvoice) {
      return NextResponse.json({
        error: 'Ya existe una factura para esta hospitalización',
        invoice_id: existingInvoice.id,
        invoice_number: existingInvoice.invoice_number
      }, { status: 400 });
    }

    // Calculate stay duration
    const admissionDate = new Date(hospitalization.admission_date || hospitalization.admitted_at);
    const dischargeDate = hospitalization.discharge_date
      ? new Date(hospitalization.discharge_date)
      : new Date();

    const stayDays = Math.max(1, Math.ceil(
      (dischargeDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24)
    ));

    // Build invoice items
    const items: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }> = [];

    // 1. Kennel/housing charge
    const dailyRate = hospitalization.kennel?.daily_rate || hospitalization.daily_rate || 0;
    if (dailyRate > 0) {
      const kennelType = hospitalization.kennel?.kennel_type || 'standard';
      items.push({
        description: `Internación ${kennelType} - ${stayDays} día${stayDays > 1 ? 's' : ''} (Jaula ${hospitalization.kennel?.kennel_number || 'N/A'})`,
        quantity: stayDays,
        unit_price: dailyRate,
        line_total: stayDays * dailyRate
      });
    }

    // 2. ICU surcharge if applicable
    const icuSurcharge = hospitalization.kennel?.icu_surcharge || 0;
    if (icuSurcharge > 0 && hospitalization.acuity_level === 'critical') {
      items.push({
        description: 'Recargo UCI - Cuidados intensivos',
        quantity: stayDays,
        unit_price: icuSurcharge,
        line_total: stayDays * icuSurcharge
      });
    }

    // 3. Treatments and medications
    const administeredTreatments = (hospitalization.treatments || []).filter(
      (t: { status: string }) => t.status === 'administered'
    );

    // Group treatments by medication/type
    const treatmentGroups = new Map<string, { count: number; unitCost: number }>();
    for (const treatment of administeredTreatments) {
      const key = treatment.medication_name || treatment.treatment_type;
      const existing = treatmentGroups.get(key);
      const unitCost = treatment.unit_cost || 0;

      if (existing) {
        existing.count++;
        // Use the highest unit cost if different
        if (unitCost > existing.unitCost) {
          existing.unitCost = unitCost;
        }
      } else {
        treatmentGroups.set(key, { count: 1, unitCost });
      }
    }

    for (const [name, { count, unitCost }] of treatmentGroups) {
      if (unitCost > 0) {
        items.push({
          description: `${name} (×${count} dosis)`,
          quantity: count,
          unit_price: unitCost,
          line_total: count * unitCost
        });
      }
    }

    // 4. Monitoring fee based on vitals recorded
    const vitalsCount = hospitalization.vitals?.length || 0;
    if (vitalsCount > 0) {
      const monitoringFee = 15000; // Per monitoring session
      items.push({
        description: `Monitoreo de signos vitales (${vitalsCount} controles)`,
        quantity: vitalsCount,
        unit_price: monitoringFee,
        line_total: vitalsCount * monitoringFee
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    const taxRate = 10; // 10% IVA
    const taxAmount = Math.round(subtotal * taxRate / 100);
    const total = subtotal + taxAmount;

    // Generate invoice number
    const { data: invoiceNumber } = await supabase
      .rpc('generate_invoice_number', { p_tenant_id: profile.tenant_id });

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        tenant_id: profile.tenant_id,
        invoice_number: invoiceNumber || `INV-HOSP-${Date.now()}`,
        pet_id: hospitalization.pet.id,
        owner_id: hospitalization.pet.owner.id,
        hospitalization_id: id,
        status: 'draft',
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        amount_paid: 0,
        amount_due: total,
        notes: `Factura generada de hospitalización ${hospitalization.hospitalization_number || id}`,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: user.id
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      return NextResponse.json({ error: 'Error al crear factura' }, { status: 500 });
    }

    // Create invoice items
    const invoiceItems = items.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percent: 0,
      line_total: item.line_total
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) {
      console.error('Error creating invoice items:', itemsError);
      // Rollback invoice
      await supabase.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json({ error: 'Error al crear items de factura' }, { status: 500 });
    }

    // Audit log
    const { logAudit } = await import('@/lib/audit');
    await logAudit('CREATE_INVOICE_FROM_HOSPITALIZATION', `invoices/${invoice.id}`, {
      invoice_number: invoice.invoice_number,
      hospitalization_id: id,
      hospitalization_number: hospitalization.hospitalization_number,
      stay_days: stayDays,
      items_count: items.length,
      total
    });

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        total: invoice.total,
        items_count: items.length,
        stay_days: stayDays
      },
      message: 'Factura generada exitosamente'
    }, { status: 201 });

  } catch (e) {
    console.error('Error generating hospitalization invoice:', e);
    return NextResponse.json({ error: 'Error al generar factura' }, { status: 500 });
  }
}
