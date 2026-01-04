import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get products from this supplier via procurement leads
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params
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

    // Check supplier exists and belongs to tenant
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('id, name')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!supplier) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 })
    }

    // Get procurement leads with product info
    const { data: leads, error } = await supabase
      .from('procurement_leads')
      .select(`
        id,
        unit_cost,
        minimum_order_qty,
        lead_time_days,
        last_verified_at,
        is_preferred,
        catalog_products (
          id,
          sku,
          name,
          description,
          base_unit
        )
      `)
      .eq('supplier_id', id)
      .eq('tenant_id', profile.tenant_id)
      .eq('is_active', true)
      .order('last_verified_at', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('Error fetching supplier products:', error)
      return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
    }

    return NextResponse.json({
      supplier,
      products: leads || [],
    })
  } catch (error) {
    console.error('Supplier products GET error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
