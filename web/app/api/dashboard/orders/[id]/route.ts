import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/dashboard/orders/[id]
 * Get a single order with all details
 */
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'vet' && profile.role !== 'admin')) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN);
  }

  try {
    // Get order with customer details
    const { data: order, error } = await supabase
      .from('store_orders')
      .select(`
        *,
        profiles:customer_id (
          id,
          full_name,
          email,
          phone
        ),
        cancelled_by_profile:cancelled_by (
          id,
          full_name
        ),
        store_coupons:coupon_id (
          id,
          code,
          name
        )
      `)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single();

    if (error || !order) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { message: 'Pedido no encontrado' }
      });
    }

    // Get order items with product details
    const { data: items } = await supabase
      .from('store_order_items')
      .select(`
        *,
        store_products (
          id,
          name,
          sku,
          images
        )
      `)
      .eq('order_id', id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      order: {
        ...order,
        customer: order.profiles,
        coupon: order.store_coupons,
        cancelled_by_info: order.cancelled_by_profile
      },
      items: items?.map(item => ({
        ...item,
        product: item.store_products
      })) || []
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PUT /api/dashboard/orders/[id]
 * Update order status or details
 */
export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'vet' && profile.role !== 'admin')) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN);
  }

  try {
    const body = await request.json();
    const {
      status,
      payment_status,
      tracking_number,
      internal_notes,
      cancellation_reason
    } = body;

    // Check if order exists
    const { data: existing } = await supabase
      .from('store_orders')
      .select('id, status')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single();

    if (!existing) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND);
    }

    const updateData: Record<string, unknown> = {};

    // Update status with timestamp tracking
    if (status !== undefined && status !== existing.status) {
      updateData.status = status;

      switch (status) {
        case 'confirmed':
          updateData.confirmed_at = new Date().toISOString();
          break;
        case 'shipped':
          updateData.shipped_at = new Date().toISOString();
          break;
        case 'delivered':
          updateData.delivered_at = new Date().toISOString();
          break;
        case 'cancelled':
          updateData.cancelled_at = new Date().toISOString();
          updateData.cancelled_by = user.id;
          if (cancellation_reason) {
            updateData.cancellation_reason = cancellation_reason;
          }
          break;
      }
    }

    if (payment_status !== undefined) updateData.payment_status = payment_status;
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
    if (internal_notes !== undefined) updateData.internal_notes = internal_notes;

    const { data: order, error } = await supabase
      .from('store_orders')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ order });

  } catch (error) {
    console.error('Error updating order:', error);
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * DELETE /api/dashboard/orders/[id]
 * Soft delete an order (admin only, typically not used)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  // Only admins can delete orders
  if (!profile || profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN);
  }

  try {
    const { error } = await supabase
      .from('store_orders')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id
      })
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting order:', error);
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
