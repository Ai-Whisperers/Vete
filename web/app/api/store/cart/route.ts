import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { checkFeatureAccess } from '@/lib/features/server'
import { rateLimit } from '@/lib/rate-limit'
import { cartSyncSchema, cartMergeSchema } from '@/lib/schemas/store'
import { getFastAuth } from '@/lib/auth/fast-auth'

export const dynamic = 'force-dynamic'

/**
 * Helper to check ecommerce feature for a tenant
 * Returns error response if feature is not available, null if allowed
 */
async function checkEcommerceAccess(
  tenantId: string
): Promise<NextResponse | null> {
  const result = await checkFeatureAccess(tenantId, 'ecommerce')

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'Tienda online no disponible en tu plan actual',
        code: 'FEATURE_RESTRICTED',
        feature: 'ecommerce',
        currentTier: result.currentTier,
        requiredTier: result.requiredTier,
        upgradeMessage: 'Actualiza a Crecimiento o superior para acceder a la tienda online',
      },
      { status: 403 }
    )
  }

  return null
}

/**
 * GET /api/store/cart
 * Load cart from database for logged-in user
 */
export async function GET() {
  // Use fast auth with caching for cart operations
  const { user, supabase, fromCache } = await getFastAuth()

  // For unauthenticated users, return empty cart (not an error)
  if (!user) {
    return NextResponse.json({ items: [], updated_at: null, authenticated: false })
  }

  // Log cache hit for debugging (remove in production if noisy)
  if (fromCache && process.env.NODE_ENV === 'development') {
    logger.debug('Cart GET: Auth from cache', { userId: user.id.slice(0, 8) })
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

  // Check if tenant has ecommerce feature enabled
  const featureCheck = await checkEcommerceAccess(profile.tenant_id)
  if (featureCheck) return featureCheck

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
export async function PUT(request: NextRequest) {
  // SEC-026: Rate limit cart operations to prevent abuse
  const rateLimitResult = await rateLimit(request, 'cart')
  if (!rateLimitResult.success) {
    return rateLimitResult.response
  }

  // Use fast auth with caching for cart operations
  const { user, supabase, fromCache } = await getFastAuth()

  // For unauthenticated users, just acknowledge (cart stays in localStorage)
  if (!user) {
    return NextResponse.json({ success: true, local_only: true })
  }

  // Log cache hit for debugging
  if (fromCache && process.env.NODE_ENV === 'development') {
    logger.debug('Cart PUT: Auth from cache', { userId: user.id.slice(0, 8) })
  }

  // SEC-028: Validate cart items with Zod schema
  const body = await request.json()
  const validation = cartSyncSchema.safeParse(body)

  if (!validation.success) {
    return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
      details: {
        message: 'Items inválidos',
        errors: validation.error.flatten().fieldErrors,
      },
    })
  }

  const { items } = validation.data

  // SEC-025: Always get tenant_id from user's profile, never trust client input
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  // If no profile, just acknowledge (cart stays in localStorage)
  if (!profile) {
    return NextResponse.json({ success: true, local_only: true, no_profile: true })
  }
  const tenantId = profile.tenant_id

  // Check if tenant has ecommerce feature enabled
  const featureCheck = await checkEcommerceAccess(tenantId)
  if (featureCheck) return featureCheck

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
  // Use fast auth with caching
  const { user, supabase } = await getFastAuth()

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

  // Check if tenant has ecommerce feature enabled
  const featureCheck = await checkEcommerceAccess(profile.tenant_id)
  if (featureCheck) return featureCheck

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
export async function POST(request: NextRequest) {
  // SEC-026: Rate limit cart operations to prevent abuse
  const rateLimitResult = await rateLimit(request, 'cart')
  if (!rateLimitResult.success) {
    return rateLimitResult.response
  }

  // Use fast auth with caching
  const { user, supabase, fromCache } = await getFastAuth()

  // Log cache hit for debugging
  if (fromCache && process.env.NODE_ENV === 'development') {
    logger.debug('Cart POST (merge): Auth from cache', { userId: user?.id.slice(0, 8) })
  }

  // SEC-028: Validate cart items with Zod schema
  const body = await request.json()
  const validation = cartMergeSchema.safeParse(body)

  if (!validation.success) {
    return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
      details: {
        message: 'Items inválidos',
        errors: validation.error.flatten().fieldErrors,
      },
    })
  }

  const { items: localItems } = validation.data

  // For unauthenticated users, return local items
  if (!user) {
    return NextResponse.json({ success: true, items: localItems, local_only: true })
  }

  // SEC-025: Always get tenant_id from user's profile, never trust client input
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
  const tenantId = profile.tenant_id

  // Check if tenant has ecommerce feature enabled
  const featureCheck = await checkEcommerceAccess(tenantId)
  if (featureCheck) return featureCheck

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
