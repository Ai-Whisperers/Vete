import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

type AdjustmentReason =
  | 'physical_count'
  | 'damage'
  | 'theft'
  | 'expired'
  | 'return'
  | 'correction'
  | 'other'

interface AdjustRequest {
  product_id: string
  new_quantity: number
  reason: AdjustmentReason
  notes?: string
}

const REASON_TO_TYPE: Record<AdjustmentReason, string> = {
  physical_count: 'adjustment',
  damage: 'damage',
  theft: 'theft',
  expired: 'expired',
  return: 'return',
  correction: 'adjustment',
  other: 'adjustment',
}

/**
 * POST /api/inventory/adjust
 * Adjust stock for a product (creates adjustment transaction)
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

  let body: AdjustRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { product_id, new_quantity, reason, notes } = body

  // Validate required fields
  if (!product_id) {
    return NextResponse.json({ error: 'product_id es requerido' }, { status: 400 })
  }

  if (new_quantity === undefined || new_quantity < 0) {
    return NextResponse.json({ error: 'new_quantity debe ser 0 o mayor' }, { status: 400 })
  }

  if (!reason) {
    return NextResponse.json({ error: 'reason es requerido' }, { status: 400 })
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

    const oldQuantity = inventory.stock_quantity
    const difference = new_quantity - oldQuantity

    // No change needed
    if (difference === 0) {
      return NextResponse.json({
        success: true,
        message: 'Stock ya coincide',
        old_stock: oldQuantity,
        new_stock: new_quantity,
        difference: 0,
      })
    }

    // Update inventory
    const { error: updateError } = await supabase
      .from('store_inventory')
      .update({
        stock_quantity: new_quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventory.id)

    if (updateError) {
      logger.error('Error updating inventory', { error: updateError })
      return NextResponse.json({ error: 'Error al actualizar inventario' }, { status: 500 })
    }

    // Create transaction record
    const transactionType = REASON_TO_TYPE[reason] || 'adjustment'
    const defaultNotes: Record<AdjustmentReason, string> = {
      physical_count: 'Ajuste por conteo físico',
      damage: 'Ajuste por daño',
      theft: 'Ajuste por robo/pérdida',
      expired: 'Ajuste por vencimiento',
      return: 'Ajuste por devolución',
      correction: 'Corrección de inventario',
      other: 'Ajuste de inventario',
    }

    const { error: transError } = await supabase.from('store_inventory_transactions').insert({
      tenant_id: tenantId,
      product_id,
      type: transactionType,
      quantity: difference, // Positive if adding, negative if removing
      unit_cost: inventory.weighted_average_cost,
      notes: notes || defaultNotes[reason],
      reference_type: `adjustment_${reason}`,
      performed_by: profile.id,
    })

    if (transError) {
      logger.error('Error creating transaction', { error: transError })
      // Don't fail the request, inventory was updated
    }

    return NextResponse.json({
      success: true,
      old_stock: oldQuantity,
      new_stock: new_quantity,
      difference,
      type: transactionType,
    })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Exception in inventory adjust', { error: error.message })
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
