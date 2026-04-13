/**
 * Base Repository - Enforces tenant isolation
 * 
 * All domain repositories should extend this class to ensure
 * tenant_id is always enforced on all queries.
 * 
 * @security This prevents accidental data leakage between tenants
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export abstract class BaseRepository<T> {
  protected constructor(
    protected readonly supabase: SupabaseClient,
    protected readonly tenantId: string
  ) {
    if (!tenantId) {
      throw new Error('tenantId is required for all repository operations')
    }
  }

  protected get table(): string {
    throw new Error('table property must be defined in subclass')
  }

  /**
   * All SELECT queries are automatically scoped to tenant
   */
  protected get baseQuery() {
    return this.supabase
      .from(this.table)
      .select('*')
      .eq('tenant_id', this.tenantId)
  }

  /**
   * Find single record by ID (tenant-scoped)
   */
  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.baseQuery
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error fetching ${this.table} ${id}: ${error.message}`)
    }

    return data as T
  }

  /**
   * Find all records with optional filters
   */
  async findAll(filters?: Record<string, unknown>): Promise<T[]> {
    let query = this.baseQuery.is('deleted_at', null)

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (typeof value === 'string' && value.includes('%')) {
          query = query.like(key, value)
        } else {
          query = query.eq(key, value)
        }
      })
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error fetching ${this.table}: ${error.message}`)
    }

    return (data || []) as T[]
  }

  /**
   * Create record - tenant_id auto-injected
   */
  async create(record: Partial<T> & Record<string, unknown>): Promise<T> {
    const dataWithTenant = {
      ...record,
      tenant_id: this.tenantId,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await this.supabase
      .from(this.table)
      .insert(dataWithTenant)
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating ${this.table}: ${error.message}`)
    }

    return data as T
  }

  /**
   * Update record - tenant-scoped
   */
  async update(id: string, updates: Partial<T> & Record<string, unknown>): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating ${this.table} ${id}: ${error.message}`)
    }

    return data as T
  }

  /**
   * Soft delete - tenant-scoped
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.table)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', this.tenantId)

    if (error) {
      throw new Error(`Error deleting ${this.table} ${id}: ${error.message}`)
    }

    return true
  }

  /**
   * Hard delete - tenant-scoped (use sparingly)
   */
  async hardDelete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.table)
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenantId)

    if (error) {
      throw new Error(`Error hard deleting ${this.table} ${id}: ${error.message}`)
    }

    return true
  }

  /**
   * Count records - tenant-scoped
   */
  async count(): Promise<number> {
    const { count, error } = await this.supabase
      .from(this.table)
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', this.tenantId)
      .is('deleted_at', null)

    if (error) {
      throw new Error(`Error counting ${this.table}: ${error.message}`)
    }

    return count || 0
  }
}

/**
 * Repository factory - creates tenant-scoped repositories
 */
export function createRepository<T>(
  supabase: SupabaseClient,
  tenantId: string
): BaseRepository<T> {
  // This is a type hint - actual repositories extend BaseRepository
  return null as unknown as BaseRepository<T>
}
