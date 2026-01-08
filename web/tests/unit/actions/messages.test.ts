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
  ilike: vi.fn().mockReturnThis(),
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
}))

// Mock auth result configuration
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

// Mock the @/lib/auth module
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
import { getConversations, createConversation } from '@/app/actions/messages'

describe('Messages Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset to unauthenticated state
    mockAuthResult = { success: false, error: 'Tu sesión ha expirado' }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getConversations', () => {
    it('should return error when user is not authenticated', async () => {
      // mockAuthResult is already set to unauthenticated

      const result = await getConversations('adris', {})

      expect(result.success).toBe(false)
      expect(result.error).toContain('sesión')
    })

    it('should return conversations for authenticated owner', async () => {
      // Set up authenticated owner
      mockAuthResult = {
        success: true,
        context: {
          user: { id: 'user-123' },
          profile: { id: 'user-123', role: 'owner', tenant_id: 'adris' },
          supabase: mockSupabaseClient,
          isStaff: false,
        },
      }

      const mockConversations = [
        {
          id: 'conv-1',
          subject: 'Test',
          client: { id: 'user-123', full_name: 'Test User' },
          staff: null,
        },
      ]

      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockConversations, error: null }),
      }))

      const result = await getConversations('adris', {})

      expect(result.success).toBe(true)
    })
  })

  describe('createConversation', () => {
    it('should return error when user is not authenticated', async () => {
      // mockAuthResult is already set to unauthenticated

      const result = await createConversation('adris', 'Test Subject', 'Test Message')

      expect(result.success).toBe(false)
      expect(result.error).toContain('sesión')
    })

    it('should create conversation for authenticated user', async () => {
      // Set up authenticated user
      mockAuthResult = {
        success: true,
        context: {
          user: { id: 'user-123' },
          profile: { id: 'user-123', role: 'owner', tenant_id: 'adris' },
          supabase: mockSupabaseClient,
          isStaff: false,
        },
      }

      const mockConversation = { id: 'conv-123', subject: 'Test Subject' }

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'conversations') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockConversation, error: null }),
          }
        }
        if (table === 'messages') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          }
        }
        return createMockChain(null)
      })

      const result = await createConversation('adris', 'Test Subject', 'Test Message')

      expect(result.success).toBe(true)
    })

    it('should return error when conversation creation fails', async () => {
      // Set up authenticated user
      mockAuthResult = {
        success: true,
        context: {
          user: { id: 'user-123' },
          profile: { id: 'user-123', role: 'owner', tenant_id: 'adris' },
          supabase: mockSupabaseClient,
          isStaff: false,
        },
      }

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'conversations') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'UNKNOWN', message: 'DB Error' } }),
          }
        }
        return createMockChain(null)
      })

      const result = await createConversation('adris', 'Test Subject', 'Test Message')

      expect(result.success).toBe(false)
      expect(result.error).toContain('conversación')
    })
  })
})
