/**
 * Conversations API Tests
 *
 * Tests for GET/POST /api/conversations
 *
 * This route handles internal messaging between clinic staff and pet owners.
 * Staff can see all conversations, owners only see their own.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/conversations/route'
import {
  mockState,
  CONVERSATIONS,
  TENANTS,
  USERS,
  PETS,
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
  return new Request(`http://localhost:3000/api/conversations?${searchParams}`, {
    method: 'GET',
  })
}

// Helper to create POST request
function createPostRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost:3000/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// Sample conversation data
const createMockConversations = (count: number = 3) =>
  Array.from({ length: count }, (_, i) => ({
    id: `conversation-${i}`,
    subject: `Consulta ${i + 1}`,
    status: i === 0 ? 'open' : 'closed',
    priority: 'normal',
    last_message_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    unread_count_staff: i === 0 ? 2 : 0,
    unread_count_client: 0,
    client: {
      id: USERS.OWNER_JUAN.id,
      full_name: USERS.OWNER_JUAN.fullName,
      avatar_url: null,
    },
    pet: {
      id: PETS.MAX_DOG.id,
      name: PETS.MAX_DOG.name,
      photo_url: null,
    },
    assigned_staff: null,
  }))

describe('GET /api/conversations', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  // ===========================================================================
  // Authentication Tests
  // ===========================================================================

  describe('Authentication', () => {
    it('should return 401 when unauthenticated', async () => {
      mockState.setAuthScenario('UNAUTHENTICATED')

      const response = await GET(createGetRequest())

      expect(response.status).toBe(401)
    })

    it('should allow owner to list conversations', async () => {
      mockState.setAuthScenario('OWNER')
      mockState.setTableResult('conversations', createMockConversations(2))

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
    })

    it('should allow vet to list conversations', async () => {
      mockState.setAuthScenario('VET')
      mockState.setTableResult('conversations', createMockConversations(3))

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
    })

    it('should allow admin to list conversations', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setTableResult('conversations', createMockConversations(3))

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
    })
  })

  // ===========================================================================
  // Response Format Tests
  // ===========================================================================

  describe('Response Format', () => {
    beforeEach(() => {
      mockState.setAuthScenario('VET')
    })

    it('should return data array', async () => {
      mockState.setTableResult('conversations', createMockConversations(3))

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(Array.isArray(body.data)).toBe(true)
    })

    it('should return pagination info', async () => {
      mockState.setTableResult('conversations', createMockConversations(3))

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.total).toBeDefined()
      expect(body.page).toBeDefined()
      expect(body.limit).toBeDefined()
    })

    it('should include unread indicator', async () => {
      mockState.setTableResult('conversations', createMockConversations(3))

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data[0]).toHaveProperty('unread')
    })

    it('should include client and pet info', async () => {
      mockState.setTableResult('conversations', createMockConversations(1))

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data[0].client).toBeDefined()
      expect(body.data[0].pet).toBeDefined()
    })
  })

  // ===========================================================================
  // Filtering Tests
  // ===========================================================================

  describe('Filtering', () => {
    beforeEach(() => {
      mockState.setAuthScenario('VET')
    })

    it('should filter by status', async () => {
      const openConvs = createMockConversations(2).map(c => ({ ...c, status: 'open' }))
      mockState.setTableResult('conversations', openConvs)

      const response = await GET(createGetRequest({ status: 'open' }))

      expect(response.status).toBe(200)
    })

    it('should filter closed conversations', async () => {
      const closedConvs = createMockConversations(1).map(c => ({ ...c, status: 'closed' }))
      mockState.setTableResult('conversations', closedConvs)

      const response = await GET(createGetRequest({ status: 'closed' }))

      expect(response.status).toBe(200)
    })
  })

  // ===========================================================================
  // Pagination Tests
  // ===========================================================================

  describe('Pagination', () => {
    beforeEach(() => {
      mockState.setAuthScenario('VET')
    })

    it('should use default pagination', async () => {
      mockState.setTableResult('conversations', createMockConversations(10))

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.page).toBe(1)
      expect(body.limit).toBe(20)
    })

    it('should respect page parameter', async () => {
      mockState.setTableResult('conversations', createMockConversations(5))

      const response = await GET(createGetRequest({ page: '2' }))

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.page).toBe(2)
    })

    it('should respect limit parameter', async () => {
      mockState.setTableResult('conversations', createMockConversations(5))

      const response = await GET(createGetRequest({ limit: '5' }))

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.limit).toBe(5)
    })
  })

  // ===========================================================================
  // Role-Based Access Tests
  // ===========================================================================

  describe('Role-Based Access', () => {
    it('should show unread for staff based on unread_count_staff', async () => {
      mockState.setAuthScenario('VET')
      const convWithUnread = [{
        ...createMockConversations(1)[0],
        unread_count_staff: 5,
        unread_count_client: 0,
      }]
      mockState.setTableResult('conversations', convWithUnread)

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data[0].unread).toBe(true)
    })

    it('should show unread for owner based on unread_count_client', async () => {
      mockState.setAuthScenario('OWNER')
      const convWithUnread = [{
        ...createMockConversations(1)[0],
        unread_count_staff: 0,
        unread_count_client: 3,
      }]
      mockState.setTableResult('conversations', convWithUnread)

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data[0].unread).toBe(true)
    })
  })

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('Error Handling', () => {
    beforeEach(() => {
      mockState.setAuthScenario('VET')
    })

    it('should return 500 on database error', async () => {
      mockState.setTableError('conversations', new Error('Database connection failed'))

      const response = await GET(createGetRequest())

      expect(response.status).toBe(500)
    })

    it('should log errors', async () => {
      const { logger } = await import('@/lib/logger')
      mockState.setTableError('conversations', new Error('Query timeout'))

      await GET(createGetRequest())

      expect(logger.error).toHaveBeenCalledWith(
        'Error loading conversations',
        expect.objectContaining({
          tenantId: TENANTS.ADRIS.id,
        })
      )
    })
  })
})

describe('POST /api/conversations', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  // ===========================================================================
  // Authentication Tests
  // ===========================================================================

  describe('Authentication', () => {
    it('should return 401 when unauthenticated', async () => {
      mockState.setAuthScenario('UNAUTHENTICATED')

      const response = await POST(createPostRequest({
        subject: 'Nueva consulta',
        message: 'Hola, tengo una pregunta',
      }))

      expect(response.status).toBe(401)
    })

    it('should allow owner to create conversation', async () => {
      mockState.setAuthScenario('OWNER')
      mockState.setTableResult('conversations', {
        id: 'new-conversation',
        subject: 'Nueva consulta',
        status: 'open',
      })

      const response = await POST(createPostRequest({
        subject: 'Nueva consulta',
        message: 'Hola, tengo una pregunta',
      }))

      expect(response.status).toBe(201)
    })

    it('should allow vet to create conversation', async () => {
      mockState.setAuthScenario('VET')
      mockState.setTableResult('conversations', {
        id: 'new-conversation',
        subject: 'Recordatorio',
        status: 'open',
      })

      const response = await POST(createPostRequest({
        subject: 'Recordatorio',
        message: 'Recordatorio de vacunación',
        client_id: USERS.OWNER_JUAN.id,
      }))

      expect(response.status).toBe(201)
    })
  })

  // ===========================================================================
  // Validation Tests
  // ===========================================================================

  describe('Validation', () => {
    beforeEach(() => {
      mockState.setAuthScenario('OWNER')
    })

    it('should return 400 when subject is missing', async () => {
      const response = await POST(createPostRequest({
        message: 'Hola, tengo una pregunta',
      }))

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.details?.required).toContain('subject')
    })

    it('should return 400 when message is missing', async () => {
      const response = await POST(createPostRequest({
        subject: 'Nueva consulta',
      }))

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.details?.required).toContain('message')
    })

    it('should return 400 when staff doesn\'t provide client_id', async () => {
      mockState.setAuthScenario('VET')

      const response = await POST(createPostRequest({
        subject: 'Nueva consulta',
        message: 'Mensaje para el cliente',
      }))

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.details?.required).toContain('client_id')
    })
  })

  // ===========================================================================
  // Pet Validation Tests
  // ===========================================================================

  describe('Pet Validation', () => {
    beforeEach(() => {
      mockState.setAuthScenario('OWNER')
    })

    it('should accept valid pet_id for owner\'s pet', async () => {
      mockState.setTableResult('pets', {
        id: PETS.MAX_DOG.id,
        owner_id: USERS.OWNER_JUAN.id,
      })
      mockState.setTableResult('conversations', {
        id: 'new-conversation',
        subject: 'Consulta sobre Max',
        status: 'open',
      })

      const response = await POST(createPostRequest({
        subject: 'Consulta sobre Max',
        message: 'Tengo una pregunta sobre Max',
        pet_id: PETS.MAX_DOG.id,
      }))

      expect(response.status).toBe(201)
    })

    it('should reject pet_id for pet not owned by client', async () => {
      mockState.setTableResult('pets', null) // Pet not found or doesn't belong

      const response = await POST(createPostRequest({
        subject: 'Consulta',
        message: 'Pregunta',
        pet_id: 'other-pet-id',
      }))

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.details?.reason).toContain('no pertenece')
    })
  })

  // ===========================================================================
  // Success Response Tests
  // ===========================================================================

  describe('Success Response', () => {
    beforeEach(() => {
      mockState.setAuthScenario('OWNER')
    })

    it('should return 201 on success', async () => {
      mockState.setTableResult('conversations', {
        id: 'new-conversation',
        subject: 'Nueva consulta',
        status: 'open',
      })

      const response = await POST(createPostRequest({
        subject: 'Nueva consulta',
        message: 'Hola, tengo una pregunta',
      }))

      expect(response.status).toBe(201)
    })

    it('should return conversation data', async () => {
      mockState.setTableResult('conversations', {
        id: 'new-conversation',
        subject: 'Nueva consulta',
        status: 'open',
        priority: 'normal',
      })

      const response = await POST(createPostRequest({
        subject: 'Nueva consulta',
        message: 'Hola, tengo una pregunta',
      }))

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.data).toBeDefined()
      expect(body.data.id).toBeDefined()
    })

    it('should return Spanish success message', async () => {
      mockState.setTableResult('conversations', {
        id: 'new-conversation',
        subject: 'Nueva consulta',
        status: 'open',
      })

      const response = await POST(createPostRequest({
        subject: 'Nueva consulta',
        message: 'Hola',
      }))

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.message).toContain('Conversación creada')
    })
  })

  // ===========================================================================
  // Staff Creating Conversation Tests
  // ===========================================================================

  describe('Staff Creating Conversation', () => {
    beforeEach(() => {
      mockState.setAuthScenario('VET')
    })

    it('should allow staff to create conversation with client_id', async () => {
      mockState.setTableResult('conversations', {
        id: 'new-conversation',
        subject: 'Recordatorio',
        status: 'open',
        started_by: 'staff',
      })

      const response = await POST(createPostRequest({
        subject: 'Recordatorio de vacunación',
        message: 'Le recordamos que la vacuna de su mascota está próxima',
        client_id: USERS.OWNER_JUAN.id,
      }))

      expect(response.status).toBe(201)
    })

    it('should allow staff to create conversation with pet_id', async () => {
      mockState.setTableResult('pets', {
        id: PETS.MAX_DOG.id,
        owner_id: USERS.OWNER_JUAN.id,
      })
      mockState.setTableResult('conversations', {
        id: 'new-conversation',
        subject: 'Seguimiento post-cirugía',
        status: 'open',
      })

      const response = await POST(createPostRequest({
        subject: 'Seguimiento post-cirugía',
        message: 'Cómo se encuentra Max después de la cirugía?',
        client_id: USERS.OWNER_JUAN.id,
        pet_id: PETS.MAX_DOG.id,
      }))

      expect(response.status).toBe(201)
    })
  })

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('Error Handling', () => {
    beforeEach(() => {
      mockState.setAuthScenario('OWNER')
    })

    it('should return 500 on database error', async () => {
      mockState.setTableError('conversations', new Error('Database insert failed'))

      const response = await POST(createPostRequest({
        subject: 'Nueva consulta',
        message: 'Pregunta',
      }))

      expect(response.status).toBe(500)
    })

    it('should log errors', async () => {
      const { logger } = await import('@/lib/logger')
      mockState.setTableError('conversations', new Error('Insert failed'))

      await POST(createPostRequest({
        subject: 'Nueva consulta',
        message: 'Pregunta',
      }))

      expect(logger.error).toHaveBeenCalledWith(
        'Error creating conversation',
        expect.objectContaining({
          tenantId: TENANTS.ADRIS.id,
        })
      )
    })
  })

  // ===========================================================================
  // Tenant Isolation Tests
  // ===========================================================================

  describe('Tenant Isolation', () => {
    it('should create conversation in correct tenant', async () => {
      mockState.setAuthScenario('OWNER')
      mockState.setTableResult('conversations', {
        id: 'new-conversation',
        tenant_id: TENANTS.ADRIS.id,
        subject: 'Nueva consulta',
        status: 'open',
      })

      const response = await POST(createPostRequest({
        subject: 'Nueva consulta',
        message: 'Pregunta',
      }))

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.data.tenant_id).toBe(TENANTS.ADRIS.id)
    })
  })
})
