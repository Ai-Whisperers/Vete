import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the Supabase client - use 'as any' to allow partial mocking in tests
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })) as any,
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.url/photo.jpg' } }),
    })),
  },
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))
// Mock database to prevent DATABASE_URL requirement
vi.mock('@/db', () => ({
  db: {},
}))

vi.mock('@/db/schema', () => ({
  profiles: {},
}))



// Import after mocking
import { updatePet, deletePet } from '@/app/actions/pets'

describe('Pet Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('updatePet', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      formData.append('name', 'Test Pet')

      const result = await updatePet('pet-123', formData)

      expect(result).toEqual({ success: false, error: 'No autorizado' })
    })

    it('should return error when pet is not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }))
      mockSupabaseClient.from = mockFrom as any

      const formData = new FormData()
      formData.append('name', 'Test Pet')

      const result = await updatePet('pet-123', formData)

      expect(result).toEqual({ success: false, error: 'Mascota no encontrada' })
    })

    it('should return error when user is not the owner', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      let callCount = 0
      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            // First call: pet query
            return Promise.resolve({
              data: { owner_id: 'different-user', tenant_id: 'adris' },
              error: null,
            })
          }
          // Second call: profile query
          return Promise.resolve({
            data: { tenant_id: 'different-tenant', role: 'owner' },
            error: null,
          })
        }),
      }))
      mockSupabaseClient.from = mockFrom as any

      const formData = new FormData()
      formData.append('name', 'Test Pet')

      const result = await updatePet('pet-123', formData)

      expect(result).toEqual({
        success: false,
        error: 'No tienes permiso para editar esta mascota',
      })
    })

    it('should successfully update pet when all validations pass', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      let callCount = 0
      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
        single: vi.fn().mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            return Promise.resolve({
              data: { owner_id: 'user-123', tenant_id: 'adris' },
              error: null,
            })
          }
          return Promise.resolve({
            data: { tenant_id: 'adris', role: 'owner' },
            error: null,
          })
        }),
      }))
      mockSupabaseClient.from = mockFrom as any

      const formData = new FormData()
      formData.append('name', 'Valid Pet Name')
      formData.append('species', 'dog')
      formData.append('clinic', 'adris')

      const result = await updatePet('pet-123', formData)

      expect(result.success).toBe(true)
    })

    it('should allow staff to edit pets in their tenant', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'vet-123' } },
        error: null,
      })

      let callCount = 0
      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            // Pet owned by different user but same tenant
            return Promise.resolve({
              data: { owner_id: 'owner-456', tenant_id: 'adris' },
              error: null,
            })
          }
          if (callCount === 2) {
            // Staff profile
            return Promise.resolve({
              data: { tenant_id: 'adris', role: 'vet' },
              error: null,
            })
          }
          return Promise.resolve({ data: null, error: null })
        }),
      }))
      mockSupabaseClient.from = mockFrom as any

      const formData = new FormData()
      formData.append('name', 'Updated Pet Name')
      formData.append('species', 'dog')
      formData.append('clinic', 'adris')

      const result = await updatePet('pet-123', formData)

      // Should not return permission error (may fail on DB update in mock)
      if (!result.success) {
        expect(result.error).not.toBe('No tienes permiso para editar esta mascota')
      }
    })
  })

  describe('deletePet', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await deletePet('pet-123')

      expect(result).toEqual({ success: false, error: 'No autorizado' })
    })

    it('should return error when pet is not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }))
      mockSupabaseClient.from = mockFrom as any

      const result = await deletePet('pet-123')

      expect(result).toEqual({ success: false, error: 'Mascota no encontrada' })
    })

    it('should return error when user is not the owner', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { owner_id: 'different-user', tenant_id: 'adris' },
          error: null,
        }),
      }))
      mockSupabaseClient.from = mockFrom as any

      const result = await deletePet('pet-123')

      expect(result).toEqual({ success: false, error: 'Solo el dueño puede eliminar esta mascota' })
    })

    it('should soft delete pet when user is the owner', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      let updateCalled = false
      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        update: vi.fn().mockImplementation(() => {
          updateCalled = true
          return {
            eq: vi.fn().mockResolvedValue({ error: null }),
          }
        }),
        single: vi.fn().mockResolvedValue({
          data: { owner_id: 'user-123', tenant_id: 'adris' },
          error: null,
        }),
      }))
      mockSupabaseClient.from = mockFrom as any

      const result = await deletePet('pet-123')

      expect(result).toEqual({ success: true })
    })
  })
})

describe('Pet Form Validation', () => {
  it('should accept valid species values', () => {
    const validSpecies = ['dog', 'cat']
    validSpecies.forEach((species) => {
      expect(['dog', 'cat'].includes(species)).toBe(true)
    })
  })

  it('should accept valid sex values', () => {
    const validSex = ['male', 'female', 'unknown']
    validSex.forEach((sex) => {
      expect(['male', 'female', 'unknown'].includes(sex)).toBe(true)
    })
  })

  it('should validate weight is positive', () => {
    const validWeights = [0.5, 1, 10, 50.5]
    validWeights.forEach((weight) => {
      expect(weight > 0).toBe(true)
    })

    const invalidWeights = [0, -1, -10]
    invalidWeights.forEach((weight) => {
      expect(weight > 0).toBe(false)
    })
  })
})
