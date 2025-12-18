import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface InvoiceItem {
  service_id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  line_total?: number;
}

// GET /api/invoices - List invoices for a clinic
export async function GET(request: Request) {
  const supabase = await createClient();

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

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic') || profile.tenant_id;
  const status = searchParams.get('status');
  const petId = searchParams.get('pet_id');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  // Staff can see all invoices, owners only see their own
  const isStaff = ['vet', 'admin'].includes(profile.role);

  if (!isStaff && clinic !== profile.tenant_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta clínica' }, { status: 403 });
  }

  try {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        pets(id, name, species),
        invoice_items(
          id, service_id, product_id, description, quantity, unit_price, discount_percent, line_total,
          services(name),
          products(name)
        ),
        payments(id, amount, payment_method, paid_at)
      `, { count: 'exact' })
      .eq('tenant_id', clinic)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Owners can only see invoices for their pets
    if (!isStaff) {
      const { data: ownerPets } = await supabase
        .from('pets')
        .select('id')
        .eq('owner_id', user.id);

      const petIds = ownerPets?.map(p => p.id) || [];
      if (petIds.length === 0) {
        return NextResponse.json({ data: [], total: 0, page, limit });
      }
      query = query.in('pet_id', petIds);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (petId) {
      query = query.eq('pet_id', petId);
    }

    const { data: invoices, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: invoices,
      total: count || 0,
      page,
      limit
    });
  } catch (e) {
    console.error('Error loading invoices:', e);
    return NextResponse.json({ error: 'Error al cargar facturas' }, { status: 500 });
  }
}

// POST /api/invoices - Create new invoice
export async function POST(request: Request) {
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
    return NextResponse.json({ error: 'Solo el personal puede crear facturas' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { pet_id, items, notes, due_date } = body;

    if (!pet_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'pet_id e items son requeridos' }, { status: 400 });
    }

    // Verify pet belongs to clinic
    const { data: pet } = await supabase
      .from('pets')
      .select('id, tenant_id, owner_id')
      .eq('id', pet_id)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (!pet) {
      return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
    }

    // Generate invoice number using database function
    const { data: invoiceNumber } = await supabase
      .rpc('generate_invoice_number', { p_tenant_id: profile.tenant_id });

    // TICKET-BIZ-006: Calculate totals with proper rounding to avoid floating point issues
    // Import roundCurrency helper for consistent rounding
    const { roundCurrency } = await import('@/lib/types/invoicing');

    let subtotal = 0;
    const processedItems = items.map((item: InvoiceItem) => {
      const discount = item.discount_percent || 0;
      // Round each line total to 2 decimal places
      const lineTotal = roundCurrency(item.quantity * item.unit_price * (1 - discount / 100));
      subtotal += lineTotal;
      return {
        ...item,
        line_total: lineTotal
      };
    });

    // Round subtotal to ensure precision
    subtotal = roundCurrency(subtotal);

    const taxRate = body.tax_rate || 10; // Default 10% IVA
    // Round tax amount to 2 decimal places
    const taxAmount = roundCurrency(subtotal * (taxRate / 100));
    const total = roundCurrency(subtotal + taxAmount);

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        tenant_id: profile.tenant_id,
        invoice_number: invoiceNumber || `INV-${Date.now()}`,
        pet_id,
        owner_id: pet.owner_id,
        status: 'draft',
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        amount_paid: 0,
        amount_due: total,
        notes,
        due_date: due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
        created_by: user.id
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Create invoice items
    const invoiceItems = processedItems.map((item: InvoiceItem) => ({
      invoice_id: invoice.id,
      service_id: item.service_id || null,
      product_id: item.product_id || null,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent || 0,
      line_total: item.line_total
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) throw itemsError;

    // Audit log
    const { logAudit } = await import('@/lib/audit');
    await logAudit('CREATE_INVOICE', `invoices/${invoice.id}`, {
      invoice_number: invoice.invoice_number,
      total,
      pet_id
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (e) {
    console.error('Error creating invoice:', e);
    return NextResponse.json({ error: 'Error al crear factura' }, { status: 500 });
  }
}
