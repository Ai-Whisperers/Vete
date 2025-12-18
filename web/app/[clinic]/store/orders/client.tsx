'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Loader2,
  ShoppingBag,
  Calendar,
  MapPin,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { ClinicConfig } from '@/lib/clinics';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  store_products?: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  coupon_code: string | null;
  shipping_cost: number;
  tax_amount: number;
  total: number;
  shipping_address: {
    street?: string;
    city?: string;
    phone?: string;
  } | null;
  shipping_method: string;
  tracking_number: string | null;
  payment_method: string;
  payment_status: string;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  store_order_items: OrderItem[];
}

interface Props {
  readonly config: ClinicConfig;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pending: { label: 'Pendiente', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: CheckCircle },
  processing: { label: 'Preparando', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: Package },
  shipped: { label: 'Enviado', color: 'text-indigo-600', bgColor: 'bg-indigo-50', icon: Truck },
  delivered: { label: 'Entregado', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle },
  refunded: { label: 'Reembolsado', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: RotateCcw },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: 'Contra Entrega',
  card: 'Tarjeta',
  bank_transfer: 'Transferencia',
};

export default function OrderHistoryClient({ config }: Props) {
  const { clinic } = useParams() as { clinic: string };
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('clinic', clinic);
      params.set('page', page.toString());
      params.set('limit', '10');
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const res = await fetch(`/api/store/orders?${params.toString()}`);

      if (res.status === 401) {
        router.push(`/${clinic}/portal/signup?redirect=/store/orders`);
        return;
      }

      if (!res.ok) {
        throw new Error('Error al cargar pedidos');
      }

      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  }, [clinic, page, statusFilter, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatPrice = (price: number): string => {
    return `Gs ${price.toLocaleString('es-PY')}`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpanded = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (!clinic) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link
            href={`/${clinic}/store`}
            className="flex items-center gap-2 font-bold text-[var(--primary)] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver a Tienda</span>
          </Link>

          <h1 className="text-lg font-bold text-[var(--text-primary)]">Mis Pedidos</h1>

          <Link href={`/${clinic}/cart`} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ShoppingBag className="w-6 h-6 text-gray-700" />
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
        {/* Status Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                statusFilter === status
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-white border border-gray-200 text-[var(--text-secondary)] hover:border-[var(--primary)]'
              )}
            >
              {status === 'all' ? 'Todos' : STATUS_CONFIG[status]?.label || status}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin mx-auto mb-3" />
              <p className="text-[var(--text-secondary)]">Cargando pedidos...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Error</h2>
              <p className="text-[var(--text-secondary)] mb-6">{error}</p>
              <button
                onClick={fetchOrders}
                className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Sin pedidos</h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              {statusFilter !== 'all'
                ? `No tienes pedidos con estado "${STATUS_CONFIG[statusFilter]?.label || statusFilter}"`
                : 'Aún no has realizado ningún pedido'}
            </p>
            <Link
              href={`/${clinic}/store`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="w-4 h-4" />
              Explorar Tienda
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Order Header */}
                  <button
                    onClick={() => toggleExpanded(order.id)}
                    className="w-full p-4 md:p-6 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    {/* Status Icon */}
                    <div
                      className={clsx(
                        'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                        statusConfig.bgColor
                      )}
                    >
                      <StatusIcon className={clsx('w-6 h-6', statusConfig.color)} />
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[var(--text-primary)]">
                          #{order.order_number}
                        </span>
                        <span
                          className={clsx(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            statusConfig.bgColor,
                            statusConfig.color
                          )}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-muted)] mt-1">
                        {formatDate(order.created_at)} • {order.store_order_items.length} producto
                        {order.store_order_items.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Total */}
                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-lg text-[var(--text-primary)]">
                        {formatPrice(order.total)}
                      </span>
                      <ChevronDown
                        className={clsx(
                          'w-5 h-5 text-gray-400 mx-auto mt-1 transition-transform',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {/* Items */}
                      <div className="p-4 md:p-6 space-y-4">
                        <h4 className="font-semibold text-[var(--text-primary)]">Productos</h4>
                        {order.store_order_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              {item.store_products?.image_url ? (
                                <Image
                                  src={item.store_products.image_url}
                                  alt={item.product_name}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/${clinic}/store/product/${item.product_id}`}
                                className="font-medium text-[var(--text-primary)] hover:text-[var(--primary)] line-clamp-1"
                              >
                                {item.product_name}
                              </Link>
                              {item.variant_name && (
                                <p className="text-sm text-[var(--text-muted)]">{item.variant_name}</p>
                              )}
                              <p className="text-sm text-[var(--text-secondary)]">
                                {item.quantity} x {formatPrice(item.unit_price)}
                              </p>
                            </div>
                            <span className="font-medium text-[var(--text-primary)]">
                              {formatPrice(item.line_total)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-gray-100 pt-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Left: Shipping & Payment */}
                          <div className="space-y-4">
                            {order.shipping_address && (
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-medium text-[var(--text-primary)]">Dirección de Envío</p>
                                  <p className="text-sm text-[var(--text-secondary)]">
                                    {order.shipping_address.street}
                                    {order.shipping_address.city && `, ${order.shipping_address.city}`}
                                  </p>
                                  {order.shipping_address.phone && (
                                    <p className="text-sm text-[var(--text-muted)]">
                                      Tel: {order.shipping_address.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              <CreditCard className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-[var(--text-primary)]">Método de Pago</p>
                                <p className="text-sm text-[var(--text-secondary)]">
                                  {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
                                </p>
                              </div>
                            </div>

                            {order.tracking_number && (
                              <div className="flex items-start gap-3">
                                <Truck className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-medium text-[var(--text-primary)]">Seguimiento</p>
                                  <p className="text-sm text-[var(--text-secondary)] font-mono">
                                    {order.tracking_number}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right: Pricing Summary */}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[var(--text-secondary)]">Subtotal</span>
                              <span className="text-[var(--text-primary)]">{formatPrice(order.subtotal)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>
                                  Descuento
                                  {order.coupon_code && ` (${order.coupon_code})`}
                                </span>
                                <span>-{formatPrice(order.discount_amount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-[var(--text-secondary)]">Envío</span>
                              <span className="text-[var(--text-primary)]">
                                {order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'Gratis'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[var(--text-secondary)]">IVA (10%)</span>
                              <span className="text-[var(--text-primary)]">{formatPrice(order.tax_amount)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-base">
                              <span className="text-[var(--text-primary)]">Total</span>
                              <span className="text-[var(--text-primary)]">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      {(order.shipped_at || order.delivered_at) && (
                        <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-gray-100 pt-4">
                          <h4 className="font-semibold text-[var(--text-primary)] mb-3">Historial</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                              <span className="text-[var(--text-secondary)]">
                                Pedido realizado: {formatDateTime(order.created_at)}
                              </span>
                            </div>
                            {order.shipped_at && (
                              <div className="flex items-center gap-3">
                                <Truck className="w-4 h-4 text-[var(--text-muted)]" />
                                <span className="text-[var(--text-secondary)]">
                                  Enviado: {formatDateTime(order.shipped_at)}
                                </span>
                              </div>
                            )}
                            {order.delivered_at && (
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-[var(--text-secondary)]">
                                  Entregado: {formatDateTime(order.delivered_at)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="px-4 md:px-6 pb-4 md:pb-6 flex gap-3">
                        <Link
                          href={`/${clinic}/store/orders/${order.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Ver Detalles
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                        {order.status === 'pending' && (
                          <button className="px-4 py-2 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors">
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={clsx(
                    'px-4 py-2 rounded-lg font-medium transition-colors',
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-[var(--primary)]'
                  )}
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-[var(--text-secondary)]">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={clsx(
                    'px-4 py-2 rounded-lg font-medium transition-colors',
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-[var(--primary)]'
                  )}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
