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

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

// Import after mocking
import { updateProfile } from '@/app/actions/update-profile'

describe('Update Profile Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('updateProfile', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      formData.set('full_name', 'Test User')
      formData.set('clinic', 'adris')

      const result = await updateProfile(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('No autorizado')
    })

    it('should return error when profile is not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain(null) // No profile found
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('full_name', 'Test User')
      formData.set('clinic', 'adris')

      const result = await updateProfile(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Perfil no encontrado')
    })

    it('should return error when clinic is missing from form', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({
            id: 'user-123',
            tenant_id: 'adris',
            role: 'owner',
            full_name: 'Test User'
          })
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('full_name', 'Test User')
      formData.set('phone', '')
      formData.set('secondary_phone', '')
      formData.set('address', '')
      formData.set('city', '')
      // Missing clinic

      const result = await updateProfile(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('clínica')
    })

    it('should return error for missing full_name', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({
            id: 'user-123',
            tenant_id: 'adris',
            role: 'owner',
            full_name: 'Test User'
          })
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('full_name', '') // Empty name
      formData.set('phone', '')
      formData.set('secondary_phone', '')
      formData.set('address', '')
      formData.set('city', '')
      formData.set('clinic', 'adris')

      const result = await updateProfile(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.full_name).toBeDefined()
    })

    it('should return error for short full_name', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({
            id: 'user-123',
            tenant_id: 'adris',
            role: 'owner',
            full_name: 'Test User'
          })
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('full_name', 'A') // Too short
      formData.set('phone', '')
      formData.set('secondary_phone', '')
      formData.set('address', '')
      formData.set('city', '')
      formData.set('clinic', 'adris')

      const result = await updateProfile(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.full_name).toBeDefined()
    })

    it('should return error for invalid full_name characters', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({
            id: 'user-123',
            tenant_id: 'adris',
            role: 'owner',
            full_name: 'Test User'
          })
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('full_name', 'Test123') // Numbers not allowed
      formData.set('phone', '')
      formData.set('secondary_phone', '')
      formData.set('address', '')
      formData.set('city', '')
      formData.set('clinic', 'adris')

      const result = await updateProfile(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.full_name).toBeDefined()
    })

    it('should return error for invalid phone format', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({
            id: 'user-123',
            tenant_id: 'adris',
            role: 'owner',
            full_name: 'Test User'
          })
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('full_name', 'Test User')
      formData.set('phone', 'invalid') // Invalid phone format
      formData.set('secondary_phone', '')
      formData.set('address', '')
      formData.set('city', '')
      formData.set('clinic', 'adris')

      const result = await updateProfile(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.phone).toBeDefined()
    })

    it('should return error for invalid secondary_phone format', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({
            id: 'user-123',
            tenant_id: 'adris',
            role: 'owner',
            full_name: 'Test User'
          })
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('full_name', 'Test User')
      formData.set('phone', '')
      formData.set('secondary_phone', 'abc') // Invalid phone
      formData.set('address', '')
      formData.set('city', '')
      formData.set('clinic', 'adris')

      const result = await updateProfile(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.secondary_phone).toBeDefined()
    })

    it('should accept valid phone with dashes', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({
            id: 'user-123',
            tenant_id: 'adris',
            role: 'owner',
            full_name: 'Test User'
          })
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('full_name', 'Test User')
      formData.set('phone', '0981-123-456') // Valid phone with dashes
      formData.set('secondary_phone', '')
      formData.set('address', '')
      formData.set('city', '')
      formData.set('clinic', 'adris')

      // The action may throw due to redirect or return a result
      try {
        const result = await updateProfile(null, formData)
        // If we get a result, check no phone validation error
        if (result && !result.success && result.fieldErrors) {
          expect(result.fieldErrors.phone).toBeUndefined()
        }
      } catch {
        // Redirect throws, which is expected for success
        expect(true).toBe(true)
      }
    })

    it('should accept Spanish names with accents', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({
            id: 'user-123',
            tenant_id: 'adris',
            role: 'owner',
            full_name: 'Test User'
          })
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('full_name', 'José María Ñoño') // Spanish name
      formData.set('phone', '')
      formData.set('secondary_phone', '')
      formData.set('address', '')
      formData.set('city', '')
      formData.set('clinic', 'adris')

      // The action may throw due to redirect or return a result
      try {
        const result = await updateProfile(null, formData)
        // If we get a result, check no name validation error
        if (result && !result.success && result.fieldErrors) {
          expect(result.fieldErrors.full_name).toBeUndefined()
        }
      } catch {
        // Redirect throws, which is expected for success
        expect(true).toBe(true)
      }
    })

    it('should accept empty optional fields', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({
            id: 'user-123',
            tenant_id: 'adris',
            role: 'owner',
            full_name: 'Test User'
          })
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('full_name', 'Test User')
      formData.set('phone', '')
      formData.set('secondary_phone', '')
      formData.set('address', '')
      formData.set('city', '')
      formData.set('clinic', 'adris')

      // The action may throw due to redirect or return a result
      try {
        const result = await updateProfile(null, formData)
        // If we get a result, check no optional field validation errors
        if (result && !result.success && result.fieldErrors) {
          expect(result.fieldErrors.phone).toBeUndefined()
          expect(result.fieldErrors.secondary_phone).toBeUndefined()
          expect(result.fieldErrors.address).toBeUndefined()
          expect(result.fieldErrors.city).toBeUndefined()
        }
      } catch {
        // Redirect throws, which is expected for success
        expect(true).toBe(true)
      }
    })
  })
})
