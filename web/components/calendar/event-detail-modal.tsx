'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import type {
  CalendarEvent,
  CalendarEventResource,
  SHIFT_TYPE_LABELS,
  TIME_OFF_STATUS_LABELS,
} from '@/lib/types/calendar'
import { statusConfig } from '@/lib/types/appointments'

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface EventDetailModalProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (event: CalendarEvent) => void
  onDelete?: (event: CalendarEvent) => void
  onStatusChange?: (event: CalendarEvent, newStatus: string) => Promise<void>
  onCheckIn?: (event: CalendarEvent) => Promise<void>
  onSendReminder?: (event: CalendarEvent) => Promise<void>
  clinicSlug?: string
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatEventTime(start: Date, end: Date, allDay?: boolean): string {
  if (allDay) {
    return 'Todo el día'
  }
  const startStr = format(start, 'HH:mm', { locale: es })
  const endStr = format(end, 'HH:mm', { locale: es })
  return `${startStr} - ${endStr}`
}

function formatEventDate(start: Date, end: Date, allDay?: boolean): string {
  const startDate = format(start, "EEEE, d 'de' MMMM", { locale: es })

  if (allDay && start.toDateString() !== end.toDateString()) {
    const endDate = format(end, "d 'de' MMMM", { locale: es })
    return `${startDate} - ${endDate}`
  }

  return startDate
}

// =============================================================================
// STATUS BADGE COMPONENT
// =============================================================================

interface StatusBadgeProps {
  status: string
  type: 'appointment' | 'time_off' | 'shift'
}

function StatusBadge({ status, type }: StatusBadgeProps) {
  let label = status
  let className = 'bg-gray-100 text-gray-800'

  if (type === 'appointment' && statusConfig[status]) {
    label = statusConfig[status].label
    className = statusConfig[status].className
  } else if (type === 'time_off') {
    const timeOffLabels: Record<string, string> = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      denied: 'Rechazada',
      cancelled: 'Cancelada',
      withdrawn: 'Retirada',
    }
    const timeOffColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-500',
      withdrawn: 'bg-gray-100 text-gray-500',
    }
    label = timeOffLabels[status] || status
    className = timeOffColors[status] || className
  } else if (type === 'shift') {
    const shiftLabels: Record<string, string> = {
      scheduled: 'Programado',
      confirmed: 'Confirmado',
      in_progress: 'En Progreso',
      completed: 'Completado',
      no_show: 'No Asistió',
      cancelled: 'Cancelado',
    }
    const shiftColors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      no_show: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    label = shiftLabels[status] || status
    className = shiftColors[status] || className
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

// =============================================================================
// EVENT DETAIL MODAL COMPONENT
// =============================================================================

export function EventDetailModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onCheckIn,
  onSendReminder,
  clinicSlug,
}: EventDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isSendingReminder, setIsSendingReminder] = useState(false)

  if (!isOpen || !event) return null

  const resource = event.resource as CalendarEventResource | undefined

  const handleEdit = () => {
    onEdit?.(event)
    onClose()
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      return
    }

    setIsDeleting(true)
    try {
      onDelete?.(event)
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!onStatusChange || !event) return

    setIsChangingStatus(true)
    try {
      await onStatusChange(event, newStatus)
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleCheckIn = async () => {
    if (!onCheckIn || !event) return

    setIsCheckingIn(true)
    try {
      await onCheckIn(event)
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleSendReminder = async () => {
    if (!onSendReminder || !event) return

    setIsSendingReminder(true)
    try {
      await onSendReminder(event)
    } finally {
      setIsSendingReminder(false)
    }
  }

  // Render event type icon
  const renderTypeIcon = () => {
    switch (event.type) {
      case 'appointment':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'shift':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'time_off':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getTypeLabel = () => {
    switch (event.type) {
      case 'appointment': return 'Cita'
      case 'shift': return 'Turno'
      case 'time_off': return 'Ausencia'
      case 'block': return 'Bloqueo'
      case 'task': return 'Tarea'
      default: return 'Evento'
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
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: event.color || '#3B82F6' }}
                >
                  {renderTypeIcon()}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{getTypeLabel()}</p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h3>
                </div>
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

          {/* Body */}
          <div className="px-6 py-4 space-y-4">
            {/* Date and Time */}
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatEventDate(event.start, event.end, event.allDay)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatEventTime(event.start, event.end, event.allDay)}
                </p>
              </div>
            </div>

            {/* Status with dropdown for appointments */}
            {resource?.status && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {onStatusChange && event.type === 'appointment' ? (
                  <select
                    value={resource.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isChangingStatus}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:opacity-50"
                    aria-label="Cambiar estado de la cita"
                  >
                    <option value="scheduled">Programada</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="no_show">No Asistió</option>
                  </select>
                ) : (
                  <StatusBadge
                    status={resource.status}
                    type={event.type as 'appointment' | 'time_off' | 'shift'}
                  />
                )}
              </div>
            )}

            {/* Staff */}
            {resource?.staffName && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm text-gray-900">{resource.staffName}</p>
              </div>
            )}

            {/* Pet (for appointments) with link to profile */}
            {resource?.petName && event.type === 'appointment' && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <div className="flex-1">
                  {clinicSlug && resource.petId ? (
                    <Link
                      href={`/${clinicSlug}/dashboard/pets/${resource.petId}`}
                      className="text-sm text-[var(--primary)] hover:underline font-medium"
                      onClick={onClose}
                    >
                      {resource.petName}
                    </Link>
                  ) : (
                    <p className="text-sm text-gray-900">{resource.petName}</p>
                  )}
                  {resource.species && (
                    <p className="text-xs text-gray-500">{resource.species}</p>
                  )}
                </div>
                {clinicSlug && resource.petId && (
                  <Link
                    href={`/${clinicSlug}/dashboard/pets/${resource.petId}`}
                    className="text-xs text-gray-400 hover:text-[var(--primary)]"
                    onClick={onClose}
                    title="Ver perfil de la mascota"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                )}
              </div>
            )}

            {/* Owner (for appointments) */}
            {resource?.ownerName && event.type === 'appointment' && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm text-gray-900">{resource.ownerName}</p>
              </div>
            )}

            {/* Service (for appointments) */}
            {resource?.serviceName && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm text-gray-900">{resource.serviceName}</p>
              </div>
            )}

            {/* Reason (for appointments) */}
            {resource?.reason && (
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <p className="text-sm text-gray-700">{resource.reason}</p>
              </div>
            )}

            {/* Notes */}
            {resource?.notes && (
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-sm text-gray-700">{resource.notes}</p>
              </div>
            )}

            {/* Time off type */}
            {resource?.timeOffType && event.type === 'time_off' && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-sm text-gray-900">{resource.timeOffType}</p>
              </div>
            )}

            {/* Shift type */}
            {resource?.shiftType && event.type === 'shift' && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-sm text-gray-900">
                  {resource.shiftType === 'regular' ? 'Regular' :
                   resource.shiftType === 'overtime' ? 'Horas Extra' :
                   resource.shiftType === 'on_call' ? 'Guardia' :
                   resource.shiftType === 'emergency' ? 'Emergencia' :
                   resource.shiftType === 'training' ? 'Capacitación' :
                   resource.shiftType === 'meeting' ? 'Reunión' : resource.shiftType}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons for appointments */}
          {event.type === 'appointment' && (onCheckIn || onSendReminder) && (
            <div className="border-t border-gray-200 px-6 py-3 flex gap-2 bg-gray-50">
              {onCheckIn && resource?.status === 'confirmed' && (
                <button
                  onClick={handleCheckIn}
                  disabled={isCheckingIn}
                  className="flex-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {isCheckingIn ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  Check-in
                </button>
              )}
              {onSendReminder && ['scheduled', 'confirmed'].includes(resource?.status || '') && (
                <button
                  onClick={handleSendReminder}
                  disabled={isSendingReminder}
                  className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {isSendingReminder ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  )}
                  Enviar Recordatorio
                </button>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isDeleting && (
                  <svg
                    className="animate-spin h-4 w-4"
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
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            )}
            {onEdit && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: 'var(--primary, #3B82F6)' }}
              >
                Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
