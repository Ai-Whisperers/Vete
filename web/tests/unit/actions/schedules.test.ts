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
  getStaffSchedules,
  getStaffSchedule,
  createStaffSchedule,
  deleteStaffSchedule,
  getBookableStaff,
} from '@/app/actions/schedules'

describe('Schedules Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getStaffSchedules', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getStaffSchedules('adris')

      expect(result.schedules).toEqual([])
      expect(result.error).toContain('autorizado')
    })

    it('should return error when user is not staff', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({ role: 'owner', tenant_id: 'adris' })
        }
        return createMockChain(null)
      })

      const result = await getStaffSchedules('adris')

      expect(result.schedules).toEqual([])
      expect(result.error).toContain('personal')
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

      const result = await getStaffSchedules('adris')

      expect(result.schedules).toEqual([])
      expect(result.error).toContain('personal')
    })
  })

  describe('getStaffSchedule', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getStaffSchedule('schedule-123')

      expect(result.schedule).toBeNull()
      expect(result.error).toContain('autorizado')
    })

    it('should return error when schedule not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'staff_schedules') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }
        }
        return createMockChain(null)
      })

      const result = await getStaffSchedule('schedule-123')

      expect(result.schedule).toBeNull()
      expect(result.error).toContain('encontrado')
    })
  })

  describe('createStaffSchedule', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await createStaffSchedule('adris', {
        staffProfileId: 'staff-123',
        name: 'Test Schedule',
        effectiveFrom: '2024-01-01',
        entries: [],
      })

      expect(result.error).toContain('autorizado')
    })

    it('should return error when user is not admin', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({ role: 'vet', tenant_id: 'adris' }) // Vet, not admin
        }
        return createMockChain(null)
      })

      const result = await createStaffSchedule('adris', {
        staffProfileId: 'staff-123',
        name: 'Test Schedule',
        effectiveFrom: '2024-01-01',
        entries: [],
      })

      expect(result.error).toContain('administradores')
    })

    it('should return error when user is from different tenant', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({ role: 'admin', tenant_id: 'other-clinic' })
        }
        return createMockChain(null)
      })

      const result = await createStaffSchedule('adris', {
        staffProfileId: 'staff-123',
        name: 'Test Schedule',
        effectiveFrom: '2024-01-01',
        entries: [],
      })

      expect(result.error).toContain('administradores')
    })
  })

  describe('deleteStaffSchedule', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await deleteStaffSchedule('schedule-123')

      expect(result.error).toContain('autorizado')
    })

    it('should return error when schedule not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'staff_schedules') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return createMockChain(null)
      })

      const result = await deleteStaffSchedule('schedule-123')

      expect(result.error).toContain('encontrado')
    })
  })

  describe('getBookableStaff', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getBookableStaff('adris')

      expect(result.staff).toEqual([])
      expect(result.error).toContain('autorizado')
    })

    it('should return error when user is not staff', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({ role: 'owner', tenant_id: 'adris' })
        }
        return createMockChain(null)
      })

      const result = await getBookableStaff('adris')

      expect(result.staff).toEqual([])
      expect(result.error).toContain('personal')
    })
  })
})
