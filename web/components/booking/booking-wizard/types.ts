import { type LucideIcon } from 'lucide-react'

/**
 * Service data from JSON configuration
 */
export interface ServiceFromJSON {
  id: string
  title: string
  category?: string
  icon?: string
  description?: string
  booking?: {
    online_enabled?: boolean
    duration_minutes?: number
    price_from?: string
  }
  variants?: Array<{
    name: string
    price: string
    duration?: string
  }>
}

/**
 * Transformed service ready for booking
 */
export interface BookableService {
  id: string
  name: string
  icon: LucideIcon
  duration: number
  price: number
  color: string
}

/**
 * Pet entity
 */
export interface Pet {
  id: string
  name: string
  species: string
  breed: string
}

/**
 * Clinic configuration (flexible to accept ClinicData)
 */
export interface ClinicConfig {
  config: {
    id: string
    name: string
    ui_labels?: {
      booking?: {
        title?: string
        select_service?: string
        select_date?: string
        select_time?: string
        select_pet?: string
        your_info?: string
        confirm_btn?: string
        success_title?: string
        success_message?: string
        available_slots?: string
        no_slots?: string
      }
      common?: {
        loading?: string
        error?: string
        retry?: string
        actions?: {
          save?: string
          cancel?: string
          edit?: string
          delete?: string
          confirm?: string
          close?: string
          back?: string
          next?: string
          submit?: string
          search?: string
          filter?: string
          clear?: string
          download?: string
        }
      }
    }
  }
  services?:
    | ServiceFromJSON[]
    | {
        hero?: any
        categories?: Array<{
          services?: ServiceFromJSON[]
        }>
        pricing?: any
      }
}

/**
 * User entity
 */
export interface User {
  id: string
  email: string
}

/**
 * Booking wizard step
 */
export type Step = 'service' | 'pet' | 'datetime' | 'confirm' | 'success'

/**
 * Booking selection state
 */
export interface BookingSelection {
  serviceId: string | null // Legacy: kept for backwards compatibility
  serviceIds: string[] // Multi-service selection
  petId: string | null
  date: string
  time_slot: string
  notes: string
}

/**
 * Multi-service booking summary
 */
export interface MultiServiceSummary {
  services: BookableService[]
  totalDuration: number
  totalPrice: number
  startTime: string
  endTime: string
}

/**
 * Maximum services allowed per booking
 */
export const MAX_SERVICES_PER_BOOKING = 5

/**
 * Progress percentage by step
 */
export const PROGRESS: Record<Step, number> = {
  service: 25,
  pet: 50,
  datetime: 75,
  confirm: 90,
  success: 100,
}
