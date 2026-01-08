import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
}

const createMockChain = (data: unknown, error: unknown = null) => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockResolvedValue({ data, error }),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue({ data: Array.isArray(data) ? data : [data], error }),
  single: vi.fn().mockResolvedValue({ data, error }),
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock next/headers for rate limiting
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn((name: string) => {
      if (name === 'x-forwarded-for') return '192.168.1.100'
      if (name === 'x-real-ip') return '192.168.1.100'
      return null
    }),
  })),
}))

// Mock action rate limiting to always allow
vi.mock('@/lib/auth/action-rate-limit', () => ({
  checkActionRateLimit: vi.fn(async () => ({ success: true, remaining: 5, retryAfter: 0 })),
  ACTION_RATE_LIMITS: {
    contactForm: { type: 'auth' },
    foundPetReport: { type: 'refund' },
  },
  clearActionRateLimits: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock auth result configuration for withActionAuth
let mockAuthResult: {
  success: boolean
  error?: string
  context?: {
    user: { id: string }
    profile: { id: string; role: string; tenant_id: string }
    supabase: typeof mockSupabaseClient
    isStaff: boolean
  }
} = { success: false, error: 'Tu sesión ha expirado' }

vi.mock('@/lib/auth', () => ({
  withActionAuth: <TResult, TArgs extends unknown[]>(
    handler: (context: NonNullable<typeof mockAuthResult.context>, ...args: TArgs) => Promise<TResult>
  ) => {
    return async (...args: TArgs) => {
      if (!mockAuthResult.success || !mockAuthResult.context) {
        return { success: false, error: mockAuthResult.error || 'No autorizado' }
      }
      return handler(mockAuthResult.context, ...args)
    }
  },
}))

vi.mock('@/lib/errors', () => ({
  actionSuccess: <T>(data?: T) => ({ success: true, data }),
  actionError: (error: string) => ({ success: false, error }),
}))

// Import after mocking
import { getLostPets, updateLostPetStatus, reportFoundPet } from '@/app/actions/safety'

describe('Safety Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthResult = { success: false, error: 'Tu sesión ha expirado' }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getLostPets', () => {
    it('should return error when user is not authenticated', async () => {
      const result = await getLostPets('adris')

      expect(result.success).toBe(false)
      expect(result.error).toContain('sesión')
    })

    it('should return lost pets for authenticated user', async () => {
      mockAuthResult = {
        success: true,
        context: {
          user: { id: 'user-123' },
          profile: { id: 'user-123', role: 'vet', tenant_id: 'adris' },
          supabase: mockSupabaseClient,
          isStaff: true,
        },
      }

      const mockLostPets = [
        {
          id: 'lost-1',
          pet_id: 'pet-1',
          status: 'lost',
          pet: { id: 'pet-1', name: 'Max', species: 'dog' },
        },
      ]

      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockLostPets, error: null }),
      }))

      const result = await getLostPets('adris')

      expect(result.success).toBe(true)
    })

    // Note: Testing status filter with complex chained queries is tested via integration tests
  })

  describe('updateLostPetStatus', () => {
    it('should return error when user is not authenticated', async () => {
      const result = await updateLostPetStatus('adris', 'report-123', 'reunited')

      expect(result.success).toBe(false)
      expect(result.error).toContain('sesión')
    })

    it('should return error when user is not staff', async () => {
      mockAuthResult = {
        success: true,
        context: {
          user: { id: 'user-123' },
          profile: { id: 'user-123', role: 'owner', tenant_id: 'adris' },
          supabase: mockSupabaseClient,
          isStaff: false,
        },
      }

      const result = await updateLostPetStatus('adris', 'report-123', 'reunited')

      expect(result.success).toBe(false)
      expect(result.error).toContain('permiso')
    })

    it('should update status for staff user', async () => {
      mockAuthResult = {
        success: true,
        context: {
          user: { id: 'user-123' },
          profile: { id: 'user-123', role: 'vet', tenant_id: 'adris' },
          supabase: mockSupabaseClient,
          isStaff: true,
        },
      }

      // Support chained eq calls (eq('id').eq('tenant_id'))
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }
      // Final eq call returns the result
      mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({ error: null })
      mockSupabaseClient.from.mockImplementation(() => mockChain)

      const result = await updateLostPetStatus('adris', 'report-123', 'reunited')

      expect(result.success).toBe(true)
    })
  })

  describe('reportFoundPet', () => {
    it('should create found pet report', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockResolvedValue({ error: null }),
      }))

      const result = await reportFoundPet('pet-123', 'Parque Central', '0981123456')

      expect(result.success).toBe(true)
    })

    it('should use default location if not provided', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockResolvedValue({ error: null }),
      }))

      const result = await reportFoundPet('pet-123')

      expect(result.success).toBe(true)
    })

    it('should return error if database insert fails', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockResolvedValue({ error: { message: 'DB Error' } }),
      }))

      const result = await reportFoundPet('pet-123')

      expect(result.success).toBe(false)
    })
  })
})
