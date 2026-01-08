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
  insert: vi.fn().mockResolvedValue({ error }),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
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
import { inviteStaff, removeInvite } from '@/app/actions/invite-staff'

describe('Invite Staff Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('inviteStaff', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      formData.set('email', 'test@test.com')
      formData.set('role', 'vet')
      formData.set('clinic', 'adris')

      const result = await inviteStaff(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('sesión')
    })

    it('should return error when user is not admin', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({ role: 'vet', tenant_id: 'adris' }) // Not admin
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('email', 'test@test.com')
      formData.set('role', 'vet')
      formData.set('clinic', 'adris')

      const result = await inviteStaff(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('administradores')
    })

    it('should return error for invalid email format', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({ role: 'admin', tenant_id: 'adris' })
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('email', 'invalid-email')
      formData.set('role', 'vet')
      formData.set('clinic', 'adris')

      const result = await inviteStaff(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.email).toBeDefined()
    })

    it('should return error for invalid role', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({ role: 'admin', tenant_id: 'adris' })
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('email', 'test@test.com')
      formData.set('role', 'invalid-role')
      formData.set('clinic', 'adris')

      const result = await inviteStaff(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.role).toBeDefined()
    })

    it('should return error when email already has a profile', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      let queryCount = 0
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          queryCount++
          if (queryCount === 1) {
            // First query: admin check
            return createMockChain({ role: 'admin', tenant_id: 'adris' })
          }
          // Second query: existing profile check
          return createMockChain({ id: 'existing-user', full_name: 'John Doe', role: 'vet' })
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('email', 'existing@test.com')
      formData.set('role', 'vet')
      formData.set('clinic', 'adris')

      const result = await inviteStaff(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('ya está registrado')
    })

    it('should return error when invite already exists', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      let profileQueryCount = 0
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          profileQueryCount++
          if (profileQueryCount === 1) {
            return createMockChain({ role: 'admin', tenant_id: 'adris' })
          }
          // No existing profile
          return createMockChain(null)
        }
        if (table === 'clinic_invites') {
          // Existing invite
          return createMockChain({
            id: 'invite-123',
            role: 'vet',
            created_at: '2025-01-01T00:00:00Z',
          })
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('email', 'test@test.com')
      formData.set('role', 'vet')
      formData.set('clinic', 'adris')

      const result = await inviteStaff(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('invitación pendiente')
    })

    it('should successfully create invite', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      let profileQueryCount = 0
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          profileQueryCount++
          if (profileQueryCount === 1) {
            return createMockChain({ role: 'admin', tenant_id: 'adris' })
          }
          // No existing profile
          return createMockChain(null)
        }
        if (table === 'clinic_invites') {
          // No existing invite, and insert success
          return {
            ...createMockChain(null),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          }
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('email', 'newvet@test.com')
      formData.set('role', 'vet')
      formData.set('clinic', 'adris')

      const result = await inviteStaff(null, formData)

      expect(result.success).toBe(true)
    })
  })

  describe('removeInvite', () => {
    it('should throw error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      formData.set('id', 'invite-123')
      formData.set('clinic', 'adris')

      await expect(removeInvite(formData)).rejects.toThrow('sesion')
    })

    it('should throw error when user is not admin', async () => {
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

      const formData = new FormData()
      formData.set('id', 'invite-123')
      formData.set('clinic', 'adris')

      await expect(removeInvite(formData)).rejects.toThrow('administradores')
    })

    it('should throw error when clinic does not match', async () => {
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

      const formData = new FormData()
      formData.set('id', 'invite-123')
      formData.set('clinic', 'adris')

      await expect(removeInvite(formData)).rejects.toThrow('acceso')
    })

    it('should successfully delete invite', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({ role: 'admin', tenant_id: 'adris' })
        }
        if (table === 'clinic_invites') {
          return {
            ...createMockChain(null),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }),
          }
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('id', 'invite-123')
      formData.set('clinic', 'adris')

      // Should not throw
      await expect(removeInvite(formData)).resolves.not.toThrow()
    })
  })
})
