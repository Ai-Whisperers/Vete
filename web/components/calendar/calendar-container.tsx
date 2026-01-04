'use client'

import { useState, useCallback, useMemo } from 'react'
import { Calendar } from './calendar'
import { CalendarSkeleton } from './calendar-skeleton'
import { EventDetailModal } from './event-detail-modal'
import { QuickAddModal } from './quick-add-modal'
import { useCalendarShortcuts } from '@/hooks/use-calendar-shortcuts'
import { useCalendarEvents } from '@/hooks/use-calendar-events'
import type {
  CalendarEvent,
  CalendarView,
  CalendarEventType,
} from '@/lib/types/calendar'

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
  user_id: string
  full_name: string
  job_title: string
  color_code: string
  avatar_url?: string | null
}

interface CalendarContainerProps {
  initialEvents: CalendarEvent[]
  initialDate?: Date
  initialView?: CalendarView
  pets?: Pet[]
  services?: Service[]
  staff?: Staff[]
  clinicSlug: string
  /** Enable dynamic event loading when navigating beyond initial date range */
  enableDynamicLoading?: boolean
  onCreateAppointment?: (data: {
    petId: string
    serviceId?: string
    vetId?: string
    startTime: Date
    endTime: Date
    reason: string
    notes?: string
  }) => Promise<void>
  onDeleteEvent?: (event: CalendarEvent) => Promise<void>
  onEventEdit?: (event: CalendarEvent) => void
  onDateChange?: (date: Date) => void
  onViewChange?: (view: CalendarView) => void
  onRangeChange?: (range: Date[] | { start: Date; end: Date }) => void
}

// =============================================================================
// FILTER TOOLBAR COMPONENT
// =============================================================================

interface FilterToolbarProps {
  staff: Staff[]
  selectedStaff: string[]
  selectedEventTypes: CalendarEventType[]
  onStaffChange: (staffIds: string[]) => void
  onEventTypeChange: (types: CalendarEventType[]) => void
  /** Resource view toggle (columns by doctor) */
  resourceMode: boolean
  onResourceModeChange: (enabled: boolean) => void
  /** Current view - resource mode only works in day/week */
  currentView: CalendarView
}

function FilterToolbar({
  staff,
  selectedStaff,
  selectedEventTypes,
  onStaffChange,
  onEventTypeChange,
  resourceMode,
  onResourceModeChange,
  currentView,
}: FilterToolbarProps) {
  const eventTypes: { type: CalendarEventType; label: string }[] = [
    { type: 'appointment', label: 'Citas' },
    { type: 'shift', label: 'Turnos' },
    { type: 'time_off', label: 'Ausencias' },
  ]

  const toggleStaff = (staffId: string) => {
    if (selectedStaff.includes(staffId)) {
      onStaffChange(selectedStaff.filter(id => id !== staffId))
    } else {
      onStaffChange([...selectedStaff, staffId])
    }
  }

  const toggleEventType = (type: CalendarEventType) => {
    if (selectedEventTypes.includes(type)) {
      onEventTypeChange(selectedEventTypes.filter(t => t !== type))
    } else {
      onEventTypeChange([...selectedEventTypes, type])
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-3 mb-2 px-1 py-2 border-b border-[var(--border-light)]"
      role="toolbar"
      aria-label="Filtros del calendario"
    >
      {/* Staff filters */}
      {staff.length > 0 && (
        <div className="flex items-center gap-2" role="group" aria-labelledby="staff-filter-label">
          <span
            id="staff-filter-label"
            className="text-xs font-medium text-[var(--text-muted)] whitespace-nowrap"
          >
            Personal:
          </span>
          <div className="flex flex-wrap gap-1.5" role="group">
            {staff.map(member => {
              const isSelected = selectedStaff.length === 0 || selectedStaff.includes(member.id)
              return (
                <button
                  key={member.id}
                  onClick={() => toggleStaff(member.id)}
                  aria-pressed={selectedStaff.includes(member.id)}
                  aria-label={`Filtrar por ${member.full_name}`}
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isSelected
                      ? 'ring-1 ring-offset-0'
                      : 'opacity-40'
                  }`}
                  style={{
                    backgroundColor: member.color_code + '15',
                    color: member.color_code,
                    // @ts-expect-error CSS custom property for ring color
                    '--tw-ring-color': member.color_code,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mr-1.5"
                    aria-hidden="true"
                    style={{ backgroundColor: member.color_code }}
                  />
                  {member.full_name.split(' ')[0]}
                </button>
              )
            })}
            {selectedStaff.length > 0 && (
              <button
                onClick={() => onStaffChange([])}
                className="text-[10px] text-[var(--text-muted)] hover:text-[var(--primary)] ml-1"
                aria-label="Limpiar filtro de personal"
                title="Limpiar filtro"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Divider */}
      {staff.length > 0 && (
        <div className="h-4 w-px bg-[var(--border-light)]" />
      )}

      {/* Event type filters - toggle style */}
      <div className="flex items-center gap-2" role="group" aria-labelledby="event-type-filter-label">
        <span
          id="event-type-filter-label"
          className="text-xs font-medium text-[var(--text-muted)] whitespace-nowrap"
        >
          Ver:
        </span>
        <div className="flex gap-1 bg-[var(--bg-subtle)] p-0.5 rounded-lg" role="group">
          {eventTypes.map(({ type, label }) => {
            const isActive = selectedEventTypes.length === 0 || selectedEventTypes.includes(type)
            return (
              <button
                key={type}
                onClick={() => toggleEventType(type)}
                aria-pressed={selectedEventTypes.includes(type)}
                aria-label={`Mostrar ${label.toLowerCase()}`}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                    isActive ? 'bg-[var(--primary)]' : 'bg-gray-300'
                  }`}
                  aria-hidden="true"
                />
                {label}
              </button>
            )
          })}
        </div>
        {selectedEventTypes.length > 0 && (
          <button
            onClick={() => onEventTypeChange([])}
            className="text-[10px] text-[var(--text-muted)] hover:text-[var(--primary)]"
            aria-label="Limpiar filtro de tipo de evento"
            title="Mostrar todos"
          >
            ✕
          </button>
        )}
      </div>

      {/* Resource view toggle - only show if we have staff and in day/week view */}
      {staff.length > 1 && (currentView === 'day' || currentView === 'week') && (
        <>
          <div className="h-4 w-px bg-[var(--border-light)]" aria-hidden="true" />
          <button
            onClick={() => onResourceModeChange(!resourceMode)}
            aria-pressed={resourceMode}
            aria-label={resourceMode ? 'Desactivar vista por doctor' : 'Activar vista por doctor'}
            className={`resource-toggle-btn ${resourceMode ? 'active' : ''}`}
            title={resourceMode ? 'Desactivar columnas por doctor' : 'Ver columnas por doctor'}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="18" rx="1" />
              <rect x="14" y="3" width="7" height="18" rx="1" />
            </svg>
            <span className="hidden sm:inline">Por Doctor</span>
          </button>
        </>
      )}
    </div>
  )
}

// =============================================================================
// CALENDAR CONTAINER COMPONENT
// =============================================================================

export function CalendarContainer({
  initialEvents,
  initialDate = new Date(),
  initialView = 'week',
  pets = [],
  services = [],
  staff = [],
  clinicSlug,
  enableDynamicLoading = true,
  onCreateAppointment,
  onDeleteEvent,
  onEventEdit,
  onDateChange,
  onViewChange,
  onRangeChange,
}: CalendarContainerProps) {
  // State
  const [currentDate, setCurrentDate] = useState<Date>(initialDate)
  const [currentView, setCurrentView] = useState<CalendarView>(initialView)

  // Dynamic event loading
  const {
    events,
    isLoading: isLoadingEvents,
    isFetching: isFetchingEvents,
    invalidateEvents,
  } = useCalendarEvents({
    initialEvents,
    currentDate,
    currentView,
    enabled: enableDynamicLoading,
  })

  // Filters
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [selectedEventTypes, setSelectedEventTypes] = useState<CalendarEventType[]>([])

  // Resource view mode (columns by doctor)
  const [resourceMode, setResourceMode] = useState(false)

  // Modals
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [quickAddSlot, setQuickAddSlot] = useState<{ start: Date; end: Date } | null>(null)

  // Loading states
  const [isLoading, setIsLoading] = useState(false)

  // Handlers
  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date)
    onDateChange?.(date)
  }, [onDateChange])

  // Keyboard shortcuts navigation handler
  const handleShortcutNavigate = useCallback((direction: 'today' | 'prev' | 'next') => {
    let newDate: Date

    switch (direction) {
      case 'today':
        newDate = new Date()
        break
      case 'prev':
        newDate = new Date(currentDate)
        if (currentView === 'month') {
          newDate.setMonth(newDate.getMonth() - 1)
        } else if (currentView === 'week') {
          newDate.setDate(newDate.getDate() - 7)
        } else {
          newDate.setDate(newDate.getDate() - 1)
        }
        break
      case 'next':
        newDate = new Date(currentDate)
        if (currentView === 'month') {
          newDate.setMonth(newDate.getMonth() + 1)
        } else if (currentView === 'week') {
          newDate.setDate(newDate.getDate() + 7)
        } else {
          newDate.setDate(newDate.getDate() + 1)
        }
        break
    }

    handleNavigate(newDate)
  }, [currentDate, currentView, handleNavigate])

  const handleViewChange = useCallback((view: CalendarView) => {
    setCurrentView(view)
    onViewChange?.(view)
  }, [onViewChange])

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }, [])

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date; action: string }) => {
    // Only open quick add on click or select, not drag in month view
    if (slotInfo.action === 'doubleClick' || (slotInfo.action === 'select' && currentView !== 'month')) {
      setQuickAddSlot({ start: slotInfo.start, end: slotInfo.end })
      setIsQuickAddOpen(true)
    }
  }, [currentView])

  const handleRangeChange = useCallback((range: Date[] | { start: Date; end: Date }) => {
    onRangeChange?.(range)
  }, [onRangeChange])

  const handleEventEdit = useCallback((event: CalendarEvent) => {
    onEventEdit?.(event)
    setIsEventModalOpen(false)
  }, [onEventEdit])

  const handleEventDelete = useCallback(async (event: CalendarEvent) => {
    if (!onDeleteEvent) return

    setIsLoading(true)
    try {
      await onDeleteEvent(event)
      setIsEventModalOpen(false)
      // Refresh events after deletion
      if (enableDynamicLoading) {
        invalidateEvents()
      }
    } finally {
      setIsLoading(false)
    }
  }, [onDeleteEvent, enableDynamicLoading, invalidateEvents])

  const handleQuickAddSave = useCallback(async (data: {
    petId: string
    serviceId?: string
    vetId?: string
    startTime: Date
    endTime: Date
    reason: string
    notes?: string
  }) => {
    if (!onCreateAppointment) return

    setIsLoading(true)
    try {
      await onCreateAppointment(data)
      setIsQuickAddOpen(false)
      setQuickAddSlot(null)
      // Refresh events after creation
      if (enableDynamicLoading) {
        invalidateEvents()
      }
    } finally {
      setIsLoading(false)
    }
  }, [onCreateAppointment, enableDynamicLoading, invalidateEvents])

  // Prepare staff for quick add modal (convert to expected format)
  const staffForQuickAdd = useMemo(() =>
    staff.map(s => ({
      id: s.id,
      full_name: s.full_name,
      color_code: s.color_code,
    })),
    [staff]
  )

  // Prepare resources for calendar resource view
  const calendarResources = useMemo(() =>
    staff.map(s => ({
      id: s.id,
      title: s.full_name,
      colorCode: s.color_code,
      jobTitle: s.job_title,
      avatarUrl: s.avatar_url,
    })),
    [staff]
  )

  // Handler to open quick add modal via keyboard shortcut
  const handleNewAppointmentShortcut = useCallback(() => {
    if (!onCreateAppointment) return
    // Create a default slot for new appointment (now + 30 min to now + 1 hour)
    const now = new Date()
    now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0) // Round to next 30 min
    const end = new Date(now.getTime() + 30 * 60000)
    setQuickAddSlot({ start: now, end })
    setIsQuickAddOpen(true)
  }, [onCreateAppointment])

  // Handle closing any open modal
  const handleCloseModal = useCallback(() => {
    if (isQuickAddOpen) {
      setIsQuickAddOpen(false)
      setQuickAddSlot(null)
    }
    if (isEventModalOpen) {
      setIsEventModalOpen(false)
      setSelectedEvent(null)
    }
  }, [isQuickAddOpen, isEventModalOpen])

  // Keyboard shortcuts
  useCalendarShortcuts({
    onNavigate: handleShortcutNavigate,
    onViewChange: handleViewChange,
    onNewAppointment: onCreateAppointment ? handleNewAppointmentShortcut : undefined,
    onCloseModal: handleCloseModal,
    isModalOpen: isEventModalOpen || isQuickAddOpen,
    enabled: true,
  })

  return (
    <div className="flex flex-col h-full">
      {/* Filter toolbar - always show since event type filters are always useful */}
      <FilterToolbar
        staff={staff}
        selectedStaff={selectedStaff}
        selectedEventTypes={selectedEventTypes}
        onStaffChange={setSelectedStaff}
        onEventTypeChange={setSelectedEventTypes}
        resourceMode={resourceMode}
        onResourceModeChange={setResourceMode}
        currentView={currentView}
      />

      {/* Loading/Fetching indicator */}
      {isFetchingEvents && !isLoadingEvents && (
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] border-b border-[var(--border-light)]">
          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Actualizando eventos...
        </div>
      )}

      {/* Calendar or Skeleton */}
      <div className="flex-1 min-h-0">
        {isLoadingEvents ? (
          <CalendarSkeleton view={currentView} />
        ) : (
          <Calendar
            events={events}
            view={currentView}
            date={currentDate}
            onNavigate={handleNavigate}
            onViewChange={handleViewChange}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={onCreateAppointment ? handleSelectSlot : undefined}
            onRangeChange={handleRangeChange}
            staffFilters={selectedStaff.length > 0 ? selectedStaff : undefined}
            eventTypeFilters={selectedEventTypes.length > 0 ? selectedEventTypes : undefined}
            selectable={!!onCreateAppointment}
            className="h-full"
            resourceMode={resourceMode}
            resources={calendarResources}
          />
        )}
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false)
          setSelectedEvent(null)
        }}
        onEdit={onEventEdit ? handleEventEdit : undefined}
        onDelete={onDeleteEvent ? handleEventDelete : undefined}
      />

      {/* Quick Add Modal */}
      {onCreateAppointment && (
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => {
            setIsQuickAddOpen(false)
            setQuickAddSlot(null)
          }}
          onSave={handleQuickAddSave}
          slotInfo={quickAddSlot}
          pets={pets}
          services={services}
          staff={staffForQuickAdd}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
