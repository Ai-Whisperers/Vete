import type { SupabaseClient } from '@supabase/supabase-js'
import { WebrtcCall } from './types'

export class WebrtcCallRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(data: CreateWebrtcCallData, userId: string, tenantId: string): Promise<WebrtcCall> {
    const { data: webrtcCall, error } = await this.supabase
      .from('webrtc_calls')
      .insert([data])
      .eq('tenant_id', tenantId)
      .single()

    if (error || !webrtcCall) {
      throw error
    }

    return webrtcCall
  }

  async update(id: string, data: UpdateWebrtcCallData, userId: string, tenantId: string): Promise<WebrtcCall> {
    const { data: webrtcCall, error } = await this.supabase
      .from('webrtc_calls')
      .update([data])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !webrtcCall) {
      throw error
    }

    return webrtcCall
  }

  async findById(id: string, tenantId: string): Promise<WebrtcCall | null> {
    const { data, error } = await this.supabase
      .from('webrtc_calls')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) {
      return null
    }

    return data
  }
}

#### Service