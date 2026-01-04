/**
 * Admin Role Authorization Tests
 *
 * Verifies that admin-only endpoints properly enforce role-based access control.
 * Critical security tests for platform administration routes.
 *
 * @tags integration, security, admin, critical
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Import the admin routes we're testing
import { GET as getPendingProducts } from '@/app/api/admin/products/pending/route'
import { POST as approveProduct } from '@/app/api/admin/products/[id]/approve/route'

// Mock response type helper
interface MockResponse {
  status: number
  json: () => Promise<Record<string, unknown>>
}

// Mock users with different roles
const mockAdminUser = { id: 'admin-001', email: 'admin@clinic.com' }
const mockAdminProfile = {
  id: 'admin-001',
  tenant_id: 'tenant-adris',
  role: 'admin',
  full_name: 'Admin User',
  is_platform_admin: true,
}

const mockVetUser = { id: 'vet-001', email: 'vet@clinic.com' }
const mockVetProfile = {
  id: 'vet-001',
  tenant_id: 'tenant-adris',
  role: 'vet',
  full_name: 'Dr. Veterinario',
  is_platform_admin: false,
}

const mockOwnerUser = { id: 'owner-001', email: 'owner@gmail.com' }
const mockOwnerProfile = {
  id: 'owner-001',
  tenant_id: 'tenant-adris',
  role: 'owner',
  full_name: 'Pet Owner',
  is_platform_admin: false,
}

// Track current user/profile for tests
let currentUser: typeof mockAdminUser | typeof mockVetUser | typeof mockOwnerUser | null =
  mockAdminUser
let currentProfile: typeof mockAdminProfile | typeof mockVetProfile | typeof mockOwnerProfile =
  mockAdminProfile

// Create chainable mock for Supabase queries
const createChainMock = (resultData: unknown = null, resultError: unknown = null) => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: resultData, error: resultError }),
    update: vi.fn().mockReturnThis(),
  }

  // Make methods chainable
  Object.keys(chain).forEach((key) => {
    if (key !== 'single') {
      chain[key].mockReturnValue(chain)
    }
  })

  return chain
}

// Mock Supabase client
const createMockSupabase = () => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: currentUser },
      error: currentUser ? null : { message: 'Not authenticated' },
    }),
  },
  from: vi.fn().mockImplementation((table: string) => {
    if (table === 'profiles') {
      return createChainMock(currentProfile)
    }
    if (table === 'store_products') {
      return {
        ...createChainMock([]),
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          not: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
        }),
      }
    }
    return createChainMock()
  }),
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
})

// Mock the Supabase server module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(() => Promise.resolve(createMockSupabase())),
}))

describe('Admin Role Authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentUser = mockAdminUser
    currentProfile = mockAdminProfile
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/admin/products/pending', () => {
    const createGetRequest = (params?: Record<string, string>) => {
      const url = new URL('http://localhost/api/admin/products/pending')
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value)
        })
      }
      return new NextRequest(url.toString(), { method: 'GET' })
    }

    describe('Admin Access', () => {
      it('should allow admin users to access pending products', async () => {
        currentUser = mockAdminUser
        currentProfile = mockAdminProfile

        const request = createGetRequest()
        const response = (await getPendingProducts(request)) as MockResponse

        // Should not return 401 or 403
        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(403)
      })

      it('should return proper pagination for admin requests', async () => {
        currentUser = mockAdminUser
        currentProfile = mockAdminProfile

        const request = createGetRequest({ page: '1', limit: '10' })
        const response = (await getPendingProducts(request)) as MockResponse

        if (response.status === 200) {
          const json = await response.json()
          expect(json).toHaveProperty('products')
          expect(json).toHaveProperty('pagination')
        }
      })
    })

    describe('Non-Admin Rejection', () => {
      it('should reject vet users with 403 Forbidden', async () => {
        currentUser = mockVetUser
        currentProfile = mockVetProfile

        const request = createGetRequest()
        const response = (await getPendingProducts(request)) as MockResponse

        expect(response.status).toBe(403)
        const json = await response.json()
        expect(json.code).toBe('INSUFFICIENT_ROLE')
      })

      it('should reject owner users with 403 Forbidden', async () => {
        currentUser = mockOwnerUser
        currentProfile = mockOwnerProfile

        const request = createGetRequest()
        const response = (await getPendingProducts(request)) as MockResponse

        expect(response.status).toBe(403)
        const json = await response.json()
        expect(json.code).toBe('INSUFFICIENT_ROLE')
      })
    })

    describe('Unauthenticated Rejection', () => {
      it('should reject unauthenticated requests with 401', async () => {
        // Reset mock to return no user
        const mockSupabase = createMockSupabase()
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        })

        vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue(
          mockSupabase as unknown as ReturnType<typeof createMockSupabase>
        )

        const request = createGetRequest()
        const response = (await getPendingProducts(request)) as MockResponse

        expect(response.status).toBe(401)
        const json = await response.json()
        expect(json.code).toBe('AUTH_REQUIRED')
      })
    })
  })

  describe('POST /api/admin/products/[id]/approve', () => {
    const productId = 'product-123'

    const createPostRequest = (body: Record<string, unknown>) =>
      new NextRequest(`http://localhost/api/admin/products/${productId}/approve`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      })

    describe('Admin Access', () => {
      it('should allow admin to verify products', async () => {
        currentUser = mockAdminUser
        currentProfile = mockAdminProfile

        // Mock product fetch
        const mockSupabase = createMockSupabase()
        vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue(
          mockSupabase as unknown as ReturnType<typeof createMockSupabase>
        )

        mockSupabase.from = vi.fn().mockImplementation((table: string) => {
          if (table === 'profiles') {
            return createChainMock(currentProfile)
          }
          if (table === 'store_products') {
            const chain = createChainMock({
              id: productId,
              name: 'Test Product',
              created_by_tenant_id: 'tenant-other',
              verification_status: 'pending',
            })
            chain.update = vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: productId,
                      verification_status: 'verified',
                      is_global_catalog: true,
                    },
                    error: null,
                  }),
                }),
              }),
            })
            return chain
          }
          return createChainMock()
        })

        const request = createPostRequest({ action: 'verify' })
        const response = (await approveProduct(request, {
          params: Promise.resolve({ id: productId }),
        })) as MockResponse

        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(403)
      })

      it('should allow admin to reject products', async () => {
        currentUser = mockAdminUser
        currentProfile = mockAdminProfile

        const mockSupabase = createMockSupabase()
        vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue(
          mockSupabase as unknown as ReturnType<typeof createMockSupabase>
        )

        mockSupabase.from = vi.fn().mockImplementation((table: string) => {
          if (table === 'profiles') {
            return createChainMock(currentProfile)
          }
          if (table === 'store_products') {
            const chain = createChainMock({
              id: productId,
              name: 'Test Product',
              created_by_tenant_id: 'tenant-other',
              verification_status: 'pending',
            })
            chain.update = vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: productId,
                      verification_status: 'rejected',
                    },
                    error: null,
                  }),
                }),
              }),
            })
            return chain
          }
          return createChainMock()
        })

        const request = createPostRequest({
          action: 'reject',
          rejection_reason: 'Datos incompletos',
        })
        const response = (await approveProduct(request, {
          params: Promise.resolve({ id: productId }),
        })) as MockResponse

        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(403)
      })
    })

    describe('Non-Admin Rejection', () => {
      it('should reject vet users with 403 Forbidden', async () => {
        currentUser = mockVetUser
        currentProfile = mockVetProfile

        const request = createPostRequest({ action: 'verify' })
        const response = (await approveProduct(request, {
          params: Promise.resolve({ id: productId }),
        })) as MockResponse

        expect(response.status).toBe(403)
        const json = await response.json()
        expect(json.code).toBe('INSUFFICIENT_ROLE')
      })

      it('should reject owner users with 403 Forbidden', async () => {
        currentUser = mockOwnerUser
        currentProfile = mockOwnerProfile

        const request = createPostRequest({ action: 'verify' })
        const response = (await approveProduct(request, {
          params: Promise.resolve({ id: productId }),
        })) as MockResponse

        expect(response.status).toBe(403)
        const json = await response.json()
        expect(json.code).toBe('INSUFFICIENT_ROLE')
      })
    })

    describe('Unauthenticated Rejection', () => {
      it('should reject unauthenticated requests with 401', async () => {
        // Reset mock to return no user
        const mockSupabase = createMockSupabase()
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        })

        vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue(
          mockSupabase as unknown as ReturnType<typeof createMockSupabase>
        )

        const request = createPostRequest({ action: 'verify' })
        const response = (await approveProduct(request, {
          params: Promise.resolve({ id: productId }),
        })) as MockResponse

        expect(response.status).toBe(401)
        const json = await response.json()
        expect(json.code).toBe('AUTH_REQUIRED')
      })
    })

    describe('Input Validation', () => {
      it('should reject invalid action values', async () => {
        currentUser = mockAdminUser
        currentProfile = mockAdminProfile

        const mockSupabase = createMockSupabase()
        vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue(
          mockSupabase as unknown as ReturnType<typeof createMockSupabase>
        )

        const request = createPostRequest({ action: 'invalid_action' })
        const response = (await approveProduct(request, {
          params: Promise.resolve({ id: productId }),
        })) as MockResponse

        expect(response.status).toBe(400)
        const json = await response.json()
        expect(json.code).toBe('VALIDATION_ERROR')
      })

      it('should reject missing action parameter', async () => {
        currentUser = mockAdminUser
        currentProfile = mockAdminProfile

        const mockSupabase = createMockSupabase()
        vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue(
          mockSupabase as unknown as ReturnType<typeof createMockSupabase>
        )

        const request = createPostRequest({})
        const response = (await approveProduct(request, {
          params: Promise.resolve({ id: productId }),
        })) as MockResponse

        expect(response.status).toBe(400)
      })
    })
  })

  describe('Role Hierarchy Tests', () => {
    const roles = [
      { user: mockAdminUser, profile: mockAdminProfile, shouldAccess: true },
      { user: mockVetUser, profile: mockVetProfile, shouldAccess: false },
      { user: mockOwnerUser, profile: mockOwnerProfile, shouldAccess: false },
    ]

    roles.forEach(({ user, profile, shouldAccess }) => {
      it(`${profile.role} role should ${shouldAccess ? 'access' : 'not access'} admin endpoints`, async () => {
        currentUser = user
        currentProfile = profile

        const request = new NextRequest('http://localhost/api/admin/products/pending', {
          method: 'GET',
        })
        const response = (await getPendingProducts(request)) as MockResponse

        if (shouldAccess) {
          expect(response.status).not.toBe(403)
        } else {
          expect(response.status).toBe(403)
        }
      })
    })
  })
})

describe('Admin Authorization Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Profile Edge Cases', () => {
    it('should reject user with no profile record', async () => {
      // Mock user exists but has no profile
      const mockSupabase = createMockSupabase()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'orphan-user', email: 'orphan@test.com' } },
        error: null,
      })
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainMock(null) // No profile found
        }
        return createChainMock()
      })

      vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue(
        mockSupabase as unknown as ReturnType<typeof createMockSupabase>
      )

      const request = new NextRequest('http://localhost/api/admin/products/pending', {
        method: 'GET',
      })
      const response = (await getPendingProducts(request)) as MockResponse

      expect(response.status).toBe(403)
    })

    it('should reject user with undefined role', async () => {
      const mockSupabase = createMockSupabase()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAdminUser },
        error: null,
      })
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainMock({
            id: 'admin-001',
            tenant_id: 'tenant-adris',
            role: undefined, // Missing role
            full_name: 'User Without Role',
          })
        }
        return createChainMock()
      })

      vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue(
        mockSupabase as unknown as ReturnType<typeof createMockSupabase>
      )

      const request = new NextRequest('http://localhost/api/admin/products/pending', {
        method: 'GET',
      })
      const response = (await getPendingProducts(request)) as MockResponse

      expect(response.status).toBe(403)
    })
  })

  describe('Authentication Edge Cases', () => {
    it('should handle expired session gracefully', async () => {
      const mockSupabase = createMockSupabase()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Session expired', status: 401 },
      })

      vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue(
        mockSupabase as unknown as ReturnType<typeof createMockSupabase>
      )

      const request = new NextRequest('http://localhost/api/admin/products/pending', {
        method: 'GET',
      })
      const response = (await getPendingProducts(request)) as MockResponse

      expect(response.status).toBe(401)
    })

    it('should handle malformed auth token', async () => {
      const mockSupabase = createMockSupabase()
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      })

      vi.mocked(await import('@/lib/supabase/server')).createClient.mockResolvedValue(
        mockSupabase as unknown as ReturnType<typeof createMockSupabase>
      )

      const request = new NextRequest('http://localhost/api/admin/products/pending', {
        method: 'GET',
      })
      const response = (await getPendingProducts(request)) as MockResponse

      expect(response.status).toBe(401)
    })
  })
})
