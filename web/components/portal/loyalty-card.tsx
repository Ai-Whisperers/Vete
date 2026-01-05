'use client'

import Link from 'next/link'
import { Star, ArrowRight, Gift } from 'lucide-react'
import { useAsyncData } from '@/lib/hooks'

interface LoyaltyData {
  balance: number
  lifetime_earned: number
  tier?: string
}

interface PortalLoyaltyCardProps {
  userId: string
  clinic: string
}

function SkeletonLoader(): React.ReactElement {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

export function PortalLoyaltyCard({ userId, clinic }: PortalLoyaltyCardProps): React.ReactElement {
  const { data, isLoading } = useAsyncData<LoyaltyData>(
    () => fetch(`/api/loyalty/points?userId=${userId}`).then((r) => r.json()),
    [userId],
    { refetchInterval: 300000 } // Refresh every 5 minutes
  )

  if (isLoading && !data) return <SkeletonLoader />

  // If no loyalty data or balance is 0, show a CTA to earn points
  if (!data || data.balance === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-[var(--accent)]/5 to-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10">
            <Gift className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[var(--text-primary)]">Programa de Lealtad</p>
            <p className="text-sm text-[var(--text-secondary)]">Acumula puntos con cada compra</p>
          </div>
        </div>
        <Link
          href={`/${clinic}/portal/loyalty`}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          Conocer más
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
            <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Puntos disponibles</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {data.balance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Progress to next tier - simplified */}
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
            style={{ width: `${Math.min((data.balance / 1000) * 100, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {1000 - (data.balance % 1000)} puntos para el siguiente nivel
        </p>
      </div>

      <Link
        href={`/${clinic}/portal/loyalty`}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
      >
        Ver historial
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
