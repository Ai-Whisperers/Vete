import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

export const dynamic = 'force-dynamic'

/**
 * POST /api/store/cart/items
 * Add or update a cart item with stock reservation
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Require authentication for reservations
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED, {
      details: { message: 'Inicia sesión para agregar al carrito' },
    })
  }

  const { productId, quantity, clinic } = await request.json()

  if (!productId || typeof quantity !== 'number' || quantity < 0) {
    return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
      details: { message: 'Producto y cantidad requeridos' },
    })
  }

  // Determine tenant_id
  let tenantId = clinic
  if (!tenantId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'Perfil no encontrado' },
      })
    }
    tenantId = profile.tenant_id
  }

  // Get or create cart
  const { data: cart } = await supabase
    .from('store_carts')
    .select('id, items')
    .eq('customer_id', user.id)
    .eq('tenant_id', tenantId)
    .single()

  let cartId: string

  if (!cart) {
    // Create new cart
    const { data: newCart, error: createError } = await supabase
      .from('store_carts')
      .insert({
        customer_id: user.id,
        tenant_id: tenantId,
        items: [],
      })
      .select('id')
      .single()

    if (createError || !newCart) {
      logger.error('Error creating cart', { error: createError })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { message: 'Error al crear carrito' },
      })
    }
    cartId = newCart.id
  } else {
    cartId = cart.id
  }

  // Try to reserve stock using the RPC function
  if (quantity > 0) {
    const { data: reserveResult, error: reserveError } = await supabase.rpc('reserve_stock', {
      p_tenant_id: tenantId,
      p_cart_id: cartId,
      p_product_id: productId,
      p_quantity: quantity,
    })

    if (reserveError) {
      logger.error('Error reserving stock', { error: reserveError })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { message: 'Error al reservar stock' },
      })
    }

    if (!reserveResult?.success) {
      return NextResponse.json(
        {
          success: false,
          error: reserveResult?.error || 'Stock insuficiente',
          available: reserveResult?.available,
        },
        { status: 400 }
      )
    }
  } else {
    // Release reservation when quantity is 0
    const { error: releaseError } = await supabase.rpc('release_reservation', {
      p_cart_id: cartId,
      p_product_id: productId,
    })

    if (releaseError) {
      logger.error('Error releasing reservation', { error: releaseError })
    }
  }

  // Update cart items
  const currentItems = (cart?.items as Array<{ id: string; quantity: number; type: string }>) || []
  let updatedItems = [...currentItems]

  const existingIndex = updatedItems.findIndex((item) => item.id === productId)

  if (quantity === 0) {
    // Remove item
    if (existingIndex !== -1) {
      updatedItems.splice(existingIndex, 1)
    }
  } else if (existingIndex !== -1) {
    // Update quantity
    updatedItems[existingIndex].quantity = quantity
  } else {
    // Add new item
    updatedItems.push({ id: productId, quantity, type: 'product' })
  }

  // Save updated cart
  const { error: updateError } = await supabase
    .from('store_carts')
    .update({
      items: updatedItems,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cartId)

  if (updateError) {
    logger.error('Error updating cart', { error: updateError })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: 'Error al actualizar carrito' },
    })
  }

  return NextResponse.json({
    success: true,
    items: updatedItems,
    reserved: quantity,
  })
}

/**
 * DELETE /api/store/cart/items
 * Remove item from cart and release reservation
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED, {
      details: { message: 'Inicia sesión' },
    })
  }

  const { productId, clinic } = await request.json()

  if (!productId) {
    return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
      details: { message: 'Producto requerido' },
    })
  }

  // Determine tenant_id
  let tenantId = clinic
  if (!tenantId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'Perfil no encontrado' },
      })
    }
    tenantId = profile.tenant_id
  }

  // Get cart
  const { data: cart } = await supabase
    .from('store_carts')
    .select('id, items')
    .eq('customer_id', user.id)
    .eq('tenant_id', tenantId)
    .single()

  if (!cart) {
    return NextResponse.json({ success: true, message: 'Cart not found' })
  }

  // Release reservation
  await supabase.rpc('release_reservation', {
    p_cart_id: cart.id,
    p_product_id: productId,
  })

  // Update cart items
  const currentItems = (cart.items as Array<{ id: string; quantity: number; type: string }>) || []
  const updatedItems = currentItems.filter((item) => item.id !== productId)

  // Save updated cart
  const { error: updateError } = await supabase
    .from('store_carts')
    .update({
      items: updatedItems,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cart.id)

  if (updateError) {
    logger.error('Error updating cart', { error: updateError })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: 'Error al actualizar carrito' },
    })
  }

  return NextResponse.json({
    success: true,
    items: updatedItems,
  })
}
