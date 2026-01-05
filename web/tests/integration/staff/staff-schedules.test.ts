/**
 * Staff Schedules API Tests
 *
 * Tests for:
 * - GET /api/staff/schedule - List staff schedules
 * - POST /api/staff/schedule - Create staff schedule
 * - PATCH /api/staff/schedule - Update schedule status
 * - DELETE /api/staff/schedule - Delete (deactivate) schedule
 *
 * Staff schedules define working hours with entries per day of week.
 * Admins can manage any schedule, staff can only edit their own.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST, PATCH, DELETE } from '@/app/api/staff/schedule/route'
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

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

// Sample data
const SAMPLE_STAFF_PROFILE = {
  id: 'staff-profile-001',
  user_id: USERS.VET_CARLOS.id,
  tenant_id: TENANTS.ADRIS.id,
  job_title: 'Veterinario',
  color_code: '#4CAF50',
  can_be_booked: true,
  employment_status: 'active',
  profiles: {
    id: USERS.VET_CARLOS.id,
    full_name: 'Dr. Test',
    email: 'vet@example.com',
  },
  staff_schedules: [
    {
      id: 'schedule-001',
      name: 'Horario Regular',
      is_active: true,
      effective_from: '2026-01-01',
      effective_to: null,
      staff_schedule_entries: [
        {
          id: 'entry-001',
          day_of_week: 1,
          start_time: '09:00',
          end_time: '17:00',
          break_start: '12:00',
          break_end: '13:00',
          location: 'Consultorio 1',
        },
      ],
    },
  ],
}

const SAMPLE_SCHEDULE = {
  id: 'schedule-001',
  staff_profile_id: 'staff-profile-001',
  name: 'Horario Regular',
  is_active: true,
  effective_from: '2026-01-01',
  effective_to: null,
  staff_schedule_entries: [
    {
      id: 'entry-001',
      schedule_id: 'schedule-001',
      day_of_week: 1,
      start_time: '09:00',
      end_time: '17:00',
      break_start: '12:00',
      break_end: '13:00',
      location: 'Consultorio 1',
    },
  ],
}

// Helper to create GET request
function createGetRequest(params: {
  clinic?: string
  staff_id?: string
  active_only?: string
}): NextRequest {
  const searchParams = new URLSearchParams()
  if (params.clinic) searchParams.set('clinic', params.clinic)
  if (params.staff_id) searchParams.set('staff_id', params.staff_id)
  if (params.active_only) searchParams.set('active_only', params.active_only)

  return new NextRequest(`http://localhost:3000/api/staff/schedule?${searchParams.toString()}`, {
    method: 'GET',
  })
}

// Helper to create POST request
function createPostRequest(body: {
  staff_profile_id?: string
  clinic?: string
  name?: string
  effective_from?: string
  effective_to?: string
  entries?: Array<{
    day_of_week: number
    start_time: string
    end_time: string
    break_start?: string
    break_end?: string
    location?: string
  }>
}): NextRequest {
  return new NextRequest('http://localhost:3000/api/staff/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// Helper to create PATCH request
function createPatchRequest(body: {
  schedule_id?: string
  clinic?: string
  is_active?: boolean
  effective_to?: string | null
}): NextRequest {
  return new NextRequest('http://localhost:3000/api/staff/schedule', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// Helper to create DELETE request
function createDeleteRequest(params: {
  schedule_id?: string
  clinic?: string
}): NextRequest {
  const searchParams = new URLSearchParams()
  if (params.schedule_id) searchParams.set('schedule_id', params.schedule_id)
  if (params.clinic) searchParams.set('clinic', params.clinic)

  return new NextRequest(`http://localhost:3000/api/staff/schedule?${searchParams.toString()}`, {
    method: 'DELETE',
  })
}

// ============================================================================
// GET Tests - List Staff Schedules
// ============================================================================

describe('GET /api/staff/schedule', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when unauthenticated', async () => {
      mockState.setAuthScenario('UNAUTHENTICATED')

      const response = await GET(createGetRequest({ clinic: TENANTS.ADRIS.id }))

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('No autorizado')
    })

    it('should return 403 when not staff of clinic', async () => {
      mockState.setAuthScenario('VET')
      mockState.setRpcResult('is_staff_of', false)

      const response = await GET(createGetRequest({ clinic: TENANTS.ADRIS.id }))

      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body.error).toBe('No autorizado')
    })

    it('should allow staff to list schedules', async () => {
      mockState.setAuthScenario('VET')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult('staff_profiles', [SAMPLE_STAFF_PROFILE], 'select')

      const response = await GET(createGetRequest({ clinic: TENANTS.ADRIS.id }))

      expect(response.status).toBe(200)
    })
  })

  describe('Validation', () => {
    it('should return 400 when clinic param is missing', async () => {
      mockState.setAuthScenario('VET')

      const response = await GET(createGetRequest({}))

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Falta el parámetro clinic')
    })
  })

  describe('Listing Schedules', () => {
    it('should list all staff schedules for clinic', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult('staff_profiles', [SAMPLE_STAFF_PROFILE], 'select')

      const response = await GET(createGetRequest({ clinic: TENANTS.ADRIS.id }))

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data).toHaveLength(1)
      expect(body.data[0].staff_name).toBe('Dr. Test')
      expect(body.data[0].schedules).toHaveLength(1)
    })

    it('should filter by staff_id', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult('staff_profiles', [SAMPLE_STAFF_PROFILE], 'select')

      const response = await GET(
        createGetRequest({
          clinic: TENANTS.ADRIS.id,
          staff_id: 'staff-profile-001',
        })
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data).toHaveLength(1)
    })

    it('should return only active schedules by default', async () => {
      const staffWithInactive = {
        ...SAMPLE_STAFF_PROFILE,
        staff_schedules: [
          { ...SAMPLE_SCHEDULE, is_active: true },
          { ...SAMPLE_SCHEDULE, id: 'schedule-002', is_active: false },
        ],
      }
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult('staff_profiles', [staffWithInactive], 'select')

      const response = await GET(createGetRequest({ clinic: TENANTS.ADRIS.id }))

      expect(response.status).toBe(200)
      const body = await response.json()
      // Only active schedules filtered
      expect(body.data[0].schedules).toHaveLength(1)
    })

    it('should return all schedules when active_only=false', async () => {
      const staffWithInactive = {
        ...SAMPLE_STAFF_PROFILE,
        staff_schedules: [
          { ...SAMPLE_SCHEDULE, is_active: true },
          { ...SAMPLE_SCHEDULE, id: 'schedule-002', is_active: false },
        ],
      }
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult('staff_profiles', [staffWithInactive], 'select')

      const response = await GET(
        createGetRequest({
          clinic: TENANTS.ADRIS.id,
          active_only: 'false',
        })
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data[0].schedules).toHaveLength(2)
    })

    it('should return empty array when no staff', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult('staff_profiles', [], 'select')

      const response = await GET(createGetRequest({ clinic: TENANTS.ADRIS.id }))

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data).toHaveLength(0)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      mockState.setAuthScenario('VET')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableError('staff_profiles', new Error('Database error'))

      const response = await GET(createGetRequest({ clinic: TENANTS.ADRIS.id }))

      expect(response.status).toBe(500)
      const body = await response.json()
      expect(body.error).toBe('Error al obtener horarios')
    })
  })
})

// ============================================================================
// POST Tests - Create Staff Schedule
// ============================================================================

describe('POST /api/staff/schedule', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  const validSchedulePayload = {
    staff_profile_id: 'staff-profile-001',
    clinic: TENANTS.ADRIS.id,
    name: 'Horario Regular',
    effective_from: '2026-01-01',
    entries: [
      {
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
      },
      {
        day_of_week: 2,
        start_time: '09:00',
        end_time: '17:00',
      },
    ],
  }

  describe('Authentication', () => {
    it('should return 401 when unauthenticated', async () => {
      mockState.setAuthScenario('UNAUTHENTICATED')

      const response = await POST(createPostRequest(validSchedulePayload))

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('No autorizado')
    })

    it('should return 403 when not staff of clinic', async () => {
      mockState.setAuthScenario('VET')
      mockState.setRpcResult('is_staff_of', false)

      const response = await POST(createPostRequest(validSchedulePayload))

      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body.error).toBe('No autorizado')
    })
  })

  describe('Validation', () => {
    it('should return 400 when staff_profile_id is missing', async () => {
      mockState.setAuthScenario('ADMIN')

      const response = await POST(
        createPostRequest({
          clinic: TENANTS.ADRIS.id,
          effective_from: '2026-01-01',
          entries: validSchedulePayload.entries,
        })
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Faltan campos requeridos')
    })

    it('should return 400 when clinic is missing', async () => {
      mockState.setAuthScenario('ADMIN')

      const response = await POST(
        createPostRequest({
          staff_profile_id: 'staff-profile-001',
          effective_from: '2026-01-01',
          entries: validSchedulePayload.entries,
        })
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Faltan campos requeridos')
    })

    it('should return 400 when effective_from is missing', async () => {
      mockState.setAuthScenario('ADMIN')

      const response = await POST(
        createPostRequest({
          staff_profile_id: 'staff-profile-001',
          clinic: TENANTS.ADRIS.id,
          entries: validSchedulePayload.entries,
        })
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Faltan campos requeridos')
    })

    it('should return 400 when entries is missing', async () => {
      mockState.setAuthScenario('ADMIN')

      const response = await POST(
        createPostRequest({
          staff_profile_id: 'staff-profile-001',
          clinic: TENANTS.ADRIS.id,
          effective_from: '2026-01-01',
        })
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Faltan campos requeridos')
    })

    it('should return 400 when entries is empty array', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_profiles',
        { id: 'staff-profile-001', user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'admin' }, 'select')

      const response = await POST(
        createPostRequest({
          ...validSchedulePayload,
          entries: [],
        })
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Debe proporcionar al menos una entrada de horario')
    })

    it('should return 400 for invalid day_of_week', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_profiles',
        { id: 'staff-profile-001', user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'admin' }, 'select')

      const response = await POST(
        createPostRequest({
          ...validSchedulePayload,
          entries: [{ day_of_week: 7, start_time: '09:00', end_time: '17:00' }],
        })
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Día de la semana inválido (debe ser 0-6)')
    })

    it('should return 400 when entry is missing start_time', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_profiles',
        { id: 'staff-profile-001', user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'admin' }, 'select')

      const response = await POST(
        createPostRequest({
          ...validSchedulePayload,
          entries: [{ day_of_week: 1, start_time: '', end_time: '17:00' }],
        })
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Hora de inicio y fin son requeridas')
    })
  })

  describe('Permission Checks', () => {
    it('should return 404 when staff profile not found', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult('staff_profiles', null, 'select')

      const response = await POST(createPostRequest(validSchedulePayload))

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body.error).toBe('Perfil de empleado no encontrado')
    })

    it('should return 403 when non-admin edits another staff schedule', async () => {
      mockState.setAuthScenario('VET')
      mockState.setRpcResult('is_staff_of', true)
      // Staff profile belongs to different user
      mockState.setTableResult(
        'staff_profiles',
        { id: 'staff-profile-001', user_id: 'different-user', tenant_id: TENANTS.ADRIS.id },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'vet' }, 'select')

      const response = await POST(createPostRequest(validSchedulePayload))

      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body.error).toBe('Solo puedes editar tu propio horario')
    })

    it('should allow staff to create their own schedule', async () => {
      mockState.setAuthScenario('VET')
      mockState.setRpcResult('is_staff_of', true)
      // Own profile
      mockState.setTableResult(
        'staff_profiles',
        { id: 'staff-profile-001', user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'vet' }, 'select')
      // Deactivate old schedules
      mockState.setTableResult('staff_schedules', { count: 1 }, 'update')
      // Create new schedule
      mockState.setTableResult('staff_schedules', SAMPLE_SCHEDULE, 'insert')
      // Create entries
      mockState.setTableResult('staff_schedule_entries', [{ id: 'entry-001' }], 'insert')

      const response = await POST(createPostRequest(validSchedulePayload))

      expect(response.status).toBe(201)
    })

    it('should allow admin to create any staff schedule', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      // Different staff's profile
      mockState.setTableResult(
        'staff_profiles',
        { id: 'staff-profile-001', user_id: 'different-user', tenant_id: TENANTS.ADRIS.id },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'admin' }, 'select')
      mockState.setTableResult('staff_schedules', { count: 1 }, 'update')
      mockState.setTableResult('staff_schedules', SAMPLE_SCHEDULE, 'insert')
      mockState.setTableResult('staff_schedule_entries', [{ id: 'entry-001' }], 'insert')

      const response = await POST(createPostRequest(validSchedulePayload))

      expect(response.status).toBe(201)
    })
  })

  describe('Successful Creation', () => {
    it('should create schedule with entries', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_profiles',
        { id: 'staff-profile-001', user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'admin' }, 'select')
      mockState.setTableResult('staff_schedules', { count: 1 }, 'update')
      mockState.setTableResult('staff_schedules', SAMPLE_SCHEDULE, 'insert')
      mockState.setTableResult('staff_schedule_entries', [{ id: 'entry-001' }], 'insert')

      const response = await POST(createPostRequest(validSchedulePayload))

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.message).toBe('Horario creado exitosamente')
      expect(body.data).toBeDefined()
    })

    it('should deactivate previous schedules', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_profiles',
        { id: 'staff-profile-001', user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'admin' }, 'select')
      // Previous schedule deactivated
      mockState.setTableResult('staff_schedules', { count: 2 }, 'update')
      mockState.setTableResult('staff_schedules', SAMPLE_SCHEDULE, 'insert')
      mockState.setTableResult('staff_schedule_entries', [{ id: 'entry-001' }], 'insert')

      const response = await POST(createPostRequest(validSchedulePayload))

      expect(response.status).toBe(201)
    })

    it('should use default name when not provided', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_profiles',
        { id: 'staff-profile-001', user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'admin' }, 'select')
      mockState.setTableResult('staff_schedules', { count: 0 }, 'update')
      mockState.setTableResult('staff_schedules', { ...SAMPLE_SCHEDULE, name: 'Horario Regular' }, 'insert')
      mockState.setTableResult('staff_schedule_entries', [{ id: 'entry-001' }], 'insert')

      const { name, ...payloadWithoutName } = validSchedulePayload
      const response = await POST(createPostRequest(payloadWithoutName))

      expect(response.status).toBe(201)
    })

    it('should support entries with break times', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_profiles',
        { id: 'staff-profile-001', user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'admin' }, 'select')
      mockState.setTableResult('staff_schedules', { count: 0 }, 'update')
      mockState.setTableResult('staff_schedules', SAMPLE_SCHEDULE, 'insert')
      mockState.setTableResult('staff_schedule_entries', [{ id: 'entry-001' }], 'insert')

      const response = await POST(
        createPostRequest({
          ...validSchedulePayload,
          entries: [
            {
              day_of_week: 1,
              start_time: '09:00',
              end_time: '17:00',
              break_start: '12:00',
              break_end: '13:00',
              location: 'Consultorio 1',
            },
          ],
        })
      )

      expect(response.status).toBe(201)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 on schedule insert error', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_profiles',
        { id: 'staff-profile-001', user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'admin' }, 'select')
      mockState.setTableResult('staff_schedules', { count: 0 }, 'update')
      mockState.setTableError('staff_schedules', new Error('Database error'))

      const response = await POST(createPostRequest(validSchedulePayload))

      expect(response.status).toBe(500)
      const body = await response.json()
      expect(body.error).toBe('Error al crear horario')
    })

    it('should return 500 on entries insert error', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_profiles',
        { id: 'staff-profile-001', user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'admin' }, 'select')
      mockState.setTableResult('staff_schedules', { count: 0 }, 'update')
      mockState.setTableResult('staff_schedules', SAMPLE_SCHEDULE, 'insert')
      mockState.setTableError('staff_schedule_entries', new Error('Entry error'))
      // Allow rollback delete
      mockState.setTableResult('staff_schedules', { count: 1 }, 'delete')

      const response = await POST(createPostRequest(validSchedulePayload))

      expect(response.status).toBe(500)
      const body = await response.json()
      expect(body.error).toBe('Error al crear entradas de horario')
    })
  })
})

// ============================================================================
// PATCH Tests - Update Schedule Status
// ============================================================================

describe('PATCH /api/staff/schedule', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when unauthenticated', async () => {
      mockState.setAuthScenario('UNAUTHENTICATED')

      const response = await PATCH(
        createPatchRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
          is_active: false,
        })
      )

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('No autorizado')
    })

    it('should return 403 when not staff of clinic', async () => {
      mockState.setAuthScenario('VET')
      mockState.setRpcResult('is_staff_of', false)

      const response = await PATCH(
        createPatchRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
          is_active: false,
        })
      )

      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body.error).toBe('No autorizado')
    })
  })

  describe('Validation', () => {
    it('should return 400 when schedule_id is missing', async () => {
      mockState.setAuthScenario('ADMIN')

      const response = await PATCH(
        createPatchRequest({
          clinic: TENANTS.ADRIS.id,
          is_active: false,
        })
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Faltan campos requeridos')
    })

    it('should return 400 when clinic is missing', async () => {
      mockState.setAuthScenario('ADMIN')

      const response = await PATCH(
        createPatchRequest({
          schedule_id: 'schedule-001',
          is_active: false,
        })
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Faltan campos requeridos')
    })

    it('should return 400 when no changes provided', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_schedules',
        {
          id: 'schedule-001',
          staff_profile_id: 'staff-001',
          staff_profiles: { user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'admin' }, 'select')

      const response = await PATCH(
        createPatchRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
        })
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('No hay cambios para guardar')
    })
  })

  describe('Permission Checks', () => {
    it('should return 404 when schedule not found', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult('staff_schedules', null, 'select')

      const response = await PATCH(
        createPatchRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
          is_active: false,
        })
      )

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body.error).toBe('Horario no encontrado')
    })

    it('should return 403 when schedule belongs to different tenant', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_schedules',
        {
          id: 'schedule-001',
          staff_profile_id: 'staff-001',
          staff_profiles: { user_id: USERS.VET_CARLOS.id, tenant_id: 'other-tenant' },
        },
        'select'
      )

      const response = await PATCH(
        createPatchRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
          is_active: false,
        })
      )

      expect(response.status).toBe(403)
    })

    it('should return 403 when non-admin edits another staff schedule', async () => {
      mockState.setAuthScenario('VET')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_schedules',
        {
          id: 'schedule-001',
          staff_profile_id: 'staff-001',
          staff_profiles: { user_id: 'different-user', tenant_id: TENANTS.ADRIS.id },
        },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'vet' }, 'select')

      const response = await PATCH(
        createPatchRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
          is_active: false,
        })
      )

      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body.error).toBe('Solo puedes editar tu propio horario')
    })
  })

  describe('Successful Updates', () => {
    it('should update is_active status', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_schedules',
        {
          id: 'schedule-001',
          staff_profile_id: 'staff-001',
          staff_profiles: { user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'admin' }, 'select')
      mockState.setTableResult('staff_schedules', { ...SAMPLE_SCHEDULE, is_active: false }, 'update')

      const response = await PATCH(
        createPatchRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
          is_active: false,
        })
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.message).toBe('Horario actualizado exitosamente')
    })

    it('should update effective_to date', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_schedules',
        {
          id: 'schedule-001',
          staff_profile_id: 'staff-001',
          staff_profiles: { user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'admin' }, 'select')
      mockState.setTableResult(
        'staff_schedules',
        { ...SAMPLE_SCHEDULE, effective_to: '2026-12-31' },
        'update'
      )

      const response = await PATCH(
        createPatchRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
          effective_to: '2026-12-31',
        })
      )

      expect(response.status).toBe(200)
    })

    it('should allow staff to update own schedule', async () => {
      mockState.setAuthScenario('VET')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_schedules',
        {
          id: 'schedule-001',
          staff_profile_id: 'staff-001',
          staff_profiles: { user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'vet' }, 'select')
      mockState.setTableResult('staff_schedules', { ...SAMPLE_SCHEDULE, is_active: false }, 'update')

      const response = await PATCH(
        createPatchRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
          is_active: false,
        })
      )

      expect(response.status).toBe(200)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 on update error', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setRpcResult('is_staff_of', true)
      mockState.setTableResult(
        'staff_schedules',
        {
          id: 'schedule-001',
          staff_profile_id: 'staff-001',
          staff_profiles: { user_id: USERS.VET_CARLOS.id, tenant_id: TENANTS.ADRIS.id },
        },
        'select'
      )
      mockState.setTableResult('profiles', { role: 'admin' }, 'select')
      mockState.setTableError('staff_schedules', new Error('Update failed'))

      const response = await PATCH(
        createPatchRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
          is_active: false,
        })
      )

      expect(response.status).toBe(500)
      const body = await response.json()
      expect(body.error).toBe('Error al actualizar horario')
    })
  })
})

// ============================================================================
// DELETE Tests - Delete (Deactivate) Schedule
// ============================================================================

describe('DELETE /api/staff/schedule', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when unauthenticated', async () => {
      mockState.setAuthScenario('UNAUTHENTICATED')

      const response = await DELETE(
        createDeleteRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
        })
      )

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('No autorizado')
    })
  })

  describe('Validation', () => {
    it('should return 400 when schedule_id is missing', async () => {
      mockState.setAuthScenario('ADMIN')

      const response = await DELETE(createDeleteRequest({ clinic: TENANTS.ADRIS.id }))

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Faltan parámetros requeridos')
    })

    it('should return 400 when clinic is missing', async () => {
      mockState.setAuthScenario('ADMIN')

      const response = await DELETE(createDeleteRequest({ schedule_id: 'schedule-001' }))

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Faltan parámetros requeridos')
    })
  })

  describe('Permission Checks', () => {
    it('should return 403 when non-admin tries to delete', async () => {
      mockState.setAuthScenario('VET')
      mockState.setTableResult('profiles', { role: 'vet', tenant_id: TENANTS.ADRIS.id }, 'select')

      const response = await DELETE(
        createDeleteRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
        })
      )

      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body.error).toBe('Solo administradores pueden eliminar horarios')
    })

    it('should return 403 when admin from different tenant', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setTableResult('profiles', { role: 'admin', tenant_id: 'other-tenant' }, 'select')

      const response = await DELETE(
        createDeleteRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
        })
      )

      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body.error).toBe('Solo administradores pueden eliminar horarios')
    })
  })

  describe('Successful Deletion', () => {
    it('should soft delete schedule by deactivating', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setTableResult('profiles', { role: 'admin', tenant_id: TENANTS.ADRIS.id }, 'select')
      mockState.setTableResult('staff_schedules', { count: 1 }, 'update')

      const response = await DELETE(
        createDeleteRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
        })
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.message).toBe('Horario eliminado exitosamente')
    })
  })

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      mockState.setAuthScenario('ADMIN')
      mockState.setTableResult('profiles', { role: 'admin', tenant_id: TENANTS.ADRIS.id }, 'select')
      mockState.setTableError('staff_schedules', new Error('Delete failed'))

      const response = await DELETE(
        createDeleteRequest({
          schedule_id: 'schedule-001',
          clinic: TENANTS.ADRIS.id,
        })
      )

      expect(response.status).toBe(500)
      const body = await response.json()
      expect(body.error).toBe('Error al eliminar horario')
    })
  })
})

// ============================================================================
// Integration Scenarios
// ============================================================================

describe('Staff Schedules Integration Scenarios', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  it('should support full schedule lifecycle (create, update, deactivate)', async () => {
    // 1. Admin creates schedule for staff
    mockState.setAuthScenario('ADMIN')
    mockState.setRpcResult('is_staff_of', true)
    mockState.setTableResult(
      'staff_profiles',
      { id: 'staff-profile-001', user_id: 'staff-user', tenant_id: TENANTS.ADRIS.id },
      'select'
    )
    mockState.setTableResult('profiles', { role: 'admin' }, 'select')
    mockState.setTableResult('staff_schedules', { count: 0 }, 'update')
    mockState.setTableResult('staff_schedules', SAMPLE_SCHEDULE, 'insert')
    mockState.setTableResult('staff_schedule_entries', [{ id: 'entry-001' }], 'insert')

    const createResponse = await POST(
      createPostRequest({
        staff_profile_id: 'staff-profile-001',
        clinic: TENANTS.ADRIS.id,
        name: 'Test Schedule',
        effective_from: '2026-01-01',
        entries: [{ day_of_week: 1, start_time: '09:00', end_time: '17:00' }],
      })
    )
    expect(createResponse.status).toBe(201)

    // 2. Update the schedule
    mockState.setTableResult(
      'staff_schedules',
      {
        id: 'schedule-001',
        staff_profile_id: 'staff-001',
        staff_profiles: { user_id: 'staff-user', tenant_id: TENANTS.ADRIS.id },
      },
      'select'
    )
    mockState.setTableResult('staff_schedules', { ...SAMPLE_SCHEDULE, effective_to: '2026-06-30' }, 'update')

    const updateResponse = await PATCH(
      createPatchRequest({
        schedule_id: 'schedule-001',
        clinic: TENANTS.ADRIS.id,
        effective_to: '2026-06-30',
      })
    )
    expect(updateResponse.status).toBe(200)

    // 3. Admin deactivates schedule
    mockState.setTableResult('profiles', { role: 'admin', tenant_id: TENANTS.ADRIS.id }, 'select')
    mockState.setTableResult('staff_schedules', { count: 1 }, 'update')

    const deleteResponse = await DELETE(
      createDeleteRequest({
        schedule_id: 'schedule-001',
        clinic: TENANTS.ADRIS.id,
      })
    )
    expect(deleteResponse.status).toBe(200)
  })

  it('should handle multiple staff with different schedules', async () => {
    const staffList = [
      {
        ...SAMPLE_STAFF_PROFILE,
        id: 'staff-1',
        profiles: { id: 'user-1', full_name: 'Dr. Alpha', email: 'alpha@example.com' },
      },
      {
        ...SAMPLE_STAFF_PROFILE,
        id: 'staff-2',
        user_id: 'user-2',
        profiles: { id: 'user-2', full_name: 'Dr. Beta', email: 'beta@example.com' },
        staff_schedules: [
          {
            ...SAMPLE_SCHEDULE,
            id: 'schedule-002',
            staff_schedule_entries: [
              { ...SAMPLE_SCHEDULE.staff_schedule_entries[0], day_of_week: 2 },
            ],
          },
        ],
      },
    ]

    mockState.setAuthScenario('ADMIN')
    mockState.setRpcResult('is_staff_of', true)
    mockState.setTableResult('staff_profiles', staffList, 'select')

    const response = await GET(createGetRequest({ clinic: TENANTS.ADRIS.id }))

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toHaveLength(2)
    expect(body.data[0].staff_name).toBe('Dr. Alpha')
    expect(body.data[1].staff_name).toBe('Dr. Beta')
  })

  it('should ensure tenant isolation', async () => {
    mockState.setAuthScenario('VET')
    mockState.setRpcResult('is_staff_of', false) // Not staff of this clinic

    const response = await GET(createGetRequest({ clinic: 'other-clinic' }))

    expect(response.status).toBe(403)
  })
})
