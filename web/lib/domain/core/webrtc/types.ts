import { z } from 'zod'

export const WebrtcCallStatus = z.enum(['pending', 'in_progress', 'completed', 'cancelled'])
export const WebrtcCallType = z.enum(['video', 'audio'])

export type WebrtcCall = {
  id: string
  tenant_id: string
  caller_id: string
  caller_type: 'vet' | 'owner'
  callee_id: string
  callee_type: 'vet' | 'owner' | 'pet'
  status: WebrtcCallStatus
  type: WebrtcCallType
  start_time: Date | null
  end_time: Date | null
  created_at: Date
  updated_at: Date
}

export type CreateWebrtcCallData = {
  caller_id: string
  caller_type: 'vet' | 'owner'
  callee_id: string
  callee_type: 'vet' | 'owner' | 'pet'
  type: WebrtcCallType
}

export type UpdateWebrtcCallData = {
  status?: WebrtcCallStatus
  start_time?: Date | null
  end_time?: Date | null
}

#### Repository