'use client'

import type { JSX } from 'react'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Gift,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Tag,
  Scissors,
  Package,
  PartyPopper,
  Copy,
  ArrowLeft,
  History,
} from 'lucide-react'

interface Reward {
  id: string
  name: string
  description: string | null
  category: string
  points_cost: number
  value_display: string | null
  stock: number | null
  max_per_user: number | null
  valid_to: string | null
  image_url: string | null
  user_redemption_count: number
}

interface Redemption {
  id: string
  points_spent: number
  status: string
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
  }
}

export default function RewardsPage(): JSX.Element {
  const params = useParams()
  const clinic = params?.clinic as string

  const [rewards, setRewards] = useState<Reward[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [pointsBalance, setPointsBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [successCode, setSuccessCode] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [clinic])

  const fetchData = async (): Promise<void> => {
    setLoading(true)
    try {
      // Fetch rewards, redemptions, and points balance in parallel
      const [rewardsRes, redemptionsRes] = await Promise.all([
        fetch(`/api/loyalty/rewards?clinic=${clinic}`),
        fetch('/api/loyalty/redeem'),
      ])

      if (rewardsRes.ok) {
        const data = await rewardsRes.json()
        setRewards(data.data || [])
      }

      if (redemptionsRes.ok) {
        const data = await redemptionsRes.json()
        setRedemptions(data.data || [])
      }

      // Get points balance from user's pets
      const meRes = await fetch('/api/auth/me')
      if (meRes.ok) {
        const me = await meRes.json()
        if (me.id) {
          // Get pets and sum loyalty points
          const petsRes = await fetch(`/api/pets?owner=${me.id}`)
          if (petsRes.ok) {
            const petsData = await petsRes.json()
            const pets = petsData.data || []
            let total = 0
            for (const pet of pets) {
              const pointsRes = await fetch(`/api/loyalty_points?petId=${pet.id}`)
              if (pointsRes.ok) {
                const pointsData = await pointsRes.json()
                total += pointsData.balance || 0
              }
            }
            setPointsBalance(total)
          }
        }
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching data:', e)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (reward: Reward): Promise<void> => {
    if (redeeming) return
    if (pointsBalance < reward.points_cost) {
      alert('No tienes suficientes puntos para esta recompensa')
      return
    }

    if (!confirm(`¿Canjear "${reward.name}" por ${reward.points_cost} puntos?`)) {
      return
    }

    setRedeeming(reward.id)
    try {
      const response = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reward_id: reward.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al canjear')
      }

      const result = await response.json()
      setSuccessCode(result.redemption.code)
      setPointsBalance((prev) => prev - reward.points_cost)
      fetchData()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al canjear recompensa')
    } finally {
      setRedeeming(null)
    }
  }

  const copyCode = (code: string): void => {
    navigator.clipboard.writeText(code)
    alert('Código copiado')
  }

  const getCategoryIcon = (category: string): JSX.Element => {
    switch (category) {
      case 'discount':
        return <Tag className="h-5 w-5" />
      case 'service':
        return <Scissors className="h-5 w-5" />
      case 'product':
        return <Package className="h-5 w-5" />
      case 'gift':
        return <Gift className="h-5 w-5" />
      case 'experience':
        return <PartyPopper className="h-5 w-5" />
      default:
        return <Sparkles className="h-5 w-5" />
    }
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string): JSX.Element => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            <CheckCircle className="h-3 w-3" />
            Disponible
          </span>
        )
      case 'used':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
            <CheckCircle className="h-3 w-3" />
            Usado
          </span>
        )
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
            <Clock className="h-3 w-3" />
            Expirado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
            <Clock className="h-3 w-3" />
            Pendiente
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
          <p className="text-[var(--text-secondary)]">Cargando recompensas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 px-4 py-8 text-white">
        <div className="container mx-auto max-w-4xl">
          <Link
            href={`/${clinic}/portal`}
            className="mb-4 inline-flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Portal
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-bold">
                <Gift className="h-8 w-8" />
                Club de Puntos
              </h1>
              <p className="mt-1 text-white/80">Canjea tus puntos por increíbles recompensas</p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 text-3xl font-bold">
                <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                {pointsBalance.toLocaleString('es-PY')}
              </div>
              <p className="text-sm text-white/80">puntos disponibles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">¡Canjeo Exitoso!</h2>
            <p className="mb-6 text-gray-600">
              Presenta este código en la clínica para reclamar tu recompensa
            </p>
            <div className="mb-6 rounded-xl bg-gray-100 p-4">
              <p className="font-mono text-3xl font-bold tracking-widest text-gray-900">
                {successCode}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => copyCode(successCode)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                <Copy className="h-4 w-4" />
                Copiar
              </button>
              <button
                onClick={() => setSuccessCode(null)}
                className="flex-1 rounded-xl bg-[var(--primary)] px-4 py-3 font-medium text-white hover:opacity-90"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Toggle Tabs */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setShowHistory(false)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
              !showHistory
                ? 'bg-[var(--primary)] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Gift className="h-4 w-4" />
            Recompensas
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
              showHistory
                ? 'bg-[var(--primary)] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <History className="h-4 w-4" />
            Mis Canjes
          </button>
        </div>

        {!showHistory ? (
          <>
            {/* Rewards Grid */}
            {rewards.length === 0 ? (
              <div className="rounded-2xl bg-white py-16 text-center">
                <Gift className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h2 className="mb-2 text-xl font-bold text-gray-900">
                  No hay recompensas disponibles
                </h2>
                <p className="text-gray-600">
                  Pronto agregaremos más opciones para canjear tus puntos
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {rewards.map((reward) => {
                  const canRedeem = pointsBalance >= reward.points_cost
                  const outOfStock = reward.stock !== null && reward.stock <= 0
                  const maxReached =
                    reward.max_per_user !== null &&
                    reward.user_redemption_count >= reward.max_per_user

                  return (
                    <div
                      key={reward.id}
                      className={`overflow-hidden rounded-2xl border bg-white transition-all ${
                        outOfStock || maxReached
                          ? 'border-gray-200 opacity-60'
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                            {getCategoryIcon(reward.category)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{reward.name}</h3>
                            {reward.description && (
                              <p className="mt-1 text-sm text-gray-600">{reward.description}</p>
                            )}
                            {reward.value_display && (
                              <p className="mt-2 text-sm font-medium text-purple-600">
                                {reward.value_display}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                            <span className="font-bold text-gray-900">
                              {reward.points_cost.toLocaleString('es-PY')} pts
                            </span>
                          </div>

                          {outOfStock ? (
                            <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500">
                              Agotado
                            </span>
                          ) : maxReached ? (
                            <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500">
                              Límite alcanzado
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRedeem(reward)}
                              disabled={!canRedeem || redeeming === reward.id}
                              className={`rounded-lg px-4 py-2 font-medium transition-all ${
                                canRedeem
                                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
                              }`}
                            >
                              {redeeming === reward.id
                                ? 'Canjeando...'
                                : canRedeem
                                  ? 'Canjear'
                                  : 'Puntos insuficientes'}
                            </button>
                          )}
                        </div>

                        {reward.stock !== null && reward.stock > 0 && reward.stock <= 10 && (
                          <p className="mt-3 flex items-center gap-1 text-xs text-orange-600">
                            <AlertCircle className="h-3 w-3" />
                            Solo quedan {reward.stock} unidades
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Redemption History */}
            {redemptions.length === 0 ? (
              <div className="rounded-2xl bg-white py-16 text-center">
                <History className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h2 className="mb-2 text-xl font-bold text-gray-900">Sin canjes aún</h2>
                <p className="text-gray-600">Cuando canjees una recompensa, aparecerá aquí</p>
              </div>
            ) : (
              <div className="space-y-4">
                {redemptions.map((redemption) => (
                  <div
                    key={redemption.id}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                          {getCategoryIcon(redemption.reward.category)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{redemption.reward.name}</h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(redemption.created_at)} • -{redemption.points_spent} pts
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(redemption.status)}
                    </div>

                    {redemption.status === 'approved' && (
                      <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-3">
                        <div>
                          <p className="mb-1 text-xs text-gray-500">Código de canje</p>
                          <p className="font-mono font-bold text-gray-900">
                            {redemption.redemption_code}
                          </p>
                        </div>
                        <button
                          onClick={() => copyCode(redemption.redemption_code)}
                          className="rounded-lg p-2 text-gray-600 hover:bg-gray-200"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {redemption.expires_at && redemption.status === 'approved' && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        Vence: {formatDate(redemption.expires_at)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
