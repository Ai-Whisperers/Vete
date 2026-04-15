import { create } from 'zustand'
import { VideoConsultationBooking } from '../domain/booking/types'

interface BookingState {
  consultationType: 'video'
  serviceId: string | null
  petId: string | null
  date: string
  timeSlot: string
  notes: string

  updateSelection: (updates: Partial<VideoConsultationBooking>) => void
}

const useBookingStore = create<BookingState>((set, get) => ({
  consultationType: 'video',
  serviceId: null,
  petId: null,
  date: '',
  timeSlot: '',
  notes: '',

  updateSelection: (updates) =>
    set((state) => ({
      ...state,
      ...updates,
    })),
}))

export { useBookingStore }