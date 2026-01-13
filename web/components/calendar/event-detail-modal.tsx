'use client'

import { useState, useEffect, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
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

function formatEventTime(start: Date, end: Date, allDay: boolean | undefined, allDayLabel: string, dateLocale: Locale): string {
  if (allDay) {
    return allDayLabel
  }
  const startStr = format(start, 'HH:mm', { locale: dateLocale })
  const endStr = format(end, 'HH:mm', { locale: dateLocale })
  return `${startStr} - ${endStr}`
}

function formatEventDate(start: Date, end: Date, allDay: boolean | undefined, dateLocale: Locale): string {
  const dateFormat = dateLocale === es ? "EEEE, d 'de' MMMM" : "EEEE, MMMM d"
  const startDate = format(start, dateFormat, { locale: dateLocale })

  if (allDay && start.toDateString() !== end.toDateString()) {
    const endFormat = dateLocale === es ? "d 'de' MMMM" : "MMMM d"
    const endDate = format(end, endFormat, { locale: dateLocale })
    return `${startDate} - ${endDate}`
  }

  return startDate
}

// Import Locale type
type Locale = typeof es

// =============================================================================
// STATUS BADGE COMPONENT
// =============================================================================

interface StatusBadgeProps {
  status: string
  type: 'appointment' | 'time_off' | 'shift'
  t: ReturnType<typeof useTranslations<'calendar.eventDetail'>>
}

function StatusBadge({ status, type, t }: StatusBadgeProps) {
  let label = status
  let className = 'bg-gray-100 text-gray-800'

  if (type === 'appointment' && statusConfig[status]) {
    label = t(`appointmentStatus.${status}` as any) || statusConfig[status].label
    className = statusConfig[status].className
  } else if (type === 'time_off') {
    const timeOffColors: Record<string, string> = {
      pending: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]',
      approved: 'bg-[var(--status-success-bg)] text-[var(--status-success-text)]',
      denied: 'bg-[var(--status-error-bg)] text-[var(--status-error-text)]',
      cancelled: 'bg-gray-100 text-gray-500',
      withdrawn: 'bg-gray-100 text-gray-500',
    }
    label = t(`timeOffStatus.${status}` as any) || status
    className = timeOffColors[status] || className
  } else if (type === 'shift') {
    const shiftColors: Record<string, string> = {
      scheduled: 'bg-[var(--status-info-bg)] text-[var(--status-info-text)]',
      confirmed: 'bg-[var(--status-success-bg)] text-[var(--status-success-text)]',
      in_progress: 'bg-[var(--status-info-bg)] text-[var(--status-info-text)]',
      completed: 'bg-gray-100 text-gray-800',
      no_show: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]',
      cancelled: 'bg-[var(--status-error-bg)] text-[var(--status-error-text)]',
    }
    label = t(`shiftStatus.${status}` as any) || status
    className = shiftColors[status] || className
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
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
  const t = useTranslations('calendar.eventDetail')
  const tc = useTranslations('calendar')
  const locale = useLocale()
  const dateLocale = locale === 'es' ? es : enUS

  const [isDeleting, setIsDeleting] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isSendingReminder, setIsSendingReminder] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Accessibility: Keyboard handling and focus trap
  useEffect(() => {
    if (!isOpen) return

    // Focus the close button when modal opens
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap - keep focus within modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstEl = focusableElements[0]
        const lastEl = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault()
          lastEl?.focus()
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault()
          firstEl?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !event) return null

  const resource = event.resource as CalendarEventResource | undefined

  const handleEdit = () => {
    onEdit?.(event)
    onClose()
  }

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) {
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
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )
      case 'shift':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case 'time_off':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        )
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  const getTypeLabel = () => {
    const typeKey = `eventTypes.${event.type}` as const
    return t(typeKey as any) || t('eventTypes.event')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="presentation">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
          className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-[var(--bg-default)] shadow-xl transition-all"
        >
          {/* Header */}
          <div className="border-b border-[var(--border)] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: event.color || '#3B82F6' }}
                >
                  {renderTypeIcon()}
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">{getTypeLabel()}</p>
                  <h3 id="event-modal-title" className="text-lg font-semibold text-[var(--text-primary)]">{event.title}</h3>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label={t('close')}
                className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-secondary)]"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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

          {/* Body */}
          <div className="space-y-4 px-6 py-4">
            {/* Date and Time */}
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatEventDate(event.start, event.end, event.allDay, dateLocale)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatEventTime(event.start, event.end, event.allDay, tc('allDay'), dateLocale)}
                </p>
              </div>
            </div>

            {/* Status with dropdown for appointments */}
            {resource?.status && (
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {onStatusChange && event.type === 'appointment' ? (
                  <select
                    value={resource.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isChangingStatus}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
                    aria-label={t('changeStatusLabel')}
                  >
                    <option value="scheduled">{t('appointmentStatus.scheduled')}</option>
                    <option value="confirmed">{t('appointmentStatus.confirmed')}</option>
                    <option value="in_progress">{t('appointmentStatus.in_progress')}</option>
                    <option value="completed">{t('appointmentStatus.completed')}</option>
                    <option value="cancelled">{t('appointmentStatus.cancelled')}</option>
                    <option value="no_show">{t('appointmentStatus.no_show')}</option>
                  </select>
                ) : (
                  <StatusBadge
                    status={resource.status}
                    type={event.type as 'appointment' | 'time_off' | 'shift'}
                    t={t}
                  />
                )}
              </div>
            )}

            {/* Staff */}
            {resource?.staffName && (
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-sm text-gray-900">{resource.staffName}</p>
              </div>
            )}

            {/* Pet (for appointments) with link to profile */}
            {resource?.petName && event.type === 'appointment' && (
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
                <div className="flex-1">
                  {clinicSlug && resource.petId ? (
                    <Link
                      href={`/${clinicSlug}/dashboard/pets/${resource.petId}`}
                      className="text-sm font-medium text-[var(--primary)] hover:underline"
                      onClick={onClose}
                    >
                      {resource.petName}
                    </Link>
                  ) : (
                    <p className="text-sm text-gray-900">{resource.petName}</p>
                  )}
                  {resource.species && <p className="text-xs text-gray-500">{resource.species}</p>}
                </div>
                {clinicSlug && resource.petId && (
                  <Link
                    href={`/${clinicSlug}/dashboard/pets/${resource.petId}`}
                    className="text-xs text-gray-400 hover:text-[var(--primary)]"
                    onClick={onClose}
                    title={t('viewPetProfile')}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            )}

            {/* Owner (for appointments) */}
            {resource?.ownerName && event.type === 'appointment' && (
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-sm text-gray-900">{resource.ownerName}</p>
              </div>
            )}

            {/* Service (for appointments) */}
            {resource?.serviceName && (
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-sm text-gray-900">{resource.serviceName}</p>
              </div>
            )}

            {/* Reason (for appointments) */}
            {resource?.reason && (
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <p className="text-sm text-gray-700">{resource.reason}</p>
              </div>
            )}

            {/* Notes */}
            {resource?.notes && (
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <p className="text-sm text-gray-700">{resource.notes}</p>
              </div>
            )}

            {/* Time off type */}
            {resource?.timeOffType && event.type === 'time_off' && (
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <p className="text-sm text-gray-900">{resource.timeOffType}</p>
              </div>
            )}

            {/* Shift type */}
            {resource?.shiftType && event.type === 'shift' && (
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <p className="text-sm text-gray-900">
                  {t(`shiftTypes.${resource.shiftType}` as any) || resource.shiftType}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons for appointments */}
          {event.type === 'appointment' && (onCheckIn || onSendReminder) && (
            <div className="flex gap-2 border-t border-gray-200 bg-gray-50 px-6 py-3">
              {onCheckIn && resource?.status === 'confirmed' && (
                <button
                  onClick={handleCheckIn}
                  disabled={isCheckingIn}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--status-success-bg)] px-3 py-2 text-sm font-medium text-[var(--status-success-text)] hover:opacity-80 disabled:opacity-50"
                >
                  {isCheckingIn ? (
                    <svg
                      className="h-4 w-4 animate-spin"
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
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {t('checkIn')}
                </button>
              )}
              {onSendReminder && ['scheduled', 'confirmed'].includes(resource?.status || '') && (
                <button
                  onClick={handleSendReminder}
                  disabled={isSendingReminder}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--status-info-bg)] px-3 py-2 text-sm font-medium text-[var(--status-info-text)] hover:opacity-80 disabled:opacity-50"
                >
                  {isSendingReminder ? (
                    <svg
                      className="h-4 w-4 animate-spin"
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
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  )}
                  {t('sendReminder')}
                </button>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--status-error-bg)] px-4 py-2 text-sm font-medium text-[var(--status-error-text)] hover:opacity-80 disabled:opacity-50"
              >
                {isDeleting && (
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
                {isDeleting ? t('deleting') : t('delete')}
              </button>
            )}
            {onEdit && (
              <button
                onClick={handleEdit}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                style={{ backgroundColor: 'var(--primary, #3B82F6)' }}
              >
                {t('edit')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
