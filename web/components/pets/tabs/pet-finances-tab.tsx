'use client'

import Link from 'next/link'
import {
  CreditCard,
  Receipt,
  Gift,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Download,
  Star,
  Coins,
  FileText,
} from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  due_date?: string
  created_at: string
  items?: Array<{
    description: string
    quantity: number
    unit_price: number
  }>
}

interface Payment {
  id: string
  amount: number
  payment_date: string
  method: string
  invoice_id?: string
}

interface LoyaltyInfo {
  balance: number
  lifetime_earned: number
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
  recent_transactions?: Array<{
    id: string
    points: number
    description: string
    type: 'earn' | 'redeem'
    created_at: string
  }>
}

interface PetFinancesTabProps {
  petId: string
  petName: string
  invoices: Invoice[]
  payments: Payment[]
  loyalty?: LoyaltyInfo | null
  clinic: string
}

export function PetFinancesTab({
  petId,
  petName,
  invoices,
  payments,
  loyalty,
  clinic,
}: PetFinancesTabProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Calculate totals
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const pendingInvoices = invoices.filter((i) => ['sent', 'overdue'].includes(i.status))
  const totalPending = pendingInvoices.reduce((sum, i) => sum + i.total, 0)

  const getStatusConfig = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return { label: 'Pagada', color: 'bg-green-100 text-green-700', icon: CheckCircle2 }
      case 'sent':
        return { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: Clock }
      case 'overdue':
        return { label: 'Vencida', color: 'bg-red-100 text-red-700', icon: AlertCircle }
      case 'cancelled':
        return { label: 'Cancelada', color: 'bg-gray-100 text-gray-700', icon: AlertCircle }
      default:
        return { label: 'Borrador', color: 'bg-gray-100 text-gray-500', icon: FileText }
    }
  }

  const getTierConfig = (tier?: string) => {
    switch (tier) {
      case 'platinum':
        return { label: 'Platino', color: 'from-gray-400 to-gray-600', textColor: 'text-gray-700' }
      case 'gold':
        return { label: 'Oro', color: 'from-yellow-400 to-amber-500', textColor: 'text-amber-700' }
      case 'silver':
        return { label: 'Plata', color: 'from-gray-300 to-gray-400', textColor: 'text-gray-600' }
      default:
        return {
          label: 'Bronce',
          color: 'from-orange-300 to-orange-400',
          textColor: 'text-orange-700',
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Paid */}
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-gray-500">
            <CreditCard className="h-4 w-4" />
            <span className="text-xs font-medium">Total Pagado</span>
          </div>
          <p className="text-2xl font-black text-green-600">{formatCurrency(totalPaid)}</p>
          <p className="mt-1 text-xs text-gray-400">{payments.length} pagos registrados</p>
        </div>

        {/* Pending */}
        <div
          className={`rounded-xl border p-4 ${totalPending > 0 ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white'}`}
        >
          <div className="mb-2 flex items-center gap-2 text-gray-500">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Pendiente</span>
          </div>
          <p
            className={`text-2xl font-black ${totalPending > 0 ? 'text-amber-600' : 'text-gray-400'}`}
          >
            {formatCurrency(totalPending)}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {pendingInvoices.length} factura{pendingInvoices.length !== 1 ? 's' : ''} pendiente
            {pendingInvoices.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Loyalty Points */}
        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-4 text-white">
          <div className="mb-2 flex items-center gap-2 text-white/80">
            <Star className="h-4 w-4" />
            <span className="text-xs font-medium">Puntos de Lealtad</span>
          </div>
          <p className="text-2xl font-black">{loyalty?.balance?.toLocaleString() || 0}</p>
          {loyalty?.tier && (
            <p className="mt-1 text-xs text-white/70">Nivel {getTierConfig(loyalty.tier).label}</p>
          )}
        </div>
      </div>

      {/* Pending Invoices Alert */}
      {pendingInvoices.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-3 flex items-center gap-2 font-bold text-amber-700">
            <AlertCircle className="h-5 w-5" />
            Facturas Pendientes de Pago
          </div>
          <div className="space-y-2">
            {pendingInvoices.slice(0, 3).map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-lg border border-amber-100 bg-white p-3"
              >
                <div>
                  <p className="text-sm font-medium">{invoice.invoice_number}</p>
                  <p className="text-xs text-gray-500">{formatDate(invoice.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-700">{formatCurrency(invoice.total)}</p>
                  {invoice.due_date && new Date(invoice.due_date) < new Date() && (
                    <p className="text-xs text-red-600">Vencida</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link
            href={`/${clinic}/portal/invoices?status=pending`}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          >
            <CreditCard className="h-4 w-4" />
            Pagar Ahora
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Loyalty Card */}
      {loyalty && (
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <Gift className="h-5 w-5 text-purple-500" />
            Programa de Lealtad
          </h3>

          {/* Progress to next tier */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-500">Progreso al siguiente nivel</span>
              <span className="font-medium text-purple-600">
                {loyalty.lifetime_earned?.toLocaleString() || 0} pts acumulados
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all"
                style={{
                  width: `${Math.min(((loyalty.lifetime_earned || 0) / 10000) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Recent transactions */}
          {loyalty.recent_transactions && loyalty.recent_transactions.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-500">Últimos Movimientos</h4>
              <div className="space-y-2">
                {loyalty.recent_transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          tx.type === 'earn' ? 'bg-green-100' : 'bg-purple-100'
                        }`}
                      >
                        {tx.type === 'earn' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <Gift className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                      </div>
                    </div>
                    <span
                      className={`font-bold ${tx.type === 'earn' ? 'text-green-600' : 'text-purple-600'}`}
                    >
                      {tx.type === 'earn' ? '+' : '-'}
                      {tx.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href={`/${clinic}/portal/loyalty`}
            className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-purple-600 hover:underline"
          >
            Ver todos los beneficios
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Invoice History */}
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <Receipt className="h-5 w-5 text-blue-500" />
            Historial de Facturas
          </h3>
          <Link
            href={`/${clinic}/portal/invoices`}
            className="text-sm font-medium text-[var(--primary)] hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {invoices.length > 0 ? (
          <div className="space-y-3">
            {invoices.slice(0, 5).map((invoice) => {
              const statusConfig = getStatusConfig(invoice.status)
              const StatusIcon = statusConfig.icon

              return (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-100 bg-white">
                      <Receipt className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{invoice.invoice_number}</p>
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(invoice.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-[var(--text-primary)]">
                      {formatCurrency(invoice.total)}
                    </p>
                    <Link
                      href={`/${clinic}/portal/invoices/${invoice.id}`}
                      className="p-2 text-gray-400 transition-colors hover:text-[var(--primary)]"
                    >
                      <Download className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400">
            <Receipt className="mx-auto mb-2 h-10 w-10 opacity-50" />
            <p className="text-sm">Sin facturas registradas</p>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <CreditCard className="h-5 w-5 text-green-500" />
            Historial de Pagos
          </h3>
        </div>

        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pago recibido</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(payment.payment_date)}
                      <span className="mx-1">•</span>
                      {payment.method}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-green-600">{formatCurrency(payment.amount)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400">
            <CreditCard className="mx-auto mb-2 h-10 w-10 opacity-50" />
            <p className="text-sm">Sin pagos registrados</p>
          </div>
        )}
      </div>
    </div>
  )
}
