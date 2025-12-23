
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';
import type {
  ProductListResponse,
  ProductFilters,
  SortOption,
  StoreProductWithDetails,
  AvailableFilters,
  Species,
  StoreCategory,
  StoreBrand
} from '@/lib/types/store';
import { SPECIES_LABELS } from '@/lib/types/store';

// Local Types
interface ProductFromDB {
  id: string;
  sku: string | null;
  barcode: string | null;
  name: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  images: string[] | null;
  base_price: number;
  attributes: any;
  target_species: string[] | null;
  weight_grams: number | null;
  dimensions: any;
  requires_prescription: boolean;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  category_id: string | null;
  brand_id: string | null;
  store_categories: StoreCategory | null;
  store_brands: StoreBrand | null;
  store_inventory: {
    stock_quantity: number;
    min_stock_level: number | null;
  } | null;
}

interface CampaignItem {
  product_id: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
}
interface Campaign {
  id: string;
  store_campaign_items: CampaignItem[];
}

const parsePagination = (searchParams: URLSearchParams) => {
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12'); 
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!clinic) {
    return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
      field_errors: { clinic: ['El parámetro clinic es requerido'] }
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { page, limit } = parsePagination(searchParams);
    const effectiveLimit = searchParams.get('limit') ? limit : 24; 
    const sort = (searchParams.get('sort') || 'relevance') as SortOption;

    // Filters
    const filters: ProductFilters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      brand: searchParams.get('brand') || undefined,
      species: searchParams.getAll('species').length > 0 ? searchParams.getAll('species') as Species[] : undefined,
      price_min: searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : undefined,
      price_max: searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : undefined,
      in_stock_only: searchParams.get('in_stock_only') === 'true',
      on_sale: searchParams.get('on_sale') === 'true',
      featured: searchParams.get('featured') === 'true',
      prescription_required: searchParams.get('prescription_required') === 'true' ? true : searchParams.get('prescription_required') === 'false' ? false : undefined,
    };

    // 1. Get Assignments
    const { data: assignments, error: assignError } = await supabase
      .from('clinic_product_assignments')
      .select('catalog_product_id, sale_price, min_stock_level, location, requires_prescription')
      .eq('tenant_id', clinic)
      .eq('is_active', true);

    if (assignError) throw assignError;

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({
        products: [],
        pagination: { page: 1, limit: effectiveLimit, total: 0, pages: 0, hasNext: false, hasPrev: false },
        filters: { applied: filters, available: await getAvailableFilters(supabase, clinic, filters) }
      });
    }

    // 2. Filter Assignments
    let filteredAssignments = assignments;
    if (filters.price_min !== undefined) filteredAssignments = filteredAssignments.filter(a => a.sale_price >= filters.price_min!);
    if (filters.price_max !== undefined) filteredAssignments = filteredAssignments.filter(a => a.sale_price <= filters.price_max!);

    if (filteredAssignments.length === 0) {
        return NextResponse.json({ products: [], pagination: { page: 1, limit: effectiveLimit, total: 0, pages: 0, hasNext: false, hasPrev: false }, filters: { applied: filters, available: await getAvailableFilters(supabase, clinic, filters) } });
    }

    const allProductIds = filteredAssignments.map(a => a.catalog_product_id);
    
    // 3. Chunked Fetching of Products
    const chunkSize = 50;
    const products: ProductFromDB[] = [];
    const chunks = [];
    
    for (let i = 0; i < allProductIds.length; i += chunkSize) {
        chunks.push(allProductIds.slice(i, i + chunkSize));
    }

    // Process chunks in parallel
    const chunkResults = await Promise.all(chunks.map(async (chunkIds) => {
        let q = supabase.from('store_products').select(`
            id, sku, barcode, name, short_description, description, image_url, images, base_price, attributes, target_species, weight_grams, dimensions, requires_prescription, is_featured, is_active, display_order, created_at, updated_at, category_id, brand_id,
            store_categories(id, name, slug),
            store_brands(id, name, slug, logo_url),
            store_inventory(stock_quantity, min_stock_level)
        `).in('id', chunkIds).eq('is_active', true);

        // Apply pre-fetch filters (Optimized)
        if (filters.search) q = q.or(`name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`); 
        if (filters.featured) q = q.eq('is_featured', true);
        
        const { data, error } = await q;
        if (error) { console.error('Chunk fail', error); return []; }
        return data as ProductFromDB[];
    }));

    chunkResults.forEach(r => products.push(...r));

    // 4. In-Memory Filter/Merge/Sort
    const now = new Date().toISOString();
    let campaigns: Campaign[] | null = null;
    try {
      const { data: campaignData } = await supabase
        .from('store_campaigns').select('id, store_campaign_items(product_id, discount_type, discount_value)')
        .eq('tenant_id', clinic).eq('is_active', true).lte('start_date', now).gte('end_date', now);
      campaigns = campaignData as any;
    } catch { }

    const discountMap = new Map<string, { type: 'percentage' | 'fixed_amount'; value: number }>();
    campaigns?.forEach(camp => camp.store_campaign_items.forEach(item => discountMap.set(item.product_id, { type: item.discount_type, value: item.discount_value })));
    const assignmentMap = new Map(filteredAssignments.map(a => [a.catalog_product_id, a]));

    let processedProducts: StoreProductWithDetails[] = products.map(p => {
      const assignment = assignmentMap.get(p.id);
      if (!assignment) return null as any; 

      const clinicPrice = assignment.sale_price || p.base_price;
      const discount = discountMap.get(p.id);
      let currentPrice = clinicPrice;
      let discountPercentage: number | null = null;

      if (discount) {
        if (discount.type === 'percentage') {
            currentPrice = clinicPrice * (1 - (discount.value / 100));
            discountPercentage = discount.value;
        } else {
            currentPrice = Math.max(0, clinicPrice - discount.value);
            discountPercentage = Math.round((discount.value / clinicPrice) * 100);
        }
      }

      return {
        id: p.id,
        tenant_id: clinic,
        category_id: p.category_id,
        subcategory_id: null,
        brand_id: p.brand_id,
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        short_description: p.short_description,
        description: p.description,
        image_url: p.image_url || ((p.images && p.images.length > 0) ? p.images[0] : null),
        base_price: clinicPrice,
        specifications: p.attributes || {},
        features: [],
        ingredients: null,
        nutritional_info: {},
        species: (p.target_species || []) as any,
        life_stages: [],
        breed_sizes: [],
        health_conditions: [],
        weight_grams: p.weight_grams,
        dimensions: p.dimensions,
        is_prescription_required: assignment.requires_prescription ?? p.requires_prescription,
        is_featured: p.is_featured,
        is_new_arrival: false,
        is_best_seller: false,
        avg_rating: 0,
        review_count: 0,
        sales_count: 0,
        view_count: 0,
        meta_title: null,
        meta_description: null,
        sort_order: p.display_order,
        is_active: p.is_active,
        created_at: p.created_at,
        updated_at: p.updated_at,
        category: p.store_categories ? { ...p.store_categories, tenant_id: clinic, is_active: true, sort_order: 0, is_featured: false, created_at: '', updated_at: '', image_url: null, icon: null, description: null } : null,
        subcategory: null,
        brand: p.store_brands ? { ...p.store_brands, tenant_id: clinic, is_active: true, sort_order: 0, is_featured: false, created_at: '', updated_at: '', description: null, website_url: null } : null,
        inventory: {
          stock_quantity: p.store_inventory?.stock_quantity || 0,
          min_stock_level: assignment.min_stock_level || p.store_inventory?.min_stock_level || null
        },
        images: (p.images || []).map((url: string, idx: number) => ({ id: `${p.id}-${idx}`, product_id: p.id, tenant_id: clinic, image_url: url, alt_text: p.name, sort_order: idx, is_primary: idx === 0, created_at: '' })),
        variants: [],
        current_price: currentPrice,
        original_price: discount ? clinicPrice : null,
        has_discount: !!discount,
        discount_percentage: discountPercentage
      } as StoreProductWithDetails;
    }).filter(Boolean);

    // Apply Filters (In Memory)
    if (filters.category) processedProducts = processedProducts.filter(p => p.category?.slug === filters.category); 
    if (filters.brand) processedProducts = processedProducts.filter(p => p.brand?.slug === filters.brand);
    if (filters.in_stock_only) processedProducts = processedProducts.filter(p => p.inventory && p.inventory.stock_quantity > 0);
    if (filters.on_sale) processedProducts = processedProducts.filter(p => p.has_discount);
    if (filters.species && filters.species.length > 0) processedProducts = processedProducts.filter(p => p.species.some((s: string) => filters.species?.includes(s as any)));

    // Sort
    if (sort === 'discount') {
        processedProducts.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
    } else if (sort === 'price_low_high') {
        processedProducts.sort((a, b) => a.current_price - b.current_price);
    } else if (sort === 'price_high_low') {
        processedProducts.sort((a, b) => b.current_price - a.current_price);
    } else if (sort === 'name_asc') {
        processedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        processedProducts.sort((a, b) => {
            if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
            return (a.sort_order || 0) - (b.sort_order || 0);
        });
    }

    const total = processedProducts.length;
    const paginatedProducts = processedProducts.slice((page - 1) * effectiveLimit, page * effectiveLimit);

    const availableFilters = await getAvailableFilters(supabase, clinic, filters);

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        page,
        limit: effectiveLimit,
        total,
        pages: Math.ceil(total / effectiveLimit),
        hasNext: page < Math.ceil(total / effectiveLimit),
        hasPrev: page > 1,
      },
      filters: { applied: filters, available: availableFilters }
    });

  } catch (e: any) {
    console.error('Error loading products:', e);
    return NextResponse.json({ error: "Internal Server Error", details: e.message, cause: e.cause }, { status: 500 });
  }
}

async function getAvailableFilters(supabase: any, tenantId: string, currentFilters: ProductFilters): Promise<AvailableFilters> {
  try {
    const [categoriesRes, brandsRes, speciesRes] = await Promise.all([
      supabase.from('store_categories').select('id, name, slug').eq('tenant_id', tenantId).eq('is_active', true).order('name'),
      supabase.from('store_brands').select('id, name, slug').eq('tenant_id', tenantId).eq('is_active', true).order('name'),
      supabase.from('store_products').select('target_species').eq('is_active', true)
    ]);

    const speciesSet = new Set<string>();
    if (speciesRes.data) {
        speciesRes.data.forEach((p: any) => {
            p.target_species?.forEach((s: string) => speciesSet.add(s));
        });
    }

    const speciesOptions = Array.from(speciesSet).sort().map(s => ({
        value: s as Species,
        label: SPECIES_LABELS[s as Species] || s.charAt(0).toUpperCase() + s.slice(1),
        count: 0 
    }));

    return {
      categories: (categoriesRes.data || []).map((c: any) => ({ ...c, count: 0 })),
      subcategories: [], 
      brands: (brandsRes.data || []).map((b: any) => ({ ...b, count: 0 })),
      species: speciesOptions,
      life_stages: [],
      breed_sizes: [],
      health_conditions: [],
      price_range: { min: 0, max: 1000000 } 
    };
  } catch (e) {
    console.error('Error fetching filters', e);
    return { categories: [], subcategories: [], brands: [], species: [], life_stages: [], breed_sizes: [], health_conditions: [], price_range: { min: 0, max: 0 } };
  }
}
