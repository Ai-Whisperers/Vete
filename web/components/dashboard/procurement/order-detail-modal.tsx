'use client'

/**
 * Order Detail Modal Component
 *
 * RES-001: Migrated to React Query for data fetching
 * - Replaced useEffect+fetch with useQuery hook
 * - Replaced manual status update with useMutation hook
 */

import { useState, useEffect } from 'react'
import {
  X,
  FileText,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Building2,
  Phone,
  Mail,
  Loader2,
  Send,
  ReceiptText,
  AlertCircle,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/Toast'
import { queryKeys } from '@/lib/queries'
import { staleTimes, gcTimes } from '@/lib/queries/utils'

interface PurchaseOrderItem {
  id: string
  quantity: number
  unit_cost: number
  line_total: number
  received_quantity: number
  received_at: string | null
  notes: string | null
  store_products: {
    id: string
    sku: string
    name: string
    base_price: number
  } | null
}

interface PurchaseOrder {
  id: string
  order_number: string
  status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'received' | 'cancelled'
  subtotal: number
  tax_amount: number
  total: number
  expected_delivery_date: string | null
  shipping_address: string | null
  notes: string | null
  created_at: string
  submitted_at: string | null
  confirmed_at: string | null
  shipped_at: string | null
  received_at: string | null
  cancelled_at: string | null
  suppliers: {
    id: string
    name: string
    contact_name: string | null
    email: string | null
    phone: string | null
  } | null
  purchase_order_items: PurchaseOrderItem[]
  created_by_profile: {
    id: string
    full_name: string
    email: string
  } | null
  received_by_profile: {
    id: string
    full_name: string
  } | null
}

interface OrderDetailModalProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
  onOrderUpdated: () => void
}

const STATUS_CONFIG = {
  draft: { label: 'Borrador', icon: FileText, color: 'text-gray-500', bg: 'bg-gray-100' },
  submitted: { label: 'Enviado', icon: Clock, color: 'text-[var(--status-info)]', bg: 'bg-[var(--status-info-bg)]' },
  confirmed: { label: 'Confirmado', icon: CheckCircle, color: 'text-[var(--status-success)]', bg: 'bg-[var(--status-success-bg)]' },
  shipped: { label: 'En Camino', icon: Truck, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary)]/10' },
  received: { label: 'Recibido', icon: Package, color: 'text-[var(--status-success)]', bg: 'bg-[var(--status-success-bg)]' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-[var(--status-error)]', bg: 'bg-[var(--status-error-bg)]' },
}

const STATUS_TIMELINE = ['draft', 'submitted', 'confirmed', 'shipped', 'received'] as const

export function OrderDetailModal({
  orderId,
  isOpen,
  onClose,
  onOrderUpdated,
}: OrderDetailModalProps): React.ReactElement | null {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Receiving state
  const [receivingMode, setReceivingMode] = useState(false)
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({})

  // React Query: Fetch order details
  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.procurement.order(orderId),
    queryFn: async (): Promise<PurchaseOrder> => {
      const res = await fetch(`/api/procurement/orders/${orderId}`)
      if (!res.ok) throw new Error('Error al cargar la orden')
      return res.json()
    },
    enabled: isOpen && !!orderId,
    staleTime: staleTimes.SHORT,
    gcTime: gcTimes.SHORT,
  })

  // Initialize received quantities when order data changes
  useEffect(() => {
    if (order?.purchase_order_items) {
      const quantities: Record<string, number> = {}
      order.purchase_order_items.forEach((item: PurchaseOrderItem) => {
        quantities[item.id] = item.received_quantity
      })
      setReceivedQuantities(quantities)
    }
  }, [order])

  // Reset receiving mode when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReceivingMode(false)
    }
  }, [isOpen, orderId])

  // Mutation: Update order status
  const statusMutation = useMutation({
    mutationFn: async (params: { status: string; received_items?: { item_id: string; received_quantity: number }[] }) => {
      const res = await fetch(`/api/procurement/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualizar la orden')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Orden Actualizada',
        description: `La orden ha sido ${variables.status === 'cancelled' ? 'cancelada' : 'actualizada'} exitosamente`,
      })
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.order(orderId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.all })
      onOrderUpdated()
      setReceivingMode(false)
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error al actualizar la orden',
        variant: 'destructive',
      })
    },
  })

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleStatusChange = (newStatus: string) => {
    if (!order) return

    const params: { status: string; received_items?: { item_id: string; received_quantity: number }[] } = {
      status: newStatus,
    }

    // If receiving, include received quantities
    if (newStatus === 'received') {
      params.received_items = Object.entries(receivedQuantities).map(([itemId, qty]) => ({
        item_id: itemId,
        received_quantity: qty,
      }))
    }

    statusMutation.mutate(params)
  }

  const getNextStatus = (): string | null => {
    if (!order) return null
    const currentIndex = STATUS_TIMELINE.indexOf(order.status as typeof STATUS_TIMELINE[number])
    if (currentIndex === -1 || currentIndex >= STATUS_TIMELINE.length - 1) return null
    return STATUS_TIMELINE[currentIndex + 1]
  }

  const getNextStatusLabel = (): string => {
    const nextStatus = getNextStatus()
    if (!nextStatus) return ''
    const labels: Record<string, string> = {
      submitted: 'Enviar al Proveedor',
      confirmed: 'Marcar Confirmado',
      shipped: 'Marcar Enviado',
      received: 'Recibir Orden',
    }
    return labels[nextStatus] || ''
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10">
              <ReceiptText className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {isLoading ? 'Cargando...' : order?.order_number || 'Orden de Compra'}
              </h2>
              <p className="text-sm text-gray-500">Detalles de la orden</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Cerrar">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : error ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center">
              <AlertCircle className="mb-4 h-12 w-12 text-[var(--status-error)]" />
              <p className="text-[var(--status-error)]">Error al cargar los detalles de la orden</p>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Status Timeline */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-4 font-medium text-[var(--text-primary)]">Estado de la Orden</h3>
                <div className="flex items-center justify-between">
                  {STATUS_TIMELINE.map((status, index) => {
                    const config = STATUS_CONFIG[status]
                    const Icon = config.icon
                    const isCurrent = order.status === status
                    const isPast = STATUS_TIMELINE.indexOf(order.status as typeof STATUS_TIMELINE[number]) > index
                    const isCancelled = order.status === 'cancelled'

                    return (
                      <div key={status} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              isCancelled
                                ? 'bg-gray-200 text-gray-400'
                                : isPast || isCurrent
                                  ? `${config.bg} ${config.color}`
                                  : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className={`mt-2 text-xs ${isCurrent ? 'font-semibold' : ''}`}>
                            {config.label}
                          </span>
                        </div>
                        {index < STATUS_TIMELINE.length - 1 && (
                          <div
                            className={`mx-2 h-0.5 flex-1 ${
                              isPast ? 'bg-[var(--status-success)]' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                {order.status === 'cancelled' && (
                  <div className="mt-4 rounded-lg bg-[var(--status-error-bg)] p-3 text-sm text-[var(--status-error)]">
                    <XCircle className="mb-1 inline h-4 w-4" /> Orden cancelada el {formatDate(order.cancelled_at)}
                  </div>
                )}
              </div>

              {/* Order Info Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Supplier Info */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-medium text-[var(--text-primary)]">
                    <Building2 className="h-4 w-4" />
                    Proveedor
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{order.suppliers?.name || '-'}</p>
                    {order.suppliers?.contact_name && (
                      <p className="text-gray-500">{order.suppliers.contact_name}</p>
                    )}
                    {order.suppliers?.email && (
                      <p className="flex items-center gap-1 text-gray-500">
                        <Mail className="h-3.5 w-3.5" />
                        {order.suppliers.email}
                      </p>
                    )}
                    {order.suppliers?.phone && (
                      <p className="flex items-center gap-1 text-gray-500">
                        <Phone className="h-3.5 w-3.5" />
                        {order.suppliers.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 font-medium text-[var(--text-primary)]">Información de la Orden</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Creada:</span>
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Creada por:</span>
                      <span>{order.created_by_profile?.full_name || '-'}</span>
                    </div>
                    {order.expected_delivery_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Entrega esperada:</span>
                        <span>{formatDate(order.expected_delivery_date)}</span>
                      </div>
                    )}
                    {order.received_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Recibida:</span>
                        <span>{formatDate(order.received_at)}</span>
                      </div>
                    )}
                    {order.received_by_profile && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Recibida por:</span>
                        <span>{order.received_by_profile.full_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-2 font-medium text-[var(--text-primary)]">Dirección de Entrega</h3>
                  <p className="text-sm text-gray-600">{order.shipping_address}</p>
                </div>
              )}

              {/* Items Table */}
              <div>
                <h3 className="mb-3 font-medium text-[var(--text-primary)]">Items de la Orden</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Producto</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">Cantidad</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">Costo Unit.</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">Subtotal</th>
                        {(order.status === 'shipped' || receivingMode) && (
                          <th className="px-4 py-3 text-right font-medium text-gray-600">Recibido</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {order.purchase_order_items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="px-4 py-3">
                            <p className="font-medium">{item.store_products?.name || 'Producto'}</p>
                            <p className="text-xs text-gray-500">SKU: {item.store_products?.sku || '-'}</p>
                          </td>
                          <td className="px-4 py-3 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">₲{item.unit_cost.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-medium">₲{item.line_total.toLocaleString()}</td>
                          {(order.status === 'shipped' || receivingMode) && (
                            <td className="px-4 py-3 text-right">
                              {receivingMode ? (
                                <input
                                  type="number"
                                  value={receivedQuantities[item.id] || 0}
                                  onChange={(e) =>
                                    setReceivedQuantities((prev) => ({
                                      ...prev,
                                      [item.id]: Math.min(parseInt(e.target.value) || 0, item.quantity),
                                    }))
                                  }
                                  min="0"
                                  max={item.quantity}
                                  className="w-20 rounded border border-gray-200 px-2 py-1 text-right focus:border-[var(--primary)] focus:outline-none"
                                />
                              ) : (
                                <span
                                  className={
                                    item.received_quantity >= item.quantity
                                      ? 'text-[var(--status-success)]'
                                      : item.received_quantity > 0
                                        ? 'text-[var(--status-warning)]'
                                        : 'text-gray-500'
                                  }
                                >
                                  {item.received_quantity}/{item.quantity}
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td
                          colSpan={order.status === 'shipped' || receivingMode ? 3 : 2}
                          className="px-4 py-3 text-right font-medium"
                        >
                          Subtotal:
                        </td>
                        <td className="px-4 py-3 text-right font-medium">₲{order.subtotal.toLocaleString()}</td>
                        {(order.status === 'shipped' || receivingMode) && <td />}
                      </tr>
                      {order.tax_amount > 0 && (
                        <tr className="bg-gray-50">
                          <td
                            colSpan={order.status === 'shipped' || receivingMode ? 3 : 2}
                            className="px-4 py-3 text-right font-medium"
                          >
                            IVA:
                          </td>
                          <td className="px-4 py-3 text-right">₲{order.tax_amount.toLocaleString()}</td>
                          {(order.status === 'shipped' || receivingMode) && <td />}
                        </tr>
                      )}
                      <tr className="bg-gray-50">
                        <td
                          colSpan={order.status === 'shipped' || receivingMode ? 3 : 2}
                          className="px-4 py-3 text-right text-lg font-bold"
                        >
                          Total:
                        </td>
                        <td className="px-4 py-3 text-right text-lg font-bold text-[var(--primary)]">
                          ₲{order.total.toLocaleString()}
                        </td>
                        {(order.status === 'shipped' || receivingMode) && <td />}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-2 font-medium text-[var(--text-primary)]">Notas</h3>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}

              {/* Actions */}
              {order.status !== 'received' && order.status !== 'cancelled' && (
                <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
                  {/* Cancel button - available for non-terminal states */}
                  <button
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={statusMutation.isPending}
                    className="rounded-lg border border-[var(--status-error)] px-4 py-2 font-medium text-[var(--status-error)] hover:bg-[var(--status-error-bg)] disabled:opacity-50"
                  >
                    Cancelar Orden
                  </button>

                  {/* Receive mode toggle for shipped orders */}
                  {order.status === 'shipped' && !receivingMode && (
                    <button
                      onClick={() => setReceivingMode(true)}
                      className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-white hover:opacity-90"
                    >
                      <Package className="h-4 w-4" />
                      Recibir Orden
                    </button>
                  )}

                  {/* Confirm receive */}
                  {receivingMode && (
                    <>
                      <button
                        onClick={() => setReceivingMode(false)}
                        className="rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleStatusChange('received')}
                        disabled={statusMutation.isPending}
                        className="flex items-center gap-2 rounded-lg bg-[var(--status-success)] px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {statusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        <CheckCircle className="h-4 w-4" />
                        Confirmar Recepción
                      </button>
                    </>
                  )}

                  {/* Next status button */}
                  {!receivingMode && getNextStatus() && order.status !== 'shipped' && (
                    <button
                      onClick={() => handleStatusChange(getNextStatus()!)}
                      disabled={statusMutation.isPending}
                      className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {statusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      {order.status === 'draft' && <Send className="h-4 w-4" />}
                      {getNextStatusLabel()}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
