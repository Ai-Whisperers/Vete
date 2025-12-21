import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/inventory/catalog
 * Browse global catalog products not assigned to clinic
 *
 * Query params:
 * - clinic: tenant_id (required)
 * - search: search query (optional)
 * - category: category slug (optional)
 * - brand: brand slug (optional)
 * - page: page number (default: 1)
 * - limit: items per page (default: 24)
 * - show_assigned: show already assigned products too (default: false)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const page = Number.parseInt(searchParams.get('page') || '1');
  const limit = Number.parseInt(searchParams.get('limit') || '24');
  const showAssigned = searchParams.get('show_assigned') === 'true';

  if (!clinic) {
    return NextResponse.json({ error: 'Falta el parámetro clinic' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    // Build the base query
    let query = supabase
      .from('store_products')
      .select(`
        id,
        sku,
        name,
        description,
        short_description,
        base_price,
        image_url,
        images,
        target_species,
        requires_prescription,
        created_at,
        store_categories(id, name, slug),
        store_brands(id, name, slug, logo_url)
      `)
      .is('tenant_id', null)  // Only global catalog products
      .eq('is_global_catalog', true)
      .eq('is_active', true)
      .is('deleted_at', null);

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    // Add category filter
    if (category) {
      query = query.eq('store_categories.slug', category);
    }

    // Add brand filter
    if (brand) {
      query = query.eq('store_brands.slug', brand);
    }

    // Test simple query first
    const { data: testData, error: testError } = await supabase
      .from('store_products')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Table test error:', testError);
      return NextResponse.json({
        error: 'Database table error',
        details: testError.message
      }, { status: 500 });
    }

    // Get total count first - simplified
    const { count: totalCount, error: countError } = await supabase
      .from('store_products')
      .select('id', { count: 'exact', head: true })
      .is('tenant_id', null)
      .eq('is_global_catalog', true)
      .eq('is_active', true);

    if (countError) {
      console.error('Count query error:', countError);
      console.error('Count query details:', JSON.stringify(countError, null, 2));
      return NextResponse.json({
        error: 'Error al obtener el total',
        details: countError.message || 'Unknown error'
      }, { status: 500 });
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data: products, error: productsError } = await query
      .order('name', { ascending: true });

    if (productsError) {
      console.error('Products query error:', productsError);
      return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
    }

    // Get assignment status for these products
    const productIds = products?.map(p => p.id) || [];
    const { data: assignments, error: assignmentsError } = await supabase
      .from('clinic_product_assignments')
      .select('catalog_product_id, sale_price, is_active')
      .eq('tenant_id', clinic)
      .in('catalog_product_id', productIds);

    if (assignmentsError) {
      console.error('Assignments query error:', assignmentsError);
      return NextResponse.json({ error: 'Error al verificar asignaciones' }, { status: 500 });
    }

    // Create assignment map
    const assignmentMap = new Map();
    assignments?.forEach(assignment => {
      assignmentMap.set(assignment.catalog_product_id, assignment);
    });

    // Filter products based on show_assigned flag
    let filteredProducts = products || [];
    if (!showAssigned) {
      filteredProducts = filteredProducts.filter(product => !assignmentMap.has(product.id));
    }

    // Add assignment info to products
    const productsWithAssignment = filteredProducts.map(product => ({
      ...product,
      assignment: assignmentMap.get(product.id) || null,
      is_assigned: assignmentMap.has(product.id)
    }));

    // Calculate pagination info
    const total = totalCount || 0;
    const pages = Math.ceil(total / limit);

    const pagination = {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    };

    return NextResponse.json({
      products: productsWithAssignment,
      pagination,
      filters: {
        applied: {
          search: search || null,
          category: category || null,
          brand: brand || null,
          show_assigned: showAssigned
        }
      }
    });

  } catch (error) {
    console.error('Catalog API error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
