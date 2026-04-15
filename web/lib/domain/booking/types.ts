import { z } from 'zod'

export const ConsultationType = z.enum(['in_person', 'video'])
export type ConsultationType = z.infer<typeof ConsultationType>

export interface BookingSelection {
  consultationType: ConsultationType
  serviceId: string | null
  petId: string | null
  date: string
  timeSlot: string
  notes: string
}

export interface VideoConsultationBooking extends BookingSelection {
  consultationType: 'video'
}

#### Repository