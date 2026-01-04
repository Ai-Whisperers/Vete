import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

interface ReceiveRequest {
  product_id: string
  quantity: number
  unit_cost?: number
  notes?: string
  batch_number?: string
  expiry_date?: string
}

/**
 * POST /api/inventory/receive
 * Receive stock for a product (creates purchase transaction)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Get user profile and verify staff role
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
  }

  if (profile.role !== 'admin' && profile.role !== 'vet') {
    return NextResponse.json({ error: 'Solo personal autorizado' }, { status: 403 })
  }

  const tenantId = profile.tenant_id

  let body: ReceiveRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { product_id, quantity, unit_cost, notes, batch_number, expiry_date } = body

  // Validate required fields
  if (!product_id) {
    return NextResponse.json({ error: 'product_id es requerido' }, { status: 400 })
  }

  if (!quantity || quantity <= 0) {
    return NextResponse.json({ error: 'La cantidad debe ser mayor a 0' }, { status: 400 })
  }

  try {
    // Get current inventory
    const { data: inventory, error: invError } = await supabase
      .from('store_inventory')
      .select('id, stock_quantity, weighted_average_cost')
      .eq('product_id', product_id)
      .eq('tenant_id', tenantId)
      .single()

    if (invError) {
      logger.error('Error fetching inventory', { error: invError })
      return NextResponse.json(
        { error: 'Inventario no encontrado para este producto' },
        { status: 404 }
      )
    }

    // Calculate new WAC if unit_cost provided
    let newWac = inventory.weighted_average_cost || 0
    const costPerUnit = unit_cost || newWac

    if (unit_cost && unit_cost > 0) {
      const currentValue = inventory.stock_quantity * (inventory.weighted_average_cost || 0)
      const newValue = quantity * unit_cost
      const newTotal = inventory.stock_quantity + quantity
      newWac = newTotal > 0 ? (currentValue + newValue) / newTotal : unit_cost
    }

    // Update inventory
    const updateData: Record<string, unknown> = {
      stock_quantity: inventory.stock_quantity + quantity,
      weighted_average_cost: newWac,
      updated_at: new Date().toISOString(),
    }

    if (batch_number) {
      updateData.batch_number = batch_number
    }

    if (expiry_date) {
      updateData.expiry_date = expiry_date
    }

    const { error: updateError } = await supabase
      .from('store_inventory')
      .update(updateData)
      .eq('id', inventory.id)

    if (updateError) {
      logger.error('Error updating inventory', { error: updateError })
      return NextResponse.json({ error: 'Error al actualizar inventario' }, { status: 500 })
    }

    // Create transaction record
    const { error: transError } = await supabase.from('store_inventory_transactions').insert({
      tenant_id: tenantId,
      product_id,
      type: 'purchase',
      quantity: quantity, // Positive for incoming stock
      unit_cost: costPerUnit,
      notes: notes || 'Recepción de stock via escáner',
      reference_type: 'scanner_receive',
      performed_by: profile.id,
    })

    if (transError) {
      logger.error('Error creating transaction', { error: transError })
      // Don't fail the request, inventory was updated
    }

    return NextResponse.json({
      success: true,
      new_stock: inventory.stock_quantity + quantity,
      new_wac: newWac,
    })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Exception in inventory receive', { error: error.message })
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
