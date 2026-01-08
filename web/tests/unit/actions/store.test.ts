import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
  rpc: vi.fn(),
}

// Default mock implementation helper
const createMockChain = (data: unknown, error: unknown = null, count: number | null = null) => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockResolvedValue({ data, error, count }),
  single: vi.fn().mockResolvedValue({ data, error }),
  maybeSingle: vi.fn().mockResolvedValue({ data, error }),
})

// Mock validated auth result
let mockAuthResult: {
  success: boolean
  context?: {
    user: { id: string; email: string }
    profile: { id: string; role: string; tenant_id: string; full_name: string }
    supabase: typeof mockSupabaseClient
  }
} = {
  success: true,
  context: {
    user: { id: 'user-123', email: 'test@test.com' },
    profile: { id: 'user-123', role: 'owner', tenant_id: 'adris', full_name: 'Test User' },
    supabase: mockSupabaseClient,
  },
}

// Mock the @/lib/auth module - replace withActionAuth with a simple wrapper
vi.mock('@/lib/auth', () => ({
  withActionAuth: (handler: (context: unknown, ...args: unknown[]) => Promise<unknown>) => {
    return async (...args: unknown[]) => {
      // Access mockAuthResult via closure - but we need to work around hoisting
      // Use a getter pattern through a global
      const authResult = (globalThis as Record<string, unknown>).__mockAuthResult as typeof mockAuthResult
      if (!authResult?.success || !authResult.context) {
        return { success: false, error: 'No autorizado' }
      }
      return handler(authResult.context, ...args)
    }
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

// Import after mocking
import { getStoreProducts, getStoreProduct, getWishlist, toggleWishlist } from '@/app/actions/store'

describe('Store Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset to authenticated by default
    mockAuthResult = {
      success: true,
      context: {
        user: { id: 'user-123', email: 'test@test.com' },
        profile: { id: 'user-123', role: 'owner', tenant_id: 'adris', full_name: 'Test User' },
        supabase: mockSupabaseClient,
      },
    }
    // Set the global for the mock to access
    ;(globalThis as Record<string, unknown>).__mockAuthResult = mockAuthResult

    mockSupabaseClient.from.mockImplementation(() => {
      return createMockChain(null, { message: 'Not mocked' })
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getStoreProducts', () => {
    it('should return error when user is not authenticated', async () => {
      mockAuthResult = { success: false } as typeof mockAuthResult
      ;(globalThis as Record<string, unknown>).__mockAuthResult = mockAuthResult

      const result = await getStoreProducts('adris', {})

      expect(result.success).toBe(false)
    })

    it('should return products with pagination', async () => {
      const mockProducts = [
        { id: '1', name: 'Product A', base_price: 10000 },
        { id: '2', name: 'Product B', base_price: 20000 },
      ]

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'store_products') {
          return createMockChain(mockProducts, null, 10)
        }
        return createMockChain(null)
      })

      const result = await getStoreProducts('adris', { page: 1, limit: 12 })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.products).toHaveLength(2)
        expect(result.data.pagination.total).toBe(10)
      }
    })

    it('should apply sort options', async () => {
      const mockProducts = [{ id: '1', name: 'Product', base_price: 10000 }]

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'store_products') {
          return createMockChain(mockProducts, null, 1)
        }
        return createMockChain(null)
      })

      const result = await getStoreProducts('adris', { sort: 'price_low_high' })

      expect(result.success).toBe(true)
    })

    it('should return error when database query fails', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'store_products') {
          return createMockChain(null, { message: 'Database error' })
        }
        return createMockChain(null)
      })

      const result = await getStoreProducts('adris', {})

      expect(result.success).toBe(false)
      expect(result.error).toContain('Error')
    })

    it('should handle search filter', async () => {
      const mockProducts = [{ id: '1', name: 'Dog Food', base_price: 10000 }]

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'store_products') {
          return createMockChain(mockProducts, null, 1)
        }
        return createMockChain(null)
      })

      const result = await getStoreProducts('adris', { search: 'dog' })

      expect(result.success).toBe(true)
    })
  })

  describe('getStoreProduct', () => {
    it('should return error when user is not authenticated', async () => {
      mockAuthResult = { success: false } as typeof mockAuthResult
      ;(globalThis as Record<string, unknown>).__mockAuthResult = mockAuthResult

      const result = await getStoreProduct('adris', 'product-123')

      expect(result.success).toBe(false)
    })

    it('should return product details', async () => {
      const mockProduct = {
        id: 'product-123',
        name: 'Premium Dog Food',
        base_price: 25000,
        description: 'High quality food',
      }

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'store_products') {
          return createMockChain(mockProduct)
        }
        return createMockChain(null)
      })

      const result = await getStoreProduct('adris', 'product-123')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('product-123')
        expect(result.data.name).toBe('Premium Dog Food')
      }
    })

    it('should return error when product is not found', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'store_products') {
          return createMockChain(null, { message: 'Not found' })
        }
        return createMockChain(null)
      })

      const result = await getStoreProduct('adris', 'invalid-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('no encontrado')
    })
  })

  describe('getWishlist', () => {
    it('should return error when user is not authenticated', async () => {
      mockAuthResult = { success: false } as typeof mockAuthResult
      ;(globalThis as Record<string, unknown>).__mockAuthResult = mockAuthResult

      const result = await getWishlist('adris')

      expect(result.success).toBe(false)
    })

    it('should return wishlist items as Set', async () => {
      const mockWishlist = [
        { product_id: 'prod-1' },
        { product_id: 'prod-2' },
        { product_id: 'prod-3' },
      ]

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'store_wishlist') {
          return {
            ...createMockChain(null),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockWishlist, error: null }),
            }),
          }
        }
        return createMockChain(null)
      })

      const result = await getWishlist('adris')

      expect(result.success).toBe(true)
      if (result.success) {
        // Result is a Set converted from product_ids
        expect(result.data).toBeDefined()
      }
    })

    it('should return error when database query fails', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'store_wishlist') {
          return {
            ...createMockChain(null),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
            }),
          }
        }
        return createMockChain(null)
      })

      const result = await getWishlist('adris')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Error')
    })
  })

  describe('toggleWishlist', () => {
    it('should return error when user is not authenticated', async () => {
      mockAuthResult = { success: false } as typeof mockAuthResult
      ;(globalThis as Record<string, unknown>).__mockAuthResult = mockAuthResult

      const result = await toggleWishlist('adris', 'product-123')

      expect(result.success).toBe(false)
    })

    it('should add product to wishlist when not already present', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'store_wishlist') {
          return {
            ...createMockChain(null),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }), // Not existing
            insert: mockInsert,
          }
        }
        return createMockChain(null)
      })

      const result = await toggleWishlist('adris', 'product-123')

      expect(result.success).toBe(true)
    })

    it('should remove product from wishlist when already present', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'store_wishlist') {
          return {
            ...createMockChain(null),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: 'wishlist-item-123' }, // Already exists
              error: null,
            }),
            delete: mockDelete,
          }
        }
        return createMockChain(null)
      })

      const result = await toggleWishlist('adris', 'product-123')

      expect(result.success).toBe(true)
    })

    it('should return error when delete fails', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'store_wishlist') {
          return {
            ...createMockChain(null),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: 'wishlist-item-123' },
              error: null,
            }),
            delete: mockDelete,
          }
        }
        return createMockChain(null)
      })

      const result = await toggleWishlist('adris', 'product-123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Error')
    })

    it('should return error when insert fails', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: { message: 'Insert failed' } })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'store_wishlist') {
          return {
            ...createMockChain(null),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            insert: mockInsert,
          }
        }
        return createMockChain(null)
      })

      const result = await toggleWishlist('adris', 'product-123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Error')
    })
  })
})
