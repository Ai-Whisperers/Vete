'use client'

import Link from 'next/link'
import * as Icons from 'lucide-react'
import { StatusBadge } from './status-badge'
import { formatCurrency, formatDate, type Invoice } from '@/lib/types/invoicing'

interface InvoiceCardProps {
  invoice: Invoice
  clinic: string
}

export function InvoiceCard({ invoice, clinic }: InvoiceCardProps) {
  const petName = invoice.pets?.name || 'Sin mascota'
  const ownerName = invoice.pets?.owner?.full_name || 'Cliente desconocido'

  return (
    <Link
      href={`/${clinic}/dashboard/invoices/${invoice.id}`}
      className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Invoice Number & Date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icons.FileText className="w-4 h-4 text-[var(--primary)]" />
            <span className="font-bold text-[var(--text-primary)]">
              {invoice.invoice_number}
            </span>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {formatDate(invoice.created_at)}
          </p>
        </div>

        {/* Client & Pet */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--text-primary)] truncate">
            {ownerName}
          </p>
          <p className="text-sm text-[var(--text-secondary)] truncate">
            <Icons.PawPrint className="w-3 h-3 inline mr-1" />
            {petName}
          </p>
        </div>

        {/* Amount */}
        <div className="text-right">
          <p className="font-bold text-[var(--text-primary)]">
            {formatCurrency(invoice.total)}
          </p>
          {invoice.amount_due > 0 && invoice.status !== 'draft' && (
            <p className="text-sm text-orange-600">
              Pendiente: {formatCurrency(invoice.amount_due)}
            </p>
          )}
          {invoice.status === 'paid' && (
            <p className="text-sm text-green-600">Pagado</p>
          )}
        </div>

        {/* Arrow */}
        <div className="hidden md:block">
          <Icons.ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </Link>
  )
}
