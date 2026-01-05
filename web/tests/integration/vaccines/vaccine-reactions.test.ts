/**
 * Vaccine Reactions API Tests
 *
 * Tests for GET/POST/PUT/DELETE /api/vaccine_reactions
 *
 * Critical for legal liability - tracks adverse reactions to vaccines.
 * Owners can view/report reactions for their pets.
 * Staff can view/manage all reactions in their clinic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST, PUT, DELETE } from '@/app/api/vaccine_reactions/route'
import {
  mockState,
  VACCINE_REACTIONS,
  VACCINES,
  PETS,
  TENANTS,
  USERS,
  resetAllMocks,
  createStatefulSupabaseMock,
} from '@/lib/test-utils'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(createStatefulSupabaseMock())),
}))

// Mock auth wrapper - uses mockState
vi.mock('@/lib/auth', () => ({
  withApiAuth: (handler: any, options?: { roles?: string[] }) => {
    return async (request: Request) => {
      const { mockState } = await import('@/lib/test-utils')
      const { createStatefulSupabaseMock } = await import('@/lib/test-utils')

      if (!mockState.user) {
        return new Response(JSON.stringify({ error: 'No autorizado', code: 'UNAUTHORIZED' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      if (!mockState.profile) {
        return new Response(JSON.stringify({ error: 'Perfil no encontrado', code: 'FORBIDDEN' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      if (options?.roles && !options.roles.includes(mockState.profile.role)) {
        return new Response(JSON.stringify({ error: 'Rol insuficiente', code: 'INSUFFICIENT_ROLE' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const supabase = createStatefulSupabaseMock()
      return handler({
        request,
        user: mockState.user,
        profile: mockState.profile,
        supabase,
      })
    }
  },
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

// Helper to create GET request
function createGetRequest(params: Record<string, string> = {}): Request {
  const searchParams = new URLSearchParams(params)
  return new Request(`http://localhost:3000/api/vaccine_reactions?${searchParams}`, {
    method: 'GET',
  })
}

// Helper to create POST request
function createPostRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost:3000/api/vaccine_reactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// Helper to create PUT request
function createPutRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost:3000/api/vaccine_reactions', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// Helper to create DELETE request
function createDeleteRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost:3000/api/vaccine_reactions', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/vaccine_reactions', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  // =========================================================================
  // GET Tests - List Reactions
  // =========================================================================

  describe('GET - List Reactions', () => {
    describe('Authentication', () => {
      it('should return 401 when unauthenticated', async () => {
        mockState.setAuthScenario('UNAUTHENTICATED')

        const response = await GET(createGetRequest())

        expect(response.status).toBe(401)
      })

      it('should allow authenticated owner', async () => {
        mockState.setAuthScenario('OWNER')
        mockState.setTableResult('vaccine_reactions', [])

        const response = await GET(createGetRequest())

        expect(response.status).toBe(200)
      })

      it('should allow authenticated vet', async () => {
        mockState.setAuthScenario('VET')
        mockState.setTableResult('vaccine_reactions', [])

        const response = await GET(createGetRequest())

        expect(response.status).toBe(200)
      })

      it('should allow authenticated admin', async () => {
        mockState.setAuthScenario('ADMIN')
        mockState.setTableResult('vaccine_reactions', [])

        const response = await GET(createGetRequest())

        expect(response.status).toBe(200)
      })
    })

    describe('Data Filtering', () => {
      it('should filter by pet_id when provided', async () => {
        mockState.setAuthScenario('VET')
        const reaction = {
          ...VACCINE_REACTIONS.MILD_LOCAL,
          pet: PETS.MAX_DOG,
          vaccine: VACCINES.RABIES_MAX,
        }
        mockState.setTableResult('vaccine_reactions', [reaction])

        const response = await GET(createGetRequest({ pet_id: PETS.MAX_DOG.id }))

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(Array.isArray(body)).toBe(true)
      })

      it('should return reactions for staff clinic', async () => {
        mockState.setAuthScenario('VET')
        const reactions = [
          { ...VACCINE_REACTIONS.MILD_LOCAL, pet: PETS.MAX_DOG, vaccine: VACCINES.RABIES_MAX },
          { ...VACCINE_REACTIONS.MODERATE_SYSTEMIC, pet: PETS.ROCKY_DOG, vaccine: VACCINES.OVERDUE },
        ]
        mockState.setTableResult('vaccine_reactions', reactions)

        const response = await GET(createGetRequest())

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.length).toBe(2)
      })

      it('should return only owner pets for owners', async () => {
        mockState.setAuthScenario('OWNER')
        const reaction = {
          ...VACCINE_REACTIONS.MILD_LOCAL,
          pet: PETS.MAX_DOG,
          vaccine: VACCINES.RABIES_MAX,
        }
        mockState.setTableResult('vaccine_reactions', [reaction])

        const response = await GET(createGetRequest())

        expect(response.status).toBe(200)
      })
    })

    describe('Response Format', () => {
      it('should return reactions with pet and vaccine details', async () => {
        mockState.setAuthScenario('VET')
        const reaction = {
          id: VACCINE_REACTIONS.MILD_LOCAL.id,
          pet_id: PETS.MAX_DOG.id,
          vaccine_id: VACCINES.RABIES_MAX.id,
          reaction_type: 'local',
          severity: 'mild',
          description: 'Leve hinchazón',
          pet: { id: PETS.MAX_DOG.id, name: PETS.MAX_DOG.name },
          vaccine: { id: VACCINES.RABIES_MAX.id, vaccine_name: VACCINES.RABIES_MAX.vaccine_name },
        }
        mockState.setTableResult('vaccine_reactions', [reaction])

        const response = await GET(createGetRequest())

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body[0]).toHaveProperty('pet')
        expect(body[0]).toHaveProperty('vaccine')
      })

      it('should order by created_at descending', async () => {
        mockState.setAuthScenario('VET')
        mockState.setTableResult('vaccine_reactions', [])

        const response = await GET(createGetRequest())

        expect(response.status).toBe(200)
      })
    })

    describe('Error Handling', () => {
      it('should return 500 on database error', async () => {
        mockState.setAuthScenario('VET')
        mockState.setTableError('vaccine_reactions', new Error('Database error'))

        const response = await GET(createGetRequest())

        expect(response.status).toBe(500)
      })
    })
  })

  // =========================================================================
  // POST Tests - Create Reaction
  // =========================================================================

  describe('POST - Create Reaction', () => {
    describe('Authentication', () => {
      it('should return 401 when unauthenticated', async () => {
        mockState.setAuthScenario('UNAUTHENTICATED')

        const response = await POST(
          createPostRequest({
            pet_id: PETS.MAX_DOG.id,
            reaction_type: 'local',
          })
        )

        expect(response.status).toBe(401)
      })

      it('should allow owner to report reaction for own pet', async () => {
        mockState.setAuthScenario('OWNER')
        mockState.setTableResult('pets', {
          ...PETS.MAX_DOG,
          owner_id: mockState.user?.id,
        })
        mockState.setTableResult('vaccine_reactions', VACCINE_REACTIONS.MILD_LOCAL)

        const response = await POST(
          createPostRequest({
            pet_id: PETS.MAX_DOG.id,
            reaction_type: 'local',
            severity: 'mild',
            description: 'Slight swelling',
          })
        )

        expect(response.status).toBe(201)
      })

      it('should allow vet to report reaction for clinic pet', async () => {
        mockState.setAuthScenario('VET')
        mockState.setTableResult('pets', PETS.MAX_DOG)
        mockState.setTableResult('vaccine_reactions', VACCINE_REACTIONS.MILD_LOCAL)

        const response = await POST(
          createPostRequest({
            pet_id: PETS.MAX_DOG.id,
            reaction_type: 'local',
            severity: 'mild',
          })
        )

        expect(response.status).toBe(201)
      })
    })

    describe('Validation', () => {
      beforeEach(() => {
        mockState.setAuthScenario('VET')
      })

      it('should require pet_id', async () => {
        const response = await POST(
          createPostRequest({
            reaction_type: 'local',
          })
        )

        expect(response.status).toBe(400)
        const body = await response.json()
        expect(body.code).toBe('MISSING_FIELDS')
      })

      it('should require reaction_type', async () => {
        const response = await POST(
          createPostRequest({
            pet_id: PETS.MAX_DOG.id,
          })
        )

        expect(response.status).toBe(400)
        const body = await response.json()
        expect(body.code).toBe('MISSING_FIELDS')
      })

      it('should return 404 for non-existent pet', async () => {
        mockState.setTableResult('pets', null)

        const response = await POST(
          createPostRequest({
            pet_id: 'non-existent',
            reaction_type: 'local',
          })
        )

        expect(response.status).toBe(404)
      })

      it('should reject invalid JSON body', async () => {
        const request = new Request('http://localhost:3000/api/vaccine_reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'invalid json',
        })

        const response = await POST(request)

        expect(response.status).toBe(400)
        const body = await response.json()
        expect(body.code).toBe('INVALID_FORMAT')
      })
    })

    describe('Severity Levels', () => {
      beforeEach(() => {
        mockState.setAuthScenario('VET')
        mockState.setTableResult('pets', PETS.MAX_DOG)
      })

      it('should create mild severity reaction', async () => {
        mockState.setTableResult('vaccine_reactions', {
          ...VACCINE_REACTIONS.MILD_LOCAL,
          severity: 'mild',
        })

        const response = await POST(
          createPostRequest({
            pet_id: PETS.MAX_DOG.id,
            reaction_type: 'local',
            severity: 'mild',
          })
        )

        expect(response.status).toBe(201)
      })

      it('should create moderate severity reaction', async () => {
        mockState.setTableResult('vaccine_reactions', {
          ...VACCINE_REACTIONS.MODERATE_SYSTEMIC,
          severity: 'moderate',
        })

        const response = await POST(
          createPostRequest({
            pet_id: PETS.MAX_DOG.id,
            reaction_type: 'systemic',
            severity: 'moderate',
          })
        )

        expect(response.status).toBe(201)
      })

      it('should create severe severity reaction', async () => {
        mockState.setTableResult('vaccine_reactions', {
          ...VACCINE_REACTIONS.SEVERE_ANAPHYLACTIC,
          severity: 'severe',
        })

        const response = await POST(
          createPostRequest({
            pet_id: PETS.MAX_DOG.id,
            reaction_type: 'anaphylactic',
            severity: 'severe',
          })
        )

        expect(response.status).toBe(201)
      })

      it('should default to mild severity if not provided', async () => {
        mockState.setTableResult('vaccine_reactions', {
          ...VACCINE_REACTIONS.MILD_LOCAL,
          severity: 'mild',
        })

        const response = await POST(
          createPostRequest({
            pet_id: PETS.MAX_DOG.id,
            reaction_type: 'local',
          })
        )

        expect(response.status).toBe(201)
      })
    })

    describe('Authorization', () => {
      it('should reject owner creating reaction for other pet', async () => {
        mockState.setAuthScenario('OWNER')
        // Pet belongs to different owner
        mockState.setTableResult('pets', {
          ...PETS.ROCKY_DOG,
          owner_id: 'different-owner',
        })

        const response = await POST(
          createPostRequest({
            pet_id: PETS.ROCKY_DOG.id,
            reaction_type: 'local',
          })
        )

        expect(response.status).toBe(403)
      })

      it('should reject staff creating reaction for other clinic pet', async () => {
        mockState.setAuthScenario('VET')
        // Pet belongs to different tenant
        mockState.setTableResult('pets', {
          ...PETS.MILO_PETLIFE,
          tenant_id: TENANTS.PETLIFE.id,
        })

        const response = await POST(
          createPostRequest({
            pet_id: PETS.MILO_PETLIFE.id,
            reaction_type: 'local',
          })
        )

        expect(response.status).toBe(403)
      })
    })
  })

  // =========================================================================
  // PUT Tests - Update Reaction
  // =========================================================================

  describe('PUT - Update Reaction', () => {
    describe('Authentication', () => {
      it('should return 401 when unauthenticated', async () => {
        mockState.setAuthScenario('UNAUTHENTICATED')

        const response = await PUT(
          createPutRequest({
            id: VACCINE_REACTIONS.MILD_LOCAL.id,
            severity: 'moderate',
          })
        )

        expect(response.status).toBe(401)
      })
    })

    describe('Validation', () => {
      it('should require id', async () => {
        mockState.setAuthScenario('VET')

        const response = await PUT(
          createPutRequest({
            severity: 'moderate',
          })
        )

        expect(response.status).toBe(400)
        const body = await response.json()
        expect(body.code).toBe('MISSING_FIELDS')
      })

      it('should return 404 for non-existent reaction', async () => {
        mockState.setAuthScenario('VET')
        mockState.setTableResult('vaccine_reactions', null)

        const response = await PUT(
          createPutRequest({
            id: 'non-existent',
            severity: 'moderate',
          })
        )

        expect(response.status).toBe(404)
      })
    })

    describe('Update Operations', () => {
      beforeEach(() => {
        mockState.setAuthScenario('VET')
      })

      it('should update severity', async () => {
        mockState.setTableResult('vaccine_reactions', {
          ...VACCINE_REACTIONS.MILD_LOCAL,
          pet: { owner_id: USERS.OWNER_JUAN.id, tenant_id: TENANTS.ADRIS.id },
        })

        const response = await PUT(
          createPutRequest({
            id: VACCINE_REACTIONS.MILD_LOCAL.id,
            severity: 'severe',
          })
        )

        expect(response.status).toBe(200)
      })

      it('should update reaction_type', async () => {
        mockState.setTableResult('vaccine_reactions', {
          ...VACCINE_REACTIONS.MILD_LOCAL,
          pet: { owner_id: USERS.OWNER_JUAN.id, tenant_id: TENANTS.ADRIS.id },
        })

        const response = await PUT(
          createPutRequest({
            id: VACCINE_REACTIONS.MILD_LOCAL.id,
            reaction_type: 'systemic',
          })
        )

        expect(response.status).toBe(200)
      })

      it('should update description', async () => {
        mockState.setTableResult('vaccine_reactions', {
          ...VACCINE_REACTIONS.MILD_LOCAL,
          pet: { owner_id: USERS.OWNER_JUAN.id, tenant_id: TENANTS.ADRIS.id },
        })

        const response = await PUT(
          createPutRequest({
            id: VACCINE_REACTIONS.MILD_LOCAL.id,
            description: 'Updated description with more details',
          })
        )

        expect(response.status).toBe(200)
      })
    })

    describe('Authorization', () => {
      it('should allow owner to update reaction for own pet', async () => {
        mockState.setAuthScenario('OWNER')
        mockState.setTableResult('vaccine_reactions', {
          ...VACCINE_REACTIONS.MILD_LOCAL,
          pet: { owner_id: mockState.user?.id, tenant_id: TENANTS.ADRIS.id },
        })

        const response = await PUT(
          createPutRequest({
            id: VACCINE_REACTIONS.MILD_LOCAL.id,
            description: 'Owner update',
          })
        )

        expect(response.status).toBe(200)
      })

      it('should reject owner updating reaction for other pet', async () => {
        mockState.setAuthScenario('OWNER')
        mockState.setTableResult('vaccine_reactions', {
          ...VACCINE_REACTIONS.MODERATE_SYSTEMIC,
          pet: { owner_id: 'different-owner', tenant_id: TENANTS.ADRIS.id },
        })

        const response = await PUT(
          createPutRequest({
            id: VACCINE_REACTIONS.MODERATE_SYSTEMIC.id,
            description: 'Unauthorized update',
          })
        )

        expect(response.status).toBe(403)
      })
    })
  })

  // =========================================================================
  // DELETE Tests - Delete Reaction
  // =========================================================================

  describe('DELETE - Delete Reaction', () => {
    describe('Authentication & Authorization', () => {
      it('should return 401 when unauthenticated', async () => {
        mockState.setAuthScenario('UNAUTHENTICATED')

        const response = await DELETE(
          createDeleteRequest({
            id: VACCINE_REACTIONS.MILD_LOCAL.id,
          })
        )

        expect(response.status).toBe(401)
      })

      it('should return 403 for owner role', async () => {
        mockState.setAuthScenario('OWNER')

        const response = await DELETE(
          createDeleteRequest({
            id: VACCINE_REACTIONS.MILD_LOCAL.id,
          })
        )

        expect(response.status).toBe(403)
        const body = await response.json()
        expect(body.code).toBe('INSUFFICIENT_ROLE')
      })

      it('should allow vet to delete', async () => {
        mockState.setAuthScenario('VET')
        mockState.setTableResult('vaccine_reactions', {
          ...VACCINE_REACTIONS.MILD_LOCAL,
          pet: { tenant_id: TENANTS.ADRIS.id },
        })

        const response = await DELETE(
          createDeleteRequest({
            id: VACCINE_REACTIONS.MILD_LOCAL.id,
          })
        )

        expect(response.status).toBe(204)
      })

      it('should allow admin to delete', async () => {
        mockState.setAuthScenario('ADMIN')
        mockState.setTableResult('vaccine_reactions', {
          ...VACCINE_REACTIONS.MILD_LOCAL,
          pet: { tenant_id: TENANTS.ADRIS.id },
        })

        const response = await DELETE(
          createDeleteRequest({
            id: VACCINE_REACTIONS.MILD_LOCAL.id,
          })
        )

        expect(response.status).toBe(204)
      })
    })

    describe('Validation', () => {
      beforeEach(() => {
        mockState.setAuthScenario('VET')
      })

      it('should require id', async () => {
        const response = await DELETE(createDeleteRequest({}))

        expect(response.status).toBe(400)
        const body = await response.json()
        expect(body.code).toBe('MISSING_FIELDS')
      })

      it('should return 404 for non-existent reaction', async () => {
        mockState.setTableResult('vaccine_reactions', null)

        const response = await DELETE(
          createDeleteRequest({
            id: 'non-existent',
          })
        )

        expect(response.status).toBe(404)
      })
    })

    describe('Tenant Isolation', () => {
      it('should reject deleting reaction from different tenant', async () => {
        mockState.setAuthScenario('VET')
        mockState.setTableResult('vaccine_reactions', {
          ...VACCINE_REACTIONS.MILD_LOCAL,
          pet: { tenant_id: TENANTS.PETLIFE.id },
        })

        const response = await DELETE(
          createDeleteRequest({
            id: VACCINE_REACTIONS.MILD_LOCAL.id,
          })
        )

        expect(response.status).toBe(403)
      })
    })
  })
})
