/**
 * Cron Stock Alerts API Tests
 *
 * Tests for:
 * - GET /api/cron/stock-alerts (customer alerts)
 * - GET /api/cron/stock-alerts/staff (staff alerts)
 *
 * These cron jobs send notifications when products are back in stock
 * or when stock is running low.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as getCustomerAlerts } from '@/app/api/cron/stock-alerts/route'
import { GET as getStaffAlerts } from '@/app/api/cron/stock-alerts/staff/route'
import {
  mockState,
  TENANTS,
  USERS,
  CRON_SECRETS,
  resetAllMocks,
  createStatefulSupabaseMock,
} from '@/lib/test-utils'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(createStatefulSupabaseMock())),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

// Mock email sending
vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}))

// Store original env
const originalEnv = process.env

// Helper to create request with optional auth
function createRequest(
  path: string,
  options?: { authHeader?: string; cronSecretHeader?: string }
): NextRequest {
  const headers: HeadersInit = {}
  if (options?.authHeader) {
    headers['authorization'] = options.authHeader
  }
  if (options?.cronSecretHeader) {
    headers['x-cron-secret'] = options.cronSecretHeader
  }

  return new NextRequest(`http://localhost:3000${path}`, {
    method: 'GET',
    headers,
  })
}

// Sample stock alert data
const SAMPLE_STOCK_ALERT = {
  id: 'alert-001',
  tenant_id: TENANTS.ADRIS.id,
  product_id: 'product-001',
  email: 'customer@example.com',
  notified: false,
  created_at: new Date().toISOString(),
  product: {
    id: 'product-001',
    name: 'Dog Food Premium',
    base_price: 50000,
    sku: 'DOG-FOOD-001',
  },
}

const SAMPLE_LOW_STOCK_PRODUCT = {
  id: 'product-002',
  tenant_id: TENANTS.ADRIS.id,
  name: 'Cat Food Gourmet',
  sku: 'CAT-FOOD-001',
  base_price: 45000,
  is_active: true,
  inventory: {
    stock_quantity: 5,
    reorder_point: 10,
  },
}

const SAMPLE_STAFF_PROFILE = {
  id: USERS.VET_CARLOS.id,
  email: USERS.VET_CARLOS.email,
  full_name: USERS.VET_CARLOS.fullName,
  tenant_id: TENANTS.ADRIS.id,
  role: 'admin',
}

// ============================================================================
// Customer Stock Alerts Tests
// ============================================================================

describe('GET /api/cron/stock-alerts (Customer)', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
    process.env = { ...originalEnv, CRON_SECRET: CRON_SECRETS.VALID }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Authentication', () => {
    it('should return 401 without authorization', async () => {
      const response = await getCustomerAlerts(
        createRequest('/api/cron/stock-alerts')
      )

      expect(response.status).toBe(401)
    })

    it('should accept valid cron secret', async () => {
      mockState.setTableResult('store_stock_alerts', [])

      const response = await getCustomerAlerts(
        createRequest('/api/cron/stock-alerts', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(200)
    })
  })

  describe('No Pending Alerts', () => {
    it('should return success when no alerts pending', async () => {
      mockState.setTableResult('store_stock_alerts', [])

      const response = await getCustomerAlerts(
        createRequest('/api/cron/stock-alerts', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.processed).toBe(0)
    })
  })

  describe('Alert Processing', () => {
    it('should find products with stock alerts', async () => {
      mockState.setTableResult('store_stock_alerts', [SAMPLE_STOCK_ALERT])
      mockState.setTableResult('store_inventory', [
        { product_id: 'product-001', stock_quantity: 10 },
      ])

      const response = await getCustomerAlerts(
        createRequest('/api/cron/stock-alerts', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(200)
    })

    it('should skip alerts for products still out of stock', async () => {
      mockState.setTableResult('store_stock_alerts', [SAMPLE_STOCK_ALERT])
      mockState.setTableResult('store_inventory', [
        { product_id: 'product-001', stock_quantity: 0 },
      ])

      const response = await getCustomerAlerts(
        createRequest('/api/cron/stock-alerts', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.processed).toBe(0)
    })

    it('should mark alerts as notified after sending', async () => {
      mockState.setTableResult('store_stock_alerts', [SAMPLE_STOCK_ALERT])
      mockState.setTableResult('store_inventory', [
        { product_id: 'product-001', stock_quantity: 10 },
      ])

      const response = await getCustomerAlerts(
        createRequest('/api/cron/stock-alerts', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(200)
    })

    it('should send email for back-in-stock products', async () => {
      const { sendEmail } = await import('@/lib/email/send')
      mockState.setTableResult('store_stock_alerts', [SAMPLE_STOCK_ALERT])
      mockState.setTableResult('store_inventory', [
        { product_id: 'product-001', stock_quantity: 10 },
      ])

      await getCustomerAlerts(
        createRequest('/api/cron/stock-alerts', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(sendEmail).toHaveBeenCalled()
    })

    it('should process multiple alerts', async () => {
      mockState.setTableResult('store_stock_alerts', [
        SAMPLE_STOCK_ALERT,
        { ...SAMPLE_STOCK_ALERT, id: 'alert-002', email: 'another@example.com' },
      ])
      mockState.setTableResult('store_inventory', [
        { product_id: 'product-001', stock_quantity: 10 },
      ])

      const response = await getCustomerAlerts(
        createRequest('/api/cron/stock-alerts', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(200)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      mockState.setTableError('store_stock_alerts', new Error('Database error'))

      const response = await getCustomerAlerts(
        createRequest('/api/cron/stock-alerts', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(500)
    })

    it('should continue processing if one email fails', async () => {
      const { sendEmail } = await import('@/lib/email/send')
      vi.mocked(sendEmail)
        .mockResolvedValueOnce({ success: false, error: 'SMTP error' })
        .mockResolvedValueOnce({ success: true })

      mockState.setTableResult('store_stock_alerts', [
        SAMPLE_STOCK_ALERT,
        { ...SAMPLE_STOCK_ALERT, id: 'alert-002', email: 'another@example.com' },
      ])
      mockState.setTableResult('store_inventory', [
        { product_id: 'product-001', stock_quantity: 10 },
      ])

      const response = await getCustomerAlerts(
        createRequest('/api/cron/stock-alerts', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(200)
    })
  })

  describe('Response Format', () => {
    it('should return all required fields', async () => {
      mockState.setTableResult('store_stock_alerts', [])

      const response = await getCustomerAlerts(
        createRequest('/api/cron/stock-alerts', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(200)
      const body = await response.json()

      expect(body).toHaveProperty('success')
      expect(body).toHaveProperty('processed')
      expect(body).toHaveProperty('timestamp')
    })
  })
})

// ============================================================================
// Staff Stock Alerts Tests
// ============================================================================

describe('GET /api/cron/stock-alerts/staff', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
    process.env = { ...originalEnv, CRON_SECRET: CRON_SECRETS.VALID }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Authentication', () => {
    it('should return 401 without authorization', async () => {
      const response = await getStaffAlerts(
        createRequest('/api/cron/stock-alerts/staff')
      )

      expect(response.status).toBe(401)
    })

    it('should accept valid cron secret', async () => {
      mockState.setTableResult('store_products', [])
      mockState.setTableResult('profiles', [])

      const response = await getStaffAlerts(
        createRequest('/api/cron/stock-alerts/staff', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(200)
    })
  })

  describe('No Low Stock Products', () => {
    it('should return success when no low stock', async () => {
      mockState.setTableResult('store_products', [])

      const response = await getStaffAlerts(
        createRequest('/api/cron/stock-alerts/staff', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.tenants_notified).toBe(0)
    })
  })

  describe('Low Stock Detection', () => {
    it('should find products below reorder point', async () => {
      mockState.setTableResult('store_products', [SAMPLE_LOW_STOCK_PRODUCT])
      mockState.setTableResult('profiles', [SAMPLE_STAFF_PROFILE])

      const response = await getStaffAlerts(
        createRequest('/api/cron/stock-alerts/staff', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(200)
    })

    it('should group alerts by tenant', async () => {
      mockState.setTableResult('store_products', [
        SAMPLE_LOW_STOCK_PRODUCT,
        { ...SAMPLE_LOW_STOCK_PRODUCT, id: 'product-003' },
      ])
      mockState.setTableResult('profiles', [SAMPLE_STAFF_PROFILE])

      const response = await getStaffAlerts(
        createRequest('/api/cron/stock-alerts/staff', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(200)
    })

    it('should send email to admin staff', async () => {
      const { sendEmail } = await import('@/lib/email/send')
      mockState.setTableResult('store_products', [SAMPLE_LOW_STOCK_PRODUCT])
      mockState.setTableResult('profiles', [SAMPLE_STAFF_PROFILE])

      await getStaffAlerts(
        createRequest('/api/cron/stock-alerts/staff', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(sendEmail).toHaveBeenCalled()
    })

    it('should skip tenants with no admin staff', async () => {
      mockState.setTableResult('store_products', [SAMPLE_LOW_STOCK_PRODUCT])
      mockState.setTableResult('profiles', []) // No admin profiles

      const response = await getStaffAlerts(
        createRequest('/api/cron/stock-alerts/staff', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.tenants_notified).toBe(0)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      mockState.setTableError('store_products', new Error('Database error'))

      const response = await getStaffAlerts(
        createRequest('/api/cron/stock-alerts/staff', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(500)
    })

    it('should log errors', async () => {
      const { logger } = await import('@/lib/logger')
      mockState.setTableError('store_products', new Error('Failed'))

      await getStaffAlerts(
        createRequest('/api/cron/stock-alerts/staff', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(logger.error).toHaveBeenCalled()
    })
  })

  describe('Response Format', () => {
    it('should return all required fields', async () => {
      mockState.setTableResult('store_products', [])

      const response = await getStaffAlerts(
        createRequest('/api/cron/stock-alerts/staff', {
          authHeader: `Bearer ${CRON_SECRETS.VALID}`,
        })
      )

      expect(response.status).toBe(200)
      const body = await response.json()

      expect(body).toHaveProperty('success')
      expect(body).toHaveProperty('tenants_notified')
      expect(body).toHaveProperty('products_below_reorder')
      expect(body).toHaveProperty('timestamp')
    })
  })
})
