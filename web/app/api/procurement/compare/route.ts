import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Compare prices across suppliers for products
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get tenant context
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Only staff can access
    if (!['vet', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const productIds = searchParams.get('products')?.split(',').filter(Boolean) || []
    const verifiedOnly = searchParams.get('verified_only') === 'true'

    if (productIds.length === 0) {
      return NextResponse.json({ error: 'Debe especificar al menos un producto' }, { status: 400 })
    }

    // Get all procurement leads for the specified products
    let query = supabase
      .from('procurement_leads')
      .select(`
        id,
        catalog_product_id,
        unit_cost,
        minimum_order_qty,
        lead_time_days,
        is_preferred,
        last_verified_at,
        suppliers (
          id,
          name,
          verification_status,
          delivery_time_days,
          payment_terms
        ),
        catalog_products (
          id,
          sku,
          name,
          base_unit
        )
      `)
      .eq('tenant_id', profile.tenant_id)
      .eq('is_active', true)
      .in('catalog_product_id', productIds)
      .order('unit_cost', { ascending: true })

    if (verifiedOnly) {
      query = query.eq('suppliers.verification_status', 'verified')
    }

    const { data: leads, error } = await query

    if (error) {
      console.error('Error fetching comparison data:', error)
      return NextResponse.json({ error: 'Error al comparar precios' }, { status: 500 })
    }

    // Group by product for easier comparison
    const comparison: Record<string, {
      product: { id: string; sku: string; name: string; base_unit: string } | null;
      suppliers: Array<{
        supplier: { id: string; name: string; verification_status: string } | null;
        unit_cost: number;
        minimum_order_qty: number | null;
        lead_time_days: number | null;
        is_preferred: boolean;
        last_verified_at: string | null;
        total_lead_time: number;
      }>;
      best_price: number | null;
      price_range: { min: number; max: number } | null;
    }> = {}

    for (const lead of leads || []) {
      const productId = lead.catalog_product_id

      if (!comparison[productId]) {
        comparison[productId] = {
          product: lead.catalog_products as { id: string; sku: string; name: string; base_unit: string } | null,
          suppliers: [],
          best_price: null,
          price_range: null,
        }
      }

      const supplierData = lead.suppliers as { id: string; name: string; verification_status: string; delivery_time_days: number | null } | null

      comparison[productId].suppliers.push({
        supplier: supplierData ? { id: supplierData.id, name: supplierData.name, verification_status: supplierData.verification_status } : null,
        unit_cost: lead.unit_cost,
        minimum_order_qty: lead.minimum_order_qty,
        lead_time_days: lead.lead_time_days,
        is_preferred: lead.is_preferred,
        last_verified_at: lead.last_verified_at,
        total_lead_time: (lead.lead_time_days || 0) + (supplierData?.delivery_time_days || 0),
      })
    }

    // Calculate best prices and ranges
    for (const productId of Object.keys(comparison)) {
      const suppliers = comparison[productId].suppliers
      if (suppliers.length > 0) {
        const prices = suppliers.map(s => s.unit_cost)
        comparison[productId].best_price = Math.min(...prices)
        comparison[productId].price_range = {
          min: Math.min(...prices),
          max: Math.max(...prices),
        }
      }
    }

    return NextResponse.json({
      comparison: Object.values(comparison),
      product_count: Object.keys(comparison).length,
      total_quotes: leads?.length || 0,
    })
  } catch (error) {
    console.error('Procurement compare GET error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
