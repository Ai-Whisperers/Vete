/**
 * Mobile-Optimized List Item Component
 *
 * Touch-friendly list item with optional swipe actions.
 */

'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { SwipeableCard } from './SwipeableCard'
import { TOUCH_TARGETS } from './constants'
import type { SwipeAction } from './types'

interface MobileListItemProps {
  leading?: ReactNode
  title: string
  subtitle?: string
  trailing?: ReactNode
  onClick?: () => void
  href?: string
  swipeActions?: {
    left?: SwipeAction[]
    right?: SwipeAction[]
  }
  className?: string
}

export function MobileListItem({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  href,
  swipeActions,
  className,
}: MobileListItemProps) {
  return (
    <SwipeableCard
      className={cn('mobile-list-item', className)}
      onClick={onClick}
      href={href}
      swipeActions={swipeActions}
    >
      {leading && <div className="leading">{leading}</div>}
      <div className="title">{title}</div>
      {subtitle && <div className="subtitle">{subtitle}</div>}
      {trailing && <div className="trailing">{trailing}</div>}
      <ChevronRight className="chevron" />
    </SwipeableCard>
  )
}