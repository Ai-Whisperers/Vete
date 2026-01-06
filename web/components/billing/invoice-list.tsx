'use client'

/**
 * Invoice List Component
 *
 * Displays a list of platform invoices with filtering and actions.
 */

import { useEffect, useState } from 'react'
import {
  FileText,
  Download,
  Eye,
  CreditCard,
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import type { PlatformInvoice, PlatformInvoiceWithItems, PlatformInvoiceStatus } from '@/lib/billing/types'

interface InvoiceListProps {
  clinic: string
  onViewInvoice: (invoice: PlatformInvoiceWithItems) => void
  onPayInvoice: (invoiceId: string) => void
  onReportTransfer: (invoiceId: string) => void
}

/**
 * Format currency in Paraguayan Guaranies
 */
function formatCurrency(amount: number): string {
  return `₲${amount.toLocaleString('es-PY')}`
}

/**
 * Format date
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-PY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Get status badge styles and label
 */
function getStatusInfo(status: PlatformInvoiceStatus): {
  label: string
  icon: React.ComponentType<{ className?: string }>
  className: string
} {
  const configs: Record<PlatformInvoiceStatus, {
    label: string
    icon: React.ComponentType<{ className?: string }>
    className: string
  }> = {
    draft: {
      label: 'Borrador',
      icon: FileText,
      className: 'bg-gray-100 text-gray-700',
    },
    sent: {
      label: 'Enviada',
      icon: Clock,
      className: 'bg-blue-100 text-blue-700',
    },
    paid: {
      label: 'Pagada',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-700',
    },
    overdue: {
      label: 'Vencida',
      icon: AlertTriangle,
      className: 'bg-red-100 text-red-700',
    },
    void: {
      label: 'Anulada',
      icon: AlertCircle,
      className: 'bg-gray-100 text-gray-500',
    },
    waived: {
      label: 'Condonada',
      icon: CheckCircle,
      className: 'bg-purple-100 text-purple-700',
    },
  }
  return configs[status]
}

export function InvoiceList({
  clinic,
  onViewInvoice,
  onPayInvoice,
  onReportTransfer,
}: InvoiceListProps): React.ReactElement {
  const [invoices, setInvoices] = useState<PlatformInvoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    loadInvoices()
  }, [clinic])

  async function loadInvoices(): Promise<void> {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/billing/invoices?clinic=${clinic}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || 'Error al cargar facturas')
      }

      const data = await response.json()
      setInvoices(data.invoices || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleViewInvoice(invoiceId: string): Promise<void> {
    try {
      const response = await fetch(`/api/billing/invoices/${invoiceId}?clinic=${clinic}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || 'Error al cargar factura')
      }

      const invoice: PlatformInvoiceWithItems = await response.json()
      onViewInvoice(invoice)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al cargar factura')
    }
  }

  async function handleDownloadPdf(invoiceId: string): Promise<void> {
    try {
      setDownloadingId(invoiceId)

      const response = await fetch(`/api/billing/invoices/${invoiceId}/pdf?clinic=${clinic}`)

      if (!response.ok) {
        throw new Error('Error al generar PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `factura-${invoiceId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al descargar PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    if (filter === 'pending') {
      return ['sent', 'overdue'].includes(invoice.status)
    }
    if (filter === 'paid') {
      return invoice.status === 'paid'
    }
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="font-medium text-red-800">Error al cargar facturas</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={loadInvoices}
          className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-200"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'paid'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]/80'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Pagadas'}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      {filteredInvoices.length === 0 ? (
        <div className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
          <p className="mt-4 text-[var(--text-secondary)]">
            {filter === 'all'
              ? 'No hay facturas generadas'
              : filter === 'pending'
                ? 'No hay facturas pendientes'
                : 'No hay facturas pagadas'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-paper)]">
          <table className="w-full">
            <thead className="bg-[var(--bg-subtle)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Factura
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Periodo
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredInvoices.map((invoice) => {
                const statusInfo = getStatusInfo(invoice.status)
                const StatusIcon = statusInfo.icon
                const canPay = ['sent', 'overdue'].includes(invoice.status)

                return (
                  <tr key={invoice.id} className="hover:bg-[var(--bg-subtle)]/50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-mono font-medium text-[var(--text-primary)]">
                          {invoice.invoice_number}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Vence: {formatDate(invoice.due_date)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-[var(--text-primary)]">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewInvoice(invoice.id)}
                          className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--primary)]"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(invoice.id)}
                          disabled={downloadingId === invoice.id}
                          className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--primary)] disabled:opacity-50"
                          title="Descargar PDF"
                        >
                          {downloadingId === invoice.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>
                        {canPay && (
                          <>
                            <button
                              onClick={() => onPayInvoice(invoice.id)}
                              className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                              title="Pagar con tarjeta"
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onReportTransfer(invoice.id)}
                              className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-green-100 hover:text-green-600"
                              title="Reportar transferencia"
                            >
                              <Building2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
