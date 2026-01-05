import { describe, it, expect, beforeEach } from 'vitest'
import {
  createMockPet,
  createMockProfile,
  createMockAppointment,
  createSupabaseMock,
  resetIdCounter,
} from '@/lib/test-utils'

describe('Test Utilities', () => {
  beforeEach(() => {
    resetIdCounter()
  })

  describe('createMockPet', () => {
    it('creates a pet with default values', () => {
      const pet = createMockPet()

      expect(pet.id).toMatch(/^test-\d+$/)
      expect(pet.tenant_id).toBe('test-tenant')
      expect(pet.species).toBe('dog')
      expect(pet.name).toContain('Pet')
    })

    it('allows overriding values', () => {
      const pet = createMockPet({
        name: 'Fido',
        species: 'cat',
        weight_kg: 5,
      })

      expect(pet.name).toBe('Fido')
      expect(pet.species).toBe('cat')
      expect(pet.weight_kg).toBe(5)
    })

    it('generates unique IDs for each pet', () => {
      const pet1 = createMockPet()
      const pet2 = createMockPet()

      expect(pet1.id).not.toBe(pet2.id)
    })
  })

  describe('createMockProfile', () => {
    it('creates a profile with default values', () => {
      const profile = createMockProfile()

      expect(profile.id).toMatch(/^test-\d+$/)
      expect(profile.tenant_id).toBe('test-tenant')
      expect(profile.role).toBe('owner')
      expect(profile.email).toMatch(/^usertest-\d+@test\.com$/)
    })

    it('allows overriding values', () => {
      const profile = createMockProfile({
        role: 'vet',
        full_name: 'Dr. Smith',
      })

      expect(profile.role).toBe('vet')
      expect(profile.full_name).toBe('Dr. Smith')
    })
  })

  describe('createMockAppointment', () => {
    it('creates an appointment with default values', () => {
      const appointment = createMockAppointment()

      expect(appointment.id).toMatch(/^test-\d+$/)
      expect(appointment.tenant_id).toBe('test-tenant')
      expect(appointment.status).toBe('scheduled')
      expect(appointment.start_time).toMatch(/^\d{4}-\d{2}-\d{2}T/)
      expect(appointment.end_time).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })

    it('generates end time after start time', () => {
      const appointment = createMockAppointment()
      const startTime = new Date(appointment.start_time)
      const endTime = new Date(appointment.end_time)

      expect(endTime.getTime()).toBeGreaterThan(startTime.getTime())
    })

    it('allows overriding status', () => {
      const appointment = createMockAppointment({ status: 'completed' })

      expect(appointment.status).toBe('completed')
    })
  })

  describe('createSupabaseMock', () => {
    it('creates a mock supabase client', () => {
      const { supabase, helpers } = createSupabaseMock()

      expect(typeof supabase.from).toBe('function')
      expect(supabase.auth).toHaveProperty('getUser')
      expect(supabase.storage).toHaveProperty('from')
    })

    it('can set query results', async () => {
      const { supabase, helpers } = createSupabaseMock()
      const mockPet = createMockPet()

      helpers.setQueryResult(mockPet)

      const result = await supabase.from('pets').select('*').single()
      expect(result.data).toEqual(mockPet)
    })

    it('can set query results for arrays', async () => {
      const { supabase, helpers } = createSupabaseMock()
      const mockPets = [createMockPet(), createMockPet()]

      helpers.setQueryResult(mockPets)

      const result = await supabase.from('pets').select('*')
      expect(result.data).toEqual(mockPets)
    })

    it('can set user', async () => {
      const { supabase, helpers } = createSupabaseMock()

      helpers.setUser({ id: 'user-1', email: 'test@example.com' })

      const result = await supabase.auth.getUser()
      expect(result.data.user?.id).toBe('user-1')
      expect(result.data.user?.email).toBe('test@example.com')
    })

    it('can set errors', async () => {
      const { supabase, helpers } = createSupabaseMock()
      const error = new Error('Database error')

      helpers.setError(error)

      const result = await supabase.from('pets').select('*').single()
      expect(result.error).toEqual(error)
      expect(result.data).toBeNull()
    })

    it('can reset mocks', () => {
      const { supabase, helpers } = createSupabaseMock()

      supabase.from('pets').select('*')
      expect(supabase.from).toHaveBeenCalled()

      helpers.reset()
      expect(supabase.from).not.toHaveBeenCalled()
    })
  })

  describe('resetIdCounter', () => {
    it('resets ID generation', () => {
      createMockPet()
      createMockPet()
      resetIdCounter()

      const pet = createMockPet()
      expect(pet.id).toBe('test-1')
    })
  })
})
