import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const clinic = searchParams.get('clinic');

  if (!userId || !clinic) {
    return NextResponse.json({ error: 'User or clinic not provided' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('store_wishlist')
    .select('product_id')
    .eq('customer_id', userId)
    .eq('tenant_id', clinic);

  if (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { product_id, clinic } = await request.json();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase.from('store_wishlist').insert({
    product_id,
    tenant_id: clinic,
    customer_id: user.id,
  });

  if (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!productId) {
        return NextResponse.json({ error: 'Product ID not provided' }, { status: 400 });
    }
    
    const { error } = await supabase
        .from('store_wishlist')
        .delete()
        .eq('customer_id', user.id)
        .eq('product_id', productId);
    
    if (error) {
        console.error('Error removing from wishlist:', error);
        return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
}