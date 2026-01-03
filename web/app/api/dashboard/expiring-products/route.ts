import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

/**
 * GET /api/dashboard/expiring-products
 * Get products expiring within a configurable number of days
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '90', 10);
  const urgency = searchParams.get('urgency'); // expired, critical, high, medium, low

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'vet'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN, {
      details: { message: 'Solo staff puede ver productos por vencer' }
    });
  }

  try {
    // Get expiring products using the RPC function
    const { data: expiringProducts, error: productsError } = await supabase
      .rpc('get_expiring_products', {
        p_tenant_id: profile.tenant_id,
        p_days: days,
      });

    if (productsError) throw productsError;

    // Get expired products
    const { data: expiredProducts } = await supabase
      .from('expired_products')
      .select('*')
      .eq('tenant_id', profile.tenant_id);

    // Get expiry summary
    const { data: summary } = await supabase
      .rpc('get_expiry_summary', { p_tenant_id: profile.tenant_id });

    // Combine and filter by urgency if specified
    let allProducts = [
      ...(expiredProducts || []).map(p => ({ ...p, urgency_level: 'expired' })),
      ...(expiringProducts || []),
    ];

    if (urgency) {
      allProducts = allProducts.filter(p => p.urgency_level === urgency);
    }

    // Group products by urgency level
    const grouped = {
      expired: allProducts.filter(p => p.urgency_level === 'expired'),
      critical: allProducts.filter(p => p.urgency_level === 'critical'),
      high: allProducts.filter(p => p.urgency_level === 'high'),
      medium: allProducts.filter(p => p.urgency_level === 'medium'),
      low: allProducts.filter(p => p.urgency_level === 'low'),
    };

    // Calculate totals
    const totals = {
      expired: grouped.expired.length,
      critical: grouped.critical.length,
      high: grouped.high.length,
      medium: grouped.medium.length,
      low: grouped.low.length,
      total: allProducts.length,
    };

    return NextResponse.json({
      products: allProducts,
      grouped,
      totals,
      summary: summary || [],
    });

  } catch (error) {
    console.error('Error fetching expiring products:', error);
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
