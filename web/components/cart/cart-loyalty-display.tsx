'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Star, ChevronRight, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

interface CartLoyaltyDisplayProps {
  userId?: string
  cartTotal?: number
  compact?: boolean
  className?: string
}

const POINTS_TO_CURRENCY = 100 // 1 point = 100 Gs
const EARN_RATE = 0.01 // 1 point per 100 Gs spent

/**
 * Displays user's loyalty points and potential earnings in cart context
 */
export function CartLoyaltyDisplay({
  userId,
  cartTotal = 0,
  compact = false,
  className,
}: CartLoyaltyDisplayProps) {
  const { clinic } = useParams() as { clinic: string }
  const [points, setPoints] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Calculate points to earn from this purchase
  const pointsToEarn = Math.floor(cartTotal * EARN_RATE)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchPoints = async () => {
      setError(false)
      try {
        const res = await fetch(`/api/loyalty/points?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setPoints(data.points || 0)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPoints()
  }, [userId])

  // Don't show if no user or if there was an error (avoid misleading "0 puntos")
  if (!userId || error) return null

  // Loading state
  if (loading) {
    return (
      <div className={clsx('flex items-center gap-2 text-[var(--text-muted)]', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  // Compact version for cart drawer
  if (compact) {
    return (
      <Link
        href={`/${clinic}/portal/loyalty`}
        className={clsx(
          'group flex items-center justify-between rounded-xl bg-[var(--status-special-bg)] px-4 py-3 transition hover:bg-[var(--status-special-light)]',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-[var(--status-special)]" />
          <div>
            <span className="text-sm font-bold text-[var(--status-special-dark)]">
              {points?.toLocaleString() || 0} puntos
            </span>
            {pointsToEarn > 0 && (
              <span className="ml-1 text-xs text-[var(--status-special)]">
                (+{pointsToEarn} con esta compra)
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-[var(--status-special)] opacity-50 transition group-hover:opacity-100" />
      </Link>
    )
  }

  // Full version for checkout
  return (
    <div
      className={clsx(
        'rounded-xl border border-[var(--status-special-light)] bg-gradient-to-r from-[var(--status-special-bg)] to-[var(--status-special-light)]/50 p-4',
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--status-special)]">
            <Star className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-[var(--text-primary)]">Tus Puntos</div>
            <div className="text-xs text-[var(--text-muted)]">
              Valor: {new Intl.NumberFormat('es-PY').format((points || 0) * POINTS_TO_CURRENCY)} Gs
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-[var(--status-special)]">{points?.toLocaleString() || 0}</div>
          <div className="text-xs text-[var(--status-special)] opacity-75">puntos</div>
        </div>
      </div>

      {cartTotal > 0 && (
        <div className="mt-3 flex items-center justify-between border-t border-[var(--status-special-light)]/50 pt-3">
          <span className="text-sm text-[var(--text-secondary)]">Ganarás con esta compra:</span>
          <span className="font-bold text-[var(--status-success)]">+{pointsToEarn} puntos</span>
        </div>
      )}

      <Link
        href={`/${clinic}/portal/loyalty`}
        className="mt-3 flex items-center gap-1 text-sm font-medium text-[var(--status-special)] hover:underline"
      >
        Ver programa de lealtad <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
