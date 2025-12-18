import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/dashboard/inventory-alerts - Get low stock and expiring products
export async function GET(request: Request) {
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
    return NextResponse.json({ error: 'Solo el personal puede ver alertas de inventario' }, { status: 403 });
  }

  try {
    // Try materialized view first
    const { data: alerts, error } = await supabase
      .from('mv_inventory_alerts')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('alert_priority', { ascending: false });

    if (error) {
      // Fallback to live queries
      const [lowStock, expiring] = await Promise.all([
        // Low stock items
        supabase
          .from('store_inventory')
          .select(`
            id, stock_quantity, min_stock_level,
            product:store_products(id, name, sku)
          `)
          .eq('tenant_id', profile.tenant_id)
          .lt('stock_quantity', supabase.rpc('get_min_stock_level')),

        // Expiring products (within 30 days)
        supabase
          .from('products')
          .select('id, name, sku, expiry_date, stock')
          .eq('tenant_id', profile.tenant_id)
          .lte('expiry_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
          .gt('stock', 0)
      ]);

      const result = {
        low_stock: lowStock.data?.map(item => {
          const product = Array.isArray(item.product) ? item.product[0] : item.product;
          return {
            product_id: product?.id,
            product_name: product?.name,
            sku: product?.sku,
            current_stock: item.stock_quantity,
            min_stock: item.min_stock_level,
            alert_type: 'low_stock'
          };
        }) || [],
        expiring_soon: expiring.data?.map(item => ({
          product_id: item.id,
          product_name: item.name,
          sku: item.sku,
          expiry_date: item.expiry_date,
          current_stock: item.stock,
          alert_type: 'expiring'
        })) || []
      };

      return NextResponse.json(result);
    }

    // Group alerts by type
    const grouped = {
      low_stock: alerts?.filter(a => a.alert_type === 'low_stock') || [],
      expiring_soon: alerts?.filter(a => a.alert_type === 'expiring') || [],
      out_of_stock: alerts?.filter(a => a.alert_type === 'out_of_stock') || []
    };

    return NextResponse.json(grouped);
  } catch (e) {
    console.error('Error loading inventory alerts:', e);
    return NextResponse.json({ error: 'Error al cargar alertas de inventario' }, { status: 500 });
  }
}
