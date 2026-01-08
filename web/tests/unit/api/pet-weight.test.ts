import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
}

// Default mock implementation helper
const createMockChain = (data: unknown, error: unknown = null) => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue({ data: Array.isArray(data) ? data : [data], error }),
  single: vi.fn().mockResolvedValue({ data, error }),
})

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
  createRequestLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
  createPerformanceTracker: vi.fn(() => ({
    checkpoint: vi.fn(),
    end: vi.fn(),
  })),
}))

// Mock apiError and HTTP_STATUS
vi.mock('@/lib/api/errors', () => ({
  apiError: (type: string, status: number, details?: object) => {
    return new Response(JSON.stringify({ error: type, details }), { status })
  },
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
}))

// Mock NextResponse
vi.mock('next/server', async () => {
  return {
    NextResponse: {
      json: (data: unknown, opts?: { status?: number }) => {
        return {
          ok: (opts?.status || 200) < 400,
          status: opts?.status || 200,
          json: async () => data,
        }
      },
    },
  }
})

// Mock auth context
let mockAuthContext: {
  success: boolean
  user?: { id: string }
  profile?: { id: string; role: string; tenant_id: string }
  supabase?: typeof mockSupabaseClient
  scoped?: object
  log?: object
  perf?: object
  requestId?: string
} = { success: false }

vi.mock('@/lib/auth', () => ({
  withApiAuthParams: <P>(handler: (ctx: unknown) => Promise<unknown>) => {
    return async (request: Request, context: { params: P }) => {
      const authCtx = (globalThis as Record<string, unknown>).__mockApiAuthContext as typeof mockAuthContext
      if (!authCtx?.success) {
        return new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), { status: 401 })
      }
      const params = await Promise.resolve(context.params)
      return handler({
        ...authCtx,
        request,
        params,
      })
    }
  },
}))

describe('Pet Weight API', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset to authenticated staff by default
    mockAuthContext = {
      success: true,
      user: { id: 'user-123' },
      profile: { id: 'user-123', role: 'vet', tenant_id: 'adris' },
      supabase: mockSupabaseClient,
      scoped: {},
      log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      perf: { checkpoint: vi.fn(), end: vi.fn() },
      requestId: 'test-req-id',
    }
    ;(globalThis as Record<string, unknown>).__mockApiAuthContext = mockAuthContext
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('GET /api/pets/[id]/weight', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockAuthContext = { success: false }
      ;(globalThis as Record<string, unknown>).__mockApiAuthContext = mockAuthContext

      // Dynamic import to get fresh module with new mocks
      const { GET } = await import('@/app/api/pets/[id]/weight/route')

      const request = new Request('http://localhost/api/pets/pet-123/weight')
      const response = await GET(request, { params: Promise.resolve({ id: 'pet-123' }) })

      expect(response.status).toBe(401)
    })

    it('should return 404 when pet is not found', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain(null, { message: 'Not found' })
        }
        return createMockChain(null)
      })

      const { GET } = await import('@/app/api/pets/[id]/weight/route')

      const request = new Request('http://localhost/api/pets/nonexistent/weight')
      const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) })

      expect(response.status).toBe(404)
    })

    it('should return 403 when user is not owner and not staff', async () => {
      mockAuthContext = {
        success: true,
        user: { id: 'other-user' },
        profile: { id: 'other-user', role: 'owner', tenant_id: 'other-clinic' },
        supabase: mockSupabaseClient,
        scoped: {},
        log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        perf: { checkpoint: vi.fn(), end: vi.fn() },
        requestId: 'test-req-id',
      }
      ;(globalThis as Record<string, unknown>).__mockApiAuthContext = mockAuthContext

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain({
            owner_id: 'owner-123', // Different from current user
            tenant_id: 'adris',
            birth_date: '2023-01-01',
          })
        }
        return createMockChain(null)
      })

      const { GET } = await import('@/app/api/pets/[id]/weight/route')

      const request = new Request('http://localhost/api/pets/pet-123/weight')
      const response = await GET(request, { params: Promise.resolve({ id: 'pet-123' }) })

      expect(response.status).toBe(403)
    })

    it('should return weight history for pet owner', async () => {
      // Set user as pet owner
      mockAuthContext = {
        success: true,
        user: { id: 'owner-123' },
        profile: { id: 'owner-123', role: 'owner', tenant_id: 'adris' },
        supabase: mockSupabaseClient,
        scoped: {},
        log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        perf: { checkpoint: vi.fn(), end: vi.fn() },
        requestId: 'test-req-id',
      }
      ;(globalThis as Record<string, unknown>).__mockApiAuthContext = mockAuthContext

      const mockWeights = [
        { id: 'w1', weight_kg: 5.5, recorded_at: '2024-01-01T10:00:00Z', notes: null, recorded_by: 'user-123' },
        { id: 'w2', weight_kg: 6.0, recorded_at: '2024-02-01T10:00:00Z', notes: 'After checkup', recorded_by: 'user-123' },
      ]

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain({
            owner_id: 'owner-123', // Same as current user
            tenant_id: 'adris',
            birth_date: '2023-01-01',
          })
        }
        if (table === 'pet_weight_history') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockWeights, error: null }),
          }
        }
        return createMockChain(null)
      })

      const { GET } = await import('@/app/api/pets/[id]/weight/route')

      const request = new Request('http://localhost/api/pets/pet-123/weight')
      const response = await GET(request, { params: Promise.resolve({ id: 'pet-123' }) })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2)
      expect(data[0].weight_kg).toBe(5.5)
      expect(data[1].weight_kg).toBe(6.0)
    })

    it('should return weight history for staff member', async () => {
      const mockWeights = [
        { id: 'w1', weight_kg: 8.2, recorded_at: '2024-01-15T10:00:00Z', notes: 'Grooming visit', recorded_by: 'vet-123' },
      ]

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain({
            owner_id: 'owner-456', // Different owner, but staff has access
            tenant_id: 'adris',
            birth_date: '2022-06-15',
          })
        }
        if (table === 'pet_weight_history') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockWeights, error: null }),
          }
        }
        return createMockChain(null)
      })

      const { GET } = await import('@/app/api/pets/[id]/weight/route')

      const request = new Request('http://localhost/api/pets/pet-123/weight')
      const response = await GET(request, { params: Promise.resolve({ id: 'pet-123' }) })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.length).toBe(1)
      expect(data[0].weight_kg).toBe(8.2)
    })

    it('should return empty array when table does not exist yet', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain({
            owner_id: 'owner-123',
            tenant_id: 'adris',
            birth_date: '2023-01-01',
          })
        }
        if (table === 'pet_weight_history') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: null, error: { message: 'relation does not exist' } }),
          }
        }
        return createMockChain(null)
      })

      // Set user as pet owner
      mockAuthContext.user = { id: 'owner-123' }
      mockAuthContext.profile = { id: 'owner-123', role: 'owner', tenant_id: 'adris' }
      ;(globalThis as Record<string, unknown>).__mockApiAuthContext = mockAuthContext

      const { GET } = await import('@/app/api/pets/[id]/weight/route')

      const request = new Request('http://localhost/api/pets/pet-123/weight')
      const response = await GET(request, { params: Promise.resolve({ id: 'pet-123' }) })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data).toEqual([])
    })
  })

  describe('POST /api/pets/[id]/weight', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockAuthContext = { success: false }
      ;(globalThis as Record<string, unknown>).__mockApiAuthContext = mockAuthContext

      const { POST } = await import('@/app/api/pets/[id]/weight/route')

      const request = new Request('http://localhost/api/pets/pet-123/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: 5.5 }),
      })
      const response = await POST(request, { params: Promise.resolve({ id: 'pet-123' }) })

      expect(response.status).toBe(401)
    })

    it('should return 404 when pet is not found', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain(null, { message: 'Not found' })
        }
        return createMockChain(null)
      })

      const { POST } = await import('@/app/api/pets/[id]/weight/route')

      const request = new Request('http://localhost/api/pets/nonexistent/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: 5.5 }),
      })
      const response = await POST(request, { params: Promise.resolve({ id: 'nonexistent' }) })

      expect(response.status).toBe(404)
    })

    it('should return 400 for invalid weight (negative)', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain({
            owner_id: 'owner-123',
            tenant_id: 'adris',
          })
        }
        return createMockChain(null)
      })

      mockAuthContext.user = { id: 'owner-123' }
      mockAuthContext.profile = { id: 'owner-123', role: 'owner', tenant_id: 'adris' }
      ;(globalThis as Record<string, unknown>).__mockApiAuthContext = mockAuthContext

      const { POST } = await import('@/app/api/pets/[id]/weight/route')

      const request = new Request('http://localhost/api/pets/pet-123/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: -5 }),
      })
      const response = await POST(request, { params: Promise.resolve({ id: 'pet-123' }) })

      expect(response.status).toBe(400)
    })

    it('should return 400 for weight exceeding 500 kg', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain({
            owner_id: 'owner-123',
            tenant_id: 'adris',
          })
        }
        return createMockChain(null)
      })

      mockAuthContext.user = { id: 'owner-123' }
      mockAuthContext.profile = { id: 'owner-123', role: 'owner', tenant_id: 'adris' }
      ;(globalThis as Record<string, unknown>).__mockApiAuthContext = mockAuthContext

      const { POST } = await import('@/app/api/pets/[id]/weight/route')

      const request = new Request('http://localhost/api/pets/pet-123/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: 600 }),
      })
      const response = await POST(request, { params: Promise.resolve({ id: 'pet-123' }) })

      expect(response.status).toBe(400)
    })

    it('should create weight record for pet owner', async () => {
      const insertedWeight = {
        id: 'new-weight-id',
        pet_id: 'pet-123',
        tenant_id: 'adris',
        weight_kg: 7.5,
        notes: 'Post-diet checkup',
        recorded_by: 'owner-123',
        recorded_at: '2024-03-01T10:00:00Z',
      }

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain({
            owner_id: 'owner-123',
            tenant_id: 'adris',
          })
        }
        if (table === 'pet_weight_history') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: insertedWeight, error: null }),
          }
        }
        return createMockChain(null)
      })

      mockAuthContext.user = { id: 'owner-123' }
      mockAuthContext.profile = { id: 'owner-123', role: 'owner', tenant_id: 'adris' }
      ;(globalThis as Record<string, unknown>).__mockApiAuthContext = mockAuthContext

      const { POST } = await import('@/app/api/pets/[id]/weight/route')

      const request = new Request('http://localhost/api/pets/pet-123/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: 7.5, notes: 'Post-diet checkup' }),
      })
      const response = await POST(request, { params: Promise.resolve({ id: 'pet-123' }) })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.weight_kg).toBe(7.5)
      expect(data.notes).toBe('Post-diet checkup')
    })

    it('should create weight record for staff', async () => {
      const insertedWeight = {
        id: 'new-weight-id',
        pet_id: 'pet-456',
        tenant_id: 'adris',
        weight_kg: 12.3,
        notes: 'Vaccination visit',
        recorded_by: 'user-123',
        recorded_at: '2024-03-15T14:30:00Z',
      }

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain({
            owner_id: 'owner-456', // Different from current user
            tenant_id: 'adris', // Same tenant as staff
          })
        }
        if (table === 'pet_weight_history') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: insertedWeight, error: null }),
          }
        }
        return createMockChain(null)
      })

      const { POST } = await import('@/app/api/pets/[id]/weight/route')

      const request = new Request('http://localhost/api/pets/pet-456/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: 12.3, notes: 'Vaccination visit' }),
      })
      const response = await POST(request, { params: Promise.resolve({ id: 'pet-456' }) })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.weight_kg).toBe(12.3)
    })

    it('should fallback to updating pet weight when table does not exist', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { owner_id: 'owner-123', tenant_id: 'adris' },
              error: null,
            }),
            update: vi.fn().mockReturnThis(),
          }
        }
        if (table === 'pet_weight_history') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'relation does not exist' } }),
          }
        }
        return createMockChain(null)
      })

      mockAuthContext.user = { id: 'owner-123' }
      mockAuthContext.profile = { id: 'owner-123', role: 'owner', tenant_id: 'adris' }
      ;(globalThis as Record<string, unknown>).__mockApiAuthContext = mockAuthContext

      const { POST } = await import('@/app/api/pets/[id]/weight/route')

      const request = new Request('http://localhost/api/pets/pet-123/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: 9.8 }),
      })
      const response = await POST(request, { params: Promise.resolve({ id: 'pet-123' }) })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.fallback).toBe(true)
      expect(data.weight_kg).toBe(9.8)
    })

    it('should return 403 when user has no access to pet', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain({
            owner_id: 'other-owner', // Different owner
            tenant_id: 'other-clinic', // Different clinic
          })
        }
        return createMockChain(null)
      })

      mockAuthContext.user = { id: 'user-123' }
      mockAuthContext.profile = { id: 'user-123', role: 'owner', tenant_id: 'adris' }
      ;(globalThis as Record<string, unknown>).__mockApiAuthContext = mockAuthContext

      const { POST } = await import('@/app/api/pets/[id]/weight/route')

      const request = new Request('http://localhost/api/pets/pet-123/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: 5.5 }),
      })
      const response = await POST(request, { params: Promise.resolve({ id: 'pet-123' }) })

      expect(response.status).toBe(403)
    })
  })
})
