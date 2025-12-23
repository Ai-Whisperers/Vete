import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProductListResponse, StoreProductWithDetails, AvailableFilters, SortOption } from '@/lib/types/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const sort = (searchParams.get('sort') || 'relevance') as SortOption;
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  // ... and so on for all filters

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic not provided' }, { status: 400 });
  }

  const supabase = await createClient();

  let query = supabase
    .from('store_products')
    .select('*, brand:store_brands(*), category:store_categories(*), variants:store_product_variants(*)', { count: 'exact' })
    .eq('tenant_id', clinic)
    .eq('is_active', true);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  if (category) {
    query = query.eq('category.slug', category);
  }

  // Apply sorting
  switch (sort) {
    case 'price_asc':
      query = query.order('current_price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('current_price', { ascending: false });
      break;
    case 'name_asc':
      query = query.order('name', { ascending: true });
      break;
    case 'name_desc':
      query = query.order('name', { ascending: false });
      break;
    default:
      // No specific order for relevance, rely on default or a future full-text search rank
      break;
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data: products, error, count } = await query;

  if (error) {
    console.error('Error fetching store products:', error);
    return NextResponse.json({ error: 'Failed to fetch store products' }, { status: 500 });
  }

  const totalPages = Math.ceil((count || 0) / limit);

  // In a real app, available filters would be calculated based on the full product set, not just the current page
  const availableFilters: AvailableFilters = {
    categories: [],
    subcategories: [],
    brands: [],
    species: [],
    life_stages: [],
    breed_sizes: [],
    health_conditions: [],
    price_range: { min: 0, max: 1000000 },
  };

  const response: ProductListResponse = {
    products: products as StoreProductWithDetails[],
    pagination: {
      page,
      pages: totalPages,
      total: count || 0,
    },
    filters: {
      applied: {}, // This would be the filters from searchParams
      available: availableFilters,
    },
  };

  return NextResponse.json(response, { status: 200 });
}