import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { useSwrWithCache } from '../utils/swr'

export class FeatureRepository {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async findMany(filters: any = {}, tenantId: string) {
    const url = `/api/features?${new URLSearchParams(filters).toString()}`
    const data = await useSwrWithCache(url)
    return data
  }
}