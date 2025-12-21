import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parsePagination } from '@/lib/api/pagination';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';
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
  images: string[] | null; // Array of image URLs stored directly in products table
  base_price: number;
  attributes: Record<string, string> | null; // Was specifications
  target_species: string[] | null; // Was species
  weight_grams: number | null;
  dimensions: { length?: number; width?: number; height?: number } | null;
  requires_prescription: boolean; // Column name in DB
  is_featured: boolean;
  is_active: boolean;
  display_order: number; // Column name in DB (was sort_order)
  created_at: string;
  updated_at: string;
  category_id: string | null;
  brand_id: string | null;
  store_categories: { id: string; name: string; slug: string } | null;
  store_brands: { id: string; name: string; slug: string; logo_url: string | null } | null;
  store_inventory: { stock_quantity: number; min_stock_level: number | null } | null;
}

/**
 * Public endpoint - no authentication required
 * Returns product catalog for a clinic
 *
 * @param clinic - Clinic slug (required)
 * @param search - Search query (optional)
 * @param category - Category filter (optional)
 * @param sort - Sort order (relevance, price_low_high, price_high_low, newest, rating, best_selling, name_asc, discount)
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 24)
 *
 * Returns paginated products with filters and sorting
 */
export async function GET(request: NextRequest): Promise<NextResponse<ProductListResponse | { error: string }>> {
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');

  if (!clinic) {
    return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
      field_errors: { clinic: ['El parámetro clinic es requerido'] }
    });
  }

  const supabase = await createClient();

  try {
    // Parse query parameters - default to 24 items per page for store
    const { page, limit, offset } = parsePagination(searchParams);
    const effectiveLimit = searchParams.get('limit') ? limit : 24; // Use 24 as default for store
    const effectiveOffset = (page - 1) * effectiveLimit;
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
    // Note: store_subcategories, store_product_images, store_product_variants don't exist
    // - Categories use self-referencing parent_id for hierarchy
    // - Images are stored in images TEXT[] array on products
    // - Variants are not currently implemented in schema
    let queryBuilder = supabase
      .from('store_products')
      .select(`
        *,
        store_categories(id, name, slug),
        store_brands(id, name, slug, logo_url),
        store_inventory(stock_quantity, min_stock_level)
      `, { count: 'exact' })
      .eq('tenant_id', clinic)
      .eq('is_active', true);

    // Apply filters
    if (filters.search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    if (filters.category) {
      // Get the selected category and all its descendants
      // First, fetch all categories to build the hierarchy
      const { data: allCategories } = await supabase
        .from('store_categories')
        .select('id, slug, parent_id')
        .eq('tenant_id', clinic)
        .eq('is_active', true);

      if (allCategories) {
        // Find the selected category
        const selectedCat = allCategories.find(c => c.slug === filters.category);

        if (selectedCat) {
          // Recursively collect all descendant category IDs
          const collectDescendants = (parentId: string): string[] => {
            const children = allCategories.filter(c => c.parent_id === parentId);
            return children.reduce<string[]>((acc, child) => {
              return [...acc, child.id, ...collectDescendants(child.id)];
            }, []);
          };

          const categoryIds = [selectedCat.id, ...collectDescendants(selectedCat.id)];

          // Filter products that belong to any of these categories
          queryBuilder = queryBuilder.in('category_id', categoryIds);
        }
      }
    }

    // Note: subcategory filter removed - schema uses parent_id hierarchy on store_categories
    // If subcategory filtering is needed, use the parent category's slug with nested category lookup

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

    // Note: The schema uses target_species TEXT[] instead of species, life_stages, breed_sizes, health_conditions
    if (filters.species && filters.species.length > 0) {
      queryBuilder = queryBuilder.overlaps('target_species', filters.species);
    }

    // Note: life_stages, breed_sizes, health_conditions columns don't exist in current schema
    // These filters are ignored until schema is updated

    if (filters.price_min !== undefined) {
      queryBuilder = queryBuilder.gte('base_price', filters.price_min);
    }

    if (filters.price_max !== undefined) {
      queryBuilder = queryBuilder.lte('base_price', filters.price_max);
    }

    // Note: is_new_arrival and is_best_seller columns don't exist in current schema
    // Filtering by featured still works
    if (filters.featured) {
      queryBuilder = queryBuilder.eq('is_featured', true);
    }

    // Note: Column is requires_prescription not is_prescription_required
    if (filters.prescription_required !== undefined) {
      queryBuilder = queryBuilder.eq('requires_prescription', filters.prescription_required);
    }

    // Note: avg_rating column doesn't exist in current schema

    // Apply sorting
    // Note: Column is display_order not sort_order
    // Note: sales_count, avg_rating, review_count don't exist in current schema
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
        // avg_rating doesn't exist, fall back to display_order
        queryBuilder = queryBuilder.order('display_order', { ascending: true }).order('name', { ascending: true });
        break;
      case 'best_selling':
        // sales_count doesn't exist, fall back to display_order
        queryBuilder = queryBuilder.order('display_order', { ascending: true }).order('name', { ascending: true });
        break;
      case 'name_asc':
        queryBuilder = queryBuilder.order('name', { ascending: true });
        break;
      case 'discount':
        // Will be handled after fetching campaigns
        queryBuilder = queryBuilder.order('display_order', { ascending: true }).order('name', { ascending: true });
        break;
      case 'relevance':
      default:
        queryBuilder = queryBuilder
          .order('is_featured', { ascending: false })
          .order('display_order', { ascending: true })
          .order('name', { ascending: true });
        break;
    }

    // Apply pagination
    queryBuilder = queryBuilder.range(effectiveOffset, effectiveOffset + effectiveLimit - 1);

    const { data: products, error: pError, count } = await queryBuilder;

    if (pError) throw pError;

    // Fetch active campaigns for discount calculation
    // Note: This query may fail if there's no FK relationship detected by PostgREST
    // We handle this gracefully by defaulting to empty campaigns
    const now = new Date().toISOString();
    let campaigns: Campaign[] | null = null;

    try {
      const { data: campaignData, error: cError } = await supabase
        .from('store_campaigns')
        .select(`
          id,
          store_campaign_items(product_id, discount_type, discount_value)
        `)
        .eq('tenant_id', clinic)
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now);

      if (!cError) {
        campaigns = campaignData as Campaign[] | null;
      }
    } catch {
      // Campaign query failed - continue without discounts
      console.warn('Could not load campaigns for discount calculation');
    }

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

      // Map database fields to API response structure
      // Note: Many fields don't exist in current schema - providing sensible defaults
      return {
        id: p.id,
        tenant_id: clinic,
        category_id: p.category_id,
        subcategory_id: null, // Doesn't exist in schema
        brand_id: p.brand_id,
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        short_description: p.short_description,
        description: p.description,
        // Use image_url or first from images array
        image_url: p.image_url || (p.images && p.images.length > 0 ? p.images[0] : null),
        base_price: p.base_price,
        specifications: p.attributes || {},
        features: [],
        ingredients: null,
        nutritional_info: {},
        species: (p.target_species || []) as StoreProductWithDetails['species'],
        life_stages: [] as StoreProductWithDetails['life_stages'],
        breed_sizes: [] as StoreProductWithDetails['breed_sizes'],
        health_conditions: [] as StoreProductWithDetails['health_conditions'],
        weight_grams: p.weight_grams,
        dimensions: p.dimensions,
        is_prescription_required: p.requires_prescription,
        is_featured: p.is_featured,
        is_new_arrival: false, // Doesn't exist in schema
        is_best_seller: false, // Doesn't exist in schema
        avg_rating: 0, // Doesn't exist in schema
        review_count: 0, // Doesn't exist in schema
        sales_count: 0, // Doesn't exist in schema
        view_count: 0, // Doesn't exist in schema
        meta_title: null,
        meta_description: null,
        sort_order: p.display_order,
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
        subcategory: null, // Doesn't exist in schema - categories use parent_id hierarchy
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
        // Convert images array strings to image objects
        images: (p.images || []).map((url, index) => ({
          id: `${p.id}-img-${index}`,
          product_id: p.id,
          tenant_id: clinic,
          image_url: url,
          alt_text: p.name,
          sort_order: index,
          is_primary: index === 0,
          created_at: '',
        })),
        variants: [], // Variants table doesn't exist in current schema
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
    const totalPages = Math.ceil(total / effectiveLimit);

    const response: ProductListResponse = {
      products: processedProducts,
      pagination: {
        page,
        limit: effectiveLimit,
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
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function getAvailableFilters(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
  currentFilters: ProductFilters
): Promise<AvailableFilters> {
  // Get categories with parent info for tree building (column is display_order not sort_order)
  const { data: categories } = await supabase
    .from('store_categories')
    .select('id, name, slug, parent_id')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('display_order');

  // Build a map of id -> slug for parent lookup
  const categoryIdToSlug = new Map<string, string>();
  (categories || []).forEach(c => categoryIdToSlug.set(c.id, c.slug));

  // Note: store_subcategories table doesn't exist - categories use parent_id hierarchy

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
    categories: (categories || []).map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parent_slug: c.parent_id ? categoryIdToSlug.get(c.parent_id) : undefined,
      count: 0
    })),
    subcategories: [], // Subcategories table doesn't exist - use parent_id hierarchy on categories
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
