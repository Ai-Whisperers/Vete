'use server'

import { withActionAuth, requireOwnership } from '@/lib/auth'
import { actionSuccess, actionError } from '@/lib/errors'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { SortOption, ProductFilters, StoreProductWithDetails } from '@/lib/types/store'

/**
 * Get products for the store with filters
 */
export const getStoreProducts = withActionAuth(
  async ({ supabase }, clinicSlug: string, params: {
    page?: number
    limit?: number
    sort?: SortOption
    search?: string
    category?: string
    brand?: string
    species?: string[]
  }) => {
    const {
      page = 1,
      limit = 12,
      sort = 'relevance',
      search,
      category,
      brand,
      species
    } = params

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('tenant_id', clinicSlug)
      .is('deleted_at', null)

    // Apply filters
    if (search) query = query.ilike('name', `%${search}%`)
    if (category) query = query.eq('category', category)
    if (brand) query = query.eq('brand', brand)
    if (species && species.length > 0) query = query.contains('target_species', species)

    // Sort
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      default:
        query = query.order('name', { ascending: true })
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: products, error, count } = await query

    if (error) {
      console.error('Get store products error:', error)
      return actionError('Error al obtener productos')
    }

    return actionSuccess({
      products: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  }
)

/**
 * Get a single product with details
 */
export const getStoreProduct = withActionAuth(
  async ({ supabase }, clinicSlug: string, productId: string) => {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('tenant_id', clinicSlug)
      .is('deleted_at', null)
      .single()

    if (error || !product) {
      console.error('Get store product error:', error)
      return actionError('Producto no encontrado')
    }

    return actionSuccess(product)
  }
)

/**
 * Get wishlist for current user
 */
export const getWishlist = withActionAuth(
  async ({ user, supabase }, clinicSlug: string) => {
    const { data, error } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', user.id)
      .eq('tenant_id', clinicSlug)

    if (error) {
      console.error('Get wishlist error:', error)
      return actionError('Error al obtener lista de deseos')
    }

    return actionSuccess(new Set(data?.map(w => w.product_id) || []))
  }
)

/**
 * Toggle product in wishlist
 */
export const toggleWishlist = withActionAuth(
  async ({ user, supabase }, clinicSlug: string, productId: string) => {
    // Check if exists
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle()

    if (existing) {
      // Remove
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', existing.id)

      if (error) return actionError('Error al remover de favoritos')
    } else {
      // Add
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId,
          tenant_id: clinicSlug
        })

      if (error) return actionError('Error al agregar a favoritos')
    }

    revalidatePath(`/${clinicSlug}/store`)
    return actionSuccess()
  }
)

/**
 * Process order checkout
 */
export const checkoutOrder = withActionAuth(
  async ({ user, profile, supabase }, clinicSlug: string, items: any[]) => {
    // 1. Create Order/Invoice
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    
    // In a real app, you would validate stock here
    
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        tenant_id: clinicSlug,
        customer_id: user.id,
        total_amount: total,
        status: 'pending',
        type: 'order'
      })
      .select()
      .single()

    if (invoiceError || !invoice) {
      console.error('Checkout error:', invoiceError)
      return actionError('Error al procesar el pedido')
    }

    // 2. Add line items
    const invoiceItems = items.map(item => ({
      invoice_id: invoice.id,
      tenant_id: clinicSlug,
      product_id: item.type === 'product' ? item.id : null,
      service_id: item.type === 'service' ? item.service_id : null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      description: item.name
    }))

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems)

    if (itemsError) {
      console.error('Checkout items error:', itemsError)
      // Note: In production, use a transaction or clean up the invoice
      return actionError('Error al registrar detalles del pedido')
    }

    revalidatePath(`/${clinicSlug}/portal/dashboard`)
    
    return actionSuccess({
      id: invoice.id,
      invoice_number: invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase(),
      total: total
    })
  }
)
