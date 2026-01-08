import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { REDIRECT_ERROR_CODE } from 'next/dist/client/components/redirect-error'

// Mock the Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
  storage: {
    from: vi.fn(),
  },
}

const createMockChain = (data: unknown, error: unknown = null) => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data, error }),
  maybeSingle: vi.fn().mockResolvedValue({ data, error }),
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn((role?: string) => Promise.resolve(mockSupabaseClient)),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock redirect to capture instead of throwing
const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url)
    const error = new Error('NEXT_REDIRECT')
    ;(error as { digest?: string }).digest = `${REDIRECT_ERROR_CODE};replace;${url};307;`
    throw error
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

// Import after mocking
import { createPet } from '@/app/actions/create-pet'

// Helper to create FormData with all required fields set to prevent null Zod errors
const createPetFormData = (overrides: Record<string, string | File> = {}) => {
  const formData = new FormData()
  // Set all fields to valid defaults (Zod expects strings, not null)
  // Note: temperament must be a valid enum value: 'unknown', 'friendly', 'shy', 'aggressive', 'calm'
  const defaults: Record<string, string> = {
    name: '',
    species: 'dog',
    sex: 'male',
    breed: '',
    color: '',
    weight: '',
    date_of_birth: '',
    microchip_id: '',
    allergies: '',
    existing_conditions: '',
    diet_category: '',
    diet_notes: '',
    temperament: 'unknown', // Must be a valid enum value
    clinic: 'adris',
  }
  // Apply defaults first
  for (const [key, value] of Object.entries(defaults)) {
    formData.set(key, value)
  }
  // Apply overrides
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value)
  }
  return formData
}

describe('Create Pet Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('createPet', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      formData.set('name', 'Firulais')
      formData.set('species', 'dog')
      formData.set('sex', 'male')
      formData.set('clinic', 'adris')

      const result = await createPet(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('sesión')
    })

    it('should return error when clinic is missing', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const formData = new FormData()
      formData.set('name', 'Firulais')
      formData.set('species', 'dog')
      formData.set('sex', 'male')
      // Missing clinic

      const result = await createPet(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('clínica')
    })

    it('should return error for missing name', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const formData = new FormData()
      formData.set('name', '')
      formData.set('species', 'dog')
      formData.set('sex', 'male')
      formData.set('clinic', 'adris')

      const result = await createPet(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.name).toBeDefined()
    })

    it('should return error for short name', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const formData = new FormData()
      formData.set('name', 'A') // Too short
      formData.set('species', 'dog')
      formData.set('sex', 'male')
      formData.set('clinic', 'adris')

      const result = await createPet(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.name).toBeDefined()
    })

    it('should return error for name with invalid characters', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const formData = new FormData()
      formData.set('name', 'Firulais123') // Numbers not allowed
      formData.set('species', 'dog')
      formData.set('sex', 'male')
      formData.set('clinic', 'adris')

      const result = await createPet(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.name).toBeDefined()
    })

    it('should return error for invalid species', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const formData = new FormData()
      formData.set('name', 'Firulais')
      formData.set('species', 'hamster') // Invalid
      formData.set('sex', 'male')
      formData.set('clinic', 'adris')

      const result = await createPet(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.species).toBeDefined()
    })

    it('should return error for invalid sex', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const formData = new FormData()
      formData.set('name', 'Firulais')
      formData.set('species', 'dog')
      formData.set('sex', 'unknown') // Invalid
      formData.set('clinic', 'adris')

      const result = await createPet(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.sex).toBeDefined()
    })

    it('should return error for weight exceeding max', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const formData = new FormData()
      formData.set('name', 'Firulais')
      formData.set('species', 'dog')
      formData.set('sex', 'male')
      formData.set('weight', '600') // Max is 500
      formData.set('clinic', 'adris')

      const result = await createPet(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.weight).toBeDefined()
    })

    it('should return error for future birth date', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)

      const formData = new FormData()
      formData.set('name', 'Firulais')
      formData.set('species', 'dog')
      formData.set('sex', 'male')
      formData.set('date_of_birth', futureDate.toISOString().split('T')[0])
      formData.set('clinic', 'adris')

      const result = await createPet(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.date_of_birth).toBeDefined()
    })

    it('should return error when profile does not exist', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            ...createMockChain(null),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return createMockChain(null)
      })

      const formData = createPetFormData({
        name: 'Firulais',
        species: 'dog',
        sex: 'male',
      })

      const result = await createPet(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('perfil')
    })

    it('should successfully create pet and redirect', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            ...createMockChain({ id: 'user-123' }),
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
          }
        }
        if (table === 'pets') {
          return {
            ...createMockChain({ id: 'pet-123' }),
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'pet-123' }, error: null }),
          }
        }
        if (table === 'pet_weight_history') {
          return {
            ...createMockChain(null),
            insert: vi.fn().mockResolvedValue({ error: null }),
          }
        }
        return createMockChain(null)
      })

      const formData = createPetFormData({
        name: 'Firulais',
        species: 'dog',
        sex: 'male',
        breed: 'Labrador',
        weight: '25',
      })

      // Expect redirect to throw
      await expect(createPet(null, formData)).rejects.toThrow('NEXT_REDIRECT')
      expect(mockRedirect).toHaveBeenCalledWith('/adris/portal/dashboard')
    })

    it('should create pet without weight history when weight not provided', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const weightHistoryInsert = vi.fn()
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            ...createMockChain({ id: 'user-123' }),
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
          }
        }
        if (table === 'pets') {
          return {
            ...createMockChain({ id: 'pet-123' }),
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'pet-123' }, error: null }),
          }
        }
        if (table === 'pet_weight_history') {
          return {
            ...createMockChain(null),
            insert: weightHistoryInsert.mockResolvedValue({ error: null }),
          }
        }
        return createMockChain(null)
      })

      const formData = createPetFormData({
        name: 'Firulais',
        species: 'dog',
        sex: 'male',
        // No weight
      })

      await expect(createPet(null, formData)).rejects.toThrow('NEXT_REDIRECT')
      // Weight history should not be called when weight is not provided
      expect(weightHistoryInsert).not.toHaveBeenCalled()
    })

    it('should handle duplicate microchip error', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            ...createMockChain({ id: 'user-123' }),
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
          }
        }
        if (table === 'pets') {
          return {
            ...createMockChain(null),
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '23505', message: 'duplicate key' }
            }),
          }
        }
        return createMockChain(null)
      })

      const formData = createPetFormData({
        name: 'Firulais',
        species: 'dog',
        sex: 'male',
        microchip_id: '123456789',
      })

      const result = await createPet(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('microchip')
    })

    it('should handle generic database error', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            ...createMockChain({ id: 'user-123' }),
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
          }
        }
        if (table === 'pets') {
          return {
            ...createMockChain(null),
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'UNKNOWN', message: 'DB error' }
            }),
          }
        }
        return createMockChain(null)
      })

      const formData = createPetFormData({
        name: 'Firulais',
        species: 'dog',
        sex: 'male',
      })

      const result = await createPet(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('guardar la mascota')
    })

    it('should allow Spanish names with accents', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            ...createMockChain({ id: 'user-123' }),
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
          }
        }
        if (table === 'pets') {
          return {
            ...createMockChain({ id: 'pet-123' }),
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'pet-123' }, error: null }),
          }
        }
        return createMockChain(null)
      })

      const formData = createPetFormData({
        name: 'Pequeño Ñoño',
        species: 'cat',
        sex: 'female',
      })

      await expect(createPet(null, formData)).rejects.toThrow('NEXT_REDIRECT')
    })

    it('should allow names with apostrophes', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            ...createMockChain({ id: 'user-123' }),
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
          }
        }
        if (table === 'pets') {
          return {
            ...createMockChain({ id: 'pet-123' }),
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'pet-123' }, error: null }),
          }
        }
        return createMockChain(null)
      })

      const formData = createPetFormData({
        name: "D'Artagnan",
        species: 'dog',
        sex: 'male',
      })

      await expect(createPet(null, formData)).rejects.toThrow('NEXT_REDIRECT')
    })

    // Note: Complex tests like allergies parsing, photo upload, weight history failure
    // are tested via integration tests due to FormData/File handling complexity in unit tests
  })
})
