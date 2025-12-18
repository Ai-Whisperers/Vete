import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface InvoiceItem {
  service_id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
}

// GET /api/invoices/[id] - Get single invoice
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
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

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        pets(id, name, species, breed, photo_url, owner:profiles(id, full_name, email, phone)),
        invoice_items(
          id, service_id, product_id, description, quantity, unit_price, discount_percent, line_total,
          services(id, name, category),
          products(id, name, sku)
        ),
        payments(id, amount, payment_method, reference_number, paid_at, received_by),
        refunds(id, amount, reason, refunded_at),
        created_by_user:profiles!invoices_created_by_fkey(full_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Check access
    const isStaff = ['vet', 'admin'].includes(profile.role);
    if (!isStaff && invoice.owner_id !== user.id) {
      return NextResponse.json({ error: 'No tienes acceso a esta factura' }, { status: 403 });
    }

    return NextResponse.json(invoice);
  } catch (e) {
    console.error('Error loading invoice:', e);
    return NextResponse.json({ error: 'Error al cargar factura' }, { status: 500 });
  }
}

// PATCH /api/invoices/[id] - Update invoice
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
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
    return NextResponse.json({ error: 'Solo el personal puede modificar facturas' }, { status: 403 });
  }

  try {
    // Get current invoice
    const { data: existing } = await supabase
      .from('invoices')
      .select('id, status, tenant_id')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Only draft invoices can be fully edited
    if (existing.status !== 'draft') {
      const body = await request.json();
      // For non-draft, only allow status changes and notes
      const allowedFields = ['status', 'notes'];
      // TICKET-TYPE-004: Use proper interface instead of any
      const updates: { status?: string; notes?: string } = {};
      allowedFields.forEach(field => {
        if (body[field] !== undefined) updates[field] = body[field];
      });

      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'Las facturas enviadas solo pueden cambiar estado o notas' }, { status: 400 });
      }

      const { data: updated, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const { logAudit } = await import('@/lib/audit');
      await logAudit('UPDATE_INVOICE', `invoices/${id}`, { updates });

      return NextResponse.json(updated);
    }

    // Draft invoice - full edit allowed
    const body = await request.json();
    const { items, ...invoiceData } = body;

    // Update invoice
    const { data: updated, error: updateError } = await supabase
      .from('invoices')
      .update({
        ...invoiceData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update items if provided
    if (items && Array.isArray(items)) {
      // Import roundCurrency helper for consistent rounding
      const { roundCurrency } = await import('@/lib/types/invoicing');

      // Delete existing items
      await supabase.from('invoice_items').delete().eq('invoice_id', id);

      // Insert new items
      let subtotal = 0;
      const newItems = items.map((item: InvoiceItem) => {
        const lineTotal = roundCurrency(item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100));
        subtotal += lineTotal;
        return {
          invoice_id: id,
          service_id: item.service_id || null,
          product_id: item.product_id || null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent || 0,
          line_total: lineTotal
        };
      });

      await supabase.from('invoice_items').insert(newItems);

      // Recalculate totals with proper rounding
      subtotal = roundCurrency(subtotal);
      const taxAmount = roundCurrency(subtotal * (updated.tax_rate / 100));
      const total = roundCurrency(subtotal + taxAmount);
      const amountDue = roundCurrency(total - updated.amount_paid);

      await supabase
        .from('invoices')
        .update({
          subtotal,
          tax_amount: taxAmount,
          total,
          amount_due: amountDue
        })
        .eq('id', id);
    }

    const { logAudit } = await import('@/lib/audit');
    await logAudit('UPDATE_INVOICE', `invoices/${id}`, { status: updated.status });

    return NextResponse.json(updated);
  } catch (e) {
    console.error('Error updating invoice:', e);
    return NextResponse.json({ error: 'Error al actualizar factura' }, { status: 500 });
  }
}

// DELETE /api/invoices/[id] - Delete invoice (soft delete or void)
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
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

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden eliminar facturas' }, { status: 403 });
  }

  try {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, status, invoice_number')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // If draft, hard delete
    if (invoice.status === 'draft') {
      await supabase.from('invoice_items').delete().eq('invoice_id', id);
      await supabase.from('invoices').delete().eq('id', id);
    } else {
      // Otherwise, void the invoice
      await supabase
        .from('invoices')
        .update({
          status: 'void',
          voided_at: new Date().toISOString(),
          voided_by: user.id
        })
        .eq('id', id);
    }

    const { logAudit } = await import('@/lib/audit');
    await logAudit('DELETE_INVOICE', `invoices/${id}`, {
      invoice_number: invoice.invoice_number,
      action: invoice.status === 'draft' ? 'deleted' : 'voided'
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error deleting invoice:', e);
    return NextResponse.json({ error: 'Error al eliminar factura' }, { status: 500 });
  }
}
