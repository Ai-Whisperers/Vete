'use client'

import { useRouter } from 'next/navigation'
import { invoiceStatusConfig } from '@/lib/types/invoicing'

interface StatusFilterProps {
  currentStatus: string
  clinic: string
}

const statuses = [
  { value: 'all', label: 'Todas' },
  { value: 'draft', label: 'Borrador' },
  { value: 'sent', label: 'Enviadas' },
  { value: 'partial', label: 'Pago parcial' },
  { value: 'paid', label: 'Pagadas' },
  { value: 'overdue', label: 'Vencidas' },
  { value: 'void', label: 'Anuladas' }
]

export function StatusFilter({ currentStatus, clinic }: StatusFilterProps) {
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value
    router.push(`/${clinic}/dashboard/invoices?status=${status}`)
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
    >
      {statuses.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  )
}
