import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

interface ProductMargin {
  id: string;
  name: string;
  sku: string | null;
  category_name: string | null;
  base_price: number;
  cost: number;
  margin_amount: number;
  margin_percentage: number;
  units_sold: number;
  total_revenue: number;
  total_profit: number;
}

interface CategoryMargin {
  category_id: string;
  category_name: string;
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  margin_percentage: number;
  product_count: number;
}

interface MarginSummary {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  average_margin: number;
  low_margin_count: number;
  low_margin_threshold: number;
}

/**
 * GET /api/analytics/store/margins
 * Get profit margin analysis for store products
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const period = parseInt(searchParams.get('period') || '30', 10);
  const lowMarginThreshold = parseFloat(searchParams.get('lowMarginThreshold') || '15');

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  // Get staff profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN);
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Get products with their cost and sales data
    const { data: products, error: productsError } = await supabase
      .from('store_products')
      .select(`
        id,
        name,
        sku,
        base_price,
        category:store_categories(id, name),
        store_inventory(weighted_average_cost)
      `)
      .eq('tenant_id', profile.tenant_id)
      .eq('is_active', true);

    if (productsError) throw productsError;

    // Get sales data for the period
    const { data: salesData, error: salesError } = await supabase
      .from('store_order_items')
      .select(`
        product_id,
        quantity,
        unit_price,
        line_total,
        order:store_orders!inner(id, status, created_at)
      `)
      .eq('tenant_id', profile.tenant_id)
      .gte('order.created_at', startDateStr)
      .in('order.status', ['delivered', 'shipped', 'confirmed', 'processing']);

    if (salesError) throw salesError;

    // Build sales map
    const salesMap: Record<string, { units: number; revenue: number }> = {};
    for (const sale of salesData || []) {
      const productId = sale.product_id;
      if (!salesMap[productId]) {
        salesMap[productId] = { units: 0, revenue: 0 };
      }
      salesMap[productId].units += sale.quantity;
      salesMap[productId].revenue += sale.line_total;
    }

    // Calculate margins for each product
    const productMargins: ProductMargin[] = [];
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let lowMarginCount = 0;

    for (const product of products || []) {
      const inventory = Array.isArray(product.store_inventory)
        ? product.store_inventory[0]
        : product.store_inventory;
      const cost = (inventory as { weighted_average_cost?: number } | null)?.weighted_average_cost || 0;
      const price = product.base_price;
      const marginAmount = price - cost;
      const marginPercentage = price > 0 ? (marginAmount / price) * 100 : 0;

      const sales = salesMap[product.id] || { units: 0, revenue: 0 };
      const productRevenue = sales.revenue;
      const productCost = cost * sales.units;
      const productProfit = productRevenue - productCost;

      if (marginPercentage < lowMarginThreshold && marginPercentage >= 0) {
        lowMarginCount++;
      }

      totalRevenue += productRevenue;
      totalCost += productCost;
      totalProfit += productProfit;

      // Category is an array from the Supabase join, get first element
      const categoryData = product.category as { id: string; name: string }[] | null;
      const category = Array.isArray(categoryData) ? categoryData[0] : categoryData;

      productMargins.push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category_name: category?.name || null,
        base_price: price,
        cost,
        margin_amount: marginAmount,
        margin_percentage: marginPercentage,
        units_sold: sales.units,
        total_revenue: productRevenue,
        total_profit: productProfit,
      });
    }

    // Sort by margin percentage (ascending to show low margins first)
    productMargins.sort((a, b) => a.margin_percentage - b.margin_percentage);

    // Calculate category margins
    const categoryMap: Record<string, CategoryMargin> = {};
    for (const product of productMargins) {
      const categoryId = product.category_name || 'uncategorized';
      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = {
          category_id: categoryId,
          category_name: product.category_name || 'Sin Categoría',
          total_revenue: 0,
          total_cost: 0,
          total_profit: 0,
          margin_percentage: 0,
          product_count: 0,
        };
      }
      categoryMap[categoryId].total_revenue += product.total_revenue;
      categoryMap[categoryId].total_cost += product.cost * product.units_sold;
      categoryMap[categoryId].total_profit += product.total_profit;
      categoryMap[categoryId].product_count++;
    }

    // Calculate margin percentage for each category
    const categoryMargins: CategoryMargin[] = Object.values(categoryMap).map(cat => ({
      ...cat,
      margin_percentage: cat.total_revenue > 0
        ? ((cat.total_revenue - cat.total_cost) / cat.total_revenue) * 100
        : 0,
    }));

    categoryMargins.sort((a, b) => b.total_profit - a.total_profit);

    const summary: MarginSummary = {
      total_revenue: totalRevenue,
      total_cost: totalCost,
      total_profit: totalProfit,
      average_margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
      low_margin_count: lowMarginCount,
      low_margin_threshold: lowMarginThreshold,
    };

    return NextResponse.json({
      summary,
      productMargins: productMargins.slice(0, 50), // Top 50 products sorted by margin
      categoryMargins,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Error fetching margin analytics:', e);
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
