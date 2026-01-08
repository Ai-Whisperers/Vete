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
import { updateAppointmentStatus } from '@/app/actions/update-appointment-status'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

describe('Update Appointment Status Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('updateAppointmentStatus', () => {
    it('should successfully update appointment status', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }))

      const result = await updateAppointmentStatus('appt-123', 'confirmed', 'adris')

      expect(result.success).toBe(true)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('appointments')
      expect(revalidatePath).toHaveBeenCalledWith('/adris/dashboard')
    })

    it('should return error when database update fails', async () => {
      const dbError = { message: 'Database error', code: 'PGRST116' }

      mockSupabaseClient.from.mockImplementation(() => ({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: dbError }),
        }),
      }))

      const result = await updateAppointmentStatus('appt-123', 'confirmed', 'adris')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to update appointment status')
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to update appointment status',
        expect.objectContaining({
          error: dbError,
          appointmentId: 'appt-123',
          newStatus: 'confirmed',
          tenant: 'adris',
        })
      )
    })

    it('should handle different status transitions', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }))

      // Test various status values
      const statuses = ['pending', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show']

      for (const status of statuses) {
        const result = await updateAppointmentStatus('appt-123', status, 'adris')
        expect(result.success).toBe(true)
      }
    })

    it('should revalidate the correct clinic dashboard path', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }))

      // Test with different clinic slugs
      await updateAppointmentStatus('appt-123', 'confirmed', 'adris')
      expect(revalidatePath).toHaveBeenCalledWith('/adris/dashboard')

      await updateAppointmentStatus('appt-456', 'completed', 'petlife')
      expect(revalidatePath).toHaveBeenCalledWith('/petlife/dashboard')
    })

    it('should not revalidate path when update fails', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'Error' } }),
        }),
      }))

      vi.mocked(revalidatePath).mockClear()

      await updateAppointmentStatus('appt-123', 'confirmed', 'adris')

      // revalidatePath should not be called on error
      expect(revalidatePath).not.toHaveBeenCalled()
    })

    it('should handle empty appointment ID', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }))

      const result = await updateAppointmentStatus('', 'confirmed', 'adris')

      // The function doesn't validate empty ID, so it passes to Supabase
      // which would return success (no rows affected)
      expect(result.success).toBe(true)
    })

    it('should handle connection errors', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('Connection timeout')),
        }),
      }))

      // The function doesn't have try-catch, so this would throw
      await expect(updateAppointmentStatus('appt-123', 'confirmed', 'adris'))
        .rejects.toThrow('Connection timeout')
    })
  })
})
