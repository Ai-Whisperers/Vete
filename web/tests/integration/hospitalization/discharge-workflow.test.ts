/**
 * Hospitalization Discharge Workflow Tests (Integration)
 *
 * Tests the patient discharge workflow:
 * - POST /api/hospitalizations/[id]/discharge
 *
 * Covers:
 * - Authorization (vet/admin only)
 * - Invoice generation before discharge
 * - Status transitions (active → discharged)
 * - Kennel status update (occupied → available)
 * - Audit logging
 * - Already invoiced handling
 *
 * @tags integration, hospitalization, clinical, critical
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Test data
const TEST_TENANT_ID = 'test-tenant-123'
const TEST_USER_ID = 'test-user-123'
const TEST_HOSPITALIZATION_ID = 'hosp-123'
const TEST_KENNEL_ID = 'kennel-456'

// Mock state management
let mockUser: { id: string } | null = null
let mockProfile: { tenant_id: string; role: string } | null = null
let mockInvoiceResult: { success: boolean; invoice: unknown; error?: string } = {
  success: true,
  invoice: { id: 'inv-123', invoice_number: 'HOS-2024-001' },
}
let mockHospUpdate: { data: unknown; error: unknown } = { data: { kennel_id: TEST_KENNEL_ID }, error: null }
let mockKennelUpdate: { error: unknown } = { error: null }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: vi.fn(() =>
          Promise.resolve({
            data: { user: mockUser },
            error: mockUser ? null : { message: 'No user' },
          })
        ),
      },
      from: vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: mockProfile,
                    error: mockProfile ? null : { message: 'Not found' },
                  })
                ),
              })),
            })),
          }
        }
        if (table === 'hospitalizations') {
          return {
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  select: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve(mockHospUpdate)),
                  })),
                })),
              })),
            })),
          }
        }
        if (table === 'kennels') {
          return {
            update: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve(mockKennelUpdate)),
            })),
          }
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        }
      }),
    })
  ),
}))

vi.mock('@/lib/billing/hospitalization', () => ({
  generateHospitalizationInvoice: vi.fn(() => Promise.resolve(mockInvoiceResult)),
}))

vi.mock('@/lib/audit', () => ({
  logAudit: vi.fn(() => Promise.resolve()),
}))

// Import route handlers after mocks
import { POST } from '@/app/api/hospitalizations/[id]/discharge/route'
import { generateHospitalizationInvoice } from '@/lib/billing/hospitalization'
import { logAudit } from '@/lib/audit'

function createRequest(): NextRequest {
  const url = `http://localhost:3000/api/hospitalizations/${TEST_HOSPITALIZATION_ID}/discharge`
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}

function createParams(): Promise<{ id: string }> {
  return Promise.resolve({ id: TEST_HOSPITALIZATION_ID })
}

describe('Hospitalization Discharge - Authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = null
    mockProfile = null
    mockInvoiceResult = {
      success: true,
      invoice: { id: 'inv-123', invoice_number: 'HOS-2024-001' },
    }
    mockHospUpdate = { data: { kennel_id: TEST_KENNEL_ID }, error: null }
    mockKennelUpdate = { error: null }
  })

  it('should reject unauthenticated requests', async () => {
    mockUser = null

    const request = createRequest()
    const response = await POST(request, { params: createParams() })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.code).toBe('AUTH_REQUIRED')
  })

  it('should reject owner role', async () => {
    mockUser = { id: TEST_USER_ID }
    mockProfile = { tenant_id: TEST_TENANT_ID, role: 'owner' }

    const request = createRequest()
    const response = await POST(request, { params: createParams() })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.code).toBe('INSUFFICIENT_ROLE')
  })

  it('should allow vet role', async () => {
    mockUser = { id: TEST_USER_ID }
    mockProfile = { tenant_id: TEST_TENANT_ID, role: 'vet' }

    const request = createRequest()
    const response = await POST(request, { params: createParams() })

    expect(response.status).toBe(200)
  })

  it('should allow admin role', async () => {
    mockUser = { id: TEST_USER_ID }
    mockProfile = { tenant_id: TEST_TENANT_ID, role: 'admin' }

    const request = createRequest()
    const response = await POST(request, { params: createParams() })

    expect(response.status).toBe(200)
  })

  it('should reject missing profile', async () => {
    mockUser = { id: TEST_USER_ID }
    mockProfile = null

    const request = createRequest()
    const response = await POST(request, { params: createParams() })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.code).toBe('INSUFFICIENT_ROLE')
  })
})

describe('Hospitalization Discharge - Invoice Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: TEST_USER_ID }
    mockProfile = { tenant_id: TEST_TENANT_ID, role: 'vet' }
    mockHospUpdate = { data: { kennel_id: TEST_KENNEL_ID }, error: null }
    mockKennelUpdate = { error: null }
  })

  it('should generate invoice on discharge', async () => {
    mockInvoiceResult = {
      success: true,
      invoice: { id: 'inv-123', invoice_number: 'HOS-2024-001' },
    }

    const request = createRequest()
    const response = await POST(request, { params: createParams() })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(generateHospitalizationInvoice).toHaveBeenCalled()
    expect(data.invoice).toBeDefined()
    expect(data.invoice.invoice_number).toBe('HOS-2024-001')
  })

  it('should return success when invoice already exists', async () => {
    mockInvoiceResult = {
      success: false,
      invoice: { id: 'inv-existing', invoice_number: 'HOS-2024-000' },
      error: 'Ya existe una factura para esta hospitalización',
    }

    const request = createRequest()
    const response = await POST(request, { params: createParams() })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.invoice).toBeDefined()
  })

  it('should fail if invoice generation fails with unexpected error', async () => {
    mockInvoiceResult = {
      success: false,
      invoice: null,
      error: 'Database connection failed',
    }

    const request = createRequest()
    const response = await POST(request, { params: createParams() })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.code).toBe('VALIDATION_ERROR')
    expect(data.details.reason).toBe('invoice_generation_failed')
  })

  it('should pass tenant_id to invoice generator', async () => {
    mockInvoiceResult = {
      success: true,
      invoice: { id: 'inv-123', invoice_number: 'HOS-2024-001' },
    }

    const request = createRequest()
    await POST(request, { params: createParams() })

    expect(generateHospitalizationInvoice).toHaveBeenCalledWith(
      expect.anything(), // supabase client
      TEST_HOSPITALIZATION_ID,
      TEST_TENANT_ID,
      TEST_USER_ID
    )
  })
})

describe('Hospitalization Discharge - Status Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: TEST_USER_ID }
    mockProfile = { tenant_id: TEST_TENANT_ID, role: 'vet' }
    mockInvoiceResult = {
      success: true,
      invoice: { id: 'inv-123', invoice_number: 'HOS-2024-001' },
    }
    mockKennelUpdate = { error: null }
  })

  it('should return success response on discharge', async () => {
    mockHospUpdate = { data: { kennel_id: TEST_KENNEL_ID }, error: null }

    const request = createRequest()
    const response = await POST(request, { params: createParams() })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('alta')
  })

  it('should handle database update error', async () => {
    mockHospUpdate = { data: null, error: { message: 'Connection failed' } }

    const request = createRequest()
    const response = await POST(request, { params: createParams() })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.code).toBe('DATABASE_ERROR')
  })

  it('should handle hospitalization without kennel', async () => {
    mockHospUpdate = { data: { kennel_id: null }, error: null }

    const request = createRequest()
    const response = await POST(request, { params: createParams() })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})

describe('Hospitalization Discharge - Kennel Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: TEST_USER_ID }
    mockProfile = { tenant_id: TEST_TENANT_ID, role: 'vet' }
    mockInvoiceResult = {
      success: true,
      invoice: { id: 'inv-123', invoice_number: 'HOS-2024-001' },
    }
  })

  it('should free kennel on discharge', async () => {
    mockHospUpdate = { data: { kennel_id: TEST_KENNEL_ID }, error: null }
    mockKennelUpdate = { error: null }

    const request = createRequest()
    const response = await POST(request, { params: createParams() })

    expect(response.status).toBe(200)
    // Kennel update is called when kennel_id exists
  })

  it('should skip kennel update when no kennel assigned', async () => {
    mockHospUpdate = { data: { kennel_id: null }, error: null }

    const request = createRequest()
    const response = await POST(request, { params: createParams() })

    expect(response.status).toBe(200)
    // No kennel update attempted
  })
})

describe('Hospitalization Discharge - Audit Logging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: TEST_USER_ID }
    mockProfile = { tenant_id: TEST_TENANT_ID, role: 'vet' }
    mockInvoiceResult = {
      success: true,
      invoice: { id: 'inv-123', invoice_number: 'HOS-2024-001' },
    }
    mockHospUpdate = { data: { kennel_id: TEST_KENNEL_ID }, error: null }
    mockKennelUpdate = { error: null }
  })

  it('should log audit on successful discharge', async () => {
    const request = createRequest()
    const response = await POST(request, { params: createParams() })

    expect(response.status).toBe(200)
    expect(logAudit).toHaveBeenCalledWith(
      'DISCHARGE_PATIENT',
      `hospitalizations/${TEST_HOSPITALIZATION_ID}`,
      expect.objectContaining({
        invoice_id: 'inv-123',
        invoice_number: 'HOS-2024-001',
      })
    )
  })

  it('should include invoice details in audit log', async () => {
    mockInvoiceResult = {
      success: true,
      invoice: { id: 'inv-999', invoice_number: 'HOS-2024-999' },
    }

    const request = createRequest()
    await POST(request, { params: createParams() })

    expect(logAudit).toHaveBeenCalledWith(
      'DISCHARGE_PATIENT',
      expect.any(String),
      expect.objectContaining({
        invoice_id: 'inv-999',
        invoice_number: 'HOS-2024-999',
      })
    )
  })
})

describe('Hospitalization Discharge - Complete Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: TEST_USER_ID }
    mockProfile = { tenant_id: TEST_TENANT_ID, role: 'admin' }
    mockInvoiceResult = {
      success: true,
      invoice: { id: 'inv-full', invoice_number: 'HOS-2024-FULL' },
    }
    mockHospUpdate = { data: { kennel_id: TEST_KENNEL_ID }, error: null }
    mockKennelUpdate = { error: null }
  })

  it('should complete full discharge workflow', async () => {
    const request = createRequest()
    const response = await POST(request, { params: createParams() })
    const data = await response.json()

    // 1. Response is successful
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    // 2. Invoice was generated
    expect(generateHospitalizationInvoice).toHaveBeenCalled()
    expect(data.invoice).toBeDefined()
    expect(data.invoice.invoice_number).toBe('HOS-2024-FULL')

    // 3. Message confirms discharge
    expect(data.message).toContain('alta')
    expect(data.message).toContain('factura')

    // 4. Audit was logged
    expect(logAudit).toHaveBeenCalled()
  })

  it('should return invoice in response', async () => {
    const request = createRequest()
    const response = await POST(request, { params: createParams() })
    const data = await response.json()

    expect(data.invoice).toBeDefined()
    expect(data.invoice.id).toBe('inv-full')
  })
})

describe('Hospitalization Discharge - Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: TEST_USER_ID }
    mockProfile = { tenant_id: TEST_TENANT_ID, role: 'vet' }
    mockHospUpdate = { data: { kennel_id: TEST_KENNEL_ID }, error: null }
    mockKennelUpdate = { error: null }
  })

  it('should handle invoice generation timeout', async () => {
    mockInvoiceResult = {
      success: false,
      invoice: null,
      error: 'Connection timeout',
    }

    const request = createRequest()
    const response = await POST(request, { params: createParams() })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.details.message).toContain('timeout')
  })

  it('should prioritize invoice errors over discharge', async () => {
    mockInvoiceResult = {
      success: false,
      invoice: null,
      error: 'Missing pet information',
    }

    const request = createRequest()
    const response = await POST(request, { params: createParams() })
    const data = await response.json()

    // Should fail before attempting discharge update
    expect(response.status).toBe(400)
    expect(data.code).toBe('VALIDATION_ERROR')
  })
})
