import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');
  if (!clinic) {
    return NextResponse.json({ error: 'Missing clinic parameter' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    let queryBuilder = supabase
      .from('store_products')
      .select(`
        id, sku, name, description, image_url, base_price,
        store_categories(name),
        store_inventory(stock_quantity)
      `)
      .eq('tenant_id', clinic)
      .eq('is_active', true);

    const search = searchParams.get('search');
    if (search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    const { data: products, error: pError } = await queryBuilder;

    if (pError) throw pError;

    // 2. Fetch active campaigns for this clinic
    const now = new Date().toISOString();
    const { data: campaigns, error: cError } = await supabase
      .from('store_campaigns')
      .select(`
        id,
        store_campaign_items(product_id, discount_type, discount_value)
      `)
      .eq('tenant_id', clinic)
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now);

    if (cError) throw cError;

    // 3. Map campaign discounts to products
    const discountMap = new Map<string, { type: string, value: number }>();
    campaigns?.forEach(camp => {
        camp.store_campaign_items.forEach((item: any) => {
            discountMap.set(item.product_id, { type: item.discount_type, value: item.discount_value });
        });
    });

    // 4. Process products
    const processed = products.map((p: any) => {
        const discount = discountMap.get(p.id);
        let currentPrice = p.base_price;
        let originalPrice = null;

        if (discount) {
            originalPrice = p.base_price;
            if (discount.type === 'percentage') {
                currentPrice = p.base_price * (1 - (discount.value / 100));
            } else {
                currentPrice = Math.max(0, p.base_price - discount.value);
            }
        }

        return {
            id: p.sku, // Keep id as SKU for compatibility with existing components
            name: p.name,
            description: p.description,
            category: p.store_categories?.name || 'Uncategorized',
            price: currentPrice,
            originalPrice: originalPrice,
            image: p.image_url,
            stock: p.store_inventory?.stock_quantity || 0,
            hasDiscount: !!discount
        };
    });

    return NextResponse.json(processed);
  } catch (e) {
    console.error('Error loading products from Supabase', e);
    return NextResponse.json({ error: 'Could not load products' }, { status: 500 });
  }
}
