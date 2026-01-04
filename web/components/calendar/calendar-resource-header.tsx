'use client'

import type { ResourceHeaderProps as RBCResourceHeaderProps } from 'react-big-calendar'

/**
 * Custom Resource Header Component
 * Displays staff member info in resource view column headers
 */

export interface CalendarResourceData {
  id: string
  title: string
  colorCode?: string
  jobTitle?: string
  avatarUrl?: string | null
}

type ResourceHeaderProps = RBCResourceHeaderProps<CalendarResourceData>

export function ResourceHeader({ resource }: ResourceHeaderProps) {
  const initials = resource.title
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 min-w-[120px]">
      {/* Avatar or initials */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
        style={{ backgroundColor: resource.colorCode || 'var(--primary, #3b82f6)' }}
      >
        {resource.avatarUrl ? (
          <img
            src={resource.avatarUrl}
            alt={resource.title}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {/* Name and job title */}
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-[var(--text-primary)] truncate">
          {resource.title}
        </span>
        {resource.jobTitle && (
          <span className="text-[10px] text-[var(--text-muted)] truncate">
            {resource.jobTitle}
          </span>
        )}
      </div>

      {/* Color indicator */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0 ml-auto"
        style={{ backgroundColor: resource.colorCode || 'var(--primary)' }}
      />
    </div>
  )
}

/**
 * Resource accessor function for react-big-calendar
 * Maps events to their resource (staff member)
 */
export function resourceAccessor(event: { resourceId?: string }): string | undefined {
  return event.resourceId
}

/**
 * Resource ID accessor for react-big-calendar
 */
export function resourceIdAccessor(resource: { id: string }): string {
  return resource.id
}

/**
 * Resource title accessor for react-big-calendar
 */
export function resourceTitleAccessor(resource: { title: string }): string {
  return resource.title
}
