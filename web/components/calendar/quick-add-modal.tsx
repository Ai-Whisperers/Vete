'use client'

import { useState, useEffect } from 'react'
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
      setStartTime(format(slotInfo.start, 'HH:mm'))
      setEndTime(format(slotInfo.end, 'HH:mm'))
    }
  }, [isOpen, slotInfo])

  // Update end time when service changes
  useEffect(() => {
    if (serviceId && slotInfo) {
      const selectedService = services.find(s => s.id === serviceId)
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
        pet =>
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
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-[var(--bg-paper)] shadow-xl transition-all">
          {/* Header */}
          <div className="border-b border-[var(--border-light,#f3f4f6)] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Nueva Cita
                </h3>
                <p className="text-sm text-gray-500">
                  {format(slotInfo.start, "EEEE, d 'de' MMMM", { locale: es })}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Error message - TICKET-A11Y-004: Added role="alert" for screen readers */}
              {error && (
                <div role="alert" aria-live="assertive" className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Pet selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mascota *
                </label>
                <input
                  type="text"
                  placeholder="Buscar por nombre o dueño..."
                  value={petSearch}
                  onChange={e => setPetSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent mb-2"
                />
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredPets.length === 0 ? (
                    <p className="p-3 text-sm text-gray-500 text-center">
                      No se encontraron mascotas
                    </p>
                  ) : (
                    filteredPets.map(pet => (
                      <button
                        key={pet.id}
                        type="button"
                        onClick={() => setPetId(pet.id)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                          petId === pet.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <span>
                          <span className="font-medium">{pet.name}</span>
                          <span className="text-gray-500 ml-2">({pet.species})</span>
                        </span>
                        {pet.owner_name && (
                          <span className="text-xs text-gray-400">
                            {pet.owner_name}
                          </span>
                        )}
                        {petId === pet.id && (
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora inicio
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora fin
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio
                </label>
                <select
                  value={serviceId}
                  onChange={e => setServiceId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                >
                  <option value="">Seleccionar servicio (opcional)</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Veterinarian */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Veterinario
                </label>
                <select
                  value={vetId}
                  onChange={e => setVetId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                >
                  <option value="">Asignar automáticamente</option>
                  {staff.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de la cita *
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Ej: Consulta general, vacunación, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Información adicional..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving || isLoading}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary, #3B82F6)' }}
              >
                {isSaving ? 'Guardando...' : 'Crear Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
