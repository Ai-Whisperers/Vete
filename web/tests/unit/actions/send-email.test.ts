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
import { sendEmail } from '@/app/actions/send-email'

describe('Send Email Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('sendEmail', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      formData.set('name', 'Test Client')
      formData.set('phone', '0981123456')
      formData.set('petName', 'Firulais')
      formData.set('reason', 'Consulta general')

      const result = await sendEmail(formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('autorizado')
    })

    it('should return error when user is not staff', async () => {
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
      formData.set('name', 'Test Client')
      formData.set('phone', '0981123456')
      formData.set('petName', 'Firulais')
      formData.set('reason', 'Consulta general')

      const result = await sendEmail(formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('denegado')
    })

    it('should return error for missing name', async () => {
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
      formData.set('name', '') // Empty name
      formData.set('phone', '0981123456')
      formData.set('petName', 'Firulais')
      formData.set('reason', 'Consulta general')

      const result = await sendEmail(formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.name).toBeDefined()
    })

    it('should return error for missing phone', async () => {
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
      formData.set('name', 'Test Client')
      formData.set('phone', '') // Empty phone
      formData.set('petName', 'Firulais')
      formData.set('reason', 'Consulta general')

      const result = await sendEmail(formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.phone).toBeDefined()
    })

    it('should return error for missing petName', async () => {
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
      formData.set('name', 'Test Client')
      formData.set('phone', '0981123456')
      formData.set('petName', '') // Empty pet name
      formData.set('reason', 'Consulta general')

      const result = await sendEmail(formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.petName).toBeDefined()
    })

    it('should return error for missing reason', async () => {
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
      formData.set('name', 'Test Client')
      formData.set('phone', '0981123456')
      formData.set('petName', 'Firulais')
      formData.set('reason', '') // Empty reason

      const result = await sendEmail(formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.reason).toBeDefined()
    })

    it('should succeed with valid form data for staff user', async () => {
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
      formData.set('name', 'Test Client')
      formData.set('phone', '0981123456')
      formData.set('petName', 'Firulais')
      formData.set('reason', 'Consulta general')

      const result = await sendEmail(formData)

      expect(result.success).toBe(true)
    }, 5000) // Increase timeout due to simulated delay

    it('should succeed for admin role', async () => {
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
      formData.set('name', 'Test Client')
      formData.set('phone', '0981123456')
      formData.set('petName', 'Firulais')
      formData.set('reason', 'Consulta general')

      const result = await sendEmail(formData)

      expect(result.success).toBe(true)
    }, 5000) // Increase timeout due to simulated delay
  })
})
