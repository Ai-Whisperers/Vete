import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(),
  })),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Import after mocking
import { cancelAppointment, rescheduleAppointment } from '@/app/actions/appointments'

describe('Appointment Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('cancelAppointment', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await cancelAppointment('appointment-123')

      expect(result).toEqual({ error: 'No autorizado' })
    })

    it('should return error when appointment is not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      }))
      mockSupabaseClient.from = mockFrom

      const result = await cancelAppointment('appointment-123')

      expect(result).toEqual({ error: 'Cita no encontrada' })
    })

    it('should return error when user is not the pet owner or staff', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      let callCount = 0
      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            // Appointment query
            return Promise.resolve({
              data: {
                id: 'appointment-123',
                tenant_id: 'adris',
                start_time: new Date(Date.now() + 86400000).toISOString(), // Future date
                status: 'pending',
                pets: { owner_id: 'different-user' },
              },
              error: null,
            })
          }
          // Profile query (not staff)
          return Promise.resolve({
            data: { role: 'owner', tenant_id: 'different-tenant' },
            error: null,
          })
        }),
      }))
      mockSupabaseClient.from = mockFrom

      const result = await cancelAppointment('appointment-123')

      expect(result).toEqual({ error: 'No tienes permiso para cancelar esta cita' })
    })

    it('should return error when appointment is in the past', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'appointment-123',
            tenant_id: 'adris',
            start_time: new Date(Date.now() - 86400000).toISOString(), // Past date
            status: 'pending',
            pets: { owner_id: 'user-123' },
          },
          error: null,
        }),
      }))
      mockSupabaseClient.from = mockFrom

      const result = await cancelAppointment('appointment-123')

      expect(result).toEqual({ error: 'No se puede cancelar una cita pasada' })
    })

    it('should return error when appointment is already cancelled', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'appointment-123',
            tenant_id: 'adris',
            start_time: new Date(Date.now() + 86400000).toISOString(),
            status: 'cancelled',
            pets: { owner_id: 'user-123' },
          },
          error: null,
        }),
      }))
      mockSupabaseClient.from = mockFrom

      const result = await cancelAppointment('appointment-123')

      expect(result).toEqual({ error: 'Esta cita ya no puede ser cancelada' })
    })

    it('should successfully cancel appointment when all validations pass', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'appointment-123',
            tenant_id: 'adris',
            start_time: new Date(Date.now() + 86400000).toISOString(),
            status: 'pending',
            pets: { owner_id: 'user-123' },
          },
          error: null,
        }),
      }))
      mockSupabaseClient.from = mockFrom

      const result = await cancelAppointment('appointment-123', 'Test reason')

      expect(result.success).toBe(true)
    })

    it('should allow staff to cancel appointments in their tenant', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'vet-123' } },
        error: null,
      })

      let callCount = 0
      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
        single: vi.fn().mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            // Appointment owned by different user
            return Promise.resolve({
              data: {
                id: 'appointment-123',
                tenant_id: 'adris',
                start_time: new Date(Date.now() + 86400000).toISOString(),
                status: 'pending',
                pets: { owner_id: 'owner-456' },
              },
              error: null,
            })
          }
          // Staff profile in same tenant
          return Promise.resolve({
            data: { role: 'vet', tenant_id: 'adris' },
            error: null,
          })
        }),
      }))
      mockSupabaseClient.from = mockFrom

      const result = await cancelAppointment('appointment-123')

      expect(result.success).toBe(true)
    })
  })

  describe('rescheduleAppointment', () => {
    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await rescheduleAppointment('appointment-123', '2025-12-25', '10:00')

      expect(result).toEqual({ error: 'No autorizado' })
    })

    it('should return error when appointment is not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      }))
      mockSupabaseClient.from = mockFrom

      const result = await rescheduleAppointment('appointment-123', '2025-12-25', '10:00')

      expect(result).toEqual({ error: 'Cita no encontrada' })
    })

    it('should return error when user is not the pet owner or staff', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      let callCount = 0
      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            return Promise.resolve({
              data: {
                id: 'appointment-123',
                tenant_id: 'adris',
                start_time: new Date(Date.now() + 86400000).toISOString(),
                end_time: new Date(Date.now() + 88200000).toISOString(),
                status: 'pending',
                pets: { owner_id: 'different-user' },
              },
              error: null,
            })
          }
          return Promise.resolve({
            data: { role: 'owner', tenant_id: 'different-tenant' },
            error: null,
          })
        }),
      }))
      mockSupabaseClient.from = mockFrom

      const result = await rescheduleAppointment('appointment-123', '2025-12-25', '10:00')

      expect(result).toEqual({ error: 'No tienes permiso para reprogramar esta cita' })
    })

    it('should return error when new date is in the past', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'appointment-123',
            tenant_id: 'adris',
            start_time: new Date(Date.now() + 86400000).toISOString(),
            end_time: new Date(Date.now() + 88200000).toISOString(),
            status: 'pending',
            pets: { owner_id: 'user-123' },
          },
          error: null,
        }),
      }))
      mockSupabaseClient.from = mockFrom

      const result = await rescheduleAppointment('appointment-123', '2020-01-01', '10:00')

      expect(result).toEqual({ error: 'La nueva fecha debe ser en el futuro' })
    })

    it('should return error when appointment is already cancelled', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'appointment-123',
            tenant_id: 'adris',
            start_time: new Date(Date.now() + 86400000).toISOString(),
            end_time: new Date(Date.now() + 88200000).toISOString(),
            status: 'cancelled',
            pets: { owner_id: 'user-123' },
          },
          error: null,
        }),
      }))
      mockSupabaseClient.from = mockFrom

      const result = await rescheduleAppointment('appointment-123', '2025-12-25', '10:00')

      expect(result).toEqual({ error: 'Esta cita no puede ser reprogramada' })
    })

    it('should successfully reschedule appointment when all validations pass', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'appointment-123',
            tenant_id: 'adris',
            start_time: new Date(Date.now() + 86400000).toISOString(),
            end_time: new Date(Date.now() + 88200000).toISOString(),
            status: 'pending',
            pets: { owner_id: 'user-123' },
          },
          error: null,
        }),
      }))
      mockSupabaseClient.from = mockFrom

      const result = await rescheduleAppointment('appointment-123', futureDateStr, '10:00')

      expect(result.success).toBe(true)
      expect(result.newDate).toBe(futureDateStr)
      expect(result.newTime).toBe('10:00')
    })
  })
})

describe('Appointment Utility Functions', () => {
  describe('canCancelAppointment', () => {
    it('should return true for future pending appointment', async () => {
      const { canCancelAppointment } = await import('@/lib/types/appointments')

      const appointment = {
        start_time: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending',
      }

      expect(canCancelAppointment(appointment)).toBe(true)
    })

    it('should return true for future confirmed appointment', async () => {
      const { canCancelAppointment } = await import('@/lib/types/appointments')

      const appointment = {
        start_time: new Date(Date.now() + 86400000).toISOString(),
        status: 'confirmed',
      }

      expect(canCancelAppointment(appointment)).toBe(true)
    })

    it('should return false for past appointment', async () => {
      const { canCancelAppointment } = await import('@/lib/types/appointments')

      const appointment = {
        start_time: new Date(Date.now() - 86400000).toISOString(),
        status: 'pending',
      }

      expect(canCancelAppointment(appointment)).toBe(false)
    })

    it('should return false for already cancelled appointment', async () => {
      const { canCancelAppointment } = await import('@/lib/types/appointments')

      const appointment = {
        start_time: new Date(Date.now() + 86400000).toISOString(),
        status: 'cancelled',
      }

      expect(canCancelAppointment(appointment)).toBe(false)
    })

    it('should return false for completed appointment', async () => {
      const { canCancelAppointment } = await import('@/lib/types/appointments')

      const appointment = {
        start_time: new Date(Date.now() + 86400000).toISOString(),
        status: 'completed',
      }

      expect(canCancelAppointment(appointment)).toBe(false)
    })

    it('should return false for no-show appointment', async () => {
      const { canCancelAppointment } = await import('@/lib/types/appointments')

      const appointment = {
        start_time: new Date(Date.now() + 86400000).toISOString(),
        status: 'no_show',
      }

      expect(canCancelAppointment(appointment)).toBe(false)
    })
  })

  describe('canRescheduleAppointment', () => {
    it('should return true for future pending appointment', async () => {
      const { canRescheduleAppointment } = await import('@/lib/types/appointments')

      const appointment = {
        start_time: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending',
      }

      expect(canRescheduleAppointment(appointment)).toBe(true)
    })

    it('should return false for past appointment', async () => {
      const { canRescheduleAppointment } = await import('@/lib/types/appointments')

      const appointment = {
        start_time: new Date(Date.now() - 86400000).toISOString(),
        status: 'pending',
      }

      expect(canRescheduleAppointment(appointment)).toBe(false)
    })
  })

  describe('formatAppointmentDate', () => {
    it('should format date in Spanish', async () => {
      const { formatAppointmentDate } = await import('@/lib/types/appointments')

      const date = '2025-12-25T10:00:00Z'
      const formatted = formatAppointmentDate(date)

      // Should contain Spanish day name and month
      expect(formatted).toMatch(/diciembre/i)
      expect(formatted).toMatch(/2025/)
    })
  })

  describe('formatAppointmentTime', () => {
    it('should format time in 24-hour format', async () => {
      const { formatAppointmentTime } = await import('@/lib/types/appointments')

      const date = '2025-12-25T14:30:00Z'
      const formatted = formatAppointmentTime(date)

      // Should contain time in HH:MM format (accounting for timezone)
      expect(formatted).toMatch(/\d{1,2}:\d{2}/)
    })
  })
})

describe('Status Configuration', () => {
  it('should have all appointment statuses configured', async () => {
    const { statusConfig } = await import('@/lib/types/appointments')

    const expectedStatuses = ['pending', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show']

    expectedStatuses.forEach((status) => {
      expect(statusConfig[status]).toBeDefined()
      expect(statusConfig[status].label).toBeTruthy()
      expect(statusConfig[status].className).toBeTruthy()
    })
  })

  it('should have Spanish labels for all statuses', async () => {
    const { statusConfig } = await import('@/lib/types/appointments')

    expect(statusConfig.pending.label).toBe('Programada')
    expect(statusConfig.confirmed.label).toBe('Confirmada')
    expect(statusConfig.cancelled.label).toBe('Cancelada')
    expect(statusConfig.completed.label).toBe('Completada')
  })
})
