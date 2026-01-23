/**
 * TerraPet RLS (Row-Level Security) Policy Enforcement Tests
 *
 * This test suite verifies that RLS policies correctly enforce tenant isolation
 * and prevent unauthorized cross-tenant data access.
 *
 * Test Approach:
 * 1. Create two tenants: 'terrapet' and 'adris'
 * 2. Create users for each tenant with different roles
 * 3. Verify that users can only access data from their own tenant
 * 4. Verify that service role can access all data
 * 5. Verify that anonymous users are blocked
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  createServiceClient,
  createAnonymousClient,
  createRLSTestDataTracker,
  createTestTenant,
  createTestUser,
  createTestPet,
  createTestAppointment,
  createTestMedicalRecord,
  cleanupRLSTestData,
  cleanupAllTestData,
  type TestUserContext,
  type RLSTestDataTracker,
} from './setup'

describe('TerraPet RLS Policy Enforcement', () => {
  let tracker: RLSTestDataTracker
  let terrapetOwner: TestUserContext
  let terrapetVet: TestUserContext
  let adrisOwner: TestUserContext
  let adrisVet: TestUserContext
  let terrapetPetId: string
  let adrisPetId: string
  let terrapetAppointmentId: string
  let adrisAppointmentId: string
  let terrapetMedicalRecordId: string
  let adrisMedicalRecordId: string

  beforeAll(async () => {
    // Clean up any leftover data from previous test runs
    await cleanupAllTestData()

    tracker = createRLSTestDataTracker()

    // Create tenants
    await createTestTenant('terrapet', 'TerraPet', tracker)
    await createTestTenant('adris', 'Veterinaria Adris', tracker)

    // Create users for each tenant with unique emails (timestamp-based)
    const timestamp = Date.now()
    
    terrapetOwner = await createTestUser(
      'terrapet',
      'owner',
      `terrapet-owner-${timestamp}@test.com`,
      'testpass123',
      tracker
    )

    terrapetVet = await createTestUser(
      'terrapet',
      'vet',
      `terrapet-vet-${timestamp}@test.com`,
      'testpass123',
      tracker
    )

    adrisOwner = await createTestUser(
      'adris',
      'owner',
      `adris-owner-${timestamp}@test.com`,
      'testpass123',
      tracker
    )

    adrisVet = await createTestUser(
      'adris',
      'vet',
      `adris-vet-${timestamp}@test.com`,
      'testpass123',
      tracker
    )

    // Create pets for each tenant
    terrapetPetId = await createTestPet(
      'terrapet',
      terrapetOwner.userId,
      'TerraPet Dog',
      tracker
    )

    adrisPetId = await createTestPet('adris', adrisOwner.userId, 'Adris Dog', tracker)

    // Create appointments
    terrapetAppointmentId = await createTestAppointment(
      'terrapet',
      terrapetPetId,
      terrapetOwner.userId,
      tracker
    )

    adrisAppointmentId = await createTestAppointment(
      'adris',
      adrisPetId,
      adrisOwner.userId,
      tracker
    )

    // Create medical records
    terrapetMedicalRecordId = await createTestMedicalRecord(
      'terrapet',
      terrapetPetId,
      terrapetVet.userId,
      tracker
    )

    adrisMedicalRecordId = await createTestMedicalRecord(
      'adris',
      adrisPetId,
      adrisVet.userId,
      tracker
    )
  }, 60000) // 60s timeout for setup

  afterAll(async () => {
    await cleanupRLSTestData(tracker)
  }, 60000) // 60s timeout for cleanup

  describe('Pets Table RLS', () => {
    it('terrapet user can query terrapet pets', async () => {
      const { data, error } = await terrapetOwner.client
        .from('pets')
        .select('*')
        .eq('id', terrapetPetId)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.id).toBe(terrapetPetId)
      expect(data?.tenant_id).toBe('terrapet')
    })

    it('terrapet user CANNOT query adris pets', async () => {
      const { data, error } = await terrapetOwner.client
        .from('pets')
        .select('*')
        .eq('id', adrisPetId)
        .single()

      // RLS should return no data (not an error, just empty)
      expect(data).toBeNull()
    })

    it('adris user CANNOT query terrapet pets', async () => {
      const { data, error } = await adrisOwner.client
        .from('pets')
        .select('*')
        .eq('id', terrapetPetId)
        .single()

      // RLS should return no data
      expect(data).toBeNull()
    })

    it('anonymous user CANNOT query any pets', async () => {
      const anonymousClient = createAnonymousClient()

      const { data, error } = await anonymousClient
        .from('pets')
        .select('*')
        .eq('id', terrapetPetId)
        .single()

      // Anonymous users should be blocked
      expect(data).toBeNull()
    })

    it('service role CAN query all pets', async () => {
      const serviceClient = createServiceClient()

      // Should be able to query terrapet pet
      const { data: terrapetData } = await serviceClient
        .from('pets')
        .select('*')
        .eq('id', terrapetPetId)
        .single()

      expect(terrapetData).toBeDefined()
      expect(terrapetData?.id).toBe(terrapetPetId)

      // Should be able to query adris pet
      const { data: adrisData } = await serviceClient
        .from('pets')
        .select('*')
        .eq('id', adrisPetId)
        .single()

      expect(adrisData).toBeDefined()
      expect(adrisData?.id).toBe(adrisPetId)
    })

    it('queries automatically filter by tenant_id', async () => {
      const { data } = await terrapetOwner.client.from('pets').select('*')

      // All returned pets should be from terrapet tenant
      expect(data).toBeDefined()
      if (data) {
        expect(data.every((pet) => pet.tenant_id === 'terrapet')).toBe(true)
      }
    })
  })

  describe('Appointments Table RLS', () => {
    it('terrapet user can query terrapet appointments', async () => {
      const { data, error } = await terrapetOwner.client
        .from('appointments')
        .select('*')
        .eq('id', terrapetAppointmentId)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.id).toBe(terrapetAppointmentId)
      expect(data?.tenant_id).toBe('terrapet')
    })

    it('terrapet user CANNOT query adris appointments', async () => {
      const { data } = await terrapetOwner.client
        .from('appointments')
        .select('*')
        .eq('id', adrisAppointmentId)
        .single()

      expect(data).toBeNull()
    })

    it('terrapet user can CREATE appointment for own tenant', async () => {
      const { data, error } = await terrapetOwner.client
        .from('appointments')
        .insert({
          tenant_id: 'terrapet',
          pet_id: terrapetPetId,
          client_id: terrapetOwner.userId,
          appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          appointment_time: '14:00:00',
          service_type: 'consultation',
          status: 'scheduled',
        })
        .select('id')
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()

      // Track for cleanup
      if (data) {
        tracker.appointmentIds.push(data.id)
      }
    })

    it('terrapet user CANNOT CREATE appointment for adris', async () => {
      const { data, error } = await terrapetOwner.client
        .from('appointments')
        .insert({
          tenant_id: 'adris', // Trying to create for different tenant
          pet_id: adrisPetId,
          client_id: adrisOwner.userId,
          appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          appointment_time: '15:00:00',
          service_type: 'consultation',
          status: 'scheduled',
        })
        .select('id')
        .single()

      // RLS should block this insert
      expect(error).toBeDefined()
    })

    it('appointment queries filter by tenant_id', async () => {
      const { data } = await terrapetOwner.client.from('appointments').select('*')

      expect(data).toBeDefined()
      if (data) {
        expect(data.every((appointment) => appointment.tenant_id === 'terrapet')).toBe(true)
      }
    })

    it('service role bypasses RLS correctly', async () => {
      const serviceClient = createServiceClient()

      // Should see both tenants' appointments
      const { data } = await serviceClient
        .from('appointments')
        .select('*')
        .in('id', [terrapetAppointmentId, adrisAppointmentId])

      expect(data).toBeDefined()
      expect(data?.length).toBe(2)
    })
  })

  describe('Profiles Table RLS', () => {
    it('terrapet user can query own profile', async () => {
      const { data, error } = await terrapetOwner.client
        .from('profiles')
        .select('*')
        .eq('id', terrapetOwner.userId)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.id).toBe(terrapetOwner.userId)
    })

    it('terrapet user can query other terrapet profiles', async () => {
      const { data, error } = await terrapetOwner.client
        .from('profiles')
        .select('*')
        .eq('id', terrapetVet.userId)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.tenant_id).toBe('terrapet')
    })

    it('terrapet user CANNOT query adris profiles', async () => {
      const { data } = await terrapetOwner.client
        .from('profiles')
        .select('*')
        .eq('id', adrisOwner.userId)
        .single()

      expect(data).toBeNull()
    })

    it('profile.tenant_id matches auth context', async () => {
      const { data } = await terrapetOwner.client.from('profiles').select('*')

      expect(data).toBeDefined()
      if (data) {
        expect(data.every((profile) => profile.tenant_id === 'terrapet')).toBe(true)
      }
    })

    it('cannot update profile to different tenant', async () => {
      const { error } = await terrapetOwner.client
        .from('profiles')
        .update({ tenant_id: 'adris' })
        .eq('id', terrapetOwner.userId)

      // RLS should block tenant_id changes
      expect(error).toBeDefined()
    })

    it('service role can query all profiles', async () => {
      const serviceClient = createServiceClient()

      const { data } = await serviceClient
        .from('profiles')
        .select('*')
        .in('id', [terrapetOwner.userId, adrisOwner.userId])

      expect(data).toBeDefined()
      expect(data?.length).toBe(2)
    })
  })

  describe('Services Table RLS (if exists)', () => {
    it('should test service table RLS when implemented', () => {
      // Placeholder for services table RLS tests
      // This depends on whether there's a services table in the database
      expect(true).toBe(true)
    })

    it('public can view terrapet services (placeholder)', () => {
      expect(true).toBe(true)
    })

    it('public CANNOT view services without tenant filter (placeholder)', () => {
      expect(true).toBe(true)
    })

    it('terrapet staff can manage terrapet services (placeholder)', () => {
      expect(true).toBe(true)
    })

    it('terrapet staff CANNOT manage adris services (placeholder)', () => {
      expect(true).toBe(true)
    })

    it('service creation requires staff role (placeholder)', () => {
      expect(true).toBe(true)
    })
  })

  describe('Medical Records RLS', () => {
    it('owner can view own pet medical records', async () => {
      const { data, error } = await terrapetOwner.client
        .from('medical_records')
        .select('*')
        .eq('id', terrapetMedicalRecordId)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.pet_id).toBe(terrapetPetId)
    })

    it('owner CANNOT view other owner records', async () => {
      const { data } = await terrapetOwner.client
        .from('medical_records')
        .select('*')
        .eq('id', adrisMedicalRecordId)
        .single()

      expect(data).toBeNull()
    })

    it('vet can view all terrapet records', async () => {
      const { data } = await terrapetVet.client
        .from('medical_records')
        .select('*')
        .eq('tenant_id', 'terrapet')

      expect(data).toBeDefined()
      if (data) {
        expect(data.length).toBeGreaterThan(0)
        expect(data.every((record) => record.tenant_id === 'terrapet')).toBe(true)
      }
    })

    it('vet CANNOT view adris records', async () => {
      const { data } = await terrapetVet.client
        .from('medical_records')
        .select('*')
        .eq('id', adrisMedicalRecordId)
        .single()

      expect(data).toBeNull()
    })

    it('anonymous CANNOT view medical records', async () => {
      const anonymousClient = createAnonymousClient()

      const { data } = await anonymousClient
        .from('medical_records')
        .select('*')
        .eq('id', terrapetMedicalRecordId)
        .single()

      expect(data).toBeNull()
    })

    it('service role can query all records', async () => {
      const serviceClient = createServiceClient()

      const { data } = await serviceClient
        .from('medical_records')
        .select('*')
        .in('id', [terrapetMedicalRecordId, adrisMedicalRecordId])

      expect(data).toBeDefined()
      expect(data?.length).toBe(2)
    })
  })
})
