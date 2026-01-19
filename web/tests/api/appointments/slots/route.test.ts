/**
 * API Integration Tests: /api/appointments/slots
 *
 * Tests authentication, tenant isolation, and available appointment slot retrieval
 * This route uses the refactored service layer pattern (AppointmentService)
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { GET } from '@/app/api/appointments/slots/route'
import {
  setupIntegrationTest,
  cleanupIntegrationTest,
  createTestAuthUser,
  createTestStaffProfile,
  TEST_TENANT_ID,
  cleanupManager,
  createTestRequest,
  expectSuccess,
  expectError,
} from '../../../__helpers__/integration-setup'
import { SupabaseClient } from '@supabase/supabase-js'

describe('API: /api/appointments/slots', () => {
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

    // Create staff profile for vet (needed for schedules)
    await createTestStaffProfile(supabase, vetProfileId, TEST_TENANT_ID, {
      specialization: 'Cirugía General',
      license_number: 'LIC-TEST-001',
    })
  })

  afterAll(async () => {
    await cleanupIntegrationTest()
  })

  afterEach(async () => {
    await cleanupManager.cleanupWithRetry()
  })

  describe('GET /api/appointments/slots', () => {
    it('requires authentication', async () => {
      const request = createTestRequest(
        `http://localhost:3000/api/appointments/slots?clinic=${TEST_TENANT_ID}&date=2024-12-20`
      )

      const response = await GET(request)

      await expectError(response, 401)
    })

    it('requires clinic parameter', async () => {
      // Sign in as owner
      const { data: session } = await supabase.auth.signInWithPassword({
        email: ownerProfileId + '@test.local',
        password: 'test-password-123',
      })

      const request = createTestRequest(
        'http://localhost:3000/api/appointments/slots?date=2024-12-20',
        {
          headers: {
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
        }
      )

      const response = await GET(request)

      await expectError(response, 400, 'required')
    })

    it('requires date parameter', async () => {
      // Sign in as owner
      const { data: session } = await supabase.auth.signInWithPassword({
        email: ownerProfileId + '@test.local',
        password: 'test-password-123',
      })

      const request = createTestRequest(
        `http://localhost:3000/api/appointments/slots?clinic=${TEST_TENANT_ID}`,
        {
          headers: {
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
        }
      )

      const response = await GET(request)

      await expectError(response, 400, 'required')
    })

    it('validates date format (YYYY-MM-DD)', async () => {
      // Sign in as owner
      const { data: session } = await supabase.auth.signInWithPassword({
        email: ownerProfileId + '@test.local',
        password: 'test-password-123',
      })

      const invalidDates = ['12/20/2024', '2024-12-20T10:00:00', '20-12-2024', 'invalid']

      for (const invalidDate of invalidDates) {
        const request = createTestRequest(
          `http://localhost:3000/api/appointments/slots?clinic=${TEST_TENANT_ID}&date=${invalidDate}`,
          {
            headers: {
              Authorization: `Bearer ${session?.session?.access_token}`,
            },
          }
        )

        const response = await GET(request)

        await expectError(response, 400, 'YYYY-MM-DD')
      }
    })

    it('enforces tenant isolation - owners can only access own clinic', async () => {
      // Create another owner in different tenant
      const otherOwner = await createTestAuthUser(supabase, 'owner', 'petlife')

      // Sign in as other owner
      const { data: session } = await supabase.auth.signInWithPassword({
        email: otherOwner.profile.id + '@test.local',
        password: 'test-password-123',
      })

      // Try to access TEST_TENANT_ID slots
      const request = createTestRequest(
        `http://localhost:3000/api/appointments/slots?clinic=${TEST_TENANT_ID}&date=2024-12-20`,
        {
          headers: {
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
        }
      )

      const response = await GET(request)

      await expectError(response, 403, 'FORBIDDEN')
    })

    it('allows staff to access any clinic within their tenant', async () => {
      // Sign in as vet (staff role)
      const { data: session } = await supabase.auth.signInWithPassword({
        email: vetProfileId + '@test.local',
        password: 'test-password-123',
      })

      const request = createTestRequest(
        `http://localhost:3000/api/appointments/slots?clinic=${TEST_TENANT_ID}&date=2024-12-20`,
        {
          headers: {
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
        }
      )

      const response = await GET(request)

      // Should succeed (staff can access)
      const body = await expectSuccess(response)
      expect(body).toHaveProperty('slots')
    })

    it('returns available slots for valid request', async () => {
      // Sign in as owner
      const { data: session } = await supabase.auth.signInWithPassword({
        email: ownerProfileId + '@test.local',
        password: 'test-password-123',
      })

      // Request slots for a future date
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const request = createTestRequest(
        `http://localhost:3000/api/appointments/slots?clinic=${TEST_TENANT_ID}&date=${futureDate}`,
        {
          headers: {
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
        }
      )

      const response = await GET(request)
      const body = await expectSuccess(response)

      // Verify response structure
      expect(body).toHaveProperty('slots')
      expect(Array.isArray(body.slots)).toBe(true)
      // Slots may be empty if no schedule configured, but structure should be correct
    })

    it('supports optional service_id filter', async () => {
      // Sign in as owner
      const { data: session } = await supabase.auth.signInWithPassword({
        email: ownerProfileId + '@test.local',
        password: 'test-password-123',
      })

      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      const serviceId = 'service-test-id'

      const request = createTestRequest(
        `http://localhost:3000/api/appointments/slots?clinic=${TEST_TENANT_ID}&date=${futureDate}&service_id=${serviceId}`,
        {
          headers: {
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
        }
      )

      const response = await GET(request)

      // Should succeed even if service doesn't exist (returns empty slots)
      const body = await expectSuccess(response)
      expect(body).toHaveProperty('slots')
    })

    it('supports optional vet_id filter', async () => {
      // Sign in as owner
      const { data: session } = await supabase.auth.signInWithPassword({
        email: ownerProfileId + '@test.local',
        password: 'test-password-123',
      })

      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const request = createTestRequest(
        `http://localhost:3000/api/appointments/slots?clinic=${TEST_TENANT_ID}&date=${futureDate}&vet_id=${vetProfileId}`,
        {
          headers: {
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
        }
      )

      const response = await GET(request)

      // Should succeed and filter by vet
      const body = await expectSuccess(response)
      expect(body).toHaveProperty('slots')
    })
  })

  describe('Security: SQL Injection Prevention', () => {
    it('handles malicious clinic parameter safely', async () => {
      // Sign in as vet (staff - can access any clinic)
      const { data: session } = await supabase.auth.signInWithPassword({
        email: vetProfileId + '@test.local',
        password: 'test-password-123',
      })

      const maliciousInputs = [
        "'; DROP TABLE appointments; --",
        "1' OR '1'='1",
        'admin"--',
      ]

      for (const malicious of maliciousInputs) {
        const request = createTestRequest(
          `http://localhost:3000/api/appointments/slots?clinic=${encodeURIComponent(malicious)}&date=2024-12-20`,
          {
            headers: {
              Authorization: `Bearer ${session?.session?.access_token}`,
            },
          }
        )

        const response = await GET(request)

        // Should handle safely (not 500)
        expect(response.status).toBeGreaterThanOrEqual(200)
        expect(response.status).toBeLessThan(500)
      }
    })

    it('handles malicious date parameter safely', async () => {
      // Sign in as owner
      const { data: session } = await supabase.auth.signInWithPassword({
        email: ownerProfileId + '@test.local',
        password: 'test-password-123',
      })

      const maliciousInputs = [
        "2024-12-20'; DROP TABLE slots; --",
        "2024-12-20 OR 1=1",
        '"><script>alert("xss")</script>',
      ]

      for (const malicious of maliciousInputs) {
        const request = createTestRequest(
          `http://localhost:3000/api/appointments/slots?clinic=${TEST_TENANT_ID}&date=${encodeURIComponent(malicious)}`,
          {
            headers: {
              Authorization: `Bearer ${session?.session?.access_token}`,
            },
          }
        )

        const response = await GET(request)

        // Should reject with 400 (invalid format) or handle safely
        expect(response.status).not.toBe(500)
      }
    })
  })
})
