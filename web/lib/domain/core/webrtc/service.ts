import { WebrtcCallRepository } from './repository'
import { WebrtcCall, CreateWebrtcCallData, UpdateWebrtcCallData } from './types'

export class WebrtcCallService {
  private repository: WebrtcCallRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new WebrtcCallRepository(supabase)
  }

  async createWebrtcCall(data: CreateWebrtcCallData, userId: string, tenantId: string): Promise<WebrtcCall> {
    return this.repository.create(data, userId, tenantId)
  }

  async updateWebrtcCall(id: string, data: UpdateWebrtcCallData, userId: string, tenantId: string): Promise<WebrtcCall> {
    return this.repository.update(id, data, userId, tenantId)
  }

  async getWebrtcCall(id: string, tenantId: string): Promise<WebrtcCall | null> {
    return this.repository.findById(id, tenantId)
  }
}

### Server Actions