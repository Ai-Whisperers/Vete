'use client'

/**
 * Calendar Global Styles
 * Styled JSX for calendar theming
 */

export function CalendarStyles() {
  return (
    <style jsx global>{`
      .calendar-wrapper {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .calendar-wrapper .rbc-calendar {
        font-family: inherit;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      /* Custom scrollbar for time content */
      .calendar-wrapper .rbc-time-content::-webkit-scrollbar {
        width: 8px;
      }
      .calendar-wrapper .rbc-time-content::-webkit-scrollbar-track {
        background: var(--bg-subtle, #f1f5f9);
        border-radius: 4px;
      }
      .calendar-wrapper .rbc-time-content::-webkit-scrollbar-thumb {
        background: var(--border-color, #cbd5e1);
        border-radius: 4px;
      }
      .calendar-wrapper .rbc-time-content::-webkit-scrollbar-thumb:hover {
        background: var(--text-muted, #94a3b8);
      }
      .calendar-wrapper .rbc-header {
        padding: 6px 8px;
        font-weight: 600;
        font-size: 0.8125rem;
        color: var(--text-primary, #1f2937);
        border-bottom: 1px solid var(--border-color, #e5e7eb);
      }
      /* Today column - very subtle grey highlight */
      .calendar-wrapper .rbc-today {
        background-color: var(--bg-subtle, #fafafa) !important;
      }
      .calendar-wrapper .rbc-day-bg.rbc-today {
        background-color: var(--bg-subtle, #fafafa) !important;
      }
      .calendar-wrapper .rbc-time-column.rbc-now.rbc-today {
        background-color: var(--bg-subtle, #fafafa) !important;
      }
      .calendar-wrapper .rbc-off-range-bg {
        background-color: var(--bg-muted, #f9fafb);
      }
      /* Weekend columns - subtle grey background */
      .calendar-wrapper .rbc-day-bg:nth-child(6),
      .calendar-wrapper .rbc-day-bg:nth-child(7) {
        background-color: var(--bg-subtle, #f8f9fa);
      }
      /* Weekend headers */
      .calendar-wrapper .rbc-header:nth-child(6),
      .calendar-wrapper .rbc-header:nth-child(7) {
        background-color: var(--bg-muted, #f3f4f6);
      }
      .calendar-wrapper .rbc-event {
        padding: 4px 8px 4px 4px;
        min-height: 40px !important;
        overflow: visible;
        border-radius: 6px !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
      .calendar-wrapper .rbc-event:focus {
        outline: 2px solid var(--primary, #3b82f6);
        outline-offset: 2px;
      }
      /* Ensure short events are still readable */
      .calendar-wrapper .rbc-event-content {
        overflow: visible;
        white-space: normal;
        word-wrap: break-word;
      }
      /* Add shadow on hover for depth */
      .calendar-wrapper .rbc-event:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10 !important;
        transform: translateY(-1px);
      }
      /* DAY VIEW: Constrain event width for readability */
      .calendar-wrapper .rbc-day-slot .rbc-events-container {
        max-width: 600px;
        margin-right: auto;
      }
      .calendar-wrapper .rbc-day-slot .rbc-event {
        max-width: 580px;
      }
      /* WEEK/DAY VIEW: Better event spacing */
      .calendar-wrapper .rbc-time-view .rbc-event {
        margin: 1px 2px;
      }
      .calendar-wrapper .rbc-toolbar {
        margin-bottom: 8px;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0 2px;
      }
      .calendar-wrapper .rbc-toolbar-label {
        font-size: 0.9375rem;
        font-weight: 600;
      }
      @media (max-width: 640px) {
        .calendar-wrapper .rbc-toolbar {
          flex-direction: column;
          align-items: stretch;
        }
        .calendar-wrapper .rbc-toolbar-label {
          order: -1;
          text-align: center;
          margin-bottom: 6px;
          font-size: 0.875rem;
        }
        .calendar-wrapper .rbc-btn-group {
          display: flex;
          justify-content: center;
        }
      }
      .calendar-wrapper .rbc-toolbar button {
        color: var(--text-primary, #374151);
        border-color: var(--border-color, #d1d5db);
        padding: 6px 12px;
        min-height: 34px;
        font-size: 0.8125rem;
        border-radius: 4px;
      }
      @media (max-width: 640px) {
        .calendar-wrapper .rbc-toolbar button {
          padding: 5px 10px;
          font-size: 0.75rem;
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
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .calendar-wrapper .rbc-time-header {
        border-bottom: 1px solid var(--border-color, #e5e7eb);
        flex-shrink: 0;
      }
      .calendar-wrapper .rbc-time-content {
        border-top: none;
        overflow-y: auto;
        overflow-x: hidden;
        flex: 1;
        min-height: 0;
      }
      .calendar-wrapper .rbc-timeslot-group {
        border-bottom: 1px solid var(--border-color, #e5e7eb);
        min-height: 80px;
      }
      /* Allow time slots to grow for more events */
      .calendar-wrapper .rbc-day-slot {
        min-height: auto;
      }
      .calendar-wrapper .rbc-day-slot .rbc-timeslot-group {
        min-height: 80px;
      }
      /* Ensure events container can grow with content */
      .calendar-wrapper .rbc-day-slot .rbc-events-container {
        min-height: 100%;
      }
      /* Make sure overlapping events are visible */
      .calendar-wrapper .rbc-day-slot .rbc-event {
        overflow: visible;
      }
      /* Time view should take full available height */
      .calendar-wrapper .rbc-time-view-resources,
      .calendar-wrapper .rbc-time-view {
        flex: 1;
        min-height: 0;
      }
      .calendar-wrapper .rbc-time-slot {
        border-top: 1px dotted var(--border-subtle, #f0f0f0);
      }
      /* First slot in group (on the hour) - no dotted line */
      .calendar-wrapper .rbc-time-slot:first-child {
        border-top: none;
      }
      /* Half-hour mark - slightly stronger dotted line */
      .calendar-wrapper .rbc-timeslot-group .rbc-time-slot:nth-child(3) {
        border-top: 1px dashed var(--border-light, #e0e0e0);
      }
      .calendar-wrapper .rbc-current-time-indicator {
        background-color: var(--accent-error, #dc2626);
        height: 2px;
        z-index: 100;
        position: relative;
      }
      .calendar-wrapper .rbc-current-time-indicator::before {
        content: '';
        position: absolute;
        left: -6px;
        top: -5px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: var(--accent-error, #dc2626);
        box-shadow: 0 0 6px var(--accent-error-glow, rgba(220, 38, 38, 0.6));
      }
      .calendar-wrapper .rbc-current-time-indicator::after {
        content: '';
        position: absolute;
        right: 0;
        top: -5px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: var(--accent-error, #dc2626);
        box-shadow: 0 0 6px var(--accent-error-glow, rgba(220, 38, 38, 0.6));
      }
      /* Time gutter styling - allow indicator visibility */
      .calendar-wrapper .rbc-time-gutter {
        overflow: visible;
        flex-shrink: 0;
      }
      .calendar-wrapper .rbc-day-slot .rbc-current-time-indicator {
        margin-left: -1px;
        margin-right: -1px;
      }
      .calendar-wrapper .rbc-month-view {
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 8px;
        overflow: auto;
        flex: 1;
        min-height: 0;
      }
      .calendar-wrapper .rbc-month-row {
        border-bottom: 1px solid var(--border-color, #e5e7eb);
        min-height: 120px;
      }
      /* Allow month rows to expand for more events */
      .calendar-wrapper .rbc-month-row + .rbc-month-row {
        flex: 1;
      }
      .calendar-wrapper .rbc-day-bg {
        border-left: 1px solid var(--border-color, #e5e7eb);
        position: relative;
      }
      /* Month view: make room for capacity bar and summary */
      .calendar-wrapper .rbc-row-content {
        padding-bottom: 8px;
        min-height: 0;
      }
      /* Month view: Hide individual events - using summary mode */
      .calendar-wrapper .rbc-month-view .rbc-row-content .rbc-row {
        min-height: 0;
      }
      /* Month view: better "show more" link */
      .calendar-wrapper .rbc-show-more {
        color: var(--primary, #3b82f6);
        font-weight: 600;
        font-size: 11px;
        padding: 2px 4px;
        background: rgba(59, 130, 246, 0.1);
        border-radius: 4px;
        margin: 2px;
      }
      .calendar-wrapper .rbc-show-more:hover {
        background: rgba(59, 130, 246, 0.2);
      }

      /* ============================================= */
      /* MONTH VIEW READABLE SUMMARY */
      /* ============================================= */

      /* Hide individual events in month view - show summary instead */
      .calendar-wrapper .rbc-month-view .rbc-event {
        display: none !important;
      }
      .calendar-wrapper .rbc-month-view .rbc-show-more {
        display: none !important;
      }
      .calendar-wrapper .rbc-month-view .rbc-row-segment {
        display: none !important;
      }

      /* Day summary container */
      .month-day-summary {
        position: absolute;
        top: 24px;
        left: 4px;
        right: 4px;
        bottom: 22px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        overflow-y: auto;
        overflow-x: hidden;
        z-index: 1;
      }

      /* Scrollbar for summary */
      .month-day-summary::-webkit-scrollbar {
        width: 3px;
      }
      .month-day-summary::-webkit-scrollbar-thumb {
        background: var(--border-color, #cbd5e1);
        border-radius: 3px;
      }

      /* Day section styling */
      .day-section {
        padding: 4px 6px;
        border-radius: 6px;
        font-size: 11px;
        line-height: 1.3;
      }

      /* Appointments section - main highlight */
      .appointments-section {
        background: linear-gradient(
          135deg,
          rgba(59, 130, 246, 0.08) 0%,
          rgba(59, 130, 246, 0.15) 100%
        );
        border-left: 3px solid #3b82f6;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 600;
        color: #1e40af;
        margin-bottom: 2px;
      }

      .section-icon {
        font-size: 12px;
      }

      .section-count {
        font-size: 14px;
        font-weight: 700;
        color: #3b82f6;
      }

      .section-label {
        font-size: 11px;
        color: #3b82f6;
      }

      .time-range {
        font-size: 10px;
        color: #64748b;
        font-weight: 500;
        margin-bottom: 2px;
      }

      .pet-names {
        font-size: 10px;
        color: #475569;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .more-pets {
        color: #3b82f6;
        font-weight: 600;
        margin-left: 4px;
      }

      /* Time off section */
      .timeoff-section {
        background: rgba(236, 72, 153, 0.1);
        border-left: 3px solid #ec4899;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .timeoff-section .section-text {
        color: #be185d;
        font-weight: 500;
        font-size: 10px;
      }

      /* Shifts section */
      .shifts-section {
        background: rgba(6, 182, 212, 0.1);
        border-left: 3px solid #06b6d4;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .shifts-section .section-text {
        color: #0891b2;
        font-weight: 500;
        font-size: 10px;
      }

      /* Capacity bar */
      .capacity-bar {
        position: absolute;
        bottom: 6px;
        left: 6px;
        right: 6px;
        height: 4px;
        border-radius: 4px;
        overflow: hidden;
        background: var(--bg-muted, #f1f5f9);
      }

      .capacity-fill {
        height: 100%;
        border-radius: 4px;
        transition: all 0.3s ease;
      }

      /* Mobile: Compact summary */
      @media (max-width: 640px) {
        .month-day-summary {
          top: 20px;
          left: 2px;
          right: 2px;
          bottom: 18px;
          gap: 2px;
        }

        .day-section {
          padding: 2px 4px;
          border-radius: 4px;
        }

        .appointments-section {
          border-left-width: 2px;
        }

        .section-header {
          gap: 2px;
        }

        .section-icon {
          font-size: 10px;
        }

        .section-count {
          font-size: 12px;
        }

        .section-label {
          font-size: 9px;
        }

        .time-range,
        .pet-names {
          display: none;
        }

        .timeoff-section,
        .shifts-section {
          border-left-width: 2px;
          padding: 2px 3px;
        }

        .timeoff-section .section-text,
        .shifts-section .section-text {
          font-size: 9px;
        }

        .capacity-bar {
          height: 3px;
          bottom: 4px;
          left: 4px;
          right: 4px;
        }
      }

      /* Tablet adjustments */
      @media (min-width: 641px) and (max-width: 900px) {
        .month-day-summary {
          gap: 3px;
        }

        .day-section {
          padding: 3px 5px;
        }

        .pet-names {
          font-size: 9px;
        }
      }
      .calendar-wrapper .rbc-agenda-view {
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 8px;
        overflow: auto;
        flex: 1;
        min-height: 0;
      }
      .calendar-wrapper .rbc-agenda-table {
        border: none;
        width: 100%;
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

      /* ============================================= */
      /* MOBILE RESPONSIVE STYLES */
      /* ============================================= */

      /* Mobile: Hide time gutter labels on very small screens */
      @media (max-width: 480px) {
        .calendar-wrapper .rbc-time-gutter {
          width: 40px !important;
          min-width: 40px !important;
        }
        .calendar-wrapper .rbc-time-gutter .rbc-label {
          font-size: 10px;
          padding: 0 2px;
        }
        .calendar-wrapper .rbc-timeslot-group {
          min-height: 60px;
        }
        .calendar-wrapper .rbc-day-slot .rbc-timeslot-group {
          min-height: 60px;
        }
      }

      /* Mobile: Compact header on small screens */
      @media (max-width: 640px) {
        .calendar-wrapper .rbc-header {
          padding: 4px 2px;
          font-size: 0.7rem;
        }
        .calendar-wrapper .rbc-event {
          padding: 2px 4px;
          min-height: 30px !important;
          font-size: 11px;
        }
        .calendar-wrapper .rbc-event-content {
          font-size: 11px;
          line-height: 1.1;
        }
        /* Simplify event display on mobile */
        .calendar-wrapper .rbc-day-slot .rbc-event {
          max-width: none;
        }
        /* Better touch targets */
        .calendar-wrapper .rbc-event {
          min-height: 36px !important;
        }
        /* Month view: smaller cells */
        .calendar-wrapper .rbc-month-row {
          min-height: 70px;
        }
        .calendar-wrapper .rbc-month-view .rbc-event {
          padding: 1px 3px;
          min-height: 18px !important;
          font-size: 10px;
        }
        /* Agenda view: stack date and time */
        .calendar-wrapper .rbc-agenda-date-cell {
          padding: 6px 8px;
          font-size: 12px;
        }
        .calendar-wrapper .rbc-agenda-time-cell {
          padding: 6px 8px;
          font-size: 11px;
        }
        .calendar-wrapper .rbc-agenda-event-cell {
          padding: 6px 8px;
        }
      }

      /* Tablet: Moderate adjustments */
      @media (min-width: 641px) and (max-width: 1024px) {
        .calendar-wrapper .rbc-event {
          min-height: 35px !important;
        }
        .calendar-wrapper .rbc-header {
          padding: 5px 6px;
          font-size: 0.75rem;
        }
      }

      /* Touch-friendly: larger click targets */
      @media (hover: none) and (pointer: coarse) {
        .calendar-wrapper .rbc-toolbar button {
          min-height: 40px;
          padding: 8px 14px;
        }
        .calendar-wrapper .rbc-btn-group button {
          min-width: 44px;
        }
      }

      /* ============================================= */
      /* RESOURCE VIEW STYLES (Columns by Doctor) */
      /* ============================================= */

      /* Resource header row */
      .calendar-wrapper.resource-mode .rbc-time-header-content {
        min-height: 60px;
      }

      /* Resource column headers */
      .calendar-wrapper.resource-mode .rbc-header {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 140px;
        padding: 0;
      }

      /* Resource column dividers */
      .calendar-wrapper.resource-mode .rbc-time-content > .rbc-day-slot {
        border-left: 2px solid var(--border-color, #e5e7eb);
      }

      .calendar-wrapper.resource-mode .rbc-time-content > .rbc-day-slot:first-child {
        border-left: none;
      }

      /* Color-coded resource columns background */
      .calendar-wrapper.resource-mode .rbc-day-slot {
        position: relative;
      }

      .calendar-wrapper.resource-mode .rbc-day-slot::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--resource-color, transparent);
        z-index: 1;
      }

      /* Events in resource view */
      .calendar-wrapper.resource-mode .rbc-event {
        margin-left: 2px;
        margin-right: 2px;
      }

      /* Today highlight in resource view */
      .calendar-wrapper.resource-mode .rbc-today {
        background: linear-gradient(
          180deg,
          var(--bg-subtle, #fafafa) 0%,
          var(--bg-default, #ffffff) 100%
        );
      }

      /* Resource view on mobile - horizontal scroll */
      @media (max-width: 768px) {
        .calendar-wrapper.resource-mode {
          overflow-x: auto;
        }
        .calendar-wrapper.resource-mode .rbc-time-view {
          min-width: 600px;
        }
        .calendar-wrapper.resource-mode .rbc-header {
          min-width: 120px;
        }
      }

      /* Highlight all-staff events spanning columns */
      .calendar-wrapper.resource-mode .rbc-event.rbc-event-allday {
        opacity: 0.9;
      }

      /* Resource view toggle button styling */
      .resource-toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 10px;
        font-size: 0.75rem;
        font-weight: 500;
        border-radius: 6px;
        border: 1px solid var(--border-color, #d1d5db);
        background: var(--bg-default, white);
        color: var(--text-secondary, #4b5563);
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .resource-toggle-btn:hover {
        background: var(--bg-hover, #f3f4f6);
        border-color: var(--primary, #3b82f6);
        color: var(--primary, #3b82f6);
      }

      .resource-toggle-btn.active {
        background: var(--primary-light, #eff6ff);
        border-color: var(--primary, #3b82f6);
        color: var(--primary, #3b82f6);
      }

      .resource-toggle-btn svg {
        width: 14px;
        height: 14px;
      }
    `}</style>
  )
}
