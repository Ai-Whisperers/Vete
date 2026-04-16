import type { SupabaseClient } from '@supabase/supabase-js'
import { HealthTimelineRepository } from './repository'
import { HealthTimelineEvent, HealthTimelineFilter } from './types'

export class HealthTimelineService {
  private repository: HealthTimelineRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new HealthTimelineRepository(supabase)
  }

  async getHealthTimeline(petId: string, filter: HealthTimelineFilter = {}, tenantId: string): Promise<HealthTimelineEvent[]> {
    return this.repository.findEventsByPetId(petId, filter, tenantId)
  }

  async createHealthTimelineEvent(event: Omit<HealthTimelineEvent, 'id'>, userId: string, tenantId: string): Promise<HealthTimelineEvent> {
    return this.repository.createEvent(event, userId, tenantId)
  }
}