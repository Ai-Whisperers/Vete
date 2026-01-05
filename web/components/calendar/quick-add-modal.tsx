'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// =============================================================================
// TYPES
// =============================================================================

interface Pet {
  id: string
  name: string
  species: string
  owner_name?: string
}

interface Service {
  id: string
  name: string
  duration_minutes: number
}

interface Staff {
  id: string
  full_name: string
  color_code: string
}

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    petId: string
    serviceId?: string
    vetId?: string
    startTime: Date
    endTime: Date
    reason: string
    notes?: string
  }) => Promise<void>
  slotInfo: { start: Date; end: Date } | null
  pets: Pet[]
  services: Service[]
  staff: Staff[]
  isLoading?: boolean
}

// =============================================================================
// QUICK ADD MODAL COMPONENT
// =============================================================================

export function QuickAddModal({
  isOpen,
  onClose,
  onSave,
  slotInfo,
  pets,
  services,
  staff,
  isLoading = false,
}: QuickAddModalProps) {
  const [petId, setPetId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [vetId, setVetId] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [petSearch, setPetSearch] = useState('')

  // Conflict detection state
  const [conflicts, setConflicts] = useState<
    Array<{ id: string; pet_name: string; start_time: string; end_time: string }>
  >([])
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check availability function
  const checkAvailability = useCallback(
    async (start: string, end: string, vet?: string) => {
      if (!slotInfo || !start || !end) return

      setIsCheckingAvailability(true)
      try {
        const [startHours, startMinutes] = start.split(':').map(Number)
        const [endHours, endMinutes] = end.split(':').map(Number)

        const startDateTime = new Date(slotInfo.start)
        startDateTime.setHours(startHours, startMinutes, 0, 0)

        const endDateTime = new Date(slotInfo.start)
        endDateTime.setHours(endHours, endMinutes, 0, 0)

        if (endDateTime <= startDateTime) return

        const response = await fetch('/api/calendar/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            vet_id: vet || undefined,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setConflicts(data.conflicts || [])
        }
      } catch {
        // Silently fail - conflicts won't prevent booking
      } finally {
        setIsCheckingAvailability(false)
      }
    },
    [slotInfo]
  )

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && slotInfo) {
      setPetId('')
      setServiceId('')
      setVetId('')
      setReason('')
      setNotes('')
      setError('')
      setPetSearch('')
      setConflicts([])
      setStartTime(format(slotInfo.start, 'HH:mm'))
      setEndTime(format(slotInfo.end, 'HH:mm'))
    }
  }, [isOpen, slotInfo])

  // Debounced availability check when times or vet changes
  useEffect(() => {
    if (!isOpen || !slotInfo || !startTime || !endTime) return

    // Clear previous timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current)
    }

    // Debounce the check
    checkTimeoutRef.current = setTimeout(() => {
      checkAvailability(startTime, endTime, vetId)
    }, 500)

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
      }
    }
  }, [isOpen, slotInfo, startTime, endTime, vetId, checkAvailability])

  // Update end time when service changes
  useEffect(() => {
    if (serviceId && slotInfo) {
      const selectedService = services.find((s) => s.id === serviceId)
      if (selectedService) {
        const start = new Date(slotInfo.start)
        const [hours, minutes] = startTime.split(':').map(Number)
        start.setHours(hours, minutes, 0, 0)
        const end = new Date(start.getTime() + selectedService.duration_minutes * 60000)
        setEndTime(format(end, 'HH:mm'))
      }
    }
  }, [serviceId, startTime, services, slotInfo])

  // Filter pets by search
  const filteredPets = petSearch
    ? pets.filter(
        (pet) =>
          pet.name.toLowerCase().includes(petSearch.toLowerCase()) ||
          pet.owner_name?.toLowerCase().includes(petSearch.toLowerCase())
      )
    : pets.slice(0, 10) // Show first 10 by default

  if (!isOpen || !slotInfo) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!petId) {
      setError('Selecciona una mascota')
      return
    }

    if (!reason.trim()) {
      setError('Ingresa el motivo de la cita')
      return
    }

    setIsSaving(true)

    try {
      const [startHours, startMinutes] = startTime.split(':').map(Number)
      const [endHours, endMinutes] = endTime.split(':').map(Number)

      const start = new Date(slotInfo.start)
      start.setHours(startHours, startMinutes, 0, 0)

      const end = new Date(slotInfo.start)
      end.setHours(endHours, endMinutes, 0, 0)

      if (end <= start) {
        setError('La hora de fin debe ser posterior a la hora de inicio')
        return
      }

      await onSave({
        petId,
        serviceId: serviceId || undefined,
        vetId: vetId || undefined,
        startTime: start,
        endTime: end,
        reason,
        notes: notes || undefined,
      })

      onClose()
    } catch {
      setError('Error al guardar la cita')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-[var(--bg-paper)] shadow-xl transition-all">
          {/* Header */}
          <div className="border-b border-[var(--border-light,#f3f4f6)] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Nueva Cita</h3>
                <p className="text-sm text-gray-500">
                  {format(slotInfo.start, "EEEE, d 'de' MMMM", { locale: es })}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-4">
              {/* Error message - TICKET-A11Y-004: Added role="alert" for screen readers */}
              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-lg border border-[var(--status-error-border)] bg-[var(--status-error-bg)] p-3 text-sm text-[var(--status-error-text)]"
                >
                  {error}
                </div>
              )}

              {/* Conflict warning */}
              {conflicts.length > 0 && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-lg border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] p-3"
                >
                  <div className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-[var(--status-warning)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-[var(--status-warning-text)]">
                        {conflicts.length} cita{conflicts.length !== 1 ? 's' : ''} en conflicto
                      </p>
                      <ul className="mt-1 space-y-0.5 text-xs text-[var(--status-warning-text)]">
                        {conflicts.slice(0, 3).map((conflict) => (
                          <li key={conflict.id}>
                            {conflict.pet_name} ({format(new Date(conflict.start_time), 'HH:mm')} -{' '}
                            {format(new Date(conflict.end_time), 'HH:mm')})
                          </li>
                        ))}
                        {conflicts.length > 3 && (
                          <li className="text-[var(--status-warning)]">... y {conflicts.length - 3} más</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Availability check indicator */}
              {isCheckingAvailability && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verificando disponibilidad...
                </div>
              )}

              {/* Pet selection */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mascota *</label>
                <input
                  type="text"
                  placeholder="Buscar por nombre o dueño..."
                  value={petSearch}
                  onChange={(e) => setPetSearch(e.target.value)}
                  className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-200">
                  {filteredPets.length === 0 ? (
                    <p className="p-3 text-center text-sm text-gray-500">
                      No se encontraron mascotas
                    </p>
                  ) : (
                    filteredPets.map((pet) => (
                      <button
                        key={pet.id}
                        type="button"
                        onClick={() => setPetId(pet.id)}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                          petId === pet.id ? 'bg-[var(--primary)]/10' : ''
                        }`}
                      >
                        <span>
                          <span className="font-medium">{pet.name}</span>
                          <span className="ml-2 text-gray-500">({pet.species})</span>
                        </span>
                        {pet.owner_name && (
                          <span className="text-xs text-gray-400">{pet.owner_name}</span>
                        )}
                        {petId === pet.id && (
                          <svg
                            className="h-4 w-4 text-[var(--primary)]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Hora inicio
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Hora fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Service */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Servicio</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">Seleccionar servicio (opcional)</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Veterinarian */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Veterinario</label>
                <select
                  value={vetId}
                  onChange={(e) => setVetId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">Asignar automáticamente</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Motivo de la cita *
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: Consulta general, vacunación, etc."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Notas adicionales
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Información adicional..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving || isLoading}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary, #3B82F6)' }}
              >
                {(isSaving || isLoading) && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {isSaving ? 'Guardando...' : 'Crear Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
