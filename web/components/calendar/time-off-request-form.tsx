'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { TimeOffType, TimeOffBalance, TimeOffRequestFormData } from '@/lib/types/calendar'

// =============================================================================
// TYPES
// =============================================================================

interface TimeOffRequestFormProps {
  types: TimeOffType[]
  balances?: TimeOffBalance[]
  onSubmit: (data: TimeOffRequestFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  initialData?: Partial<TimeOffRequestFormData>
}

// =============================================================================
// COMPONENT
// =============================================================================

export function TimeOffRequestForm({
  types,
  balances = [],
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}: TimeOffRequestFormProps) {
  const [typeId, setTypeId] = useState(initialData?.time_off_type_id || '')
  const [startDate, setStartDate] = useState(initialData?.start_date || '')
  const [endDate, setEndDate] = useState(initialData?.end_date || '')
  const [startHalfDay, setStartHalfDay] = useState(initialData?.start_half_day || false)
  const [endHalfDay, setEndHalfDay] = useState(initialData?.end_half_day || false)
  const [reason, setReason] = useState(initialData?.reason || '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Get selected type details
  const selectedType = types.find((t) => t.id === typeId)
  const selectedBalance = balances.find((b) => b.time_off_type_id === typeId)

  // Calculate days requested
  const calculateDays = (): number => {
    if (!startDate || !endDate) return 0

    const start = new Date(startDate)
    const end = new Date(endDate)
    const msPerDay = 1000 * 60 * 60 * 24
    let days = Math.ceil((end.getTime() - start.getTime()) / msPerDay) + 1

    if (startHalfDay) days -= 0.5
    if (endHalfDay) days -= 0.5

    return Math.max(0, days)
  }

  const daysRequested = calculateDays()

  // Validation
  const validate = (): string | null => {
    if (!typeId) return 'Selecciona un tipo de ausencia'
    if (!startDate) return 'Selecciona la fecha de inicio'
    if (!endDate) return 'Selecciona la fecha de fin'

    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (start > end) return 'La fecha de inicio debe ser anterior a la fecha de fin'
    if (start < today) return 'La fecha de inicio no puede ser en el pasado'

    // Check min notice days
    if (selectedType?.min_notice_days) {
      const minDate = new Date(today)
      minDate.setDate(minDate.getDate() + selectedType.min_notice_days)
      if (start < minDate) {
        return `Se requieren al menos ${selectedType.min_notice_days} días de anticipación`
      }
    }

    // Check available balance
    if (selectedBalance && selectedType?.max_days_per_year) {
      const available = selectedBalance.available_days
      if (daysRequested > available) {
        return `Solo tienes ${available} días disponibles de ${selectedType.name}`
      }
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)

    try {
      await onSubmit({
        time_off_type_id: typeId,
        start_date: startDate,
        end_date: endDate,
        start_half_day: startHalfDay,
        end_half_day: endHalfDay,
        reason: reason || undefined,
      })
    } catch {
      setError('Error al enviar la solicitud')
    } finally {
      setIsSaving(false)
    }
  }

  // Set default end date when start date changes
  useEffect(() => {
    if (startDate && !endDate) {
      setEndDate(startDate)
    }
  }, [startDate, endDate])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error message - TICKET-A11Y-004: Added role="alert" for screen readers */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="border-[var(--status-error,#ef4444)]/20 rounded-lg border bg-[var(--status-error-bg,#fee2e2)] p-3 text-sm text-[var(--status-error,#dc2626)]"
        >
          {error}
        </div>
      )}

      {/* Type selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
          Tipo de ausencia *
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {types.map((type) => {
            const balance = balances.find((b) => b.time_off_type_id === type.id)
            const isSelected = typeId === type.id

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setTypeId(type.id)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-[var(--primary)] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: type.color_code }}
                  />
                  <span className="font-medium text-gray-900">{type.name}</span>
                </div>
                {type.description && (
                  <p className="mt-1 text-xs text-gray-500">{type.description}</p>
                )}
                {balance && type.max_days_per_year && (
                  <p className="mt-2 text-xs">
                    <span className="text-gray-500">Disponible: </span>
                    <span className="font-medium text-gray-900">
                      {balance.available_days} / {type.max_days_per_year} días
                    </span>
                  </p>
                )}
                {type.requires_approval && (
                  <p className="mt-1 text-xs text-yellow-600">Requiere aprobación</p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Date selection */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de inicio *</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          {selectedType?.allows_half_day && (
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={startHalfDay}
                onChange={(e) => setStartHalfDay(e.target.checked)}
                className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              Empezar a medio día
            </label>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de fin *</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split('T')[0]}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          {selectedType?.allows_half_day && startDate !== endDate && (
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={endHalfDay}
                onChange={(e) => setEndHalfDay(e.target.checked)}
                className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              Terminar a medio día
            </label>
          )}
        </div>
      </div>

      {/* Days summary */}
      {daysRequested > 0 && (
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total de días solicitados:</span>
            <span className="text-lg font-semibold text-gray-900">
              {daysRequested} {daysRequested === 1 ? 'día' : 'días'}
            </span>
          </div>
          {startDate && endDate && (
            <p className="mt-1 text-xs text-gray-500">
              {format(new Date(startDate), "d 'de' MMMM", { locale: es })}
              {startDate !== endDate && (
                <> - {format(new Date(endDate), "d 'de' MMMM, yyyy", { locale: es })}</>
              )}
              {startDate === endDate && (
                <>, {format(new Date(startDate), 'yyyy', { locale: es })}</>
              )}
            </p>
          )}
        </div>
      )}

      {/* Reason */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Motivo {selectedType?.requires_approval ? '*' : '(opcional)'}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Describe el motivo de tu solicitud..."
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>

      {/* Notice about approval */}
      {selectedType?.requires_approval && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-yellow-600"
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
              <p className="text-sm font-medium text-yellow-800">
                Esta solicitud requiere aprobación
              </p>
              <p className="mt-1 text-xs text-yellow-700">
                Tu solicitud será revisada por un administrador antes de ser confirmada.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving || isLoading}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--primary, #3B82F6)' }}
        >
          {isSaving ? 'Enviando...' : 'Enviar Solicitud'}
        </button>
      </div>
    </form>
  )
}
