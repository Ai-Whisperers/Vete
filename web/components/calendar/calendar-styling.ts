/**
 * Calendar Styling Utilities
 * Functions for event and calendar styling
 */

import type { CalendarEvent, CalendarEventResource } from '@/lib/types/calendar'
import { STATUS_COLORS, EVENT_TYPE_COLORS } from './calendar-constants'

// =============================================================================
// EVENT STYLING
// =============================================================================

export interface EventStyle {
  style: {
    backgroundColor: string
    borderColor: string
    borderRadius: string
    opacity: number
    color: string
    border: string
    fontSize: string
  }
}

/**
 * Get styling for calendar events based on type and status
 */
export function getEventStyle(event: CalendarEvent): EventStyle {
  const resource = event.resource as CalendarEventResource | undefined
  let backgroundColor = event.color || EVENT_TYPE_COLORS.appointment
  let borderColor = backgroundColor

  // Use staff color if available
  if (resource?.staffColor) {
    backgroundColor = resource.staffColor
    borderColor = resource.staffColor
  }

  // Style by event type
  switch (event.type) {
    case 'time_off':
      backgroundColor = EVENT_TYPE_COLORS.time_off
      borderColor = EVENT_TYPE_COLORS.time_off
      break
    case 'shift':
      backgroundColor = resource?.staffColor || EVENT_TYPE_COLORS.shift
      borderColor = resource?.staffColor || EVENT_TYPE_COLORS.shift
      break
    case 'block':
      backgroundColor = EVENT_TYPE_COLORS.block
      borderColor = EVENT_TYPE_COLORS.block
      break
  }

  // Adjust for status
  if (resource?.status && resource.status in STATUS_COLORS) {
    const statusColor = STATUS_COLORS[resource.status as keyof typeof STATUS_COLORS]
    backgroundColor = statusColor
    borderColor = statusColor
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
