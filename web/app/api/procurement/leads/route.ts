import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for procurement leads
const procurementLeadSchema = z.object({
  supplier_id: z.string().uuid('ID de proveedor inválido'),
  catalog_product_id: z.string().uuid('ID de producto inválido'),
  unit_cost: z.number().positive('Costo debe ser positivo'),
  minimum_order_qty: z.number().int().positive().optional(),
  lead_time_days: z.number().int().min(0).optional(),
  is_preferred: z.boolean().optional(),
  notes: z.string().optional(),
})

// GET - List procurement leads with filters
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
    const supplierId = searchParams.get('supplier_id')
    const productId = searchParams.get('product_id')
    const preferredOnly = searchParams.get('preferred') === 'true'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('procurement_leads')
      .select(`
        *,
        suppliers (id, name, verification_status, delivery_time_days),
        catalog_products (id, sku, name, base_unit)
      `, { count: 'exact' })
      .eq('tenant_id', profile.tenant_id)
      .eq('is_active', true)
      .order('unit_cost', { ascending: true })

    if (supplierId) {
      query = query.eq('supplier_id', supplierId)
    }

    if (productId) {
      query = query.eq('catalog_product_id', productId)
    }

    if (preferredOnly) {
      query = query.eq('is_preferred', true)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: leads, error, count } = await query

    if (error) {
      console.error('Error fetching procurement leads:', error)
      return NextResponse.json({ error: 'Error al obtener cotizaciones' }, { status: 500 })
    }

    return NextResponse.json({
      leads,
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Procurement leads GET error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Add new price quote
export async function POST(request: NextRequest): Promise<NextResponse> {
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

    // Only admin can add price quotes
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden agregar cotizaciones' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = procurementLeadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const leadData = validation.data

    // Verify supplier exists and belongs to tenant
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', leadData.supplier_id)
      .eq('tenant_id', profile.tenant_id)
      .eq('is_active', true)
      .single()

    if (!supplier) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 })
    }

    // Check if lead already exists for this supplier-product combo
    const { data: existing } = await supabase
      .from('procurement_leads')
      .select('id')
      .eq('tenant_id', profile.tenant_id)
      .eq('supplier_id', leadData.supplier_id)
      .eq('catalog_product_id', leadData.catalog_product_id)
      .eq('is_active', true)
      .single()

    if (existing) {
      // Update existing lead
      const { data: lead, error } = await supabase
        .from('procurement_leads')
        .update({
          unit_cost: leadData.unit_cost,
          minimum_order_qty: leadData.minimum_order_qty,
          lead_time_days: leadData.lead_time_days,
          is_preferred: leadData.is_preferred,
          notes: leadData.notes,
          last_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating procurement lead:', error)
        return NextResponse.json({ error: 'Error al actualizar cotización' }, { status: 500 })
      }

      return NextResponse.json(lead)
    }

    // Create new lead
    const { data: lead, error } = await supabase
      .from('procurement_leads')
      .insert({
        tenant_id: profile.tenant_id,
        supplier_id: leadData.supplier_id,
        catalog_product_id: leadData.catalog_product_id,
        unit_cost: leadData.unit_cost,
        minimum_order_qty: leadData.minimum_order_qty,
        lead_time_days: leadData.lead_time_days,
        is_preferred: leadData.is_preferred || false,
        notes: leadData.notes,
        last_verified_at: new Date().toISOString(),
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating procurement lead:', error)
      return NextResponse.json({ error: 'Error al crear cotización' }, { status: 500 })
    }

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Procurement leads POST error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
