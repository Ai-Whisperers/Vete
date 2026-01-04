'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  Package,
  CreditCard,
  User,
  Phone,
  Mail,
  Calendar,
  X,
  FileText,
  RefreshCw,
  MapPin,
} from 'lucide-react'

interface Order {
  id: string
  order_number: string
  status: OrderStatus
  payment_status: PaymentStatus
  subtotal: number
  discount_amount: number
  shipping_cost: number
  tax_amount: number
  total: number
  shipping_method: string | null
  tracking_number: string | null
  customer_notes: string | null
  internal_notes: string | null
  created_at: string
  confirmed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  item_count: number
  has_prescription_items: boolean
  customer: {
    id: string
    full_name: string
    email: string
    phone: string | null
  } | null
}

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  discount_amount: number
  total: number
  requires_prescription: boolean
  prescription_file_url: string | null
  product: {
    id: string
    name: string
    sku: string
    images: string[] | null
  } | null
}

interface OrderSummary {
  pending: number
  confirmed: number
  processing: number
  ready: number
  shipped: number
  delivered: number
  cancelled: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

interface OrdersClientProps {
  clinic: string
}

const statusOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'processing', label: 'En Proceso' },
  { value: 'ready', label: 'Listos' },
  { value: 'shipped', label: 'Enviados' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'cancelled', label: 'Cancelados' },
]

const paymentStatusOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'failed', label: 'Fallido' },
  { value: 'refunded', label: 'Reembolsado' },
]

const statusWorkflow: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'ready',
  'shipped',
  'delivered',
]

function getStatusBadge(status: string): React.ReactElement {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> =
    {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: <Clock className="h-3 w-3" />,
        label: 'Pendiente',
      },
      confirmed: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: <CheckCircle className="h-3 w-3" />,
        label: 'Confirmado',
      },
      processing: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        icon: <RefreshCw className="h-3 w-3" />,
        label: 'En Proceso',
      },
      ready: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-700',
        icon: <Package className="h-3 w-3" />,
        label: 'Listo',
      },
      shipped: {
        bg: 'bg-cyan-100',
        text: 'text-cyan-700',
        icon: <Truck className="h-3 w-3" />,
        label: 'Enviado',
      },
      delivered: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: <CheckCircle className="h-3 w-3" />,
        label: 'Entregado',
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: <XCircle className="h-3 w-3" />,
        label: 'Cancelado',
      },
      refunded: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        icon: <RefreshCw className="h-3 w-3" />,
        label: 'Reembolsado',
      },
    }

  const c = config[status] || config.pending

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${c.bg} ${c.text}`}
    >
      {c.icon}
      {c.label}
    </span>
  )
}

function getPaymentBadge(status: string): React.ReactElement {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Pago Pendiente' },
    paid: { bg: 'bg-green-50', text: 'text-green-600', label: 'Pagado' },
    failed: { bg: 'bg-red-50', text: 'text-red-600', label: 'Pago Fallido' },
    refunded: { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Reembolsado' },
  }

  const c = config[status] || config.pending

  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}
    >
      <CreditCard className="h-3 w-3" />
      {c.label}
    </span>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(amount: number): string {
  return `₲ ${amount.toLocaleString('es-PY')}`
}

export default function OrdersClient({ clinic }: OrdersClientProps): React.ReactElement {
  const [orders, setOrders] = useState<Order[]>([])
  const [summary, setSummary] = useState<OrderSummary>({
    pending: 0,
    confirmed: 0,
    processing: 0,
    ready: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  })
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [showDetail, setShowDetail] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        clinic,
        page: String(pagination.page),
        limit: String(pagination.limit),
        status: statusFilter,
        payment_status: paymentFilter,
      })

      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/dashboard/orders?${params}`)

      if (!response.ok) {
        throw new Error('Error al cargar pedidos')
      }

      const data = await response.json()
      setOrders(data.orders || [])
      setSummary(data.summary || {})
      setPagination(data.pagination)
    } catch (err) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching orders:', err)
      }
      setError('Error al cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }, [clinic, pagination.page, pagination.limit, statusFilter, paymentFilter, search])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const fetchOrderDetails = async (orderId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}`)

      if (!response.ok) {
        throw new Error('Error al cargar detalles')
      }

      const data = await response.json()
      setSelectedOrder(data.order)
      setOrderItems(data.items || [])
      setShowDetail(true)
    } catch (err) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching order details:', err)
      }
      setError('Error al cargar detalles del pedido')
    }
  }

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    cancellationReason?: string
  ): Promise<void> => {
    setUpdating(true)
    try {
      const body: Record<string, unknown> = { status: newStatus }
      if (cancellationReason) {
        body.cancellation_reason = cancellationReason
      }

      const response = await fetch(`/api/dashboard/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar pedido')
      }

      // Refresh orders
      fetchOrders()

      // Update selected order if viewing details
      if (selectedOrder?.id === orderId) {
        const data = await response.json()
        setSelectedOrder(data.order)
      }
    } catch (err) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating order:', err)
      }
      setError('Error al actualizar el pedido')
    } finally {
      setUpdating(false)
    }
  }

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = statusWorkflow.indexOf(currentStatus)
    if (currentIndex === -1 || currentIndex >= statusWorkflow.length - 1) {
      return null
    }
    return statusWorkflow[currentIndex + 1]
  }

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-primary)]">
            <ShoppingBag className="h-7 w-7 text-[var(--primary)]" />
            Gestión de Pedidos
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">Administra los pedidos de la tienda</p>
        </div>
        <Link
          href={`/${clinic}/dashboard/orders/prescriptions`}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-all hover:bg-gray-50"
        >
          <FileText className="h-4 w-4" />
          Recetas Pendientes
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {[
          { key: 'pending', label: 'Pendientes', color: 'yellow' },
          { key: 'confirmed', label: 'Confirmados', color: 'blue' },
          { key: 'processing', label: 'En Proceso', color: 'purple' },
          { key: 'ready', label: 'Listos', color: 'indigo' },
          { key: 'shipped', label: 'Enviados', color: 'cyan' },
          { key: 'delivered', label: 'Entregados', color: 'green' },
          { key: 'cancelled', label: 'Cancelados', color: 'red' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setStatusFilter(item.key)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className={`rounded-xl border p-3 text-center transition-all ${
              statusFilter === item.key
                ? `border-${item.color}-400 bg-${item.color}-50`
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <div
              className={`text-2xl font-bold ${
                item.color === 'yellow'
                  ? 'text-yellow-600'
                  : item.color === 'blue'
                    ? 'text-blue-600'
                    : item.color === 'purple'
                      ? 'text-purple-600'
                      : item.color === 'indigo'
                        ? 'text-indigo-600'
                        : item.color === 'cyan'
                          ? 'text-cyan-600'
                          : item.color === 'green'
                            ? 'text-green-600'
                            : 'text-red-600'
              }`}
            >
              {summary[item.key as keyof OrderSummary] || 0}
            </div>
            <div className="mt-1 text-xs text-[var(--text-secondary)]">{item.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número de pedido..."
                className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 transition-colors focus:border-[var(--primary)] focus:ring-2"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
              className="focus:ring-[var(--primary)]/20 rounded-xl border border-gray-200 bg-white px-4 py-2.5 focus:border-[var(--primary)] focus:ring-2"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className="focus:ring-[var(--primary)]/20 rounded-xl border border-gray-200 bg-white px-4 py-2.5 focus:border-[var(--primary)] focus:ring-2"
          >
            {paymentStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Orders List */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
            <p className="mt-4 text-[var(--text-secondary)]">Cargando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">No hay pedidos</h3>
            <p className="mt-1 text-[var(--text-secondary)]">
              {search || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'No se encontraron pedidos con los filtros aplicados'
                : 'Los pedidos de la tienda aparecerán aquí'}
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Pedido
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-[var(--primary)]/10 rounded-lg p-2">
                            <ShoppingBag className="h-5 w-5 text-[var(--primary)]" />
                          </div>
                          <div>
                            <div className="font-bold text-[var(--text-primary)]">
                              #{order.order_number}
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">
                              {order.item_count} producto{order.item_count !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {order.customer ? (
                          <div>
                            <div className="font-medium text-[var(--text-primary)]">
                              {order.customer.full_name}
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">
                              {order.customer.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {getStatusBadge(order.status)}
                          {getPaymentBadge(order.payment_status)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-[var(--text-primary)]">
                          {formatCurrency(order.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[var(--text-secondary)]">
                          {formatDate(order.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <>
                              {getNextStatus(order.status) && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(order.id, getNextStatus(order.status)!)
                                  }
                                  disabled={updating}
                                  className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                                >
                                  Avanzar
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={() => fetchOrderDetails(order.id)}
                            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                  {pagination.total} pedidos
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={!pagination.hasPrev}
                    className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-[var(--text-primary)]">
                    {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={!pagination.hasNext}
                    className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetail(false)} />
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Pedido #{selectedOrder.order_number}
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Status and Actions */}
              <div className="flex flex-wrap items-center gap-4">
                {getStatusBadge(selectedOrder.status)}
                {getPaymentBadge(selectedOrder.payment_status)}

                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                  <div className="ml-auto flex items-center gap-2">
                    {getNextStatus(selectedOrder.status) && (
                      <button
                        onClick={() =>
                          updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)
                        }
                        disabled={updating}
                        className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {updating
                          ? 'Actualizando...'
                          : `Marcar como ${
                              getNextStatus(selectedOrder.status) === 'confirmed'
                                ? 'Confirmado'
                                : getNextStatus(selectedOrder.status) === 'processing'
                                  ? 'En Proceso'
                                  : getNextStatus(selectedOrder.status) === 'ready'
                                    ? 'Listo'
                                    : getNextStatus(selectedOrder.status) === 'shipped'
                                      ? 'Enviado'
                                      : 'Entregado'
                            }`}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const reason = prompt('Razón de cancelación:')
                        if (reason) {
                          updateOrderStatus(selectedOrder.id, 'cancelled', reason)
                        }
                      }}
                      disabled={updating}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              {selectedOrder.customer && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                    <User className="h-4 w-4" />
                    Cliente
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{selectedOrder.customer.full_name}</p>
                    <p className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Mail className="h-4 w-4" />
                      {selectedOrder.customer.email}
                    </p>
                    {selectedOrder.customer.phone && (
                      <p className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Phone className="h-4 w-4" />
                        {selectedOrder.customer.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                  <Package className="h-4 w-4" />
                  Productos ({orderItems.length})
                </h3>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                          Producto
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">
                          Cant.
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                          Precio
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orderItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {item.product?.images?.[0] ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product?.name || ''}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium">{item.product?.name}</p>
                                <p className="text-xs text-gray-500">{item.product?.sku}</p>
                                {item.requires_prescription && (
                                  <span className="mt-1 inline-flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">
                                    <FileText className="h-3 w-3" />
                                    Receta
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-sm">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento</span>
                      <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                  {selectedOrder.shipping_cost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Envío</span>
                      <span>{formatCurrency(selectedOrder.shipping_cost)}</span>
                    </div>
                  )}
                  {selectedOrder.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Impuestos</span>
                      <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {(selectedOrder.customer_notes || selectedOrder.internal_notes) && (
                <div className="space-y-3">
                  {selectedOrder.customer_notes && (
                    <div className="rounded-xl bg-blue-50 p-4">
                      <h4 className="mb-1 font-medium text-blue-700">Notas del Cliente</h4>
                      <p className="text-sm text-blue-600">{selectedOrder.customer_notes}</p>
                    </div>
                  )}
                  {selectedOrder.internal_notes && (
                    <div className="rounded-xl bg-gray-50 p-4">
                      <h4 className="mb-1 font-medium text-gray-700">Notas Internas</h4>
                      <p className="text-sm text-gray-600">{selectedOrder.internal_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Cancellation Info */}
              {selectedOrder.status === 'cancelled' && (
                <div className="rounded-xl bg-red-50 p-4">
                  <h4 className="mb-1 font-medium text-red-700">Pedido Cancelado</h4>
                  <p className="text-sm text-red-600">
                    {selectedOrder.cancelled_at &&
                      `Fecha: ${formatDate(selectedOrder.cancelled_at)}`}
                  </p>
                  {selectedOrder.cancellation_reason && (
                    <p className="mt-1 text-sm text-red-600">
                      Razón: {selectedOrder.cancellation_reason}
                    </p>
                  )}
                </div>
              )}

              {/* Tracking */}
              {selectedOrder.tracking_number && (
                <div className="rounded-xl bg-cyan-50 p-4">
                  <h4 className="mb-1 flex items-center gap-2 font-medium text-cyan-700">
                    <Truck className="h-4 w-4" />
                    Seguimiento
                  </h4>
                  <p className="text-sm text-cyan-600">Número: {selectedOrder.tracking_number}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
