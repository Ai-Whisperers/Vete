import type { SupabaseClient } from '@supabase/supabase-js'
import { HealthTimelineEvent } from './types'

export class HealthTimelineRepository {
  constructor(private supabase: SupabaseClient) {}

  async findEventsByPetId(petId: string, filter: any = {}, tenantId: string): Promise<HealthTimelineEvent[]> {
    const { data, error } = await this.supabase
      .from('health_timeline')
      .select('id, pet_id, event_type, event_date, description')
      .eq('pet_id', petId)
      .eq('tenant_id', tenantId)
      .order('event_date', { ascending: true })

    if (error) {
      throw error
    }

    return data as HealthTimelineEvent[]
  }

  async createEvent(event: Omit<HealthTimelineEvent, 'id'>, userId: string, tenantId: string): Promise<HealthTimelineEvent> {
    const { data, error } = await this.supabase
      .from('health_timeline')
      .insert([event])
      .eq('tenant_id', tenantId)
      .single()

    if (error) {
      throw error
    }

    return data as HealthTimelineEvent
  }
}