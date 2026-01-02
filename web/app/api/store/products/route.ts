import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProductListResponse, StoreProductWithDetails, AvailableFilters, SortOption } from '@/lib/types/store';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

// Schema for creating a new product
const createProductSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  base_price: z.number().min(0, 'Precio debe ser positivo'),
  sale_price: z.number().min(0).optional(),
  purchase_unit: z.string().optional(),
  sale_unit: z.string().optional(),
  conversion_factor: z.number().min(0).optional(),
  image_url: z.string().url().optional().nullable(),
  is_prescription_required: z.boolean().optional(),
  is_active: z.boolean().optional(),
  initial_stock: z.number().min(0).optional(),
  reorder_point: z.number().min(0).optional(),
});

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
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
      details: { message: 'Clinic not provided' }
    });
  }

  const supabase = await createClient();

  // DEBUG: Log the query params
  console.log('🔍 [Store Products API] Fetching products for:', { clinic, page, limit, sort, search, category });

  // Simplified query - avoid joins that might not have foreign keys set up
  let query = supabase
    .from('store_products')
    .select('*', { count: 'exact' })
    .eq('tenant_id', clinic)
    .eq('is_active', true)
    .is('deleted_at', null);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  if (category) {
    query = query.eq('category.slug', category);
  }

  // Apply sorting
  switch (sort) {
    case 'price_low_high':
      query = query.order('current_price', { ascending: true });
      break;
    case 'price_high_low':
      query = query.order('current_price', { ascending: false });
      break;
    case 'name_asc':
      query = query.order('name', { ascending: true });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'best_selling':
      // Would need sales data - fall through to default for now
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
    // Supabase errors have message, details, hint, code properties
    logger.error('Error fetching store products', {
      tenantId: clinic,
      errorMessage: error.message,
      errorCode: error.code,
      errorDetails: error.details,
      errorHint: error.hint
    });
    console.error('🔴 [Store Products API] Supabase Error:', JSON.stringify(error, null, 2));
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: error.message }
    });
  }

  // DEBUG: Log success
  console.log('✅ [Store Products API] Found products:', {
    count,
    productCount: products?.length,
    firstProduct: products?.[0]?.name
  });

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
      limit,
      pages: totalPages,
      total: count || 0,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    filters: {
      applied: {}, // This would be the filters from searchParams
      available: availableFilters,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * POST /api/store/products
 * Create a new product (staff only)
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  // Get user's profile and verify staff role
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
      details: { message: 'Perfil no encontrado' }
    });
  }

  if (profile.role !== 'vet' && profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN, {
      details: { message: 'Solo personal autorizado puede crear productos' }
    });
  }

  try {
    const body = await request.json();
    const validation = createProductSchema.safeParse(body);

    if (!validation.success) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        field_errors: validation.error.flatten().fieldErrors as Record<string, string[]>
      });
    }

    const data = validation.data;

    // Create product
    const { data: product, error: productError } = await supabase
      .from('store_products')
      .insert({
        tenant_id: profile.tenant_id,
        name: data.name,
        description: data.description,
        short_description: data.short_description,
        sku: data.sku,
        barcode: data.barcode,
        category_id: data.category_id,
        brand_id: data.brand_id,
        base_price: data.base_price,
        sale_price: data.sale_price,
        current_price: data.sale_price ?? data.base_price,
        purchase_unit: data.purchase_unit || 'Unidad',
        sale_unit: data.sale_unit || 'Unidad',
        conversion_factor: data.conversion_factor || 1,
        image_url: data.image_url,
        is_prescription_required: data.is_prescription_required || false,
        is_active: data.is_active ?? true,
      })
      .select()
      .single();

    if (productError) {
      logger.error('Error creating product', {
        tenantId: profile.tenant_id,
        userId: user.id,
        error: productError instanceof Error ? productError.message : String(productError)
      });
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { message: 'Error al crear producto' }
      });
    }

    // Create initial inventory record if stock provided
    if (data.initial_stock !== undefined || data.reorder_point !== undefined) {
      const { error: inventoryError } = await supabase
        .from('store_inventory')
        .insert({
          tenant_id: profile.tenant_id,
          product_id: product.id,
          stock_quantity: data.initial_stock ?? 0,
          reorder_point: data.reorder_point ?? 5,
        });

      if (inventoryError) {
        logger.error('Error creating inventory', {
          tenantId: profile.tenant_id,
          productId: product.id,
          error: inventoryError instanceof Error ? inventoryError.message : String(inventoryError)
        });
        // Don't fail the whole operation, product was created
      }
    }

    return NextResponse.json({
      success: true,
      product
    }, { status: 201 });

  } catch (error) {
    logger.error('Error in product creation', {
      tenantId: profile?.tenant_id,
      userId: user?.id,
      error: error instanceof Error ? error.message : 'Unknown'
    });
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}