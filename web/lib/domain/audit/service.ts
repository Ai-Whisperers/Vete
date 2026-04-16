import type { SupabaseClient } from '@supabase/supabase-js'
import { AuditRepository } from './repository'
import type { AuditLog, AuditFilter } from './types'

export class AuditService {
  private repository: AuditRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new AuditRepository(supabase)
  }

  async getAuditLogs(filters: AuditFilter = {}, tenantId: string): Promise<AuditLog[]> {
    return this.repository.findAll(filters, tenantId)
  }

  async getAuditLog(id: string, tenantId: string): Promise<AuditLog | null> {
    return this.repository.findById(id, tenantId)
  }

  async createAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>, tenantId: string): Promise<AuditLog> {
    return this.repository.create(log, tenantId)
  }
}