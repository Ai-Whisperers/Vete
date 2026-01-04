'use client'

import { useEffect, useState } from 'react'
import { Gift, Star } from 'lucide-react'

// TICKET-TYPE-003: Define proper types for component props
interface ClinicConfig {
  config?: {
    name?: string
    ui_labels?: {
      portal?: {
        loyalty_points?: string
      }
    }
  }
}

interface LoyaltyCardProps {
  petId: string
  petName: string
  clinicConfig: ClinicConfig
  labels?: {
    pointsTitle?: string
    pointsAbbr?: string
    nextReward?: string
    rewardAvailable?: string
  }
}

export function LoyaltyCard({ petId, petName, clinicConfig, labels = {} }: LoyaltyCardProps) {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch(`/api/loyalty_points?petId=${petId}`)
        const data = await res.json()
        if (typeof data.balance === 'number') {
          setBalance(data.balance)
        }
      } catch {
        // Error fetching loyalty points - silently fail
      } finally {
        setLoading(false)
      }
    }

    if (petId) fetchBalance()
  }, [petId])

  if (loading)
    return <div className="h-24 w-full animate-pulse rounded-xl bg-[var(--bg-subtle)]"></div>

  // Configurable tiers or next reward logic could go here
  const nextReward = 500
  const progress = Math.min(100, Math.max(0, ((balance || 0) / nextReward) * 100))

  // Get labels with fallbacks
  const pointsTitle =
    labels.pointsTitle ||
    clinicConfig.config?.ui_labels?.portal?.loyalty_points ||
    `Puntos ${clinicConfig.config?.name || 'Veterinaria'}`
  const pointsAbbr = labels.pointsAbbr || 'pts'
  const nextRewardText = labels.nextReward || 'Próximo premio'
  const rewardAvailableText = labels.rewardAvailable || '¡Puedes un canje disponible!'

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 p-6 text-white shadow-lg">
      <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>

      <div className="relative z-10 mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-purple-100">{pointsTitle}</h3>
          <p className="text-sm text-purple-200">{petName}</p>
        </div>
        <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
          <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />
        </div>
      </div>

      <div className="relative z-10 mb-4">
        <span className="text-4xl font-black">{balance || 0}</span>
        <span className="ml-2 text-sm text-purple-200">{pointsAbbr}</span>
      </div>

      <div className="relative z-10">
        <div className="mb-1 flex justify-between text-xs text-purple-200">
          <span>{nextRewardText}</span>
          <span>
            {nextReward} {pointsAbbr}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {balance !== null && balance >= nextReward && (
          <div className="mt-3 flex animate-bounce items-center gap-2 rounded-lg bg-white/20 p-2 text-xs">
            <Gift className="h-4 w-4" />
            <span>{rewardAvailableText}</span>
          </div>
        )}
      </div>
    </div>
  )
}
