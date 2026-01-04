"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FileText,
  Check,
  X,
  ExternalLink,
  Loader2,
  AlertCircle,
  Calendar,
  User,
  Package,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Eye,
} from 'lucide-react';
import type { ClinicConfig } from '@/lib/clinics';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  requires_prescription: boolean;
  prescription_file_url: string | null;
  product: {
    id: string;
    name: string;
    image_url: string | null;
  } | null;
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

interface PendingOrder {
  id: string;
  invoice_number: string;
  status: string;
  total: number;
  requires_prescription_review: boolean;
  prescription_file_url: string | null;
  created_at: string;
  customer: Customer | Customer[] | null;
  items: OrderItem[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Props {
  clinic: string;
  config: ClinicConfig;
}

export default function PrescriptionOrdersClient({ clinic, config }: Props) {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const currency = config.settings?.currency || 'PYG';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchOrders = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/store/orders/pending-prescriptions?page=${page}&limit=10`
      );

      if (!response.ok) {
        throw new Error('Error al cargar pedidos');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setPagination(data.pagination);
    } catch (err) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching orders:', err);
      }
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  const handleReview = async () => {
    if (!selectedOrder || !reviewAction) return;

    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      setError('Por favor ingresa un motivo de rechazo');
      return;
    }

    setIsReviewing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/store/orders/${selectedOrder.id}/prescription`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: reviewAction,
            notes: notes.trim() || undefined,
            rejection_reason: reviewAction === 'reject' ? rejectionReason.trim() : undefined,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al procesar revisión');
      }

      // Success - refresh list and close modal
      setSelectedOrder(null);
      setReviewAction(null);
      setRejectionReason('');
      setNotes('');
      fetchOrders(currentPage);
    } catch (err) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error reviewing order:', err);
      }
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsReviewing(false);
    }
  };

  const getCustomer = (order: PendingOrder): Customer | null => {
    if (!order.customer) return null;
    return Array.isArray(order.customer) ? order.customer[0] : order.customer;
  };

  const getPrescriptionItems = (order: PendingOrder) => {
    return order.items.filter((item) => item.requires_prescription);
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Pedidos con Receta
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Revisa y aprueba pedidos que requieren verificación de receta médica
          </p>
        </div>
        <button
          onClick={() => fetchOrders(currentPage)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-subtle)] text-[var(--text-primary)] rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-[var(--border-default)]">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)]">
            No hay pedidos pendientes
          </h3>
          <p className="text-[var(--text-secondary)] mt-1">
            Todos los pedidos con receta han sido procesados
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const customer = getCustomer(order);
            const prescriptionItems = getPrescriptionItems(order);

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-[var(--border-default)] overflow-hidden"
              >
                {/* Order header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">
                          {order.invoice_number}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          Pendiente Revisión
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.created_at)}
                        </span>
                        {customer && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {customer.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-[var(--primary)]">
                      {formatPrice(order.total)}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {prescriptionItems.length} producto{prescriptionItems.length > 1 ? 's' : ''} con receta
                    </p>
                  </div>
                </div>

                {/* Prescription items */}
                <div className="p-4 bg-gray-50">
                  <div className="space-y-3">
                    {prescriptionItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 bg-white p-3 rounded-lg"
                      >
                        {/* Product image */}
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.product?.image_url ? (
                            <Image
                              src={item.product.image_url}
                              alt={item.product?.name || ''}
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400 absolute inset-0 m-auto" />
                          )}
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--text-primary)] truncate">
                            {item.product?.name || 'Producto'}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            Cantidad: {item.quantity} × {formatPrice(item.unit_price)}
                          </p>
                        </div>

                        {/* Prescription file link */}
                        {item.prescription_file_url && (
                          <a
                            href={item.prescription_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Receta
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setReviewAction('reject');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                  >
                    <X className="w-4 h-4" />
                    Rechazar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setReviewAction('approve');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Aprobar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrev || isLoading}
            className="p-2 rounded-lg border border-[var(--border-default)] disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 py-2 text-[var(--text-secondary)]">
            Página {pagination.page} de {pagination.pages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={!pagination.hasNext || isLoading}
            className="p-2 rounded-lg border border-[var(--border-default)] disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Review Modal */}
      {selectedOrder && reviewAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!isReviewing) {
                setSelectedOrder(null);
                setReviewAction(null);
                setRejectionReason('');
                setNotes('');
              }
            }}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              {reviewAction === 'approve' ? 'Aprobar Pedido' : 'Rechazar Pedido'}
            </h3>

            <div className="space-y-4">
              {/* Order info */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium">{selectedOrder.invoice_number}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {getCustomer(selectedOrder)?.full_name} - {formatPrice(selectedOrder.total)}
                </p>
              </div>

              {/* Rejection reason (only for reject) */}
              {reviewAction === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Motivo de rechazo *
                  </label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="">Selecciona un motivo...</option>
                    <option value="Receta ilegible">Receta ilegible</option>
                    <option value="Receta vencida">Receta vencida</option>
                    <option value="Medicamento no coincide">Medicamento no coincide con la receta</option>
                    <option value="Falta firma del veterinario">Falta firma del veterinario</option>
                    <option value="Receta incompleta">Receta incompleta</option>
                    <option value="Dosis incorrecta">Dosis incorrecta en la receta</option>
                    <option value="Otro">Otro motivo</option>
                  </select>
                  {rejectionReason === 'Otro' && (
                    <input
                      type="text"
                      placeholder="Especifica el motivo..."
                      value={notes}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        setRejectionReason(e.target.value);
                      }}
                      className="w-full mt-2 px-4 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  )}
                </div>
              )}

              {/* Notes (optional) */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Agregar notas para el registro..."
                  className="w-full px-4 py-2 border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setReviewAction(null);
                  setRejectionReason('');
                  setNotes('');
                  setError(null);
                }}
                disabled={isReviewing}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleReview}
                disabled={isReviewing || (reviewAction === 'reject' && !rejectionReason)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 ${
                  reviewAction === 'approve'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isReviewing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : reviewAction === 'approve' ? (
                  <>
                    <Check className="w-5 h-5" />
                    Confirmar Aprobación
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    Confirmar Rechazo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
