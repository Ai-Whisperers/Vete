import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Create stock alert
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  try {
    const body = await request.json();
    const { product_id, clinic, email, variant_id } = body;

    if (!product_id || !clinic || !email) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    // Check if alert already exists
    const { data: existing } = await supabase
      .from('store_stock_alerts')
      .select('id')
      .eq('email', email)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Ya estás suscrito para recibir alertas de este producto' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('store_stock_alerts')
      .insert({
        product_id,
        tenant_id: clinic,
        user_id: user?.id || null,
        email,
        variant_id,
        notified: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, alert: data });
  } catch (e) {
    console.error('Error creating stock alert', e);
    return NextResponse.json({ error: 'No se pudo crear la alerta' }, { status: 500 });
  }
}

// DELETE - Remove stock alert
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const alertId = searchParams.get('id');
  const email = searchParams.get('email');

  if (!alertId && !email) {
    return NextResponse.json({ error: 'Falta id o email' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    let query = supabase.from('store_stock_alerts').delete();

    if (alertId) {
      query = query.eq('id', alertId);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error deleting stock alert', e);
    return NextResponse.json({ error: 'No se pudo eliminar la alerta' }, { status: 500 });
  }
}
