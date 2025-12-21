'use client'

import { useState, useCallback, useMemo } from 'react'
import { Calendar } from './calendar'
import { EventDetailModal } from './event-detail-modal'
import { QuickAddModal } from './quick-add-modal'
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
  isAdmin?: boolean
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
}

function FilterToolbar({
  staff,
  selectedStaff,
  selectedEventTypes,
  onStaffChange,
  onEventTypeChange,
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
    <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
      {/* Staff filters */}
      {staff.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Personal
          </label>
          <div className="flex flex-wrap gap-2">
            {staff.map(member => (
              <button
                key={member.id}
                onClick={() => toggleStaff(member.id)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedStaff.length === 0 || selectedStaff.includes(member.id)
                    ? 'ring-2 ring-offset-1'
                    : 'opacity-50'
                }`}
                style={{
                  backgroundColor: member.color_code + '20',
                  color: member.color_code,
                  // @ts-expect-error CSS custom property for ring color
                  '--tw-ring-color': member.color_code,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: member.color_code }}
                />
                {member.full_name}
              </button>
            ))}
            {selectedStaff.length > 0 && (
              <button
                onClick={() => onStaffChange([])}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Mostrar todos
              </button>
            )}
          </div>
        </div>
      )}

      {/* Event type filters */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Tipo de evento
        </label>
        <div className="flex flex-wrap gap-2">
          {eventTypes.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => toggleEventType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedEventTypes.length === 0 || selectedEventTypes.includes(type)
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
          {selectedEventTypes.length > 0 && (
            <button
              onClick={() => onEventTypeChange([])}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Mostrar todos
            </button>
          )}
        </div>
      </div>
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
  isAdmin = false,
  onCreateAppointment,
  onDeleteEvent,
  onEventEdit,
  onDateChange,
  onViewChange,
  onRangeChange,
}: CalendarContainerProps) {
  // State
  const [events] = useState<CalendarEvent[]>(initialEvents)
  const [currentDate, setCurrentDate] = useState<Date>(initialDate)
  const [currentView, setCurrentView] = useState<CalendarView>(initialView)

  // Filters
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [selectedEventTypes, setSelectedEventTypes] = useState<CalendarEventType[]>([])

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
    } finally {
      setIsLoading(false)
    }
  }, [onDeleteEvent])

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
    } finally {
      setIsLoading(false)
    }
  }, [onCreateAppointment])

  // Prepare staff for quick add modal (convert to expected format)
  const staffForQuickAdd = useMemo(() =>
    staff.map(s => ({
      id: s.id,
      full_name: s.full_name,
      color_code: s.color_code,
    })),
    [staff]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Filter toolbar */}
      {(staff.length > 0 || isAdmin) && (
        <FilterToolbar
          staff={staff}
          selectedStaff={selectedStaff}
          selectedEventTypes={selectedEventTypes}
          onStaffChange={setSelectedStaff}
          onEventTypeChange={setSelectedEventTypes}
        />
      )}

      {/* Calendar */}
      <div className="flex-1 min-h-0">
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
        />
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
