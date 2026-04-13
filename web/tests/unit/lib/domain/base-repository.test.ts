import { describe, it, expect, vi } from 'vitest'
import { BaseRepository } from '@/lib/domain/base-repository'

class TestRepository extends BaseRepository<{ id: string; name: string; tenant_id: string }> {
  protected get table() { return 'test_table' }
}

const createMockSupabase = () => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  single: vi.fn(),
  count: vi.fn(),
})

describe('BaseRepository', () => {
  describe('constructor', () => {
    it('should throw if tenantId is empty', () => {
      const mock = createMockSupabase()
      expect(() => new TestRepository(mock, '')).toThrow('tenantId is required')
    })

    it('should create with valid tenantId', () => {
      const mock = createMockSupabase()
      const repo = new TestRepository(mock, 'clinic-1')
      expect(repo).toBeDefined()
    })
  })

  describe('baseQuery', () => {
    it('should include tenant_id filter automatically', () => {
      const mock = createMockSupabase()
      const repo = new TestRepository(mock, 'clinic-1')
      const _query = repo.baseQuery
      expect(mock.from).toHaveBeenCalledWith('test_table')
      expect(mock.eq).toHaveBeenCalledWith('tenant_id', 'clinic-1')
    })
  })

  describe('findById', () => {
    it('should fetch by id with tenant scope', async () => {
      const mock = createMockSupabase()
      mock.single.mockResolvedValue({ data: { id: '1', name: 'Test', tenant_id: 'clinic-1' }, error: null })
      const repo = new TestRepository(mock, 'clinic-1')
      const result = await repo.findById('1')
      expect(result).toBeTruthy()
    })

    it('should return null for PGRST116 error', async () => {
      const mock = createMockSupabase()
      mock.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      const repo = new TestRepository(mock, 'clinic-1')
      const result = await repo.findById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should auto-inject tenant_id', async () => {
      const mock = createMockSupabase()
      mock.single.mockResolvedValue({ data: { id: 'new', name: 'Test', tenant_id: 'clinic-1' }, error: null })
      const repo = new TestRepository(mock, 'clinic-1')
      await repo.create({ name: 'Test' })
      expect(mock.insert).toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('should scope update to tenant', async () => {
      const mock = createMockSupabase()
      mock.single.mockResolvedValue({ data: { id: '1', name: 'Updated' }, error: null })
      const repo = new TestRepository(mock, 'clinic-1')
      await repo.update('1', { name: 'Updated' })
      expect(mock.update).toHaveBeenCalled()
      // tenant_id should be in eq filter
      expect(mock.eq).toHaveBeenCalledWith('tenant_id', 'clinic-1')
    })
  })

  describe('delete', () => {
    it('should soft delete with tenant scope', async () => {
      const mock = createMockSupabase()
      mock.eq.mockReturnThis()
      const repo = new TestRepository(mock, 'clinic-1')
      const result = await repo.delete('1')
      expect(result).toBe(true)
      expect(mock.update).toHaveBeenCalled()
    })
  })

  describe('table property', () => {
    it('should throw if not overridden', () => {
      const mock = createMockSupabase()
      const repo = new BaseRepository(mock, 'clinic-1')
      expect(() => repo.table).toThrow('table property must be defined')
    })
  })
})
