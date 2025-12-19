'use client'

import { Calendar as BigCalendar, Views } from 'react-big-calendar'
import type {
  CalendarEvent,
  CalendarView,
  CalendarEventType,
} from '@/lib/types/calendar'

import 'react-big-calendar/lib/css/react-big-calendar.css'

// Internal modules
import { calendarLocalizer } from './calendar-localizer'
import { CALENDAR_MESSAGES, CALENDAR_CONFIG } from './calendar-constants'
import { getEventStyle } from './calendar-styling'
import { CalendarEventComponent } from './CalendarEvent'
import { CalendarStyles } from './CalendarStyles'
import { useCalendarState } from './useCalendarState'

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
  eventTypeFilters?: CalendarEventType[]
  minTime?: Date
  maxTime?: Date
  selectable?: boolean
  className?: string
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
  // Use custom hook for state management
  const {
    currentView,
    currentDate,
    filteredEvents,
    defaultMinTime,
    defaultMaxTime,
    handlers,
  } = useCalendarState({
    events,
    initialView: view,
    initialDate: date,
    staffFilters,
    eventTypeFilters,
    minTime,
    maxTime,
    onNavigate,
    onViewChange,
    onSelectEvent,
    onSelectSlot,
    onRangeChange,
    selectable,
  })

  return (
    <div className={`calendar-wrapper ${className}`}>
      <CalendarStyles />
      <BigCalendar
        localizer={calendarLocalizer}
        events={filteredEvents}
        view={currentView}
        date={currentDate}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        onNavigate={handlers.handleNavigate}
        onView={handlers.handleViewChange as (view: string) => void}
        onSelectEvent={handlers.handleSelectEvent}
        onSelectSlot={handlers.handleSelectSlot}
        onRangeChange={handlers.handleRangeChange}
        selectable={selectable}
        eventPropGetter={getEventStyle}
        components={{
          event: CalendarEventComponent,
        }}
        messages={CALENDAR_MESSAGES}
        min={defaultMinTime}
        max={defaultMaxTime}
        step={CALENDAR_CONFIG.step}
        timeslots={CALENDAR_CONFIG.timeslots}
        culture="es"
        popup
        showMultiDayTimes
        dayLayoutAlgorithm="no-overlap"
      />
    </div>
  )
}
