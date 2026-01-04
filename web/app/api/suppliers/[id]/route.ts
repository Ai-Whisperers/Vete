import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Validation schema for updating suppliers
const updateSupplierSchema = z.object({
  name: z.string().min(1).optional(),
  legal_name: z.string().optional(),
  tax_id: z.string().optional(),
  contact_info: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    contact_person: z.string().optional(),
  }).optional(),
  supplier_type: z.enum(['products', 'services', 'both']).optional(),
  minimum_order_amount: z.number().min(0).optional(),
  payment_terms: z.string().optional(),
  delivery_time_days: z.number().int().min(0).optional(),
  notes: z.string().optional(),
})

// GET - Get supplier details
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

    // Only staff can access suppliers
    if (!['vet', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Fetch supplier with related data
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        procurement_leads(
          id,
          catalog_product_id,
          unit_cost,
          minimum_order_qty,
          lead_time_days,
          last_verified_at
        )
      `)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (error || !supplier) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 })
    }

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Supplier GET error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Update supplier
export async function PUT(
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

    // Only admin can update suppliers
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden editar proveedores' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = updateSupplierSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Check supplier exists and belongs to tenant
    const { data: existing } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 })
    }

    // Update supplier
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating supplier:', error)
      return NextResponse.json({ error: 'Error al actualizar proveedor' }, { status: 500 })
    }

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Supplier PUT error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Soft delete supplier
export async function DELETE(
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

    // Only admin can delete suppliers
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar proveedores' }, { status: 403 })
    }

    // Check supplier exists
    const { data: existing } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 })
    }

    // Soft delete
    const { error } = await supabase
      .from('suppliers')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)

    if (error) {
      console.error('Error deleting supplier:', error)
      return NextResponse.json({ error: 'Error al eliminar proveedor' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Supplier DELETE error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
