/**
 * Stock Alerts API Tests
 *
 * Tests for:
 * - POST /api/store/stock-alerts - Create stock alert
 * - DELETE /api/store/stock-alerts - Remove stock alert
 *
 * This route handles "notify me when available" functionality.
 * Allows both authenticated and unauthenticated users to subscribe
 * for stock availability notifications.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, DELETE } from '@/app/api/store/stock-alerts/route'
import {
  mockState,
  TENANTS,
  USERS,
  PRODUCTS,
  resetAllMocks,
  createStatefulSupabaseMock,
} from '@/lib/test-utils'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(createStatefulSupabaseMock())),
}))

// Mock API error helpers
vi.mock('@/lib/api/errors', () => ({
  apiError: (code: string, status: number, options?: { details?: Record<string, unknown> }) => {
    const { NextResponse } = require('next/server')
    return NextResponse.json(
      { error: code, ...options?.details },
      { status }
    )
  },
  HTTP_STATUS: {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
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

// Helper to create POST request
function createPostRequest(body: {
  product_id?: string
  clinic?: string
  email?: string
  variant_id?: string
}): NextRequest {
  return new NextRequest('http://localhost:3000/api/store/stock-alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// Helper to create DELETE request
function createDeleteRequest(params: { id?: string; email?: string }): NextRequest {
  const searchParams = new URLSearchParams()
  if (params.id) searchParams.set('id', params.id)
  if (params.email) searchParams.set('email', params.email)

  return new NextRequest(`http://localhost:3000/api/store/stock-alerts?${searchParams.toString()}`, {
    method: 'DELETE',
  })
}

// Sample alert result
const SAMPLE_ALERT = {
  id: 'alert-001',
  product_id: PRODUCTS.OUT_OF_STOCK.id,
  tenant_id: TENANTS.ADRIS.id,
  user_id: USERS.OWNER.id,
  email: 'owner@example.com',
  variant_id: null,
  notified: false,
  created_at: '2026-01-01T10:00:00Z',
}

// ============================================================================
// POST Tests - Create Stock Alert
// ============================================================================

describe('POST /api/store/stock-alerts', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should allow unauthenticated users to create alerts', async () => {
      mockState.setAuthScenario('UNAUTHENTICATED')
      // No existing alert
      mockState.setTableResult('store_stock_alerts', null, 'select')
      // Insert success
      mockState.setTableResult('store_stock_alerts', SAMPLE_ALERT, 'insert')

      const response = await POST(createPostRequest({
        product_id: PRODUCTS.OUT_OF_STOCK.id,
        clinic: TENANTS.ADRIS.id,
        email: 'guest@example.com',
      }))

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
    })

    it('should allow authenticated users to create alerts', async () => {
      mockState.setAuthScenario('OWNER')
      mockState.setTableResult('store_stock_alerts', null, 'select')
      mockState.setTableResult('store_stock_alerts', SAMPLE_ALERT, 'insert')

      const response = await POST(createPostRequest({
        product_id: PRODUCTS.OUT_OF_STOCK.id,
        clinic: TENANTS.ADRIS.id,
        email: 'owner@example.com',
      }))

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
    })
  })

  describe('Validation', () => {
    it('should return 400 when product_id is missing', async () => {
      mockState.setAuthScenario('OWNER')

      const response = await POST(createPostRequest({
        clinic: TENANTS.ADRIS.id,
        email: 'test@example.com',
      }))

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe('Faltan parámetros requeridos')
    })

    it('should return 400 when clinic is missing', async () => {
      mockState.setAuthScenario('OWNER')

      const response = await POST(createPostRequest({
        product_id: PRODUCTS.OUT_OF_STOCK.id,
        email: 'test@example.com',
      }))

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe('Faltan parámetros requeridos')
    })

    it('should return 400 when email is missing', async () => {
      mockState.setAuthScenario('OWNER')

      const response = await POST(createPostRequest({
        product_id: PRODUCTS.OUT_OF_STOCK.id,
        clinic: TENANTS.ADRIS.id,
      }))

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe('Faltan parámetros requeridos')
    })

    it('should return 400 for invalid email format', async () => {
      mockState.setAuthScenario('OWNER')

      const response = await POST(createPostRequest({
        product_id: PRODUCTS.OUT_OF_STOCK.id,
        clinic: TENANTS.ADRIS.id,
        email: 'invalid-email',
      }))

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe('Email inválido')
    })

    it('should return 400 for email without domain', async () => {
      mockState.setAuthScenario('OWNER')

      const response = await POST(createPostRequest({
        product_id: PRODUCTS.OUT_OF_STOCK.id,
        clinic: TENANTS.ADRIS.id,
        email: 'test@',
      }))

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe('Email inválido')
    })
  })

  describe('Duplicate Handling', () => {
    it('should return 409 when alert already exists', async () => {
      mockState.setAuthScenario('OWNER')
      // Return existing alert
      mockState.setTableResult('store_stock_alerts', { id: 'existing-alert' }, 'select')

      const response = await POST(createPostRequest({
        product_id: PRODUCTS.OUT_OF_STOCK.id,
        clinic: TENANTS.ADRIS.id,
        email: 'owner@example.com',
      }))

      expect(response.status).toBe(409)
      const body = await response.json()
      expect(body.message).toBe('Ya estás suscrito para recibir alertas de este producto')
    })
  })

  describe('Successful Creation', () => {
    it('should create alert with all required fields', async () => {
      mockState.setAuthScenario('OWNER')
      mockState.setTableResult('store_stock_alerts', null, 'select')
      mockState.setTableResult('store_stock_alerts', SAMPLE_ALERT, 'insert')

      const response = await POST(createPostRequest({
        product_id: PRODUCTS.OUT_OF_STOCK.id,
        clinic: TENANTS.ADRIS.id,
        email: 'owner@example.com',
      }))

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.alert).toBeDefined()
    })

    it('should create alert with variant_id', async () => {
      mockState.setAuthScenario('OWNER')
      mockState.setTableResult('store_stock_alerts', null, 'select')
      mockState.setTableResult('store_stock_alerts', {
        ...SAMPLE_ALERT,
        variant_id: 'variant-001',
      }, 'insert')

      const response = await POST(createPostRequest({
        product_id: PRODUCTS.OUT_OF_STOCK.id,
        clinic: TENANTS.ADRIS.id,
        email: 'owner@example.com',
        variant_id: 'variant-001',
      }))

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
    })

    it('should set notified to false on creation', async () => {
      mockState.setAuthScenario('UNAUTHENTICATED')
      mockState.setTableResult('store_stock_alerts', null, 'select')
      mockState.setTableResult('store_stock_alerts', {
        ...SAMPLE_ALERT,
        notified: false,
      }, 'insert')

      const response = await POST(createPostRequest({
        product_id: PRODUCTS.OUT_OF_STOCK.id,
        clinic: TENANTS.ADRIS.id,
        email: 'guest@example.com',
      }))

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.alert.notified).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      mockState.setAuthScenario('OWNER')
      mockState.setTableResult('store_stock_alerts', null, 'select')
      mockState.setTableError('store_stock_alerts', new Error('Database error'))

      const response = await POST(createPostRequest({
        product_id: PRODUCTS.OUT_OF_STOCK.id,
        clinic: TENANTS.ADRIS.id,
        email: 'owner@example.com',
      }))

      expect(response.status).toBe(500)
      const body = await response.json()
      expect(body.message).toBe('No se pudo crear la alerta')
    })

    it('should log database errors', async () => {
      const { logger } = await import('@/lib/logger')
      mockState.setAuthScenario('OWNER')
      mockState.setTableResult('store_stock_alerts', null, 'select')
      mockState.setTableError('store_stock_alerts', new Error('Connection failed'))

      await POST(createPostRequest({
        product_id: PRODUCTS.OUT_OF_STOCK.id,
        clinic: TENANTS.ADRIS.id,
        email: 'owner@example.com',
      }))

      expect(logger.error).toHaveBeenCalled()
    })
  })
})

// ============================================================================
// DELETE Tests - Remove Stock Alert
// ============================================================================

describe('DELETE /api/store/stock-alerts', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  describe('Validation', () => {
    it('should return 400 when neither id nor email provided', async () => {
      const response = await DELETE(createDeleteRequest({}))

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe('Falta id o email')
    })
  })

  describe('Delete by ID', () => {
    it('should delete alert by id', async () => {
      mockState.setTableResult('store_stock_alerts', { count: 1 })

      const response = await DELETE(createDeleteRequest({ id: 'alert-001' }))

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
    })

    it('should succeed even if alert not found', async () => {
      mockState.setTableResult('store_stock_alerts', { count: 0 })

      const response = await DELETE(createDeleteRequest({ id: 'non-existent' }))

      expect(response.status).toBe(200)
    })
  })

  describe('Delete by Email', () => {
    it('should delete all alerts for email', async () => {
      mockState.setTableResult('store_stock_alerts', { count: 5 })

      const response = await DELETE(createDeleteRequest({ email: 'owner@example.com' }))

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      mockState.setTableError('store_stock_alerts', new Error('Database error'))

      const response = await DELETE(createDeleteRequest({ id: 'alert-001' }))

      expect(response.status).toBe(500)
      const body = await response.json()
      expect(body.message).toBe('No se pudo eliminar la alerta')
    })

    it('should log database errors', async () => {
      const { logger } = await import('@/lib/logger')
      mockState.setTableError('store_stock_alerts', new Error('Connection failed'))

      await DELETE(createDeleteRequest({ id: 'alert-001' }))

      expect(logger.error).toHaveBeenCalled()
    })
  })
})

// ============================================================================
// Integration Scenarios
// ============================================================================

describe('Stock Alerts Integration Scenarios', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  it('should support subscribe then unsubscribe workflow', async () => {
    mockState.setAuthScenario('OWNER')

    // Subscribe
    mockState.setTableResult('store_stock_alerts', null, 'select')
    mockState.setTableResult('store_stock_alerts', SAMPLE_ALERT, 'insert')

    const createResponse = await POST(createPostRequest({
      product_id: PRODUCTS.OUT_OF_STOCK.id,
      clinic: TENANTS.ADRIS.id,
      email: 'owner@example.com',
    }))
    expect(createResponse.status).toBe(200)

    // Unsubscribe
    mockState.setTableResult('store_stock_alerts', { count: 1 })
    const deleteResponse = await DELETE(createDeleteRequest({ email: 'owner@example.com' }))
    expect(deleteResponse.status).toBe(200)
  })

  it('should handle guest user complete flow', async () => {
    mockState.setAuthScenario('UNAUTHENTICATED')

    // Guest subscribes
    mockState.setTableResult('store_stock_alerts', null, 'select')
    mockState.setTableResult('store_stock_alerts', {
      ...SAMPLE_ALERT,
      user_id: null,
      email: 'guest@example.com',
    }, 'insert')

    const createResponse = await POST(createPostRequest({
      product_id: PRODUCTS.OUT_OF_STOCK.id,
      clinic: TENANTS.ADRIS.id,
      email: 'guest@example.com',
    }))

    expect(createResponse.status).toBe(200)
    const body = await createResponse.json()
    expect(body.alert.user_id).toBeNull()
  })

  it('should support multiple products for same email', async () => {
    mockState.setAuthScenario('OWNER')

    // First product subscription
    mockState.setTableResult('store_stock_alerts', null, 'select')
    mockState.setTableResult('store_stock_alerts', SAMPLE_ALERT, 'insert')

    const response1 = await POST(createPostRequest({
      product_id: PRODUCTS.OUT_OF_STOCK.id,
      clinic: TENANTS.ADRIS.id,
      email: 'owner@example.com',
    }))
    expect(response1.status).toBe(200)

    // Second product subscription (different product)
    mockState.setTableResult('store_stock_alerts', null, 'select')
    mockState.setTableResult('store_stock_alerts', {
      ...SAMPLE_ALERT,
      id: 'alert-002',
      product_id: PRODUCTS.DOG_FOOD.id,
    }, 'insert')

    const response2 = await POST(createPostRequest({
      product_id: PRODUCTS.DOG_FOOD.id,
      clinic: TENANTS.ADRIS.id,
      email: 'owner@example.com',
    }))
    expect(response2.status).toBe(200)
  })

  it('should handle variant-specific alerts', async () => {
    mockState.setAuthScenario('OWNER')
    mockState.setTableResult('store_stock_alerts', null, 'select')
    mockState.setTableResult('store_stock_alerts', {
      ...SAMPLE_ALERT,
      variant_id: 'size-large',
    }, 'insert')

    const response = await POST(createPostRequest({
      product_id: PRODUCTS.OUT_OF_STOCK.id,
      clinic: TENANTS.ADRIS.id,
      email: 'owner@example.com',
      variant_id: 'size-large',
    }))

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.alert.variant_id).toBe('size-large')
  })
})
