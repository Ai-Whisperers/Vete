import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type {
  ProductListResponse,
  ProductFilters,
  SortOption,
  StoreProductWithDetails,
  AvailableFilters,
} from '@/lib/types/store';

interface CampaignItem {
  product_id: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
}

interface Campaign {
  id: string;
  store_campaign_items: CampaignItem[];
}

interface ProductFromDB {
  id: string;
  sku: string | null;
  barcode: string | null;
  name: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  base_price: number;
  specifications: Record<string, string> | null;
  features: string[] | null;
  ingredients: string | null;
  nutritional_info: Record<string, string | number> | null;
  species: string[] | null;
  life_stages: string[] | null;
  breed_sizes: string[] | null;
  health_conditions: string[] | null;
  weight_grams: number | null;
  dimensions: { length?: number; width?: number; height?: number } | null;
  is_prescription_required: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  avg_rating: number;
  review_count: number;
  sales_count: number;
  view_count: number;
  meta_title: string | null;
  meta_description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_id: string | null;
  subcategory_id: string | null;
  brand_id: string | null;
  store_categories: { id: string; name: string; slug: string } | null;
  store_subcategories: { id: string; name: string; slug: string } | null;
  store_brands: { id: string; name: string; slug: string; logo_url: string | null } | null;
  store_inventory: { stock_quantity: number; min_stock_level: number | null } | null;
  store_product_images: { id: string; image_url: string; alt_text: string | null; is_primary: boolean; sort_order: number }[];
  store_product_variants: { id: string; sku: string; name: string; variant_type: string; price_modifier: number; stock_quantity: number; is_default: boolean; sort_order: number }[];
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest): Promise<NextResponse<ProductListResponse | { error: string }>> {
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');

  if (!clinic) {
    return NextResponse.json({ error: 'Falta el parámetro clinic' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || String(DEFAULT_PAGE)));
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT))));
    const offset = (page - 1) * limit;
    const sort = (searchParams.get('sort') || 'relevance') as SortOption;

    // Parse filters
    const filters: ProductFilters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      subcategory: searchParams.get('subcategory') || undefined,
      brand: searchParams.get('brand') || undefined,
      species: searchParams.getAll('species').length > 0 ? searchParams.getAll('species') as ProductFilters['species'] : undefined,
      life_stages: searchParams.getAll('life_stages').length > 0 ? searchParams.getAll('life_stages') as ProductFilters['life_stages'] : undefined,
      breed_sizes: searchParams.getAll('breed_sizes').length > 0 ? searchParams.getAll('breed_sizes') as ProductFilters['breed_sizes'] : undefined,
      health_conditions: searchParams.getAll('health_conditions').length > 0 ? searchParams.getAll('health_conditions') as ProductFilters['health_conditions'] : undefined,
      price_min: searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : undefined,
      price_max: searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : undefined,
      in_stock_only: searchParams.get('in_stock_only') === 'true',
      on_sale: searchParams.get('on_sale') === 'true',
      new_arrivals: searchParams.get('new_arrivals') === 'true',
      best_sellers: searchParams.get('best_sellers') === 'true',
      featured: searchParams.get('featured') === 'true',
      prescription_required: searchParams.get('prescription_required') === 'true' ? true : searchParams.get('prescription_required') === 'false' ? false : undefined,
      min_rating: searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')!) : undefined,
    };

    // Build the base query
    let queryBuilder = supabase
      .from('store_products')
      .select(`
        *,
        store_categories(id, name, slug),
        store_subcategories(id, name, slug),
        store_brands(id, name, slug, logo_url),
        store_inventory(stock_quantity, min_stock_level),
        store_product_images(id, image_url, alt_text, is_primary, sort_order),
        store_product_variants(id, sku, name, variant_type, price_modifier, stock_quantity, is_default, sort_order)
      `, { count: 'exact' })
      .eq('tenant_id', clinic)
      .eq('is_active', true);

    // Apply filters
    if (filters.search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    if (filters.category) {
      // First get category ID from slug
      const { data: category } = await supabase
        .from('store_categories')
        .select('id')
        .eq('tenant_id', clinic)
        .eq('slug', filters.category)
        .single();

      if (category) {
        queryBuilder = queryBuilder.eq('category_id', category.id);
      }
    }

    if (filters.subcategory) {
      const { data: subcategory } = await supabase
        .from('store_subcategories')
        .select('id')
        .eq('tenant_id', clinic)
        .eq('slug', filters.subcategory)
        .single();

      if (subcategory) {
        queryBuilder = queryBuilder.eq('subcategory_id', subcategory.id);
      }
    }

    if (filters.brand) {
      const { data: brand } = await supabase
        .from('store_brands')
        .select('id')
        .eq('tenant_id', clinic)
        .eq('slug', filters.brand)
        .single();

      if (brand) {
        queryBuilder = queryBuilder.eq('brand_id', brand.id);
      }
    }

    if (filters.species && filters.species.length > 0) {
      queryBuilder = queryBuilder.overlaps('species', filters.species);
    }

    if (filters.life_stages && filters.life_stages.length > 0) {
      queryBuilder = queryBuilder.overlaps('life_stages', filters.life_stages);
    }

    if (filters.breed_sizes && filters.breed_sizes.length > 0) {
      queryBuilder = queryBuilder.overlaps('breed_sizes', filters.breed_sizes);
    }

    if (filters.health_conditions && filters.health_conditions.length > 0) {
      queryBuilder = queryBuilder.overlaps('health_conditions', filters.health_conditions);
    }

    if (filters.price_min !== undefined) {
      queryBuilder = queryBuilder.gte('base_price', filters.price_min);
    }

    if (filters.price_max !== undefined) {
      queryBuilder = queryBuilder.lte('base_price', filters.price_max);
    }

    if (filters.new_arrivals) {
      queryBuilder = queryBuilder.eq('is_new_arrival', true);
    }

    if (filters.best_sellers) {
      queryBuilder = queryBuilder.eq('is_best_seller', true);
    }

    if (filters.featured) {
      queryBuilder = queryBuilder.eq('is_featured', true);
    }

    if (filters.prescription_required !== undefined) {
      queryBuilder = queryBuilder.eq('is_prescription_required', filters.prescription_required);
    }

    if (filters.min_rating !== undefined) {
      queryBuilder = queryBuilder.gte('avg_rating', filters.min_rating);
    }

    // Apply sorting
    switch (sort) {
      case 'price_low_high':
        queryBuilder = queryBuilder.order('base_price', { ascending: true });
        break;
      case 'price_high_low':
        queryBuilder = queryBuilder.order('base_price', { ascending: false });
        break;
      case 'newest':
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
        break;
      case 'rating':
        queryBuilder = queryBuilder.order('avg_rating', { ascending: false }).order('review_count', { ascending: false });
        break;
      case 'best_selling':
        queryBuilder = queryBuilder.order('sales_count', { ascending: false });
        break;
      case 'name_asc':
        queryBuilder = queryBuilder.order('name', { ascending: true });
        break;
      case 'discount':
        // Will be handled after fetching campaigns
        queryBuilder = queryBuilder.order('sort_order', { ascending: true }).order('name', { ascending: true });
        break;
      case 'relevance':
      default:
        queryBuilder = queryBuilder
          .order('is_featured', { ascending: false })
          .order('sales_count', { ascending: false })
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true });
        break;
    }

    // Apply pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data: products, error: pError, count } = await queryBuilder;

    if (pError) throw pError;

    // Fetch active campaigns for discount calculation
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

    // Build discount map
    const discountMap = new Map<string, { type: 'percentage' | 'fixed_amount'; value: number }>();
    (campaigns as Campaign[] | null)?.forEach(camp => {
      camp.store_campaign_items.forEach((item: CampaignItem) => {
        discountMap.set(item.product_id, { type: item.discount_type, value: item.discount_value });
      });
    });

    // Process products
    let processedProducts: StoreProductWithDetails[] = (products as ProductFromDB[]).map((p) => {
      const discount = discountMap.get(p.id);
      let currentPrice = p.base_price;
      let originalPrice: number | null = null;
      let discountPercentage: number | null = null;

      if (discount) {
        originalPrice = p.base_price;
        if (discount.type === 'percentage') {
          currentPrice = p.base_price * (1 - (discount.value / 100));
          discountPercentage = discount.value;
        } else {
          currentPrice = Math.max(0, p.base_price - discount.value);
          discountPercentage = Math.round((discount.value / p.base_price) * 100);
        }
      }

      return {
        id: p.id,
        tenant_id: clinic,
        category_id: p.category_id,
        subcategory_id: p.subcategory_id,
        brand_id: p.brand_id,
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        short_description: p.short_description,
        description: p.description,
        image_url: p.image_url || (p.store_product_images?.find(img => img.is_primary)?.image_url) || (p.store_product_images?.[0]?.image_url) || null,
        base_price: p.base_price,
        specifications: p.specifications || {},
        features: p.features || [],
        ingredients: p.ingredients,
        nutritional_info: p.nutritional_info || {},
        species: (p.species || []) as StoreProductWithDetails['species'],
        life_stages: (p.life_stages || []) as StoreProductWithDetails['life_stages'],
        breed_sizes: (p.breed_sizes || []) as StoreProductWithDetails['breed_sizes'],
        health_conditions: (p.health_conditions || []) as StoreProductWithDetails['health_conditions'],
        weight_grams: p.weight_grams,
        dimensions: p.dimensions,
        is_prescription_required: p.is_prescription_required,
        is_featured: p.is_featured,
        is_new_arrival: p.is_new_arrival,
        is_best_seller: p.is_best_seller,
        avg_rating: p.avg_rating || 0,
        review_count: p.review_count || 0,
        sales_count: p.sales_count || 0,
        view_count: p.view_count || 0,
        meta_title: p.meta_title,
        meta_description: p.meta_description,
        sort_order: p.sort_order,
        is_active: p.is_active,
        created_at: p.created_at,
        updated_at: p.updated_at,
        category: p.store_categories ? {
          id: p.store_categories.id,
          tenant_id: clinic,
          name: p.store_categories.name,
          slug: p.store_categories.slug,
          description: null,
          icon: null,
          image_url: null,
          sort_order: 0,
          is_featured: false,
          is_active: true,
          created_at: '',
          updated_at: '',
        } : null,
        subcategory: p.store_subcategories ? {
          id: p.store_subcategories.id,
          tenant_id: clinic,
          category_id: p.category_id || '',
          name: p.store_subcategories.name,
          slug: p.store_subcategories.slug,
          description: null,
          icon: null,
          sort_order: 0,
          is_active: true,
          created_at: '',
          updated_at: '',
        } : null,
        brand: p.store_brands ? {
          id: p.store_brands.id,
          tenant_id: clinic,
          name: p.store_brands.name,
          slug: p.store_brands.slug,
          logo_url: p.store_brands.logo_url,
          description: null,
          website_url: null,
          is_featured: false,
          sort_order: 0,
          is_active: true,
          created_at: '',
          updated_at: '',
        } : null,
        inventory: p.store_inventory ? {
          stock_quantity: p.store_inventory.stock_quantity || 0,
          min_stock_level: p.store_inventory.min_stock_level,
        } : { stock_quantity: 0, min_stock_level: null },
        images: (p.store_product_images || []).sort((a, b) => a.sort_order - b.sort_order).map(img => ({
          id: img.id,
          product_id: p.id,
          tenant_id: clinic,
          image_url: img.image_url,
          alt_text: img.alt_text,
          sort_order: img.sort_order,
          is_primary: img.is_primary,
          created_at: '',
        })),
        variants: (p.store_product_variants || []).sort((a, b) => a.sort_order - b.sort_order).map(v => ({
          id: v.id,
          product_id: p.id,
          tenant_id: clinic,
          sku: v.sku,
          name: v.name,
          variant_type: v.variant_type as StoreProductWithDetails['variants'][0]['variant_type'],
          price_modifier: v.price_modifier,
          stock_quantity: v.stock_quantity,
          sort_order: v.sort_order,
          is_default: v.is_default,
          is_active: true,
          created_at: '',
          updated_at: '',
        })),
        current_price: currentPrice,
        original_price: originalPrice,
        has_discount: !!discount,
        discount_percentage: discountPercentage,
      };
    });

    // Filter by stock if needed (after processing since inventory is joined)
    if (filters.in_stock_only) {
      processedProducts = processedProducts.filter(p => (p.inventory?.stock_quantity || 0) > 0);
    }

    // Filter by on_sale (products with active discounts)
    if (filters.on_sale) {
      processedProducts = processedProducts.filter(p => p.has_discount);
    }

    // Sort by discount if requested
    if (sort === 'discount') {
      processedProducts.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
    }

    // Get available filters
    const availableFilters = await getAvailableFilters(supabase, clinic, filters);

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const response: ProductListResponse = {
      products: processedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        applied: filters,
        available: availableFilters,
      },
    };

    return NextResponse.json(response);
  } catch (e) {
    console.error('Error loading products from Supabase', e);
    return NextResponse.json({ error: 'No se pudieron cargar los productos' }, { status: 500 });
  }
}

async function getAvailableFilters(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
  currentFilters: ProductFilters
): Promise<AvailableFilters> {
  // Get categories with product counts
  const { data: categories } = await supabase
    .from('store_categories')
    .select('id, name, slug')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('sort_order');

  // Get subcategories
  const { data: subcategories } = await supabase
    .from('store_subcategories')
    .select('id, name, slug')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('sort_order');

  // Get brands
  const { data: brands } = await supabase
    .from('store_brands')
    .select('id, name, slug')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('name');

  // Get price range
  const { data: priceData } = await supabase
    .from('store_products')
    .select('base_price')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('base_price', { ascending: true });

  const prices = priceData?.map(p => p.base_price) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return {
    categories: (categories || []).map(c => ({ id: c.id, name: c.name, slug: c.slug, count: 0 })),
    subcategories: (subcategories || []).map(s => ({ id: s.id, name: s.name, slug: s.slug, count: 0 })),
    brands: (brands || []).map(b => ({ id: b.id, name: b.name, slug: b.slug, count: 0 })),
    species: [
      { value: 'perro' as const, label: 'Perro', count: 0 },
      { value: 'gato' as const, label: 'Gato', count: 0 },
      { value: 'ave' as const, label: 'Ave', count: 0 },
      { value: 'reptil' as const, label: 'Reptil', count: 0 },
      { value: 'pez' as const, label: 'Pez', count: 0 },
      { value: 'roedor' as const, label: 'Roedor', count: 0 },
      { value: 'conejo' as const, label: 'Conejo', count: 0 },
    ],
    life_stages: [
      { value: 'cachorro' as const, label: 'Cachorro', count: 0 },
      { value: 'junior' as const, label: 'Junior', count: 0 },
      { value: 'adulto' as const, label: 'Adulto', count: 0 },
      { value: 'senior' as const, label: 'Senior', count: 0 },
    ],
    breed_sizes: [
      { value: 'mini' as const, label: 'Mini (< 4kg)', count: 0 },
      { value: 'pequeno' as const, label: 'Pequeño (4-10kg)', count: 0 },
      { value: 'mediano' as const, label: 'Mediano (10-25kg)', count: 0 },
      { value: 'grande' as const, label: 'Grande (25-45kg)', count: 0 },
      { value: 'gigante' as const, label: 'Gigante (> 45kg)', count: 0 },
    ],
    health_conditions: [
      { value: 'urinario' as const, label: 'Salud Urinaria', count: 0 },
      { value: 'digestivo' as const, label: 'Salud Digestiva', count: 0 },
      { value: 'piel' as const, label: 'Piel y Pelaje', count: 0 },
      { value: 'articulaciones' as const, label: 'Articulaciones', count: 0 },
      { value: 'peso' as const, label: 'Control de Peso', count: 0 },
      { value: 'renal' as const, label: 'Salud Renal', count: 0 },
      { value: 'cardiaco' as const, label: 'Salud Cardíaca', count: 0 },
      { value: 'hepatico' as const, label: 'Salud Hepática', count: 0 },
      { value: 'diabetico' as const, label: 'Diabetes', count: 0 },
      { value: 'alergias' as const, label: 'Alergias', count: 0 },
    ],
    price_range: {
      min: minPrice,
      max: maxPrice,
    },
  };
}
