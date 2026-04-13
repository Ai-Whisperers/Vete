import { describe, it, expect } from 'vitest'
import type { Appointment, AppointmentStatus, AppointmentFilters } from '@/lib/domain/appointments/types'

describe('Appointment Types', () => {
  describe('AppointmentStatus', () => {
    it('should accept confirmed status', () => {
      const status: AppointmentStatus = 'confirmed'
      expect(status).toBe('confirmed')
    })

    it('should accept pending status', () => {
      const status: AppointmentStatus = 'pending'
      expect(status).toBe('pending')
    })

    it('should accept cancelled status', () => {
      const status: AppointmentStatus = 'cancelled'
      expect(status).toBe('cancelled')
    })

    it('should accept completed status', () => {
      const status: AppointmentStatus = 'completed'
      expect(status).toBe('completed')
    })

    it('should accept scheduled status', () => {
      const status: AppointmentStatus = 'scheduled'
      expect(status).toBe('scheduled')
    })
  })

  describe('Appointment', () => {
    it('should create a valid appointment', () => {
      const appointment: Appointment = {
        id: 'apt-1',
        tenantId: 'clinic-1',
        petId: 'pet-1',
        vetId: 'vet-1',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T10:30:00Z',
        status: 'confirmed',
        reason: 'Annual checkup',
      }

      expect(appointment.id).toBe('apt-1')
      expect(appointment.status).toBe('confirmed')
    })

    it('should allow optional fields', () => {
      const appointment: Appointment = {
        id: 'apt-1',
        tenantId: 'clinic-1',
        petId: 'pet-1',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T10:30:00Z',
        status: 'pending',
      }

      expect(appointment.vetId).toBeUndefined()
      expect(appointment.notes).toBeUndefined()
    })
  })

  describe('AppointmentFilters', () => {
    it('should create filters with status', () => {
      const filters: AppointmentFilters = {
        status: 'confirmed',
      }

      expect(filters.status).toBe('confirmed')
    })

    it('should create filters with date range', () => {
      const filters: AppointmentFilters = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      }

      expect(filters.startDate).toBe('2024-01-01')
    })

    it('should create filters with vet', () => {
      const filters: AppointmentFilters = {
        vetId: 'vet-1',
      }

      expect(filters.vetId).toBe('vet-1')
    })
  })
})
