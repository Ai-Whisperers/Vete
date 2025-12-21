/**
 * Domain service factory
 * Provides a centralized way to create domain services with proper dependencies
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { AppointmentService } from './appointments'
import { PetService } from './pets'

export class DomainFactory {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Create appointment service
   */
  createAppointmentService(): AppointmentService {
    return new AppointmentService(this.supabase)
  }

  /**
   * Create pet service
   */
  createPetService(): PetService {
    return new PetService(this.supabase)
  }
}

/**
 * Global domain factory instance
 * Use this for convenience, or create your own instance for testing
 */
let globalFactory: DomainFactory | null = null

export function getDomainFactory(supabase?: SupabaseClient): DomainFactory {
  if (!globalFactory) {
    if (!supabase) {
      throw new Error('Supabase client required for first domain factory creation')
    }
    globalFactory = new DomainFactory(supabase)
  }
  return globalFactory
}
