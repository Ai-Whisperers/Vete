'use client'

import { useCallback, useMemo, useState } from 'react'
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import type {
  CalendarEvent,
  CalendarView,
  CalendarEventResource,
} from '@/lib/types/calendar'

import 'react-big-calendar/lib/css/react-big-calendar.css'

// =============================================================================
// LOCALIZER SETUP
// =============================================================================

const locales = { es }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
  getDay,
  locales,
})

// =============================================================================
// MESSAGES (Spanish)
// =============================================================================

const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay eventos en este rango.',
  showMore: (total: number) => `+ Ver ${total} más`,
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface CalendarProps {
  events: CalendarEvent[]
  view?: CalendarView
  date?: Date
  onNavigate?: (date: Date) => void
  onViewChange?: (view: CalendarView) => void
  onSelectEvent?: (event: CalendarEvent) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date; action: string }) => void
  onRangeChange?: (range: Date[] | { start: Date; end: Date }) => void
  staffFilters?: string[]
  eventTypeFilters?: string[]
  minTime?: Date
  maxTime?: Date
  selectable?: boolean
  className?: string
}

// =============================================================================
// EVENT STYLING
// =============================================================================

const eventStyleGetter = (event: CalendarEvent) => {
  const resource = event.resource as CalendarEventResource | undefined
  let backgroundColor = event.color || '#3B82F6'
  let borderColor = backgroundColor

  // Use staff color if available
  if (resource?.staffColor) {
    backgroundColor = resource.staffColor
    borderColor = resource.staffColor
  }

  // Style by event type
  switch (event.type) {
    case 'time_off':
      backgroundColor = '#EC4899' // pink
      borderColor = '#EC4899'
      break
    case 'shift':
      backgroundColor = resource?.staffColor || '#06B6D4' // cyan
      borderColor = resource?.staffColor || '#06B6D4'
      break
    case 'block':
      backgroundColor = '#6B7280' // gray
      borderColor = '#6B7280'
      break
  }

  // Adjust for status
  if (resource?.status) {
    switch (resource.status) {
      case 'cancelled':
        backgroundColor = '#EF4444'
        borderColor = '#EF4444'
        break
      case 'completed':
        backgroundColor = '#9CA3AF'
        borderColor = '#9CA3AF'
        break
      case 'in_progress':
        backgroundColor = '#8B5CF6'
        borderColor = '#8B5CF6'
        break
      case 'confirmed':
        backgroundColor = '#10B981'
        borderColor = '#10B981'
        break
    }
  }

  return {
    style: {
      backgroundColor,
      borderColor,
      borderRadius: '4px',
      opacity: event.type === 'block' ? 0.6 : 1,
      color: 'white',
      border: `1px solid ${borderColor}`,
      fontSize: '0.875rem',
    },
  }
}

// =============================================================================
// CUSTOM COMPONENTS
// =============================================================================

interface EventComponentProps {
  event: CalendarEvent
}

function EventComponent({ event }: EventComponentProps) {
  const resource = event.resource as CalendarEventResource | undefined

  return (
    <div className="flex flex-col h-full overflow-hidden p-0.5">
      <span className="font-medium text-xs truncate">{event.title}</span>
      {resource?.petName && resource.type === 'appointment' && (
        <span className="text-xs opacity-80 truncate">
          {resource.serviceName || resource.reason}
        </span>
      )}
    </div>
  )
}

// =============================================================================
// CALENDAR COMPONENT
// =============================================================================

export function Calendar({
  events,
  view = 'week',
  date = new Date(),
  onNavigate,
  onViewChange,
  onSelectEvent,
  onSelectSlot,
  onRangeChange,
  staffFilters,
  eventTypeFilters,
  minTime,
  maxTime,
  selectable = true,
  className = '',
}: CalendarProps) {
  const [currentView, setCurrentView] = useState<CalendarView>(view)
  const [currentDate, setCurrentDate] = useState<Date>(date)

  // Filter events based on staff and event type filters
  const filteredEvents = useMemo(() => {
    let filtered = events

    // Filter by staff
    if (staffFilters && staffFilters.length > 0) {
      filtered = filtered.filter(event => {
        const resource = event.resource as CalendarEventResource | undefined
        if (!resource?.staffId) return true // Show events without staff
        return staffFilters.includes(resource.staffId)
      })
    }

    // Filter by event type
    if (eventTypeFilters && eventTypeFilters.length > 0) {
      filtered = filtered.filter(event =>
        eventTypeFilters.includes(event.type)
      )
    }

    return filtered
  }, [events, staffFilters, eventTypeFilters])

  // Handlers
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate)
    onNavigate?.(newDate)
  }, [onNavigate])

  const handleViewChange = useCallback((newView: CalendarView) => {
    setCurrentView(newView)
    onViewChange?.(newView)
  }, [onViewChange])

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    onSelectEvent?.(event)
  }, [onSelectEvent])

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date; action: string }) => {
    if (selectable) {
      onSelectSlot?.(slotInfo)
    }
  }, [selectable, onSelectSlot])

  const handleRangeChange = useCallback((range: Date[] | { start: Date; end: Date }) => {
    onRangeChange?.(range)
  }, [onRangeChange])

  // Default work hours
  const defaultMinTime = useMemo(() => {
    const min = minTime || new Date()
    if (!minTime) {
      min.setHours(7, 0, 0, 0)
    }
    return min
  }, [minTime])

  const defaultMaxTime = useMemo(() => {
    const max = maxTime || new Date()
    if (!maxTime) {
      max.setHours(21, 0, 0, 0)
    }
    return max
  }, [maxTime])

  return (
    <div className={`calendar-wrapper ${className}`}>
      <style jsx global>{`
        .calendar-wrapper .rbc-calendar {
          font-family: inherit;
        }
        .calendar-wrapper .rbc-header {
          padding: 8px;
          font-weight: 600;
          color: var(--text-primary, #1f2937);
          border-bottom: 1px solid var(--border-color, #e5e7eb);
        }
        .calendar-wrapper .rbc-today {
          background-color: var(--primary-light, #eff6ff);
        }
        .calendar-wrapper .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        .calendar-wrapper .rbc-event {
          padding: 2px 4px;
        }
        .calendar-wrapper .rbc-event:focus {
          outline: 2px solid var(--primary, #3b82f6);
          outline-offset: 2px;
        }
        .calendar-wrapper .rbc-toolbar {
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
          padding: 0 4px;
        }
        @media (max-width: 640px) {
          .calendar-wrapper .rbc-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .calendar-wrapper .rbc-toolbar-label {
            order: -1;
            text-align: center;
            margin-bottom: 8px;
            font-size: 1rem;
          }
          .calendar-wrapper .rbc-btn-group {
            display: flex;
            justify-content: center;
          }
        }
        .calendar-wrapper .rbc-toolbar button {
          color: var(--text-primary, #374151);
          border-color: var(--border-color, #d1d5db);
          padding: 10px 16px;
          min-height: 44px;
          font-size: 0.875rem;
          border-radius: 6px;
        }
        @media (max-width: 640px) {
          .calendar-wrapper .rbc-toolbar button {
            padding: 8px 12px;
            font-size: 0.8125rem;
          }
        }
        .calendar-wrapper .rbc-toolbar button:hover {
          background-color: var(--bg-hover, #f3f4f6);
        }
        .calendar-wrapper .rbc-toolbar button.rbc-active {
          background-color: var(--primary, #3b82f6);
          color: white;
          border-color: var(--primary, #3b82f6);
        }
        .calendar-wrapper .rbc-time-view {
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 8px;
          overflow: hidden;
        }
        .calendar-wrapper .rbc-time-header {
          border-bottom: 1px solid var(--border-color, #e5e7eb);
        }
        .calendar-wrapper .rbc-time-content {
          border-top: none;
        }
        .calendar-wrapper .rbc-timeslot-group {
          border-bottom: 1px solid var(--border-color, #f3f4f6);
        }
        .calendar-wrapper .rbc-time-slot {
          border-top: none;
        }
        .calendar-wrapper .rbc-current-time-indicator {
          background-color: #ef4444;
          height: 2px;
        }
        .calendar-wrapper .rbc-current-time-indicator::before {
          content: '';
          position: absolute;
          left: -6px;
          top: -4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #ef4444;
        }
        .calendar-wrapper .rbc-month-view {
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 8px;
          overflow: hidden;
        }
        .calendar-wrapper .rbc-month-row {
          border-bottom: 1px solid var(--border-color, #e5e7eb);
        }
        .calendar-wrapper .rbc-day-bg {
          border-left: 1px solid var(--border-color, #e5e7eb);
        }
        .calendar-wrapper .rbc-agenda-view {
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 8px;
          overflow: hidden;
        }
        .calendar-wrapper .rbc-agenda-table {
          border: none;
        }
        .calendar-wrapper .rbc-agenda-time-cell,
        .calendar-wrapper .rbc-agenda-date-cell {
          padding: 8px 12px;
          white-space: nowrap;
        }
        .calendar-wrapper .rbc-agenda-event-cell {
          padding: 8px 12px;
        }
        .calendar-wrapper .rbc-show-more {
          color: var(--primary, #3b82f6);
          font-weight: 500;
        }
      `}</style>
      <BigCalendar
        localizer={localizer}
        events={filteredEvents}
        view={currentView}
        date={currentDate}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        onNavigate={handleNavigate}
        onView={handleViewChange as (view: string) => void}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        onRangeChange={handleRangeChange}
        selectable={selectable}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
        }}
        messages={messages}
        min={defaultMinTime}
        max={defaultMaxTime}
        step={15}
        timeslots={4}
        culture="es"
        popup
        showMultiDayTimes
        dayLayoutAlgorithm="no-overlap"
      />
    </div>
  )
}
