import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// TICKET-BIZ-003: Checkout API that validates stock and decrements inventory
// TICKET-BIZ-004: Server-side stock validation
// Uses atomic process_checkout function for consistency
//
// CRITICAL: process_checkout function updated in migration 100_fix_checkout_product_lookup.sql
// to lookup products by UUID ID (not SKU) since cart sends product.id

interface CartItem {
  id: string;
  name: string;
  price: number;
  type: 'service' | 'product';
  quantity: number;
}

interface CheckoutRequest {
  items: CartItem[];
  clinic: string;
  notes?: string;
}

interface StockError {
  id: string;
  name: string;
  requested: number;
  available: number;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  // 1. Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Apply rate limiting for write endpoints (20 requests per minute)
  const { rateLimit } = await import('@/lib/rate-limit');
  const rateLimitResult = await rateLimit(request as any, 'write', user.id);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  // 2. Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, full_name, email')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  // 3. Parse request body
  let body: CheckoutRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { items, clinic, notes } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
  }

  // Validate clinic matches user's tenant
  if (clinic !== profile.tenant_id) {
    return NextResponse.json({ error: 'Clínica no válida' }, { status: 403 });
  }

  // 4. Separate products and services for logging/metrics
  const productItems = items.filter(item => item.type === 'product');
  const serviceItems = items.filter(item => item.type === 'service');

  // 5. Attempt atomic checkout using database function
  // This ensures all operations (validation, invoice creation, stock decrement) happen atomically
  try {
    const { data: checkoutResult, error: checkoutError } = await supabase.rpc('process_checkout', {
      p_tenant_id: clinic,
      p_user_id: user.id,
      p_items: JSON.stringify(items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type
      }))),
      p_notes: notes || 'Pedido desde tienda online'
    });

    if (checkoutError) {
      console.error('Atomic checkout failed:', checkoutError);
      return NextResponse.json({
        error: 'Error al procesar el pedido',
        details: checkoutError.message
      }, { status: 500 });
    }

    // Parse the result from the database function
    const result = checkoutResult as {
      success: boolean;
      error?: string;
      stock_errors?: StockError[];
      invoice?: {
        id: string;
        invoice_number: string;
        total: number;
        status: string;
      };
    };

    // Handle stock errors returned by the function
    if (!result.success) {
      if (result.stock_errors && result.stock_errors.length > 0) {
        return NextResponse.json({
          error: result.error || 'Stock insuficiente para algunos productos',
          stockErrors: result.stock_errors
        }, { status: 400 });
      }

      return NextResponse.json({
        error: result.error || 'Error al procesar el pedido'
      }, { status: 500 });
    }

    // Success - log the transaction
    const { logAudit } = await import('@/lib/audit');
    await logAudit('CHECKOUT', `invoices/${result.invoice?.id}`, {
      total: result.invoice?.total,
      item_count: items.length,
      product_count: productItems.length,
      service_count: serviceItems.length
    });

    return NextResponse.json({
      success: true,
      invoice: result.invoice
    }, { status: 201 });

  } catch (e) {
    console.error('Checkout error:', e);
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Error al procesar el pedido'
    }, { status: 500 });
  }
}
