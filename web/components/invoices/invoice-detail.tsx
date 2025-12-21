'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { StatusBadge } from './status-badge'
import { RecordPaymentDialog } from './record-payment-dialog'
import { SendInvoiceDialog } from './send-invoice-dialog'
import { InvoicePDFButton } from './invoice-pdf'
import { voidInvoice } from '@/app/actions/invoices'
import {
  formatCurrency,
  formatDate,
  canEditInvoice,
  canSendInvoice,
  canRecordPayment,
  canVoidInvoice,
  paymentMethodLabels,
  type Invoice
} from '@/lib/types/invoicing'

interface InvoiceDetailProps {
  invoice: Invoice
  clinic: string
  clinicName: string
  isAdmin: boolean
}

export function InvoiceDetail({ invoice, clinic, clinicName, isAdmin }: InvoiceDetailProps) {
  const router = useRouter()
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [voidLoading, setVoidLoading] = useState(false)

  const handleVoid = async () => {
    if (!confirm('¿Estás seguro de anular esta factura? Esta acción no se puede deshacer.')) {
      return
    }

    setVoidLoading(true)
    const result = await voidInvoice(invoice.id)

    if (!result.success) {
      alert(result.error || 'Error al anular')
    }

    setVoidLoading(false)
    router.refresh()
  }

  const owner = invoice.pets?.owner

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {invoice.invoice_number}
            </h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-[var(--text-secondary)]">
            Creada el {formatDate(invoice.created_at)}
            {invoice.created_by_user && ` por ${invoice.created_by_user.full_name}`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <InvoicePDFButton invoice={invoice} clinicName={clinicName} />

          {canEditInvoice(invoice.status) && (
            <Link
              href={`/${clinic}/dashboard/invoices/${invoice.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[var(--text-primary)] hover:bg-gray-50"
            >
              <Icons.Edit className="w-4 h-4" />
              Editar
            </Link>
          )}

          {canSendInvoice(invoice.status) && (
            <button
              onClick={() => setShowSendDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
            >
              <Icons.Send className="w-4 h-4" />
              Enviar
            </button>
          )}

          {canRecordPayment(invoice.status, invoice.amount_due) && (
            <button
              onClick={() => setShowPaymentDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Icons.DollarSign className="w-4 h-4" />
              Registrar pago
            </button>
          )}

          {isAdmin && canVoidInvoice(invoice.status) && (
            <button
              onClick={handleVoid}
              disabled={voidLoading}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {voidLoading ? (
                <Icons.Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icons.XCircle className="w-4 h-4" />
              )}
              Anular
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Invoice Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Client & Pet */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-bold text-[var(--text-primary)] mb-3">Cliente</h2>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                <Icons.User className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">
                  {owner?.full_name || 'Cliente desconocido'}
                </p>
                {owner?.email && (
                  <p className="text-sm text-[var(--text-secondary)]">
                    <Icons.Mail className="w-3 h-3 inline mr-1" />
                    {owner.email}
                  </p>
                )}
                {owner?.phone && (
                  <p className="text-sm text-[var(--text-secondary)]">
                    <Icons.Phone className="w-3 h-3 inline mr-1" />
                    {owner.phone}
                  </p>
                )}
                {invoice.pets && (
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    <Icons.PawPrint className="w-3 h-3 inline mr-1" />
                    {invoice.pets.name} ({invoice.pets.species})
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-bold text-[var(--text-primary)] mb-3">Artículos</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-[var(--text-secondary)] pb-2">Descripción</th>
                    <th className="text-right text-xs font-medium text-[var(--text-secondary)] pb-2">Cant.</th>
                    <th className="text-right text-xs font-medium text-[var(--text-secondary)] pb-2">Precio</th>
                    <th className="text-right text-xs font-medium text-[var(--text-secondary)] pb-2">Desc.</th>
                    <th className="text-right text-xs font-medium text-[var(--text-secondary)] pb-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.invoice_items?.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="py-3 text-[var(--text-primary)]">
                        {item.description}
                        {item.services?.name && (
                          <span className="text-xs text-[var(--text-secondary)] block">
                            {item.services.name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right text-[var(--text-primary)]">{item.quantity}</td>
                      <td className="py-3 text-right text-[var(--text-primary)]">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 text-right text-[var(--text-secondary)]">
                        {item.discount_percent ? `${item.discount_percent}%` : '-'}
                      </td>
                      <td className="py-3 text-right font-medium text-[var(--text-primary)]">
                        {formatCurrency(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h2 className="font-bold text-[var(--text-primary)] mb-3">Historial de Pagos</h2>
              <div className="space-y-3">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {paymentMethodLabels[payment.payment_method]} • {formatDate(payment.paid_at)}
                        {payment.receiver && ` • ${payment.receiver.full_name}`}
                      </p>
                      {payment.reference_number && (
                        <p className="text-xs text-[var(--text-secondary)]">
                          Ref: {payment.reference_number}
                        </p>
                      )}
                    </div>
                    <Icons.CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h2 className="font-bold text-[var(--text-primary)] mb-2">Notas</h2>
              <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-4">
          {/* Totals */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-bold text-[var(--text-primary)] mb-3">Resumen</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">IVA ({invoice.tax_rate}%)</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
              {invoice.amount_paid > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Pagado</span>
                  <span>-{formatCurrency(invoice.amount_paid)}</span>
                </div>
              )}
              {invoice.amount_due > 0 && (
                <div className="flex justify-between font-bold text-orange-600 pt-2 border-t border-gray-100">
                  <span>Pendiente</span>
                  <span>{formatCurrency(invoice.amount_due)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-bold text-[var(--text-primary)] mb-3">Fechas</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Creada</span>
                <span>{formatDate(invoice.created_at)}</span>
              </div>
              {invoice.due_date && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Vencimiento</span>
                  <span>{formatDate(invoice.due_date)}</span>
                </div>
              )}
              {invoice.sent_at && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Enviada</span>
                  <span>{formatDate(invoice.sent_at)}</span>
                </div>
              )}
              {invoice.paid_at && (
                <div className="flex justify-between text-green-600">
                  <span>Pagada</span>
                  <span>{formatDate(invoice.paid_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <RecordPaymentDialog
        invoiceId={invoice.id}
        amountDue={invoice.amount_due}
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
      />

      <SendInvoiceDialog
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoice_number}
        total={invoice.total}
        clientEmail={owner?.email}
        clientName={owner?.full_name}
        isOpen={showSendDialog}
        onClose={() => setShowSendDialog(false)}
      />
    </div>
  )
}
