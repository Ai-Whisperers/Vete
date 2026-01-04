import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

export const dynamic = 'force-dynamic'

/**
 * GET /api/store/cart
 * Load cart from database for logged-in user
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // For unauthenticated users, return empty cart (not an error)
  if (!user) {
    return NextResponse.json({ items: [], updated_at: null, authenticated: false })
  }

  // Get user's profile to determine tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  // If no profile, return empty cart (user might be new)
  if (!profile) {
    return NextResponse.json({ items: [], updated_at: null, authenticated: true, no_profile: true })
  }

  // Get cart
  const { data: cart, error } = await supabase
    .from('store_carts')
    .select('items, updated_at')
    .eq('customer_id', user.id)
    .eq('tenant_id', profile.tenant_id)
    .single()

  // Handle errors gracefully
  if (error) {
    // PGRST116 = no rows returned (empty cart) - not an error
    // PGRST205 = table doesn't exist yet - return empty cart
    if (error.code === 'PGRST116' || error.code === 'PGRST205') {
      return NextResponse.json({
        items: [],
        updated_at: null,
      })
    }
    logger.error('Error fetching cart', {
      userId: user.id,
      tenantId: profile.tenant_id,
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: 'Error al cargar carrito' },
    })
  }

  return NextResponse.json({
    items: cart?.items ?? [],
    updated_at: cart?.updated_at ?? null,
  })
}

/**
 * PUT /api/store/cart
 * Save cart to database
 */
export async function PUT(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // For unauthenticated users, just acknowledge (cart stays in localStorage)
  if (!user) {
    return NextResponse.json({ success: true, local_only: true })
  }

  const { items, clinic } = await request.json()

  if (!Array.isArray(items)) {
    return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
      details: { message: 'Items inválidos' },
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

    // If no profile, just acknowledge (cart stays in localStorage)
    if (!profile) {
      return NextResponse.json({ success: true, local_only: true, no_profile: true })
    }
    tenantId = profile.tenant_id
  }

  // Upsert cart
  const { error } = await supabase.from('store_carts').upsert(
    {
      customer_id: user.id,
      tenant_id: tenantId,
      items: items,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'customer_id,tenant_id',
    }
  )

  if (error) {
    // Handle table not existing - cart will be stored locally only
    if (error.code === 'PGRST205') {
      return NextResponse.json({ success: true, local_only: true })
    }
    logger.error('Error saving cart', {
      userId: user.id,
      tenantId,
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: 'Error al guardar carrito' },
    })
  }

  return NextResponse.json({ success: true })
}

/**
 * DELETE /api/store/cart
 * Clear cart from database
 */
export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // For unauthenticated users, just acknowledge
  if (!user) {
    return NextResponse.json({ success: true, local_only: true })
  }

  // Get user's profile to determine tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  // If no profile, just acknowledge
  if (!profile) {
    return NextResponse.json({ success: true, local_only: true, no_profile: true })
  }

  const { error } = await supabase
    .from('store_carts')
    .delete()
    .eq('customer_id', user.id)
    .eq('tenant_id', profile.tenant_id)

  if (error) {
    // Handle table not existing - nothing to clear
    if (error.code === 'PGRST205') {
      return NextResponse.json({ success: true })
    }
    logger.error('Error clearing cart', {
      userId: user.id,
      tenantId: profile.tenant_id,
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: 'Error al limpiar carrito' },
    })
  }

  return NextResponse.json({ success: true })
}

/**
 * POST /api/store/cart/merge
 * Merge localStorage cart with database cart (called on login)
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { items: localItems, clinic } = await request.json()

  if (!Array.isArray(localItems)) {
    return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
      details: { message: 'Items inválidos' },
    })
  }

  // For unauthenticated users, return local items
  if (!user) {
    return NextResponse.json({ success: true, items: localItems, local_only: true })
  }

  // Determine tenant_id
  let tenantId = clinic
  if (!tenantId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    // If no profile, return local items
    if (!profile) {
      return NextResponse.json({
        success: true,
        items: localItems,
        local_only: true,
        no_profile: true,
      })
    }
    tenantId = profile.tenant_id
  }

  // Get existing cart
  const { data: existingCart } = await supabase
    .from('store_carts')
    .select('items')
    .eq('customer_id', user.id)
    .eq('tenant_id', tenantId)
    .single()

  // Merge carts - use RPC function if available, otherwise do client-side merge
  let mergedItems = localItems

  if (existingCart?.items && Array.isArray(existingCart.items)) {
    const existingMap = new Map<string, (typeof localItems)[0]>()

    // Add existing items to map
    for (const item of existingCart.items) {
      const key = `${item.id}-${item.type}`
      existingMap.set(key, item)
    }

    // Merge local items (prefer higher quantity)
    for (const localItem of localItems) {
      const key = `${localItem.id}-${localItem.type}`
      const existing = existingMap.get(key)

      if (existing) {
        existing.quantity = Math.max(existing.quantity, localItem.quantity)
      } else {
        existingMap.set(key, localItem)
      }
    }

    mergedItems = Array.from(existingMap.values())
  }

  // Save merged cart
  const { error } = await supabase.from('store_carts').upsert(
    {
      customer_id: user.id,
      tenant_id: tenantId,
      items: mergedItems,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'customer_id,tenant_id',
    }
  )

  if (error) {
    // Handle table not existing - return local items as merged result
    if (error.code === 'PGRST205') {
      return NextResponse.json({
        success: true,
        items: localItems,
        local_only: true,
      })
    }
    logger.error('Error merging cart', {
      userId: user.id,
      tenantId,
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: 'Error al fusionar carrito' },
    })
  }

  return NextResponse.json({
    success: true,
    items: mergedItems,
  })
}
