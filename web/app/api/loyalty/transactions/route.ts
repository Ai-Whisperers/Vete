import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

/**
 * GET /api/loyalty/transactions
 * Get current user's loyalty transaction history
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  // Get user's profile for tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ data: [], total: 0 });
  }

  try {
    // Get total count
    const { count } = await supabase
      .from('loyalty_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .eq('tenant_id', profile.tenant_id);

    // Get transactions with pagination
    const { data: transactions, error } = await supabase
      .from('loyalty_transactions')
      .select(`
        id,
        type,
        points,
        description,
        balance_after,
        invoice_id,
        order_id,
        created_at
      `)
      .eq('client_id', user.id)
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data: transactions || [],
      total: count || 0,
      limit,
      offset
    });
  } catch (e) {
    console.error('Error fetching transactions:', e);
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
