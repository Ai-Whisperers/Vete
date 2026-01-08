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
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
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

// Import after mocking
import {
  getTimeOffTypes,
  getTimeOffRequests,
  createTimeOffRequest,
  updateTimeOffRequestStatus,
  cancelTimeOffRequest,
  getPendingTimeOffCount,
} from '@/app/actions/time-off'

describe('Time Off Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getTimeOffTypes', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getTimeOffTypes('adris')

      expect(result.types).toEqual([])
      expect(result.error).toContain('autorizado')
    })

    it('should return error when user is from different tenant', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({ tenant_id: 'other-clinic' })
        }
        return createMockChain(null)
      })

      const result = await getTimeOffTypes('adris')

      expect(result.types).toEqual([])
      expect(result.error).toContain('acceso')
    })
  })

  describe('getTimeOffRequests', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getTimeOffRequests('adris')

      expect(result.requests).toEqual([])
      expect(result.error).toContain('autorizado')
    })

    it('should return error when user is from different tenant', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({ role: 'vet', tenant_id: 'other-clinic' })
        }
        return createMockChain(null)
      })

      const result = await getTimeOffRequests('adris')

      expect(result.requests).toEqual([])
      expect(result.error).toContain('acceso')
    })
  })

  describe('createTimeOffRequest', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await createTimeOffRequest('adris', {
        time_off_type_id: 'type-123',
        start_date: '2024-02-01',
        end_date: '2024-02-05',
      })

      expect(result.error).toContain('autorizado')
    })

    it('should return error when user has no staff profile', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'staff_profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return createMockChain(null)
      })

      const result = await createTimeOffRequest('adris', {
        time_off_type_id: 'type-123',
        start_date: '2024-02-01',
        end_date: '2024-02-05',
      })

      expect(result.error).toContain('perfil de personal')
    })
  })

  describe('updateTimeOffRequestStatus', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await updateTimeOffRequestStatus('request-123', 'approved')

      expect(result.error).toContain('autorizado')
    })

    it('should return error when request not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'time_off_requests') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return createMockChain(null)
      })

      const result = await updateTimeOffRequestStatus('request-123', 'approved')

      expect(result.error).toContain('encontrada')
    })

    it('should return error when user is not admin', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'time_off_requests') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'request-123', tenant_id: 'adris', status: 'pending' },
              error: null,
            }),
          }
        }
        if (table === 'profiles') {
          return createMockChain({ role: 'vet', tenant_id: 'adris' }) // Vet, not admin
        }
        return createMockChain(null)
      })

      const result = await updateTimeOffRequestStatus('request-123', 'approved')

      expect(result.error).toContain('administradores')
    })
  })

  describe('cancelTimeOffRequest', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await cancelTimeOffRequest('request-123')

      expect(result.error).toContain('autorizado')
    })

    it('should return error when request not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'time_off_requests') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return createMockChain(null)
      })

      const result = await cancelTimeOffRequest('request-123')

      expect(result.error).toContain('encontrada')
    })
  })

  describe('getPendingTimeOffCount', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getPendingTimeOffCount('adris')

      expect(result.count).toBe(0)
      expect(result.error).toContain('autorizado')
    })

    it('should return 0 when user is not admin', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({ role: 'vet', tenant_id: 'adris' })
        }
        return createMockChain(null)
      })

      const result = await getPendingTimeOffCount('adris')

      expect(result.count).toBe(0)
      expect(result.error).toBeUndefined()
    })
  })
})
