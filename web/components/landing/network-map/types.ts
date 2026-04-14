/**
 * Network Map Types
 *
 * Type definitions for tenant network map components.
 */

export interface TenantLocation {
  id: string
  name: string
  address: string
  city: string
  neighborhood: string
  coordinates: { lat: number; lng: number }
  phone: string
  hours: {
    weekdays: string
    saturday: string
    sunday: string
  }
  specialties: string[]
  rating: number
  isOpen?: boolean
  distance?: string
  emergency24h: boolean
}
