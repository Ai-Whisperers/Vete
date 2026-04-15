import { z } from 'zod'

export const SightingStatus = z.enum(['new', 'verified', 'resolved'])
export type SightingStatus = z.infer<typeof SightingStatus>

export const SightingType = z.enum(['visual', 'audio', 'other'])
export type SightingType = z.infer<typeof SightingType>

export interface Sighting {
  id: string
  pet_id: string
  tenant_id: string
  type: SightingType
  location: {
    lat: number
    lng: number
  }
  timestamp: Date
  status: SightingStatus
  description: string | null
  created_at: Date
  updated_at: Date
}

export interface CreateSightingData {
  pet_id: string
  type: SightingType
  location: {
    lat: number
    lng: number
  }
  timestamp: Date
  description: string | null
}

export interface UpdateSightingData {
  status: SightingStatus
  description: string | null
}

export interface SightingFilters {
  pet_id: string
  status: SightingStatus | null
  start_time: Date | null
  end_time: Date | null
}