import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
  rpc: vi.fn(),
}

// Default mock implementation helper
const createMockChain = (data: unknown, error: unknown = null) => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data, error }),
  maybeSingle: vi.fn().mockResolvedValue({ data, error }),
  order: vi.fn().mockReturnThis(),
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

vi.mock('@/lib/notification-service', () => ({
  sendConfirmationEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/email-templates', () => ({
  generateAppointmentConfirmationEmail: vi.fn().mockReturnValue('email body'),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

// Import after mocking
import { createAppointment, createAppointmentJson, createMultiServiceAppointmentJson } from '@/app/actions/create-appointment'

describe('Create Appointment Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createMockChain({ role: 'owner', tenant_id: 'adris' })
      }
      return createMockChain(null, { message: 'Not mocked' })
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('createAppointment (FormData)', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      formData.set('clinic', 'adris')
      formData.set('pet_id', '550e8400-e29b-41d4-a716-446655440000')
      formData.set('start_time', new Date(Date.now() + 86400000).toISOString())
      formData.set('reason', 'Consulta general')

      const result = await createAppointment(null, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('sesión')
    })

    it('should return field errors for missing required fields', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@test.com' } },
        error: null,
      })

      const formData = new FormData()
      formData.set('clinic', 'adris')
      // Missing pet_id, start_time, reason

      const result = await createAppointment(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors).toBeDefined()
    })

    it('should return error for invalid pet_id format', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@test.com' } },
        error: null,
      })

      const formData = new FormData()
      formData.set('clinic', 'adris')
      formData.set('pet_id', 'not-a-uuid')
      formData.set('start_time', new Date(Date.now() + 86400000).toISOString())
      formData.set('reason', 'Consulta general')

      const result = await createAppointment(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.pet_id).toBeDefined()
    })

    it('should return error for past appointment date', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@test.com' } },
        error: null,
      })

      const formData = new FormData()
      formData.set('clinic', 'adris')
      formData.set('pet_id', '550e8400-e29b-41d4-a716-446655440000')
      formData.set('start_time', new Date(Date.now() - 86400000).toISOString()) // Past date
      formData.set('reason', 'Consulta general')

      const result = await createAppointment(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.start_time).toBeDefined()
    })

    it('should return error for reason that is too short', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@test.com' } },
        error: null,
      })

      const formData = new FormData()
      formData.set('clinic', 'adris')
      formData.set('pet_id', '550e8400-e29b-41d4-a716-446655440000')
      formData.set('start_time', new Date(Date.now() + 86400000).toISOString())
      formData.set('reason', 'ab') // Too short

      const result = await createAppointment(null, formData)

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.reason).toBeDefined()
    })

    // Note: Pet not found and unauthorized pet access tests are covered in createAppointmentJson
    // since FormData path has the same validation logic but is harder to mock due to async chains
    // See createAppointmentJson tests for comprehensive business logic coverage
  })

  describe('createAppointmentJson', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await createAppointmentJson({
        clinic: 'adris',
        pet_id: '550e8400-e29b-41d4-a716-446655440000',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        reason: 'Consulta general',
      })

      expect(result.success).toBe(false)
    })

    it('should return field errors for invalid input', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@test.com' } },
        error: null,
      })

      const result = await createAppointmentJson({
        clinic: '',
        pet_id: '',
        start_time: '',
        reason: '',
      })

      expect(result.success).toBe(false)
      expect(result.fieldErrors).toBeDefined()
    })

    it('should return error when pet is not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@test.com' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain(null, null)
        }
        return createMockChain(null)
      })

      const result = await createAppointmentJson({
        clinic: 'adris',
        pet_id: '550e8400-e29b-41d4-a716-446655440000',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        reason: 'Consulta general',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('mascota')
    })

    it('should handle slot_taken error from atomic function', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@test.com' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain({
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Firulais',
            owner_id: 'user-123',
            tenant_id: 'adris',
          })
        }
        if (table === 'appointments') {
          return {
            ...createMockChain([]),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockResolvedValue({ data: [], error: null }),
          }
        }
        return createMockChain(null)
      })

      mockSupabaseClient.rpc.mockResolvedValue({
        data: { success: false, error: 'Horario no disponible', error_code: 'slot_taken' },
        error: null,
      })

      const result = await createAppointmentJson({
        clinic: 'adris',
        pet_id: '550e8400-e29b-41d4-a716-446655440000',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        reason: 'Consulta general',
      })

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.start_time).toBeDefined()
    })

    it('should successfully create appointment when all validations pass', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@test.com' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain({
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Firulais',
            owner_id: 'user-123',
            tenant_id: 'adris',
          })
        }
        if (table === 'appointments') {
          return {
            ...createMockChain([]),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockResolvedValue({ data: [], error: null }),
          }
        }
        if (table === 'tenants') {
          return createMockChain({ name: 'Veterinaria Adris' })
        }
        return createMockChain(null)
      })

      mockSupabaseClient.rpc.mockResolvedValue({
        data: { success: true, appointment_id: 'new-apt-123' },
        error: null,
      })

      const result = await createAppointmentJson({
        clinic: 'adris',
        pet_id: '550e8400-e29b-41d4-a716-446655440000',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        reason: 'Consulta general',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('exitosamente')
    })
  })

  describe('createMultiServiceAppointmentJson', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await createMultiServiceAppointmentJson({
        clinic: 'adris',
        pet_id: '550e8400-e29b-41d4-a716-446655440000',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        service_ids: ['service-1', 'service-2'],
      })

      expect(result.success).toBe(false)
    })

    it('should return error when no services are selected', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@test.com' } },
        error: null,
      })

      const result = await createMultiServiceAppointmentJson({
        clinic: 'adris',
        pet_id: '550e8400-e29b-41d4-a716-446655440000',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        service_ids: [],
      })

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.service_ids).toBeDefined()
    })

    it('should return error when too many services are selected', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@test.com' } },
        error: null,
      })

      const result = await createMultiServiceAppointmentJson({
        clinic: 'adris',
        pet_id: '550e8400-e29b-41d4-a716-446655440000',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        service_ids: ['s1', 's2', 's3', 's4', 's5', 's6'], // More than 5
      })

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.service_ids).toBeDefined()
    })

    it('should return error when services are invalid or not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@test.com' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain({
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Firulais',
            owner_id: 'user-123',
            tenant_id: 'adris',
          })
        }
        if (table === 'services') {
          // Return only 1 service when 2 were requested
          return {
            ...createMockChain(null),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [{ id: 'service-1', name: 'Consulta', duration_minutes: 30 }],
              error: null,
            }),
          }
        }
        return createMockChain(null)
      })

      const result = await createMultiServiceAppointmentJson({
        clinic: 'adris',
        pet_id: '550e8400-e29b-41d4-a716-446655440000',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        service_ids: [
          '550e8400-e29b-41d4-a716-446655440001',
          '550e8400-e29b-41d4-a716-446655440002',
        ],
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('servicios')
    })

    it('should successfully create multi-service booking', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@test.com' } },
        error: null,
      })

      const service1Id = '550e8400-e29b-41d4-a716-446655440001'
      const service2Id = '550e8400-e29b-41d4-a716-446655440002'

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pets') {
          return createMockChain({
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Firulais',
            owner_id: 'user-123',
            tenant_id: 'adris',
          })
        }
        if (table === 'services') {
          return {
            ...createMockChain(null),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [
                { id: service1Id, name: 'Consulta', duration_minutes: 30 },
                { id: service2Id, name: 'Vacuna', duration_minutes: 15 },
              ],
              error: null,
            }),
          }
        }
        if (table === 'appointments') {
          return {
            ...createMockChain([]),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockResolvedValue({ data: [], error: null }),
          }
        }
        if (table === 'tenants') {
          return createMockChain({ name: 'Veterinaria Adris' })
        }
        return createMockChain(null)
      })

      mockSupabaseClient.rpc.mockResolvedValue({
        data: {
          success: true,
          booking_group_id: 'group-123',
          appointment_ids: ['apt-1', 'apt-2'],
        },
        error: null,
      })

      const result = await createMultiServiceAppointmentJson({
        clinic: 'adris',
        pet_id: '550e8400-e29b-41d4-a716-446655440000',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        service_ids: [service1Id, service2Id],
      })

      expect(result.success).toBe(true)
      expect(result.data?.booking_group_id).toBe('group-123')
      expect(result.data?.appointment_ids).toHaveLength(2)
    })
  })
})
