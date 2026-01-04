'use client'

import { useMemo } from 'react'
import type { CalendarEvent, CalendarEventType } from '@/lib/types/calendar'

/**
 * Event type configuration for display
 */
const EVENT_TYPE_CONFIG: Record<CalendarEventType, { label: string; pluralLabel: string; color: string; icon: string }> = {
  appointment: {
    label: 'Cita',
    pluralLabel: 'Citas',
    color: '#3B82F6', // Blue
    icon: '📋',
  },
  shift: {
    label: 'Turno',
    pluralLabel: 'Turnos',
    color: '#06B6D4', // Cyan
    icon: '👤',
  },
  time_off: {
    label: 'Ausencia',
    pluralLabel: 'Ausencias',
    color: '#EC4899', // Pink
    icon: '🏖️',
  },
  block: {
    label: 'Bloqueo',
    pluralLabel: 'Bloqueos',
    color: '#6B7280', // Gray
    icon: '🚫',
  },
  task: {
    label: 'Tarea',
    pluralLabel: 'Tareas',
    color: '#F59E0B', // Amber
    icon: '✓',
  },
}

interface MonthDateCellProps {
  date: Date
  events: CalendarEvent[]
  onSelectSlot?: (date: Date) => void
}

/**
 * Custom month date cell that shows event counts by type
 * instead of individual event listings
 */
export function MonthDateCell({ date, events, onSelectSlot }: MonthDateCellProps) {
  // Count events by type for this date
  const eventCounts = useMemo(() => {
    const dateKey = date.toISOString().split('T')[0]
    const counts = new Map<CalendarEventType, number>()

    for (const event of events) {
      const eventDateKey = event.start.toISOString().split('T')[0]
      if (eventDateKey === dateKey) {
        const type = event.type || 'appointment'
        counts.set(type, (counts.get(type) || 0) + 1)
      }
    }

    return counts
  }, [date, events])

  // Convert to array and sort by count (highest first)
  const sortedCounts = useMemo(() => {
    return Array.from(eventCounts.entries())
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
  }, [eventCounts])

  const totalEvents = useMemo(() => {
    return Array.from(eventCounts.values()).reduce((sum, count) => sum + count, 0)
  }, [eventCounts])

  const handleClick = () => {
    onSelectSlot?.(date)
  }

  if (totalEvents === 0) {
    return null
  }

  return (
    <div
      className="month-date-cell-content"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick()
        }
      }}
    >
      {sortedCounts.map(([type, count]) => {
        const config = EVENT_TYPE_CONFIG[type]
        const label = count === 1 ? config.label : config.pluralLabel

        return (
          <div
            key={type}
            className="event-type-badge"
            style={{
              '--badge-color': config.color,
            } as React.CSSProperties}
            title={`${count} ${label}`}
          >
            <span className="badge-count">{count}</span>
            <span className="badge-label">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Styles for the month date cell
 * Injected via CalendarStyles
 */
export const monthDateCellStyles = `
  /* Month date cell content container */
  .month-date-cell-content {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 2px 4px;
    cursor: pointer;
  }

  .month-date-cell-content:hover {
    background: var(--bg-hover, rgba(0, 0, 0, 0.03));
    border-radius: 4px;
  }

  /* Event type badge */
  .event-type-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    background: color-mix(in srgb, var(--badge-color) 15%, transparent);
    color: var(--badge-color);
    border-left: 3px solid var(--badge-color);
    transition: all 0.15s ease;
  }

  .event-type-badge:hover {
    background: color-mix(in srgb, var(--badge-color) 25%, transparent);
    transform: translateX(2px);
  }

  .badge-count {
    font-weight: 700;
    min-width: 16px;
    text-align: center;
  }

  .badge-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Mobile: More compact badges */
  @media (max-width: 640px) {
    .event-type-badge {
      padding: 1px 4px;
      font-size: 10px;
      gap: 2px;
    }

    .badge-label {
      display: none;
    }

    .badge-count {
      min-width: 14px;
    }
  }

  /* Hide default events in month view when using summary mode */
  .calendar-wrapper.month-summary-mode .rbc-month-view .rbc-row-content .rbc-row:not(.rbc-month-header) {
    display: none !important;
  }

  .calendar-wrapper.month-summary-mode .rbc-month-view .rbc-row-bg {
    display: flex;
  }

  .calendar-wrapper.month-summary-mode .rbc-month-view .rbc-day-bg {
    display: flex;
    flex-direction: column;
    padding-top: 24px;
  }

  /* Show more link hidden in summary mode */
  .calendar-wrapper.month-summary-mode .rbc-show-more {
    display: none !important;
  }
`
