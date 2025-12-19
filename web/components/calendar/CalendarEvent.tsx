/**
 * Calendar Event Component
 * Renders individual events in the calendar
 */

import type { CalendarEvent, CalendarEventResource } from '@/lib/types/calendar'

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface CalendarEventProps {
  event: CalendarEvent
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CalendarEventComponent({ event }: CalendarEventProps) {
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
