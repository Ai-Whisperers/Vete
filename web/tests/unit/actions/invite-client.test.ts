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
import { inviteClient, createPetForClient } from '@/app/actions/invite-client'

describe('Invite Client Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('inviteClient', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      formData.set('email', 'client@test.com')
      formData.set('fullName', 'Test Client')
      formData.set('clinic', 'adris')

      const result = await inviteClient(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('sesión')
    })

    it('should return error when user is not staff (vet/admin)', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({ role: 'owner', tenant_id: 'adris' }) // Not staff
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('email', 'client@test.com')
      formData.set('fullName', 'Test Client')
      formData.set('clinic', 'adris')

      const result = await inviteClient(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('veterinarios')
    })

    it('should return error when user profile has no tenant_id', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createMockChain({ role: 'vet', tenant_id: null })
        }
        return createMockChain(null)
      })

      const formData = new FormData()
      formData.set('email', 'client@test.com')
      formData.set('fullName', 'Test Client')
      formData.set('clinic', 'adris')

      const result = await inviteClient(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('perfil de clínica')
    })

    it('should return error for invalid email format', async () => {
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
      formData.set('email', 'invalid-email')
      formData.set('fullName', 'Test Client')
      formData.set('clinic', 'adris')

      const result = await inviteClient(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.email).toBeDefined()
    })

    it('should return error for missing client name', async () => {
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
      formData.set('email', 'client@test.com')
      formData.set('fullName', '') // Empty name
      formData.set('clinic', 'adris')

      const result = await inviteClient(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.fullName).toBeDefined()
    })

    it('should return error for invalid phone format', async () => {
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
      formData.set('email', 'client@test.com')
      formData.set('fullName', 'Test Client')
      formData.set('phone', 'invalid') // Invalid phone
      formData.set('clinic', 'adris')

      const result = await inviteClient(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.phone).toBeDefined()
    })

    // Note: Complex multi-query tests (existing profile check, invite already exists, etc.)
    // are tested via integration tests due to mocking complexity with sequential queries
  })

  describe('createPetForClient', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      formData.set('clientId', '550e8400-e29b-41d4-a716-446655440000')
      formData.set('petName', 'Firulais')
      formData.set('petSpecies', 'dog')
      formData.set('clinic', 'adris')

      const result = await createPetForClient(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('sesión')
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

      const formData = new FormData()
      formData.set('clientId', '550e8400-e29b-41d4-a716-446655440000')
      formData.set('petName', 'Firulais')
      formData.set('petSpecies', 'dog')
      formData.set('clinic', 'adris')

      const result = await createPetForClient(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('veterinarios')
    })

    it('should return error for invalid client UUID', async () => {
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
      formData.set('clientId', 'invalid-uuid')
      formData.set('petName', 'Firulais')
      formData.set('petSpecies', 'dog')
      formData.set('clinic', 'adris')

      const result = await createPetForClient(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.clientId).toBeDefined()
    })

    it('should return error for missing pet name', async () => {
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
      formData.set('clientId', '550e8400-e29b-41d4-a716-446655440000')
      formData.set('petName', '')
      formData.set('petSpecies', 'dog')
      formData.set('clinic', 'adris')

      const result = await createPetForClient(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.petName).toBeDefined()
    })

    it('should return error for invalid pet species', async () => {
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
      formData.set('clientId', '550e8400-e29b-41d4-a716-446655440000')
      formData.set('petName', 'Firulais')
      formData.set('petSpecies', 'hamster') // Invalid species
      formData.set('clinic', 'adris')

      const result = await createPetForClient(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.petSpecies).toBeDefined()
    })

    // Note: Complex multi-query tests (client not found, different tenant, staff account, success, DB error)
    // are tested via integration tests due to mocking complexity with sequential queries

    it('should return error for invalid pet weight', async () => {
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
      formData.set('clientId', '550e8400-e29b-41d4-a716-446655440000')
      formData.set('petName', 'Firulais')
      formData.set('petSpecies', 'dog')
      formData.set('petWeight', '600') // Too heavy (max 500)
      formData.set('clinic', 'adris')

      const result = await createPetForClient(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.petWeight).toBeDefined()
    })
  })
})
