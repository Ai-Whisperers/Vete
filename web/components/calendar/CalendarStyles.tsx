'use client';

/**
 * Calendar Global Styles
 * Styled JSX for calendar theming
 */

export function CalendarStyles() {
  return (
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
  )
}
