import { create } from 'zustand'
import {
  Syringe,
  Stethoscope,
  Scissors,
  UserCircle,
  Activity,
  Heart,
  Microscope,
  Sparkles,
  FileText,
  Building2,
  Leaf,
  PawPrint,
  type LucideIcon,
} from 'lucide-react'
import type {
  Step,
  BookingSelection,
  ServiceFromJSON,
  BookableService,
  Pet,
  ClinicConfig,
} from '@/components/booking/booking-wizard/types'
import { MAX_SERVICES_PER_BOOKING } from '@/components/booking/booking-wizard/types'

// Icon mapping from string names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Syringe,
  Stethoscope,
  Scissors,
  UserCircle,
  Activity,
  Heart,
  Microscope,
  Sparkles,
  FileText,
  Building2,
  Leaf,
  PawPrint,
}

// Color mapping by service category
const CATEGORY_COLORS: Record<string, string> = {
  clinical: 'bg-green-50 text-green-600',
  preventive: 'bg-blue-50 text-blue-600',
  specialty: 'bg-amber-50 text-amber-600',
  diagnostics: 'bg-purple-50 text-purple-600',
  surgery: 'bg-rose-50 text-rose-600',
  hospital: 'bg-red-50 text-red-600',
  holistic: 'bg-emerald-50 text-emerald-600',
  grooming: 'bg-pink-50 text-pink-600',
  luxury: 'bg-yellow-50 text-yellow-600',
  documents: 'bg-slate-50 text-slate-600',
}

function parsePrice(priceStr: string | undefined): number {
  if (!priceStr) return 0
  return parseInt(priceStr.replace(/\./g, ''), 10) || 0
}

// Type for services data which can be either a direct array or categorized structure
interface ServiceCategory {
  services?: ServiceFromJSON[]
}

interface CategorizedServices {
  categories: ServiceCategory[]
}

type ServicesData = ServiceFromJSON[] | CategorizedServices | null | undefined

function extractServices(servicesData: ServicesData): ServiceFromJSON[] {
  if (!servicesData) return []
  if (Array.isArray(servicesData)) return servicesData
  if ('categories' in servicesData && Array.isArray(servicesData.categories)) {
    return servicesData.categories.flatMap((cat) => cat.services || [])
  }
  return []
}

function transformServices(jsonServices: ServiceFromJSON[]): BookableService[] {
  return jsonServices
    .filter((s) => s.booking?.online_enabled === true)
    .map((s) => ({
      id: s.id,
      name: s.title,
      icon: ICON_MAP[s.icon || ''] || PawPrint,
      duration: s.booking?.duration_minutes || 30,
      price: parsePrice(s.booking?.price_from),
      color: CATEGORY_COLORS[s.category || ''] || 'bg-gray-50 text-gray-600',
    }))
}

interface BookingState {
  // State
  clinicId: string
  pets: Pet[]
  step: Step
  selection: BookingSelection
  isSubmitting: boolean
  submitError: string | null

  // Computed/Derived (cached in store for convenience)
  services: BookableService[]

  // Actions
  setStep: (step: Step) => void
  updateSelection: (updates: Partial<BookingSelection>) => void
  toggleService: (serviceId: string) => void
  clearServices: () => void
  initialize: (
    clinic: ClinicConfig,
    userPets: Pet[],
    initialServiceIds?: string[],
    initialPetId?: string
  ) => void
  submitBooking: () => Promise<boolean>
  reset: () => void

  // Computed selectors
  getSelectedServices: () => BookableService[]
  getTotalDuration: () => number
  getTotalPrice: () => number
  getEndTime: () => string
}

const initialSelection: BookingSelection = {
  serviceId: null,
  serviceIds: [],
  petId: null,
  date: '',
  time_slot: '',
  notes: '',
}

export const useBookingStore = create<BookingState>((set, get) => ({
  clinicId: '',
  pets: [],
  step: 'service',
  selection: initialSelection,
  isSubmitting: false,
  submitError: null,
  services: [],

  setStep: (step) => set({ step }),

  updateSelection: (updates) =>
    set((state) => ({
      selection: { ...state.selection, ...updates },
    })),

  toggleService: (serviceId: string) => {
    const { selection } = get()
    const current = selection.serviceIds

    let updated: string[]
    if (current.includes(serviceId)) {
      // Remove service
      updated = current.filter((id) => id !== serviceId)
    } else {
      // Add service (check limit)
      if (current.length >= MAX_SERVICES_PER_BOOKING) {
        // Don't add, limit reached
        return
      }
      updated = [...current, serviceId]
    }

    set({
      selection: {
        ...selection,
        serviceIds: updated,
        // Keep serviceId in sync for backwards compat (first selected)
        serviceId: updated.length > 0 ? updated[0] : null,
      },
    })
  },

  clearServices: () => {
    const { selection } = get()
    set({
      selection: {
        ...selection,
        serviceIds: [],
        serviceId: null,
      },
    })
  },

  initialize: (clinic, userPets, initialServiceIds = [], initialPetId) => {
    const servicesList = extractServices(clinic.services as ServicesData)
    const transformed = transformServices(servicesList)

    // Filter valid service IDs (must exist in available services)
    const validServiceIds = initialServiceIds.filter((id) =>
      transformed.some((s) => s.id === id)
    )

    // Determine initial pet: explicit param > single pet auto-select > null
    const resolvedPetId =
      initialPetId && userPets.some((p) => p.id === initialPetId)
        ? initialPetId
        : userPets.length === 1
          ? userPets[0].id
          : null

    // Determine initial step based on what's pre-selected
    let initialStep: Step = 'service'
    if (validServiceIds.length > 0 && resolvedPetId) {
      initialStep = 'datetime' // Both service(s) and pet selected, go to date
    } else if (validServiceIds.length > 0) {
      initialStep = 'pet' // Service(s) selected, need pet
    }

    set({
      clinicId: clinic.config.id,
      pets: userPets,
      services: transformed,
      step: initialStep,
      selection: {
        ...initialSelection,
        serviceIds: validServiceIds,
        serviceId: validServiceIds.length > 0 ? validServiceIds[0] : null,
        petId: resolvedPetId,
      },
    })
  },

  submitBooking: async () => {
    const { isSubmitting, selection, clinicId, services } = get()
    if (isSubmitting) return false

    // Validate required fields
    if (selection.serviceIds.length === 0) {
      set({ submitError: 'Por favor selecciona al menos un servicio' })
      return false
    }
    if (!selection.petId) {
      set({ submitError: 'Por favor selecciona una mascota' })
      return false
    }
    if (!selection.date || !selection.time_slot) {
      set({ submitError: 'Por favor selecciona fecha y hora' })
      return false
    }

    set({ isSubmitting: true, submitError: null })

    try {
      const startDateTime = new Date(`${selection.date}T${selection.time_slot}`)

      if (selection.serviceIds.length === 1) {
        // Single service: use existing flow
        const service = services.find((s) => s.id === selection.serviceIds[0])
        const input = {
          clinic: clinicId,
          pet_id: selection.petId,
          start_time: startDateTime.toISOString(),
          reason: service?.name || 'Consulta General',
          notes: selection.notes || null,
        }

        const { createAppointmentJson } = await import('@/app/actions/create-appointment')
        const result = await createAppointmentJson(input)

        if (result.success) {
          set({ step: 'success' })
          return true
        } else {
          set({ submitError: result.error || 'No se pudo procesar la reserva' })
          return false
        }
      } else {
        // Multi-service: use new flow
        const input = {
          clinic: clinicId,
          pet_id: selection.petId,
          start_time: startDateTime.toISOString(),
          service_ids: selection.serviceIds,
          notes: selection.notes || null,
        }

        const { createMultiServiceAppointmentJson } = await import(
          '@/app/actions/create-appointment'
        )
        const result = await createMultiServiceAppointmentJson(input)

        if (result.success) {
          set({ step: 'success' })
          return true
        } else {
          set({ submitError: result.error || 'No se pudo procesar la reserva' })
          return false
        }
      }
    } catch (e) {
      console.error(e)
      set({ submitError: 'Error de conexión con el servidor. Por favor intenta de nuevo.' })
      return false
    } finally {
      set({ isSubmitting: false })
    }
  },

  reset: () =>
    set({
      clinicId: '',
      pets: [],
      step: 'service',
      selection: initialSelection,
      isSubmitting: false,
      submitError: null,
      services: [],
    }),

  // Computed selectors
  getSelectedServices: () => {
    const { services, selection } = get()
    return services.filter((s) => selection.serviceIds.includes(s.id))
  },

  getTotalDuration: () => {
    const selectedServices = get().getSelectedServices()
    return selectedServices.reduce((sum, s) => sum + s.duration, 0)
  },

  getTotalPrice: () => {
    const selectedServices = get().getSelectedServices()
    return selectedServices.reduce((sum, s) => sum + s.price, 0)
  },

  getEndTime: () => {
    const { selection } = get()
    const totalDuration = get().getTotalDuration()

    if (!selection.time_slot || totalDuration === 0) return ''

    const [hours, minutes] = selection.time_slot.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + totalDuration

    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60

    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
  },
}))

/**
 * Format price number for display (e.g., 50000 -> "50.000")
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return '0'
  return price.toLocaleString('es-PY')
}

/**
 * Format date for input value (YYYY-MM-DD) using local timezone
 */
export function getLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
