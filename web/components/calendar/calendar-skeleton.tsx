'use client'

/**
 * Calendar Skeleton Loader
 * Shows a loading placeholder while calendar data is being fetched
 */

interface CalendarSkeletonProps {
  view?: 'week' | 'day' | 'month' | 'agenda'
}

export function CalendarSkeleton({ view = 'week' }: CalendarSkeletonProps) {
  // Render different skeletons based on view
  if (view === 'month') {
    return <MonthSkeleton />
  }

  if (view === 'agenda') {
    return <AgendaSkeleton />
  }

  // Default: Week/Day view skeleton
  return <WeekDaySkeleton isDayView={view === 'day'} />
}

function WeekDaySkeleton({ isDayView }: { isDayView: boolean }) {
  const columns = isDayView ? 1 : 7
  const hours = Array.from({ length: 10 }, (_, i) => i + 8) // 8am to 5pm

  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between p-2 border-b border-[var(--border-light)]">
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-[var(--bg-muted)] rounded" />
          <div className="h-8 w-24 bg-[var(--bg-muted)] rounded" />
          <div className="h-8 w-20 bg-[var(--bg-muted)] rounded" />
        </div>
        <div className="h-6 w-32 bg-[var(--bg-muted)] rounded" />
        <div className="flex gap-1">
          <div className="h-8 w-16 bg-[var(--bg-muted)] rounded" />
          <div className="h-8 w-16 bg-[var(--bg-muted)] rounded" />
          <div className="h-8 w-16 bg-[var(--bg-muted)] rounded" />
        </div>
      </div>

      {/* Header with days */}
      <div className="flex border-b border-[var(--border-light)]">
        <div className="w-16 shrink-0" />
        <div className={`flex-1 grid gap-px ${isDayView ? '' : 'grid-cols-7'}`}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="p-2 text-center border-l border-[var(--border-light)]">
              <div className="h-4 w-8 mx-auto bg-[var(--bg-muted)] rounded mb-1" />
              <div className="h-6 w-6 mx-auto bg-[var(--bg-muted)] rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Time gutter */}
          <div className="w-16 shrink-0 border-r border-[var(--border-light)]">
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b border-[var(--border-light)] pr-2 pt-1 text-right">
                <div className="h-3 w-10 ml-auto bg-[var(--bg-muted)] rounded" />
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className={`flex-1 grid gap-px ${isDayView ? '' : 'grid-cols-7'}`}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="border-l border-[var(--border-light)]">
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="h-16 border-b border-[var(--border-light)] relative"
                  >
                    {/* Random event placeholders */}
                    {Math.random() > 0.7 && (
                      <div
                        className="absolute left-1 right-1 bg-[var(--bg-muted)] rounded"
                        style={{
                          top: `${Math.random() * 20}%`,
                          height: `${40 + Math.random() * 40}px`,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MonthSkeleton() {
  const weeks = 5
  const days = 7

  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between p-2 border-b border-[var(--border-light)]">
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-[var(--bg-muted)] rounded" />
          <div className="h-8 w-24 bg-[var(--bg-muted)] rounded" />
          <div className="h-8 w-20 bg-[var(--bg-muted)] rounded" />
        </div>
        <div className="h-6 w-32 bg-[var(--bg-muted)] rounded" />
        <div className="flex gap-1">
          <div className="h-8 w-16 bg-[var(--bg-muted)] rounded" />
          <div className="h-8 w-16 bg-[var(--bg-muted)] rounded" />
          <div className="h-8 w-16 bg-[var(--bg-muted)] rounded" />
        </div>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 border-b border-[var(--border-light)]">
        {Array.from({ length: days }).map((_, i) => (
          <div key={i} className="p-2 text-center border-l border-[var(--border-light)] first:border-l-0">
            <div className="h-4 w-8 mx-auto bg-[var(--bg-muted)] rounded" />
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="flex-1 grid grid-rows-5">
        {Array.from({ length: weeks }).map((_, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-[var(--border-light)]">
            {Array.from({ length: days }).map((_, dayIndex) => (
              <div
                key={dayIndex}
                className="p-1 border-l border-[var(--border-light)] first:border-l-0 min-h-[80px]"
              >
                <div className="h-5 w-5 bg-[var(--bg-muted)] rounded mb-1" />
                {/* Random event indicators */}
                {Math.random() > 0.5 && (
                  <div className="h-4 w-full bg-[var(--bg-muted)] rounded mb-1" />
                )}
                {Math.random() > 0.7 && (
                  <div className="h-4 w-3/4 bg-[var(--bg-muted)] rounded" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function AgendaSkeleton() {
  const items = 8

  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between p-2 border-b border-[var(--border-light)]">
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-[var(--bg-muted)] rounded" />
          <div className="h-8 w-24 bg-[var(--bg-muted)] rounded" />
          <div className="h-8 w-20 bg-[var(--bg-muted)] rounded" />
        </div>
        <div className="h-6 w-32 bg-[var(--bg-muted)] rounded" />
        <div className="flex gap-1">
          <div className="h-8 w-16 bg-[var(--bg-muted)] rounded" />
          <div className="h-8 w-16 bg-[var(--bg-muted)] rounded" />
          <div className="h-8 w-16 bg-[var(--bg-muted)] rounded" />
        </div>
      </div>

      {/* Table header */}
      <div className="flex border-b border-[var(--border-light)] bg-[var(--bg-subtle)]">
        <div className="w-32 p-3">
          <div className="h-4 w-16 bg-[var(--bg-muted)] rounded" />
        </div>
        <div className="w-24 p-3">
          <div className="h-4 w-12 bg-[var(--bg-muted)] rounded" />
        </div>
        <div className="flex-1 p-3">
          <div className="h-4 w-20 bg-[var(--bg-muted)] rounded" />
        </div>
      </div>

      {/* Agenda items */}
      <div className="flex-1 overflow-hidden">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex border-b border-[var(--border-light)]">
            <div className="w-32 p-3">
              <div className="h-4 w-20 bg-[var(--bg-muted)] rounded mb-1" />
              <div className="h-3 w-16 bg-[var(--bg-muted)] rounded" />
            </div>
            <div className="w-24 p-3">
              <div className="h-4 w-16 bg-[var(--bg-muted)] rounded" />
            </div>
            <div className="flex-1 p-3">
              <div className="h-4 w-3/4 bg-[var(--bg-muted)] rounded mb-1" />
              <div className="h-3 w-1/2 bg-[var(--bg-muted)] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
