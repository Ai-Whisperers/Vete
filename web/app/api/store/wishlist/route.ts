import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get user's wishlist
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');

  if (!clinic) {
    return NextResponse.json({ error: 'Falta el parámetro clinic' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('store_wishlists')
      .select(`
        id,
        product_id,
        variant_id,
        notes,
        notify_on_sale,
        notify_on_stock,
        created_at,
        store_products(
          id, name, short_description, image_url, base_price,
          avg_rating, review_count, is_new_arrival, is_best_seller,
          store_inventory(stock_quantity),
          store_brands(name, slug)
        )
      `)
      .eq('user_id', user.id)
      .eq('tenant_id', clinic)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      items: data || [],
      total: data?.length || 0,
    });
  } catch (e) {
    console.error('Error fetching wishlist', e);
    return NextResponse.json({ error: 'No se pudo cargar la lista de deseos' }, { status: 500 });
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { product_id, clinic, variant_id, notes, notify_on_sale, notify_on_stock } = body;

    if (!product_id || !clinic) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('store_wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Ya está en tu lista de deseos' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('store_wishlists')
      .insert({
        user_id: user.id,
        product_id,
        tenant_id: clinic,
        variant_id,
        notes,
        notify_on_sale: notify_on_sale ?? true,
        notify_on_stock: notify_on_stock ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, item: data });
  } catch (e) {
    console.error('Error adding to wishlist', e);
    return NextResponse.json({ error: 'No se pudo agregar a la lista de deseos' }, { status: 500 });
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  if (!productId) {
    return NextResponse.json({ error: 'Falta product_id' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('store_wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error removing from wishlist', e);
    return NextResponse.json({ error: 'No se pudo eliminar de la lista de deseos' }, { status: 500 });
  }
}
