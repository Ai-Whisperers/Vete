import type { SupabaseClient } from '@supabase/supabase-js'
import { GDPRRepository } from './repository'
import type {
  GDPRRequest,
  CreateGDPRRequestInput,
  UserDataExport,
  DeletionResult,
} from './types'

export class GDPRService {
  private repository: GDPRRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new GDPRRepository(supabase)
  }

  /**
   * Create a new GDPR request
   */
  async createRequest(
    data: CreateGDPRRequestInput,
    userId: string,
    tenantId: string
  ): Promise<GDPRRequest> {
    return this.repository.createRequest(data, userId, tenantId)
  }

  /**
   * Get a GDPR request by ID
   */
  async getRequestById(id: string): Promise<GDPRRequest | null> {
    return this.repository.getRequestById(id)
  }

  /**
   * Update the status of a GDPR request
   */
  async updateRequestStatus(
    id: string,
    status: string
  ): Promise<GDPRRequest | null> {
    return this.repository.updateRequestStatus(id, status)
  }

  /**
   * Delete user data for a GDPR request
   */
  async deleteUserDate(
    userId: string,
    tenantId: string
  ): Promise<DeletionResult> {
    return this.repository.deleteUserDate(userId, tenantId)
  }

  /**
   * Export user data for a GDPR request
   */
  async exportUserData(
    userId: string,
    tenantId: string
  ): Promise<UserDataExport> {
    return this.repository.exportUserData(userId, tenantId)
  }
}