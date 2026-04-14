/**
 * Pull to Refresh Component
 *
 * Touch-enabled pull-down refresh gesture handler.
 */

'use client'

import { useState, useRef, type ReactNode, type TouchEvent } from 'react'
import { cn } from '@/lib/utils'
import { Loader2, ArrowDown } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  threshold?: number
  children: ReactNode
  className?: string
}

export function PullToRefresh({
  onRefresh,
  threshold = 80,
  children,
  className,
}: PullToRefreshProps): React.ReactElement {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canPull, setCanPull] = useState(true)
  const startYRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (event: TouchEvent) => {
    startYRef.current = event.touches[0].clientY
  }

  const handleTouchMove = (event: TouchEvent) => {
    const currentY = event.touches[0].clientY
    const distance = currentY - startYRef.current
    setPullDistance(distance)
    if (distance > threshold && canPull) {
      setCanPull(false)
    }
  }

  const handleTouchEnd = () => {
    if (pullDistance > threshold) {
      onRefresh().then(() => {
        setIsRefreshing(false)
        setPullDistance(0)
        setCanPull(true)
      })
    } else {
      setPullDistance(0)
    }
  }

  return (
    <div
      className={cn('pull-to-refresh', className)}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isRefreshing ? (
        <Loader2 className="loader" />
      ) : (
        <ArrowDown className="arrow" />
      )}
      {children}
    </div>
  )
}