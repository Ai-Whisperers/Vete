import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { StoreProductWithDetails, StoreReview, ReviewSummary } from '@/lib/types/store';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: Props
): Promise<NextResponse> {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');

  if (!clinic) {
    return NextResponse.json({ error: 'Falta el parámetro clinic' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    // Get product with all related data
    const { data: product, error: pError } = await supabase
      .from('store_products')
      .select(`
        *,
        store_categories(id, name, slug, description, icon, image_url),
        store_subcategories(id, name, slug, description, icon),
        store_brands(id, name, slug, logo_url, description, website_url),
        store_inventory(stock_quantity, min_stock_level, expiry_date, batch_number),
        store_product_images(id, image_url, alt_text, is_primary, sort_order),
        store_product_variants(id, sku, name, variant_type, price_modifier, stock_quantity, is_default, sort_order, is_active)
      `)
      .eq('tenant_id', clinic)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (pError || !product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // Fetch active campaigns for discount
    const now = new Date().toISOString();
    const { data: campaigns } = await supabase
      .from('store_campaigns')
      .select(`
        id,
        store_campaign_items!inner(product_id, discount_type, discount_value)
      `)
      .eq('tenant_id', clinic)
      .eq('is_active', true)
      .eq('store_campaign_items.product_id', id)
      .lte('start_date', now)
      .gte('end_date', now);

    let currentPrice = product.base_price;
    let originalPrice: number | null = null;
    let discountPercentage: number | null = null;
    let hasDiscount = false;

    if (campaigns && campaigns.length > 0) {
      const campaignItem = campaigns[0].store_campaign_items[0];
      if (campaignItem) {
        hasDiscount = true;
        originalPrice = product.base_price;
        if (campaignItem.discount_type === 'percentage') {
          currentPrice = product.base_price * (1 - (campaignItem.discount_value / 100));
          discountPercentage = campaignItem.discount_value;
        } else {
          currentPrice = Math.max(0, product.base_price - campaignItem.discount_value);
          discountPercentage = Math.round((campaignItem.discount_value / product.base_price) * 100);
        }
      }
    }

    // Get reviews summary
    const { data: reviews } = await supabase
      .from('store_reviews')
      .select('rating')
      .eq('product_id', id)
      .eq('is_approved', true);

    const reviewSummary: ReviewSummary = {
      avg_rating: product.avg_rating || 0,
      total_reviews: product.review_count || 0,
      rating_distribution: {
        5: reviews?.filter(r => r.rating === 5).length || 0,
        4: reviews?.filter(r => r.rating === 4).length || 0,
        3: reviews?.filter(r => r.rating === 3).length || 0,
        2: reviews?.filter(r => r.rating === 2).length || 0,
        1: reviews?.filter(r => r.rating === 1).length || 0,
      },
    };

    // Get related products
    const { data: relatedProducts } = await supabase
      .from('store_related_products')
      .select(`
        relation_type,
        related_product:related_product_id(
          id, name, short_description, image_url, base_price,
          avg_rating, review_count, is_new_arrival, is_best_seller,
          store_inventory(stock_quantity)
        )
      `)
      .eq('product_id', id)
      .eq('tenant_id', clinic)
      .order('sort_order')
      .limit(12);

    // Get product questions
    const { data: questions } = await supabase
      .from('store_product_questions')
      .select(`
        *,
        user:user_id(full_name),
        answerer:answered_by(full_name)
      `)
      .eq('product_id', id)
      .eq('is_public', true)
      .not('answer', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    // Track product view (if user is authenticated)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.rpc('track_product_view', {
        p_user_id: user.id,
        p_product_id: id,
        p_tenant_id: clinic,
      });
    }

    // Build response
    const productWithDetails: StoreProductWithDetails = {
      id: product.id,
      tenant_id: clinic,
      category_id: product.category_id,
      subcategory_id: product.subcategory_id,
      brand_id: product.brand_id,
      sku: product.sku,
      barcode: product.barcode,
      name: product.name,
      short_description: product.short_description,
      description: product.description,
      image_url: product.image_url || product.store_product_images?.find((img: { is_primary: boolean }) => img.is_primary)?.image_url || product.store_product_images?.[0]?.image_url || null,
      base_price: product.base_price,
      specifications: product.specifications || {},
      features: product.features || [],
      ingredients: product.ingredients,
      nutritional_info: product.nutritional_info || {},
      species: product.species || [],
      life_stages: product.life_stages || [],
      breed_sizes: product.breed_sizes || [],
      health_conditions: product.health_conditions || [],
      weight_grams: product.weight_grams,
      dimensions: product.dimensions,
      is_prescription_required: product.is_prescription_required,
      is_featured: product.is_featured,
      is_new_arrival: product.is_new_arrival,
      is_best_seller: product.is_best_seller,
      avg_rating: product.avg_rating || 0,
      review_count: product.review_count || 0,
      sales_count: product.sales_count || 0,
      view_count: product.view_count || 0,
      meta_title: product.meta_title,
      meta_description: product.meta_description,
      sort_order: product.sort_order,
      is_active: product.is_active,
      created_at: product.created_at,
      updated_at: product.updated_at,
      category: product.store_categories ? {
        id: product.store_categories.id,
        tenant_id: clinic,
        name: product.store_categories.name,
        slug: product.store_categories.slug,
        description: product.store_categories.description,
        icon: product.store_categories.icon,
        image_url: product.store_categories.image_url,
        sort_order: 0,
        is_featured: false,
        is_active: true,
        created_at: '',
        updated_at: '',
      } : null,
      subcategory: product.store_subcategories ? {
        id: product.store_subcategories.id,
        tenant_id: clinic,
        category_id: product.category_id || '',
        name: product.store_subcategories.name,
        slug: product.store_subcategories.slug,
        description: product.store_subcategories.description,
        icon: product.store_subcategories.icon,
        sort_order: 0,
        is_active: true,
        created_at: '',
        updated_at: '',
      } : null,
      brand: product.store_brands ? {
        id: product.store_brands.id,
        tenant_id: clinic,
        name: product.store_brands.name,
        slug: product.store_brands.slug,
        logo_url: product.store_brands.logo_url,
        description: product.store_brands.description,
        website_url: product.store_brands.website_url,
        is_featured: false,
        sort_order: 0,
        is_active: true,
        created_at: '',
        updated_at: '',
      } : null,
      inventory: product.store_inventory ? {
        stock_quantity: product.store_inventory.stock_quantity || 0,
        min_stock_level: product.store_inventory.min_stock_level,
      } : { stock_quantity: 0, min_stock_level: null },
      images: (product.store_product_images || [])
        .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
        .map((img: { id: string; image_url: string; alt_text: string | null; sort_order: number; is_primary: boolean }) => ({
          id: img.id,
          product_id: product.id,
          tenant_id: clinic,
          image_url: img.image_url,
          alt_text: img.alt_text,
          sort_order: img.sort_order,
          is_primary: img.is_primary,
          created_at: '',
        })),
      variants: (product.store_product_variants || [])
        .filter((v: { is_active: boolean }) => v.is_active)
        .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
        .map((v: { id: string; sku: string; name: string; variant_type: string; price_modifier: number; stock_quantity: number; is_default: boolean; sort_order: number }) => ({
          id: v.id,
          product_id: product.id,
          tenant_id: clinic,
          sku: v.sku,
          name: v.name,
          variant_type: v.variant_type,
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
      has_discount: hasDiscount,
      discount_percentage: discountPercentage,
    };

    return NextResponse.json({
      product: productWithDetails,
      review_summary: reviewSummary,
      related_products: relatedProducts?.map(rp => ({
        relation_type: rp.relation_type,
        product: rp.related_product,
      })) || [],
      questions: questions?.map(q => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        created_at: q.created_at,
        user_name: q.user?.full_name || 'Usuario',
        answerer_name: q.answerer?.full_name || 'Equipo',
        answered_at: q.answered_at,
      })) || [],
    });
  } catch (e) {
    console.error('Error loading product details', e);
    return NextResponse.json({ error: 'No se pudo cargar el producto' }, { status: 500 });
  }
}
