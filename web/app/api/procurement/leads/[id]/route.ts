import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateLeadSchema = z.object({
  unit_cost: z.number().positive().optional(),
  minimum_order_qty: z.number().int().positive().optional(),
  lead_time_days: z.number().int().min(0).optional(),
  is_preferred: z.boolean().optional(),
  notes: z.string().optional(),
})

// GET - Get procurement lead details
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

    const { data: lead, error } = await supabase
      .from('procurement_leads')
      .select(`
        *,
        suppliers (id, name, contact_info, verification_status),
        catalog_products (id, sku, name, description, base_unit)
      `)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (error || !lead) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Procurement lead GET error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Update procurement lead
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

    // Only admin can update
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden editar cotizaciones' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = updateLeadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Check lead exists
    const { data: existing } = await supabase
      .from('procurement_leads')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    // Update lead
    const { data: lead, error } = await supabase
      .from('procurement_leads')
      .update({
        ...validation.data,
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating procurement lead:', error)
      return NextResponse.json({ error: 'Error al actualizar cotización' }, { status: 500 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Procurement lead PUT error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Soft delete procurement lead
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

    // Only admin can delete
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar cotizaciones' }, { status: 403 })
    }

    // Soft delete
    const { error } = await supabase
      .from('procurement_leads')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)

    if (error) {
      console.error('Error deleting procurement lead:', error)
      return NextResponse.json({ error: 'Error al eliminar cotización' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Procurement lead DELETE error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
