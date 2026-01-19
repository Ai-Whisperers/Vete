/**
 * API Integration Tests: /api/pets
 * 
 * Tests authentication, authorization, tenant isolation, and validation
 * for the pets API endpoint.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { GET, POST } from '@/app/api/pets/route'
import {
  setupIntegrationTest,
  cleanupIntegrationTest,
  createTestAuthUser,
  createTestPet,
  TEST_TENANT_ID,
  cleanupManager,
  createTestRequest,
  expectResponse,
  expectSuccess,
  expectError,
} from '../../__helpers__/integration-setup'
import { SupabaseClient } from '@supabase/supabase-js'

describe('API: /api/pets', () => {
  let supabase: SupabaseClient
  let ownerUserId: string
  let ownerProfileId: string
  let vetUserId: string
  let vetProfileId: string

  beforeAll(async () => {
    supabase = await setupIntegrationTest()

    // Create test users
    const owner = await createTestAuthUser(supabase, 'owner', TEST_TENANT_ID)
    ownerUserId = owner.userId
    ownerProfileId = owner.profile.id

    const vet = await createTestAuthUser(supabase, 'vet', TEST_TENANT_ID)
    vetUserId = vet.userId
    vetProfileId = vet.profile.id
  })

  afterAll(async () => {
    await cleanupIntegrationTest()
  })

  afterEach(async () => {
    await cleanupManager.cleanupWithRetry()
  })

  describe('GET /api/pets', () => {
    it('requires authentication', async () => {
      const request = createTestRequest('http://localhost:3000/api/pets')

      const response = await GET(request)

      await expectError(response, 401, 'autorizado')
    })

    it('enforces tenant isolation - owner sees only own pets', async () => {
      // Create pet for owner in TEST_TENANT_ID
      const pet1 = await createTestPet(supabase, ownerProfileId, TEST_TENANT_ID, {
        name: 'Owner Pet 1',
      })

      // Create another owner in different tenant
      const otherOwner = await createTestAuthUser(supabase, 'owner', 'petlife')
      const pet2 = await createTestPet(supabase, otherOwner.profile.id, 'petlife', {
        name: 'Other Clinic Pet',
      })

      // Sign in as first owner
      const { data: session } = await supabase.auth.signInWithPassword({
        email: ownerProfileId + '@test.local',
        password: 'test-password-123',
      })

      const request = createTestRequest('http://localhost:3000/api/pets', {
        headers: {
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
      })

      const response = await GET(request)
      const body = await expectSuccess(response)

      expect(body.data).toHaveLength(1)
      expect(body.data[0].id).toBe(pet1.id)
      expect(body.data[0].tenant_id).toBe(TEST_TENANT_ID)
    })

    it('allows staff to see all clinic pets', async () => {
      // Create pets from different owners in same tenant
      const pet1 = await createTestPet(supabase, ownerProfileId, TEST_TENANT_ID, {
        name: 'Pet 1',
      })

      const owner2 = await createTestAuthUser(supabase, 'owner', TEST_TENANT_ID)
      const pet2 = await createTestPet(supabase, owner2.profile.id, TEST_TENANT_ID, {
        name: 'Pet 2',
      })

      // Sign in as vet
      const { data: session } = await supabase.auth.signInWithPassword({
        email: vetProfileId + '@test.local',
        password: 'test-password-123',
      })

      const request = createTestRequest('http://localhost:3000/api/pets', {
        headers: {
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
      })

      const response = await GET(request)
      const body = await expectSuccess(response)

      expect(body.data.length).toBeGreaterThanOrEqual(2)
      const petIds = body.data.map((p: { id: string }) => p.id)
      expect(petIds).toContain(pet1.id)
      expect(petIds).toContain(pet2.id)
    })

    it('supports search filtering', async () => {
      await createTestPet(supabase, ownerProfileId, TEST_TENANT_ID, {
        name: 'Fluffy',
      })
      await createTestPet(supabase, ownerProfileId, TEST_TENANT_ID, {
        name: 'Max',
      })

      const { data: session } = await supabase.auth.signInWithPassword({
        email: ownerProfileId + '@test.local',
        password: 'test-password-123',
      })

      const request = createTestRequest('http://localhost:3000/api/pets?search=fluffy', {
        headers: {
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
      })

      const response = await GET(request)
      const body = await expectSuccess(response)

      expect(body.data).toHaveLength(1)
      expect(body.data[0].name).toBe('Fluffy')
    })
  })

  describe('POST /api/pets', () => {
    it('requires authentication', async () => {
      const request = createTestRequest('http://localhost:3000/api/pets', {
        method: 'POST',
        body: {
          name: 'Test Pet',
          species: 'dog',
        },
      })

      const response = await POST(request)

      await expectError(response, 401, 'autorizado')
    })

    it('validates required fields', async () => {
      const { data: session } = await supabase.auth.signInWithPassword({
        email: ownerProfileId + '@test.local',
        password: 'test-password-123',
      })

      const request = createTestRequest('http://localhost:3000/api/pets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
        body: {
          // Missing name
          species: 'dog',
        },
      })

      const response = await POST(request)

      await expectError(response, 400)
    })

    it('validates species enum', async () => {
      const { data: session } = await supabase.auth.signInWithPassword({
        email: ownerProfileId + '@test.local',
        password: 'test-password-123',
      })

      const request = createTestRequest('http://localhost:3000/api/pets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
        body: {
          name: 'Test Pet',
          species: 'invalid_species', // Invalid enum value
        },
      })

      const response = await POST(request)

      await expectError(response, 400)
    })

    it('creates pet with valid data', async () => {
      const { data: session } = await supabase.auth.signInWithPassword({
        email: ownerProfileId + '@test.local',
        password: 'test-password-123',
      })

      const request = createTestRequest('http://localhost:3000/api/pets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
        body: {
          name: 'New Pet',
          species: 'dog',
          breed: 'Labrador',
          birth_date: '2020-01-15',
        },
      })

      const response = await POST(request)
      const body = await expectSuccess(response)

      expect(body.data.name).toBe('New Pet')
      expect(body.data.species).toBe('dog')
      expect(body.data.breed).toBe('Labrador')
      expect(body.data.owner_id).toBe(ownerProfileId)
      expect(body.data.tenant_id).toBe(TEST_TENANT_ID)

      // Track for cleanup
      cleanupManager.track('pets', body.data.id)
    })

    it('prevents tenant_id override', async () => {
      const { data: session } = await supabase.auth.signInWithPassword({
        email: ownerProfileId + '@test.local',
        password: 'test-password-123',
      })

      const request = createTestRequest('http://localhost:3000/api/pets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
        body: {
          name: 'Pet with Wrong Tenant',
          species: 'cat',
          tenant_id: 'petlife', // Attempting to override tenant
        },
      })

      const response = await POST(request)

      // Should either reject or auto-correct tenant_id
      if (response.status === 200) {
        const body = await response.json()
        expect(body.data.tenant_id).toBe(TEST_TENANT_ID) // Should use profile's tenant
        cleanupManager.track('pets', body.data.id)
      } else {
        await expectError(response, 403)
      }
    })
  })

  describe('Security: SQL Injection Prevention', () => {
    it('handles malicious search input safely', async () => {
      await createTestPet(supabase, ownerProfileId, TEST_TENANT_ID, {
        name: 'Normal Pet',
      })

      const { data: session } = await supabase.auth.signInWithPassword({
        email: ownerProfileId + '@test.local',
        password: 'test-password-123',
      })

      const maliciousInputs = [
        "'; DROP TABLE pets; --",
        "1' OR '1'='1",
        "\" OR 1=1 --",
        "<script>alert('xss')</script>",
      ]

      for (const malicious of maliciousInputs) {
        const request = createTestRequest(
          `http://localhost:3000/api/pets?search=${encodeURIComponent(malicious)}`,
          {
            headers: {
              Authorization: `Bearer ${session?.session?.access_token}`,
            },
          }
        )

        const response = await GET(request)

        // Should not error, just return empty results
        expect(response.status).toBeGreaterThanOrEqual(200)
        expect(response.status).toBeLessThan(300)
      }
    })
  })
})
