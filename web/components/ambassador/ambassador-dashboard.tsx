'use client'

/**
 * Ambassador Dashboard
 *
 * Full dashboard for ambassadors to:
 * - See their referral code
 * - Track referrals and conversions
 * - View earnings and request payouts
 * - Track tier progress
 */

import { useState, useEffect } from 'react'
import {
  Gift,
  Copy,
  Share2,
  Users,
  TrendingUp,
  DollarSign,
  Award,
  Check,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Banknote,
} from 'lucide-react'

interface Ambassador {
  id: string
  email: string
  full_name: string
  phone: string
  type: string
  university?: string
  status: string
  tier: string
  referral_code: string
  referrals_count: number
  conversions_count: number
  commission_rate: number
  total_earned: number
  total_paid: number
  pending_payout: number
  share_url: string
  share_message: string
}

interface Stats {
  total_referrals: number
  pending_referrals: number
  converted_referrals: number
  total_earned: number
  pending_payout: number
  tier: string
  commission_rate: number
  next_tier: string | null
  referrals_to_next_tier: number
  tier_info: {
    name: string
    commission: number
    color: string
    benefits: string[]
  }
  next_tier_info: {
    name: string
    commission: number
    benefits: string[]
  } | null
}

interface Referral {
  id: string
  status: string
  referred_at: string
  trial_started_at: string | null
  converted_at: string | null
  subscription_amount: number | null
  commission_rate: number | null
  commission_amount: number | null
  payout_status: string
  tenant: { id: string; name: string; zone: string } | null
}

export function AmbassadorDashboard() {
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [ambassadorRes, statsRes, referralsRes] = await Promise.all([
        fetch('/api/ambassador'),
        fetch('/api/ambassador/stats'),
        fetch('/api/ambassador/referrals?limit=5'),
      ])

      if (!ambassadorRes.ok) {
        const data = await ambassadorRes.json()
        throw new Error(data.error || 'Error al cargar perfil')
      }

      setAmbassador(await ambassadorRes.json())

      if (statsRes.ok) {
        setStats(await statsRes.json())
      }

      if (referralsRes.ok) {
        const data = await referralsRes.json()
        setReferrals(data.referrals || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const copyCode = async () => {
    if (!ambassador) return
    try {
      await navigator.clipboard.writeText(ambassador.referral_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = ambassador.referral_code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareCode = async () => {
    if (!ambassador) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Únete a Vetic',
          text: ambassador.share_message,
          url: ambassador.share_url,
        })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(ambassador.share_message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return `Gs ${amount.toLocaleString('es-PY')}`
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      trial_started: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <AlertCircle className="h-3 w-3" /> },
      converted: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      expired: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <AlertCircle className="h-3 w-3" /> },
    }
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      trial_started: 'En prueba',
      converted: 'Convertido',
      expired: 'Expirado',
    }
    const style = styles[status] || styles.pending
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {labels[status] || status}
      </span>
    )
  }

  const getTierBadge = (tier: string) => {
    const styles: Record<string, string> = {
      embajador: 'bg-blue-100 text-blue-800 border-blue-200',
      promotor: 'bg-purple-100 text-purple-800 border-purple-200',
      super: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border-amber-200',
    }
    const labels: Record<string, string> = {
      embajador: 'Embajador',
      promotor: 'Promotor',
      super: 'Super Embajador',
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${styles[tier] || styles.embajador}`}>
        <Award className="h-4 w-4" />
        {labels[tier] || tier}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-48 rounded-xl bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !ambassador) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-4 text-lg font-semibold text-red-800">Error</h3>
        <p className="mt-2 text-red-600">{error || 'No se pudo cargar el perfil de embajador'}</p>
        <button
          onClick={fetchData}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (ambassador.status === 'pending') {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-8 text-center">
        <Clock className="mx-auto h-12 w-12 text-yellow-500" />
        <h3 className="mt-4 text-lg font-semibold text-yellow-800">Cuenta Pendiente de Aprobación</h3>
        <p className="mt-2 text-yellow-700">
          Tu registro como embajador está siendo revisado. Te notificaremos por email cuando sea aprobado.
        </p>
        <div className="mt-4 rounded-lg bg-white p-4 text-left">
          <p className="text-sm text-gray-600">
            <strong>Tu código de referido:</strong> {ambassador.referral_code}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            (Estará activo cuando tu cuenta sea aprobada)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Tier Badge */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Hola, {ambassador.full_name.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">Panel de Embajador</p>
        </div>
        {getTierBadge(ambassador.tier)}
      </div>

      {/* Referral Code Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900">Tu Código de Referido</h2>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Gana {stats?.commission_rate || ambassador.commission_rate}% de comisión por cada clínica que se una
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 rounded-lg border-2 border-emerald-200 bg-white px-4 py-3">
              <p className="text-center text-2xl font-bold tracking-widest text-emerald-600">
                {ambassador.referral_code}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyCode}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 sm:flex-none"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                onClick={shareCode}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-emerald-600 px-4 py-3 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 sm:flex-none"
              >
                <Share2 className="h-4 w-4" />
                Compartir
              </button>
            </div>
          </div>
        </div>

        {/* Tier Progress */}
        {stats?.next_tier && (
          <div className="border-t border-emerald-100 bg-white/50 px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {stats.referrals_to_next_tier} conversiones más para {stats.next_tier_info?.name}
              </span>
              <span className="font-medium text-emerald-600">
                +{(stats.next_tier_info?.commission || 0) - stats.commission_rate}% comisión
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${
                    stats.next_tier === 'promotor'
                      ? (stats.converted_referrals / 5) * 100
                      : stats.next_tier === 'super'
                      ? ((stats.converted_referrals - 5) / 5) * 100
                      : 100
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.total_referrals}</p>
                <p className="text-sm text-gray-500">Referidos</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.converted_referrals}</p>
                <p className="text-sm text-gray-500">Convertidos</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_earned)}</p>
                <p className="text-sm text-gray-500">Total ganado</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <Banknote className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pending_payout)}</p>
                <p className="text-sm text-gray-500">Por cobrar</p>
              </div>
            </div>
            {stats.pending_payout >= 500000 && (
              <a
                href="/ambassador/payouts"
                className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600"
              >
                Solicitar pago
                <ChevronRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Recent Referrals */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="font-semibold text-gray-900">Referidos Recientes</h3>
          <a
            href="/ambassador/referrals"
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Ver todos
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {referrals.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Gift className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">Aún no tienes referidos</p>
            <p className="mt-1 text-sm text-gray-400">
              Comparte tu código para empezar a ganar comisiones
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Users className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {referral.tenant?.name || 'Clínica'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {referral.tenant?.zone} • {formatDate(referral.referred_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {referral.status === 'converted' && referral.commission_amount && (
                    <span className="text-sm font-semibold text-green-600">
                      +{formatCurrency(referral.commission_amount)}
                    </span>
                  )}
                  {getStatusBadge(referral.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it Works */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">¿Cómo funciona?</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Comparte tu código</p>
              <p className="text-sm text-gray-500">
                Envíalo a veterinarias que conozcas
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Ellos se registran</p>
              <p className="text-sm text-gray-500">
                Con tu código obtienen 2 meses extra de prueba
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Gana comisión</p>
              <p className="text-sm text-gray-500">
                {stats?.commission_rate || 30}% del primer año cuando se suscriben
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AmbassadorDashboard
