'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Star,
  Gift,
  TrendingUp,
  Clock,
  ChevronRight,
  Loader2,
  CheckCircle,
  ShoppingBag,
  Calendar,
  AlertCircle,
  Trophy,
} from 'lucide-react'
import { clsx } from 'clsx'

interface LoyaltyData {
  points: number
  tier: string | null
  lifetime_earned: number
  lifetime_redeemed: number
}

interface Transaction {
  id: string
  type: 'earn' | 'redeem' | 'expire' | 'adjust' | 'bonus'
  points: number
  description: string | null
  balance_after: number | null
  invoice_id: string | null
  order_id: string | null
  created_at: string
}

interface Reward {
  id: string
  name: string
  description: string | null
  category: string
  points_cost: number
  value_display: string | null
  stock: number | null
  max_per_user: number | null
  image_url: string | null
  user_redemption_count?: number
}

interface Redemption {
  id: string
  points_spent: number
  status: 'pending' | 'approved' | 'used' | 'expired' | 'cancelled'
  redemption_code: string
  expires_at: string | null
  used_at: string | null
  created_at: string
  reward: {
    id: string
    name: string
    description: string | null
    category: string
    value_display: string | null
  } | null
}

interface LoyaltyClientProps {
  clinic: string
  initialData: LoyaltyData
}

// Tier configuration matching loyalty-widget.tsx
const TIERS = {
  bronze: {
    name: 'Bronce',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    min: 0,
    next: 500,
  },
  silver: {
    name: 'Plata',
    color: 'text-gray-600',
    bg: 'bg-gray-200',
    border: 'border-gray-400',
    min: 500,
    next: 2000,
  },
  gold: {
    name: 'Oro',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    border: 'border-yellow-400',
    min: 2000,
    next: 5000,
  },
  platinum: {
    name: 'Platino',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-400',
    min: 5000,
    next: null,
  },
}

const POINTS_TO_CURRENCY = 100 // 1 point = 100 Gs

export function LoyaltyClient({ clinic, initialData }: LoyaltyClientProps) {
  const [data] = useState<LoyaltyData>(initialData)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'history'>('overview')
  const [loading, setLoading] = useState(true)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  const tierKey = (data.tier || 'bronze') as keyof typeof TIERS
  const tierConfig = TIERS[tierKey]
  const nextTier =
    tierKey !== 'platinum'
      ? Object.entries(TIERS).find(([, config]) => config.min > tierConfig.min)
      : null
  const pointsToNextTier = nextTier ? nextTier[1].min - data.lifetime_earned : 0
  const progressPercent = nextTier
    ? Math.min(
        100,
        ((data.lifetime_earned - tierConfig.min) / (nextTier[1].min - tierConfig.min)) * 100
      )
    : 100

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [txRes, rewardsRes, redemptionsRes] = await Promise.all([
          fetch(`/api/loyalty/transactions?limit=20`),
          fetch(`/api/loyalty/rewards?clinic=${clinic}`),
          fetch('/api/loyalty/redeem'),
        ])

        if (txRes.ok) {
          const txData = await txRes.json()
          setTransactions(txData.data || [])
        }

        if (rewardsRes.ok) {
          const rewardsData = await rewardsRes.json()
          setRewards(rewardsData.data || [])
        }

        if (redemptionsRes.ok) {
          const redemptionsData = await redemptionsRes.json()
          setRedemptions(redemptionsData.data || [])
        }
      } catch (e) {
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching loyalty data:', e)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [clinic])

  const formatPrice = (price: number): string => {
    return `Gs ${price.toLocaleString('es-PY')}`
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'earn':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'bonus':
        return <Gift className="h-4 w-4 text-purple-600" />
      case 'redeem':
        return <ShoppingBag className="h-4 w-4 text-orange-600" />
      case 'expire':
        return <Clock className="h-4 w-4 text-gray-500" />
      case 'adjust':
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      default:
        return <Star className="h-4 w-4 text-gray-400" />
    }
  }

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleRedeem = async (reward: Reward) => {
    if (data.points < reward.points_cost) {
      showFeedback('error', 'Puntos insuficientes')
      return
    }

    if (reward.max_per_user && (reward.user_redemption_count || 0) >= reward.max_per_user) {
      showFeedback(
        'error',
        `Ya has canjeado esta recompensa el máximo de ${reward.max_per_user} veces`
      )
      return
    }

    setRedeemingId(reward.id)

    try {
      const res = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reward_id: reward.id }),
      })

      const result = await res.json()

      if (!res.ok) {
        showFeedback('error', result.details?.reason || 'Error al canjear')
        return
      }

      showFeedback('success', `¡Canjeado! Tu código es: ${result.redemption.code}`)

      // Refresh data
      const [rewardsRes, redemptionsRes] = await Promise.all([
        fetch(`/api/loyalty/rewards?clinic=${clinic}`),
        fetch('/api/loyalty/redeem'),
      ])

      if (rewardsRes.ok) {
        const rewardsData = await rewardsRes.json()
        setRewards(rewardsData.data || [])
      }

      if (redemptionsRes.ok) {
        const redemptionsData = await redemptionsRes.json()
        setRedemptions(redemptionsData.data || [])
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error redeeming:', e)
      }
      showFeedback('error', 'Error de conexión')
    } finally {
      setRedeemingId(null)
    }
  }

  const getRedemptionStatusBadge = (status: Redemption['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
            Pendiente
          </span>
        )
      case 'approved':
        return (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
            Aprobado
          </span>
        )
      case 'used':
        return (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Usado</span>
        )
      case 'expired':
        return (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            Expirado
          </span>
        )
      case 'cancelled':
        return (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
            Cancelado
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={clsx(
            'fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl px-6 py-3 font-medium shadow-lg',
            feedback.type === 'success' && 'bg-green-500 text-white',
            feedback.type === 'error' && 'bg-red-500 text-white'
          )}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Points Balance Card */}
      <div className={clsx('rounded-2xl border-2 p-6 md:p-8', tierConfig.bg, tierConfig.border)}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div
                className={clsx(
                  'flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm'
                )}
              >
                <Star className={clsx('h-7 w-7', tierConfig.color)} />
              </div>
              <div>
                <span
                  className={clsx(
                    'rounded-full px-3 py-1 text-sm font-bold',
                    tierConfig.bg,
                    tierConfig.color
                  )}
                >
                  Nivel {tierConfig.name}
                </span>
              </div>
            </div>

            <div className="text-5xl font-black text-[var(--text-primary)]">
              {data.points.toLocaleString()}
            </div>
            <div className="mt-1 text-lg text-[var(--text-secondary)]">
              puntos disponibles = {formatPrice(data.points * POINTS_TO_CURRENCY)}
            </div>
          </div>

          <div className="flex flex-col gap-4 md:text-right">
            <div>
              <div className="text-sm text-[var(--text-muted)]">Total Ganados</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {data.lifetime_earned.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--text-muted)]">Total Canjeados</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {data.lifetime_redeemed.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Progress to next tier */}
        {nextTier && (
          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className={clsx('font-medium', tierConfig.color)}>
                <Trophy className="mr-1 inline h-4 w-4" />
                Próximo nivel: {nextTier[1].name}
              </span>
              <span className="text-[var(--text-muted)]">
                {pointsToNextTier.toLocaleString()} puntos más
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white shadow-inner">
              <div
                className={clsx('h-full rounded-full transition-all duration-500', {
                  'bg-gray-500': nextTier[0] === 'silver',
                  'bg-yellow-500': nextTier[0] === 'gold',
                  'bg-purple-500': nextTier[0] === 'platinum',
                })}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'overview', label: 'Resumen' },
          { key: 'rewards', label: 'Recompensas' },
          { key: 'history', label: 'Historial' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={clsx(
              '-mb-[2px] border-b-2 px-4 py-3 font-medium transition',
              activeTab === tab.key
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Transactions */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
                  Actividad Reciente
                </h3>
                {transactions.length === 0 ? (
                  <p className="py-8 text-center text-[var(--text-muted)]">
                    No hay transacciones aún
                  </p>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(tx.type)}
                          <div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">
                              {tx.description || tx.type}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                              {formatDate(tx.created_at)}
                            </div>
                          </div>
                        </div>
                        <span
                          className={clsx(
                            'font-bold',
                            tx.points > 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {tx.points > 0 ? '+' : ''}
                          {tx.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {transactions.length > 5 && (
                  <button
                    onClick={() => setActiveTab('history')}
                    className="mt-4 flex w-full items-center justify-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
                  >
                    Ver todo <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Active Redemptions */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
                  Mis Canjes Activos
                </h3>
                {redemptions.filter((r) => ['pending', 'approved'].includes(r.status)).length ===
                0 ? (
                  <p className="py-8 text-center text-[var(--text-muted)]">
                    No tienes canjes activos
                  </p>
                ) : (
                  <div className="space-y-3">
                    {redemptions
                      .filter((r) => ['pending', 'approved'].includes(r.status))
                      .slice(0, 5)
                      .map((redemption) => (
                        <div key={redemption.id} className="rounded-xl bg-gray-50 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-medium text-[var(--text-primary)]">
                                {redemption.reward?.name}
                              </div>
                              <div className="mt-1 text-xs text-[var(--text-muted)]">
                                Código:{' '}
                                <span className="font-mono font-bold">
                                  {redemption.redemption_code}
                                </span>
                              </div>
                            </div>
                            {getRedemptionStatusBadge(redemption.status)}
                          </div>
                          {redemption.expires_at && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                              <Calendar className="h-3 w-3" />
                              Expira: {formatDate(redemption.expires_at)}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="space-y-4">
              {rewards.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center">
                  <Gift className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-[var(--text-muted)]">
                    No hay recompensas disponibles en este momento
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rewards.map((reward) => {
                    const canRedeem =
                      data.points >= reward.points_cost &&
                      (reward.stock === null || reward.stock > 0) &&
                      (reward.max_per_user === null ||
                        (reward.user_redemption_count || 0) < reward.max_per_user)

                    return (
                      <div
                        key={reward.id}
                        className={clsx(
                          'overflow-hidden rounded-2xl border bg-white transition',
                          canRedeem
                            ? 'border-gray-100 hover:shadow-md'
                            : 'border-gray-100 opacity-60'
                        )}
                      >
                        {reward.image_url && (
                          <div className="relative h-32 bg-gray-100">
                            <Image
                              src={reward.image_url}
                              alt={reward.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <h4 className="font-bold text-[var(--text-primary)]">{reward.name}</h4>
                            <span className="flex items-center gap-1 text-sm font-bold text-[var(--primary)]">
                              <Star className="h-4 w-4" />
                              {reward.points_cost.toLocaleString()}
                            </span>
                          </div>
                          {reward.description && (
                            <p className="mb-3 line-clamp-2 text-sm text-[var(--text-muted)]">
                              {reward.description}
                            </p>
                          )}
                          {reward.value_display && (
                            <p className="mb-3 text-sm font-medium text-green-600">
                              Valor: {reward.value_display}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            {reward.stock !== null && (
                              <span className="text-xs text-[var(--text-muted)]">
                                {reward.stock} disponibles
                              </span>
                            )}
                            <button
                              onClick={() => handleRedeem(reward)}
                              disabled={!canRedeem || redeemingId === reward.id}
                              className={clsx(
                                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
                                canRedeem
                                  ? 'bg-[var(--primary)] text-white hover:brightness-110'
                                  : 'cursor-not-allowed bg-gray-200 text-gray-500'
                              )}
                            >
                              {redeemingId === reward.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Gift className="h-4 w-4" />
                              )}
                              Canjear
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {transactions.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-[var(--text-muted)]">No hay transacciones aún</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={clsx(
                            'flex h-10 w-10 items-center justify-center rounded-full',
                            tx.points > 0 ? 'bg-green-100' : 'bg-red-100'
                          )}
                        >
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--text-primary)]">
                            {tx.description || tx.type}
                          </div>
                          <div className="text-sm text-[var(--text-muted)]">
                            {formatDateTime(tx.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={clsx(
                            'text-lg font-bold',
                            tx.points > 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {tx.points > 0 ? '+' : ''}
                          {tx.points}
                        </div>
                        {tx.balance_after !== null && (
                          <div className="text-xs text-[var(--text-muted)]">
                            Saldo: {tx.balance_after.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
