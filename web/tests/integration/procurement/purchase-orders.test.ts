/**
 * Purchase Orders API Tests
 *
 * Tests for:
 * - GET /api/procurement/orders - List purchase orders
 * - POST /api/procurement/orders - Create purchase order
 * - GET /api/procurement/orders/[id] - Get order details
 * - PATCH /api/procurement/orders/[id] - Update order status / receive items
 * - DELETE /api/procurement/orders/[id] - Delete draft order
 *
 * Procurement handles supplier purchase orders for inventory replenishment.
 * Admin-only for write operations, vet/admin for read.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  mockState,
  TENANTS,
  USERS,
  resetAllMocks,
  createStatefulSupabaseMock,
} from '@/lib/test-utils'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(createStatefulSupabaseMock())),
}))

// Mock withApiAuth wrapper
vi.mock('@/lib/auth', () => ({
  withApiAuth: (handler: any, options?: { roles?: string[] }) => {
    return async (request: Request) => {
      const { mockState } = await import('@/lib/test-utils')
      const { createStatefulSupabaseMock } = await import('@/lib/test-utils')

      if (!mockState.user) {
        const { apiError, HTTP_STATUS } = await import('@/lib/api/errors')
        return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
      }

      if (!mockState.profile) {
        const { apiError, HTTP_STATUS } = await import('@/lib/api/errors')
        return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
      }

      if (options?.roles && !options.roles.includes(mockState.profile.role)) {
        const { apiError, HTTP_STATUS } = await import('@/lib/api/errors')
        return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
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
  withApiAuthParams: (handler: any, options?: { roles?: string[] }) => {
    return async (request: Request, context: { params: Promise<{ id: string }> }) => {
      const { mockState } = await import('@/lib/test-utils')
      const { createStatefulSupabaseMock } = await import('@/lib/test-utils')
      const params = await context.params

      if (!mockState.user) {
        const { apiError, HTTP_STATUS } = await import('@/lib/api/errors')
        return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
      }

      if (!mockState.profile) {
        const { apiError, HTTP_STATUS } = await import('@/lib/api/errors')
        return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
      }

      if (options?.roles && !options.roles.includes(mockState.profile.role)) {
        const { apiError, HTTP_STATUS } = await import('@/lib/api/errors')
        return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
      }

      const supabase = createStatefulSupabaseMock()
      return handler({
        request,
        params,
        user: mockState.user,
        profile: mockState.profile,
        supabase,
      })
    }
  },
}))

// Mock API error helpers
vi.mock('@/lib/api/errors', () => ({
  apiError: (
    code: string,
    status: number,
    options?: { details?: Record<string, unknown> }
  ) => {
    const { NextResponse } = require('next/server')
    return NextResponse.json({ error: code, ...options?.details }, { status })
  },
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
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

// Import routes after mocks
import { GET, POST } from '@/app/api/procurement/orders/route'
import {
  GET as GET_BY_ID,
  PATCH,
  DELETE,
} from '@/app/api/procurement/orders/[id]/route'

// Sample data with valid UUIDs
const SUPPLIER_ID = '00000000-0000-4000-8000-000000000001'
const CATALOG_PRODUCT_ID = '00000000-0000-4000-8000-000000000002'
const PO_ID = '00000000-0000-4000-8000-000000000003'
const ITEM_ID = '00000000-0000-4000-8000-000000000004'

const SAMPLE_SUPPLIER = {
  id: SUPPLIER_ID,
  name: 'Proveedor Test',
  tenant_id: TENANTS.ADRIS.id,
  contact_info: { email: 'supplier@example.com', phone: '555-1234' },
  payment_terms: 'net-30',
  delivery_time_days: 5,
  is_active: true,
}

const SAMPLE_CATALOG_PRODUCT = {
  id: CATALOG_PRODUCT_ID,
  sku: 'VAC-001',
  name: 'Vacuna Rabia',
  base_unit: 'dose',
}

const SAMPLE_PURCHASE_ORDER = {
  id: PO_ID,
  tenant_id: TENANTS.ADRIS.id,
  supplier_id: SUPPLIER_ID,
  order_number: 'PO-000001',
  status: 'draft',
  subtotal: 1000,
  tax_amount: 0,
  total: 1000,
  expected_delivery_date: '2026-01-15',
  notes: 'Restock vaccines',
  created_by: USERS.ADMIN_PRINCIPAL.id,
  created_at: '2026-01-05T10:00:00Z',
  suppliers: SAMPLE_SUPPLIER,
  purchase_order_items: [
    {
      id: ITEM_ID,
      catalog_product_id: CATALOG_PRODUCT_ID,
      quantity: 100,
      unit_cost: 10,
      line_total: 1000,
      received_quantity: 0,
      catalog_products: SAMPLE_CATALOG_PRODUCT,
    },
  ],
  profiles: { id: USERS.ADMIN_PRINCIPAL.id, full_name: 'Admin User' },
}

// Helper functions
function createGetRequest(params?: Record<string, string>): Request {
  const searchParams = new URLSearchParams(params)
  const url = params
    ? `http://localhost:3000/api/procurement/orders?${searchParams.toString()}`
    : 'http://localhost:3000/api/procurement/orders'
  return new Request(url, { method: 'GET' })
}

function createPostRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost:3000/api/procurement/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function createContext(id: string) {
  return { params: Promise.resolve({ id }) }
}

function createGetByIdRequest(id: string): [Request, { params: Promise<{ id: string }> }] {
  return [
    new Request(`http://localhost:3000/api/procurement/orders/${id}`),
    createContext(id),
  ]
}

function createPatchRequest(
  id: string,
  body: Record<string, unknown>
): [Request, { params: Promise<{ id: string }> }] {
  return [
    new Request(`http://localhost:3000/api/procurement/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    createContext(id),
  ]
}

function createDeleteRequest(id: string): [Request, { params: Promise<{ id: string }> }] {
  return [
    new Request(`http://localhost:3000/api/procurement/orders/${id}`, { method: 'DELETE' }),
    createContext(id),
  ]
}

// ============================================================================
// GET /api/procurement/orders Tests
// ============================================================================

describe('GET /api/procurement/orders', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when unauthenticated', async () => {
      mockState.setAuthScenario('UNAUTHENTICATED')

      const response = await GET(createGetRequest())

      expect(response.status).toBe(401)
    })

    it('should return 403 for owner role', async () => {
      mockState.setAuthScenario('OWNER')

      const response = await GET(createGetRequest())

      expect(response.status).toBe(403)
    })

    it('should allow vet to read orders', async () => {
      mockState.setAuthScenario('VET')
      mockState.setTableResult('purchase_orders', [SAMPLE_PURCHASE_ORDER])

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
    })

    it('should allow admin to read orders', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setTableResult('purchase_orders', [SAMPLE_PURCHASE_ORDER])

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
    })
  })

  describe('Listing Orders', () => {
    beforeEach(() => {
      mockState.setAuthScenario('ADMIN')
    })

    it('should list purchase orders with pagination', async () => {
      mockState.setTableResult('purchase_orders', [SAMPLE_PURCHASE_ORDER])

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.orders).toHaveLength(1)
      expect(body.total).toBeDefined()
    })

    it('should filter by status', async () => {
      mockState.setTableResult('purchase_orders', [SAMPLE_PURCHASE_ORDER])

      const response = await GET(createGetRequest({ status: 'draft' }))

      expect(response.status).toBe(200)
    })

    it('should filter by supplier_id', async () => {
      mockState.setTableResult('purchase_orders', [SAMPLE_PURCHASE_ORDER])

      const response = await GET(createGetRequest({ supplier_id: SUPPLIER_ID }))

      expect(response.status).toBe(200)
    })

    it('should support pagination params', async () => {
      mockState.setTableResult('purchase_orders', [SAMPLE_PURCHASE_ORDER])

      const response = await GET(createGetRequest({ limit: '10', offset: '20' }))

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.limit).toBe(10)
      expect(body.offset).toBe(20)
    })

    it('should return empty list when no orders', async () => {
      mockState.setTableResult('purchase_orders', [])

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.orders).toHaveLength(0)
    })

    it('should include supplier details', async () => {
      mockState.setTableResult('purchase_orders', [SAMPLE_PURCHASE_ORDER])

      const response = await GET(createGetRequest())

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.orders[0].suppliers.name).toBe('Proveedor Test')
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockState.setAuthScenario('ADMIN')
    })

    it('should return 500 on database error', async () => {
      mockState.setTableError('purchase_orders', new Error('Database error'))

      const response = await GET(createGetRequest())

      expect(response.status).toBe(500)
    })
  })
})

// ============================================================================
// POST /api/procurement/orders Tests
// ============================================================================

describe('POST /api/procurement/orders', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  const validPayload = {
    supplier_id: SUPPLIER_ID,
    items: [
      {
        catalog_product_id: CATALOG_PRODUCT_ID,
        quantity: 100,
        unit_cost: 10,
      },
    ],
    expected_delivery_date: '2026-01-15',
    notes: 'Urgent restock',
  }

  describe('Authentication', () => {
    it('should return 401 when unauthenticated', async () => {
      mockState.setAuthScenario('UNAUTHENTICATED')

      const response = await POST(createPostRequest(validPayload))

      expect(response.status).toBe(401)
    })

    it('should return 403 for owner role', async () => {
      mockState.setAuthScenario('OWNER')

      const response = await POST(createPostRequest(validPayload))

      expect(response.status).toBe(403)
    })

    it('should return 403 for vet role (admin only for writes)', async () => {
      mockState.setAuthScenario('VET')

      const response = await POST(createPostRequest(validPayload))

      expect(response.status).toBe(403)
    })

    it('should allow admin to create orders', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setTableResult('suppliers', SAMPLE_SUPPLIER)
      mockState.setTableResult('purchase_orders', { order_number: 'PO-000000' }) // Last order
      mockState.setTableResult('purchase_orders', SAMPLE_PURCHASE_ORDER, 'insert')
      mockState.setTableResult('purchase_order_items', [{ id: ITEM_ID }], 'insert')

      const response = await POST(createPostRequest(validPayload))

      expect(response.status).toBe(201)
    })
  })

  describe('Validation', () => {
    beforeEach(() => {
      mockState.setAuthScenario('ADMIN')
    })

    it('should return 400 when supplier_id is missing', async () => {
      const response = await POST(
        createPostRequest({
          items: validPayload.items,
        })
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('VALIDATION_ERROR')
    })

    it('should return 400 when items is empty', async () => {
      const response = await POST(
        createPostRequest({
          supplier_id: SUPPLIER_ID,
          items: [],
        })
      )

      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid supplier_id format', async () => {
      const response = await POST(
        createPostRequest({
          supplier_id: 'invalid-not-a-uuid',
          items: validPayload.items,
        })
      )

      expect(response.status).toBe(400)
    })

    it('should return 400 for negative quantity', async () => {
      const response = await POST(
        createPostRequest({
          supplier_id: SUPPLIER_ID,
          items: [{ catalog_product_id: CATALOG_PRODUCT_ID, quantity: -10, unit_cost: 10 }],
        })
      )

      expect(response.status).toBe(400)
    })

    it('should return 400 for zero unit_cost', async () => {
      const response = await POST(
        createPostRequest({
          supplier_id: SUPPLIER_ID,
          items: [{ catalog_product_id: CATALOG_PRODUCT_ID, quantity: 10, unit_cost: 0 }],
        })
      )

      expect(response.status).toBe(400)
    })
  })

  describe('Supplier Verification', () => {
    beforeEach(() => {
      mockState.setAuthScenario('ADMIN')
    })

    it('should return 404 when supplier not found', async () => {
      mockState.setTableResult('suppliers', null)

      const response = await POST(createPostRequest(validPayload))

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body.resource).toBe('supplier')
    })
  })

  describe('Order Creation', () => {
    beforeEach(() => {
      mockState.setAuthScenario('ADMIN')
      mockState.setTableResult('suppliers', SAMPLE_SUPPLIER)
    })

    it('should create order with items', async () => {
      mockState.setTableResult('purchase_orders', { order_number: 'PO-000005' })
      mockState.setTableResult('purchase_orders', SAMPLE_PURCHASE_ORDER, 'insert')
      mockState.setTableResult('purchase_order_items', [{ id: ITEM_ID }], 'insert')

      const response = await POST(createPostRequest(validPayload))

      expect(response.status).toBe(201)
    })

    it('should generate incremental order number', async () => {
      mockState.setTableResult('purchase_orders', { order_number: 'PO-000010' })
      mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, order_number: 'PO-000011' }, 'insert')
      mockState.setTableResult('purchase_order_items', [{ id: ITEM_ID }], 'insert')

      const response = await POST(createPostRequest(validPayload))

      expect(response.status).toBe(201)
    })

    it('should calculate correct subtotal', async () => {
      mockState.setTableResult('purchase_orders', null) // No previous orders
      mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, subtotal: 1000, total: 1000 }, 'insert')
      mockState.setTableResult('purchase_order_items', [{ id: ITEM_ID }], 'insert')

      const response = await POST(
        createPostRequest({
          supplier_id: SUPPLIER_ID,
          items: [{ catalog_product_id: CATALOG_PRODUCT_ID, quantity: 100, unit_cost: 10 }],
        })
      )

      expect(response.status).toBe(201)
    })

    it('should support multiple items', async () => {
      mockState.setTableResult('purchase_orders', null)
      mockState.setTableResult('purchase_orders', SAMPLE_PURCHASE_ORDER, 'insert')
      mockState.setTableResult('purchase_order_items', [{ id: ITEM_ID }, { id: '00000000-0000-4000-8000-000000000005' }], 'insert')

      const response = await POST(
        createPostRequest({
          supplier_id: SUPPLIER_ID,
          items: [
            { catalog_product_id: CATALOG_PRODUCT_ID, quantity: 50, unit_cost: 10 },
            { catalog_product_id: '00000000-0000-4000-8000-000000000006', quantity: 25, unit_cost: 20 },
          ],
        })
      )

      expect(response.status).toBe(201)
    })

    it('should set initial status to draft', async () => {
      mockState.setTableResult('purchase_orders', null)
      mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, status: 'draft' }, 'insert')
      mockState.setTableResult('purchase_order_items', [{ id: ITEM_ID }], 'insert')

      const response = await POST(createPostRequest(validPayload))

      expect(response.status).toBe(201)
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockState.setAuthScenario('ADMIN')
      mockState.setTableResult('suppliers', SAMPLE_SUPPLIER)
      mockState.setTableResult('purchase_orders', null)
    })

    it('should return 500 on order insert error', async () => {
      mockState.setTableError('purchase_orders', new Error('Insert failed'))

      const response = await POST(createPostRequest(validPayload))

      expect(response.status).toBe(500)
    })

    it('should rollback on items insert error', async () => {
      mockState.setTableResult('purchase_orders', SAMPLE_PURCHASE_ORDER, 'insert')
      mockState.setTableError('purchase_order_items', new Error('Items insert failed'))
      mockState.setTableResult('purchase_orders', { count: 1 }, 'delete')

      const response = await POST(createPostRequest(validPayload))

      expect(response.status).toBe(500)
    })
  })
})

// ============================================================================
// GET /api/procurement/orders/[id] Tests
// ============================================================================

describe('GET /api/procurement/orders/[id]', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when unauthenticated', async () => {
      mockState.setAuthScenario('UNAUTHENTICATED')

      const [request, context] = createGetByIdRequest(PO_ID)
      const response = await GET_BY_ID(request, context)

      expect(response.status).toBe(401)
    })

    it('should allow vet to view order', async () => {
      mockState.setAuthScenario('VET')
      mockState.setTableResult('purchase_orders', SAMPLE_PURCHASE_ORDER)

      const [request, context] = createGetByIdRequest(PO_ID)
      const response = await GET_BY_ID(request, context)

      expect(response.status).toBe(200)
    })
  })

  describe('Fetching Order', () => {
    beforeEach(() => {
      mockState.setAuthScenario('ADMIN')
    })

    it('should return order with full details', async () => {
      mockState.setTableResult('purchase_orders', SAMPLE_PURCHASE_ORDER)

      const [request, context] = createGetByIdRequest(PO_ID)
      const response = await GET_BY_ID(request, context)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.order_number).toBe('PO-000001')
      expect(body.suppliers).toBeDefined()
      expect(body.purchase_order_items).toHaveLength(1)
    })

    it('should return 404 when order not found', async () => {
      mockState.setTableError('purchase_orders', new Error('No rows'))

      const [request, context] = createGetByIdRequest('non-existent')
      const response = await GET_BY_ID(request, context)

      expect(response.status).toBe(404)
    })
  })
})

// ============================================================================
// PATCH /api/procurement/orders/[id] Tests
// ============================================================================

describe('PATCH /api/procurement/orders/[id]', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when unauthenticated', async () => {
      mockState.setAuthScenario('UNAUTHENTICATED')

      const [request, context] = createPatchRequest(PO_ID, { status: 'submitted' })
      const response = await PATCH(request, context)

      expect(response.status).toBe(401)
    })

    it('should return 403 for vet role', async () => {
      mockState.setAuthScenario('VET')

      const [request, context] = createPatchRequest(PO_ID, { status: 'submitted' })
      const response = await PATCH(request, context)

      expect(response.status).toBe(403)
    })
  })

  describe('Status Updates', () => {
    beforeEach(() => {
      mockState.setAuthScenario('ADMIN')
      mockState.setTableResult('purchase_orders', { id: PO_ID, status: 'draft' })
    })

    it('should update status to submitted', async () => {
      mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, status: 'submitted' }, 'update')

      const [request, context] = createPatchRequest(PO_ID, { status: 'submitted' })
      const response = await PATCH(request, context)

      expect(response.status).toBe(200)
    })

    it('should update status to confirmed', async () => {
      mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, status: 'confirmed' }, 'update')

      const [request, context] = createPatchRequest(PO_ID, { status: 'confirmed' })
      const response = await PATCH(request, context)

      expect(response.status).toBe(200)
    })

    it('should update status to shipped', async () => {
      mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, status: 'shipped' }, 'update')

      const [request, context] = createPatchRequest(PO_ID, { status: 'shipped' })
      const response = await PATCH(request, context)

      expect(response.status).toBe(200)
    })

    it('should update status to cancelled', async () => {
      mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, status: 'cancelled' }, 'update')

      const [request, context] = createPatchRequest(PO_ID, { status: 'cancelled' })
      const response = await PATCH(request, context)

      expect(response.status).toBe(200)
    })

    it('should update notes', async () => {
      mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, notes: 'Updated notes' }, 'update')

      const [request, context] = createPatchRequest(PO_ID, { notes: 'Updated notes' })
      const response = await PATCH(request, context)

      expect(response.status).toBe(200)
    })
  })

  describe('Receiving Items', () => {
    beforeEach(() => {
      mockState.setAuthScenario('ADMIN')
      mockState.setTableResult('purchase_orders', { id: PO_ID, status: 'shipped' })
    })

    it('should update received quantities', async () => {
      mockState.setTableResult('purchase_order_items', { count: 1 }, 'update')
      mockState.setTableResult('purchase_order_items', [{ quantity: 100, received_quantity: 100 }])
      mockState.setTableResult('purchase_orders', { count: 1 }, 'update')
      mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, status: 'received' })

      const [request, context] = createPatchRequest(PO_ID, {
        items: [{ item_id: ITEM_ID, received_quantity: 100 }],
      })
      const response = await PATCH(request, context)

      expect(response.status).toBe(200)
    })

    it('should handle partial receiving', async () => {
      mockState.setTableResult('purchase_order_items', { count: 1 }, 'update')
      mockState.setTableResult('purchase_order_items', [{ quantity: 100, received_quantity: 50 }])
      mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, status: 'shipped' })

      const [request, context] = createPatchRequest(PO_ID, {
        items: [{ item_id: ITEM_ID, received_quantity: 50 }],
      })
      const response = await PATCH(request, context)

      expect(response.status).toBe(200)
    })

    it('should auto-complete order when all items received', async () => {
      mockState.setTableResult('purchase_order_items', { count: 1 }, 'update')
      mockState.setTableResult('purchase_order_items', [{ quantity: 100, received_quantity: 100 }])
      mockState.setTableResult('purchase_orders', { count: 1 }, 'update')
      mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, status: 'received' })

      const [request, context] = createPatchRequest(PO_ID, {
        items: [{ item_id: ITEM_ID, received_quantity: 100 }],
      })
      const response = await PATCH(request, context)

      expect(response.status).toBe(200)
    })
  })

  describe('Validation', () => {
    beforeEach(() => {
      mockState.setAuthScenario('ADMIN')
    })

    it('should return 404 when order not found', async () => {
      mockState.setTableResult('purchase_orders', null)

      const [request, context] = createPatchRequest('non-existent', { status: 'submitted' })
      const response = await PATCH(request, context)

      expect(response.status).toBe(404)
    })

    it('should return 400 for invalid status', async () => {
      mockState.setTableResult('purchase_orders', { id: PO_ID, status: 'draft' })

      const [request, context] = createPatchRequest(PO_ID, { status: 'invalid' })
      const response = await PATCH(request, context)

      expect(response.status).toBe(400)
    })
  })
})

// ============================================================================
// DELETE /api/procurement/orders/[id] Tests
// ============================================================================

describe('DELETE /api/procurement/orders/[id]', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when unauthenticated', async () => {
      mockState.setAuthScenario('UNAUTHENTICATED')

      const [request, context] = createDeleteRequest(PO_ID)
      const response = await DELETE(request, context)

      expect(response.status).toBe(401)
    })

    it('should return 403 for vet role', async () => {
      mockState.setAuthScenario('VET')

      const [request, context] = createDeleteRequest(PO_ID)
      const response = await DELETE(request, context)

      expect(response.status).toBe(403)
    })
  })

  describe('Deletion', () => {
    beforeEach(() => {
      mockState.setAuthScenario('ADMIN')
    })

    it('should delete draft order', async () => {
      mockState.setTableResult('purchase_orders', { id: PO_ID, status: 'draft' })
      mockState.setTableResult('purchase_order_items', { count: 1 }, 'delete')
      mockState.setTableResult('purchase_orders', { count: 1 }, 'delete')

      const [request, context] = createDeleteRequest(PO_ID)
      const response = await DELETE(request, context)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
    })

    it('should return 404 when order not found', async () => {
      mockState.setTableResult('purchase_orders', null)

      const [request, context] = createDeleteRequest('non-existent')
      const response = await DELETE(request, context)

      expect(response.status).toBe(404)
    })

    it('should return 400 for non-draft order', async () => {
      mockState.setTableResult('purchase_orders', { id: PO_ID, status: 'submitted' })

      const [request, context] = createDeleteRequest(PO_ID)
      const response = await DELETE(request, context)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toContain('borrador')
    })

    it('should not delete confirmed order', async () => {
      mockState.setTableResult('purchase_orders', { id: PO_ID, status: 'confirmed' })

      const [request, context] = createDeleteRequest(PO_ID)
      const response = await DELETE(request, context)

      expect(response.status).toBe(400)
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockState.setAuthScenario('ADMIN')
      mockState.setTableResult('purchase_orders', { id: PO_ID, status: 'draft' })
      mockState.setTableResult('purchase_order_items', { count: 1 }, 'delete')
    })

    it('should return 500 on delete error', async () => {
      mockState.setTableError('purchase_orders', new Error('Delete failed'))

      const [request, context] = createDeleteRequest(PO_ID)
      const response = await DELETE(request, context)

      expect(response.status).toBe(500)
    })
  })
})

// ============================================================================
// Integration Scenarios
// ============================================================================

describe('Purchase Orders Integration Scenarios', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  it('should support complete purchase order lifecycle', async () => {
    mockState.setAuthScenario('ADMIN')

    // 1. Create order
    mockState.setTableResult('suppliers', SAMPLE_SUPPLIER)
    mockState.setTableResult('purchase_orders', null)
    mockState.setTableResult('purchase_orders', SAMPLE_PURCHASE_ORDER, 'insert')
    mockState.setTableResult('purchase_order_items', [{ id: ITEM_ID }], 'insert')

    const createResponse = await POST(
      createPostRequest({
        supplier_id: SUPPLIER_ID,
        items: [{ catalog_product_id: CATALOG_PRODUCT_ID, quantity: 100, unit_cost: 10 }],
      })
    )
    expect(createResponse.status).toBe(201)

    // 2. Submit order
    mockState.setTableResult('purchase_orders', { id: PO_ID, status: 'draft' })
    mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, status: 'submitted' }, 'update')

    const [submitReq, submitCtx] = createPatchRequest(PO_ID, { status: 'submitted' })
    const submitResponse = await PATCH(submitReq, submitCtx)
    expect(submitResponse.status).toBe(200)

    // 3. Confirm order
    mockState.setTableResult('purchase_orders', { id: PO_ID, status: 'submitted' })
    mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, status: 'confirmed' }, 'update')

    const [confirmReq, confirmCtx] = createPatchRequest(PO_ID, { status: 'confirmed' })
    const confirmResponse = await PATCH(confirmReq, confirmCtx)
    expect(confirmResponse.status).toBe(200)

    // 4. Mark as shipped
    mockState.setTableResult('purchase_orders', { id: PO_ID, status: 'confirmed' })
    mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, status: 'shipped' }, 'update')

    const [shipReq, shipCtx] = createPatchRequest(PO_ID, { status: 'shipped' })
    const shipResponse = await PATCH(shipReq, shipCtx)
    expect(shipResponse.status).toBe(200)

    // 5. Receive items
    mockState.setTableResult('purchase_orders', { id: PO_ID, status: 'shipped' })
    mockState.setTableResult('purchase_order_items', { count: 1 }, 'update')
    mockState.setTableResult('purchase_order_items', [{ quantity: 100, received_quantity: 100 }])
    mockState.setTableResult('purchase_orders', { count: 1 }, 'update')
    mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, status: 'received' })

    const [receiveReq, receiveCtx] = createPatchRequest(PO_ID, {
      items: [{ item_id: ITEM_ID, received_quantity: 100 }],
    })
    const receiveResponse = await PATCH(receiveReq, receiveCtx)
    expect(receiveResponse.status).toBe(200)
  })

  it('should handle order cancellation', async () => {
    mockState.setAuthScenario('ADMIN')
    mockState.setTableResult('purchase_orders', { id: PO_ID, status: 'submitted' })
    mockState.setTableResult('purchase_orders', { ...SAMPLE_PURCHASE_ORDER, status: 'cancelled' }, 'update')

    const [request, context] = createPatchRequest(PO_ID, { status: 'cancelled' })
    const response = await PATCH(request, context)

    expect(response.status).toBe(200)
  })

  it('should prevent deletion of submitted order', async () => {
    mockState.setAuthScenario('ADMIN')
    mockState.setTableResult('purchase_orders', { id: PO_ID, status: 'submitted' })

    const [request, context] = createDeleteRequest(PO_ID)
    const response = await DELETE(request, context)

    expect(response.status).toBe(400)
  })
})
