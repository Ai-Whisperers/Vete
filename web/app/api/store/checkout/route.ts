import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// TICKET-BIZ-003: Checkout API that validates stock and decrements inventory

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

  // 4. Separate products and services
  const productItems = items.filter(item => item.type === 'product');
  const serviceItems = items.filter(item => item.type === 'service');

  // 5. Validate stock for products
  const stockErrors: StockError[] = [];

  if (productItems.length > 0) {
    // Get product IDs (which are SKUs in the cart)
    const skus = productItems.map(item => item.id);

    // Fetch current stock for all products
    const { data: inventoryData, error: invError } = await supabase
      .from('store_products')
      .select(`
        id,
        sku,
        name,
        store_inventory(stock_quantity)
      `)
      .eq('tenant_id', clinic)
      .in('sku', skus);

    if (invError) {
      console.error('Error fetching inventory:', invError);
      return NextResponse.json({ error: 'Error al verificar inventario' }, { status: 500 });
    }

    // Create a map of SKU -> inventory data
    const inventoryMap = new Map(
      inventoryData?.map(p => {
        // Supabase returns store_inventory as array for one-to-one relation
        const inventory = Array.isArray(p.store_inventory)
          ? p.store_inventory[0]
          : p.store_inventory;
        return [p.sku, {
          id: p.id,
          name: p.name,
          stock: (inventory as { stock_quantity: number } | null)?.stock_quantity || 0
        }];
      }) || []
    );

    // Check stock for each item
    for (const item of productItems) {
      const inventory = inventoryMap.get(item.id);
      if (!inventory) {
        stockErrors.push({
          id: item.id,
          name: item.name,
          requested: item.quantity,
          available: 0
        });
      } else if (inventory.stock < item.quantity) {
        stockErrors.push({
          id: item.id,
          name: inventory.name,
          requested: item.quantity,
          available: inventory.stock
        });
      }
    }

    // If any stock errors, return them
    if (stockErrors.length > 0) {
      return NextResponse.json({
        error: 'Stock insuficiente para algunos productos',
        stockErrors
      }, { status: 400 });
    }
  }

  try {
    // 6. Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 10; // 10% IVA
    const taxAmount = Math.round(subtotal * taxRate) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    // 7. Create invoice
    const invoiceNumber = `INV-${Date.now()}`;
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        tenant_id: clinic,
        invoice_number: invoiceNumber,
        owner_id: user.id,
        status: 'pending',
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        amount_paid: 0,
        amount_due: total,
        notes: notes || 'Pedido desde tienda online',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        created_by: user.id
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      return NextResponse.json({ error: 'Error al crear factura' }, { status: 500 });
    }

    // 8. Create invoice items
    const invoiceItems = items.map(item => ({
      invoice_id: invoice.id,
      product_id: item.type === 'product' ? item.id : null,
      service_id: item.type === 'service' ? item.id : null,
      description: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      discount_percent: 0,
      line_total: Math.round(item.price * item.quantity * 100) / 100
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) {
      console.error('Error creating invoice items:', itemsError);
      // Try to clean up the invoice
      await supabase.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json({ error: 'Error al crear items de factura' }, { status: 500 });
    }

    // 9. Decrement stock for products
    if (productItems.length > 0) {
      // Get product UUIDs from SKUs
      const { data: products } = await supabase
        .from('store_products')
        .select('id, sku')
        .eq('tenant_id', clinic)
        .in('sku', productItems.map(p => p.id));

      const skuToUuid = new Map(products?.map(p => [p.sku, p.id]) || []);

      for (const item of productItems) {
        const productUuid = skuToUuid.get(item.id);
        if (productUuid) {
          // Decrement stock
          const { error: stockError } = await supabase.rpc('decrement_stock', {
            p_product_id: productUuid,
            p_tenant_id: clinic,
            p_quantity: item.quantity
          });

          if (stockError) {
            console.error(`Error decrementing stock for ${item.id}:`, stockError);
            // Continue with other items - stock was validated earlier
          }
        }
      }
    }

    // 10. Log the transaction
    const { logAudit } = await import('@/lib/audit');
    await logAudit('CHECKOUT', `invoices/${invoice.id}`, {
      total,
      item_count: items.length,
      product_count: productItems.length,
      service_count: serviceItems.length
    });

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoice_number: invoiceNumber,
        total,
        status: 'pending'
      }
    }, { status: 201 });

  } catch (e) {
    console.error('Checkout error:', e);
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Error al procesar el pedido'
    }, { status: 500 });
  }
}
