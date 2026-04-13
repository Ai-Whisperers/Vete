import { describe, it, expect } from 'vitest'
import {
  apiError,
  apiSuccess,
  validationError,
  paginatedResponse,
  HTTP_STATUS,
  API_ERRORS,
} from '@/lib/api/errors'

describe('API Error Responses', () => {
  describe('apiError', () => {
    it('should return 401 for UNAUTHORIZED', () => {
      const res = apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
      expect(res.status).toBe(401)
    })

    it('should include error code in body', async () => {
      const res = apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
      const body = await res.json()
      expect(body.code).toBe('NOT_FOUND')
      expect(body.error).toBe('Recurso no encontrado')
    })

    it('should include details when provided', async () => {
      const res = apiError('VALIDATION_ERROR', 400, {
        field_errors: { email: ['Email inválido'] },
      })
      const body = await res.json()
      expect(body.field_errors).toEqual({ email: ['Email inválido'] })
    })
  })

  describe('apiSuccess', () => {
    it('should return 200 by default', () => {
      const res = apiSuccess({ id: '1' })
      expect(res.status).toBe(200)
    })

    it('should return data in body', async () => {
      const res = apiSuccess({ id: '1', name: 'Test' })
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data).toEqual({ id: '1', name: 'Test' })
    })

    it('should include optional message', async () => {
      const res = apiSuccess({ id: '1' }, 'Created successfully')
      const body = await res.json()
      expect(body.message).toBe('Created successfully')
    })

    it('should support custom status codes', () => {
      const res = apiSuccess({ id: '1' }, undefined, HTTP_STATUS.CREATED)
      expect(res.status).toBe(201)
    })
  })

  describe('validationError', () => {
    it('should return 400 status', () => {
      const res = validationError({ name: ['Required'] })
      expect(res.status).toBe(400)
    })

    it('should include field errors', async () => {
      const res = validationError({
        email: ['Email requerido', 'Formato inválido'],
        name: ['Nombre requerido'],
      })
      const body = await res.json()
      expect(body.code).toBe('VALIDATION_ERROR')
      expect(body.field_errors).toEqual({
        email: ['Email requerido', 'Formato inválido'],
        name: ['Nombre requerido'],
      })
    })
  })

  describe('paginatedResponse', () => {
    it('should return correct pagination metadata', async () => {
      const items = [{ id: '1' }, { id: '2' }]
      const res = paginatedResponse(items, { page: 1, pageSize: 20, total: 50 })
      const body = await res.json()

      expect(body.success).toBe(true)
      expect(body.data).toEqual(items)
      expect(body.pagination).toEqual({
        page: 1,
        pageSize: 20,
        total: 50,
        totalPages: 3,
        hasMore: true,
      })
    })

    it('should set hasMore=false on last page', async () => {
      const res = paginatedResponse([], { page: 3, pageSize: 20, total: 50 })
      const body = await res.json()
      expect(body.pagination.hasMore).toBe(false)
      expect(body.pagination.totalPages).toBe(3)
    })

    it('should handle empty results', async () => {
      const res = paginatedResponse([], { page: 1, pageSize: 20, total: 0 })
      const body = await res.json()
      expect(body.pagination.totalPages).toBe(0)
      expect(body.pagination.hasMore).toBe(false)
    })
  })

  describe('HTTP_STATUS', () => {
    it('should have all standard status codes', () => {
      expect(HTTP_STATUS.OK).toBe(200)
      expect(HTTP_STATUS.CREATED).toBe(201)
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400)
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401)
      expect(HTTP_STATUS.FORBIDDEN).toBe(403)
      expect(HTTP_STATUS.NOT_FOUND).toBe(404)
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500)
    })
  })

  describe('API_ERRORS', () => {
    it('should have all error codes defined', () => {
      expect(API_ERRORS.UNAUTHORIZED).toBeDefined()
      expect(API_ERRORS.NOT_FOUND).toBeDefined()
      expect(API_ERRORS.VALIDATION_ERROR).toBeDefined()
      expect(API_ERRORS.SERVER_ERROR).toBeDefined()
    })

    it('should have Spanish messages', () => {
      expect(API_ERRORS.UNAUTHORIZED.error).toBe('No autorizado')
      expect(API_ERRORS.NOT_FOUND.error).toBe('Recurso no encontrado')
    })
  })
})
