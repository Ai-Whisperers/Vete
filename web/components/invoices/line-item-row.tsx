'use client'

import * as Icons from 'lucide-react'
import { calculateLineTotal, formatCurrency } from '@/lib/types/invoicing'

interface Service {
  id: string
  name: string
  base_price: number
  category?: string
}

interface LineItem {
  id: string
  service_id: string | null
  description: string
  quantity: number
  unit_price: number
  discount_percent: number
}

interface LineItemRowProps {
  item: LineItem
  services: Service[]
  onUpdate: (item: LineItem) => void
  onRemove: () => void
  disabled?: boolean
}

export function LineItemRow({ item, services, onUpdate, onRemove, disabled }: LineItemRowProps) {
  const lineTotal = calculateLineTotal(item.quantity, item.unit_price, item.discount_percent)

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    onUpdate({
      ...item,
      service_id: serviceId || null,
      description: service?.name || item.description,
      unit_price: service?.base_price || item.unit_price
    })
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 p-4 bg-gray-50 rounded-lg">
      {/* Service/Description */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Servicio/Descripción
        </label>
        <select
          value={item.service_id || ''}
          onChange={(e) => handleServiceChange(e.target.value)}
          disabled={disabled}
          className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] outline-none"
        >
          <option value="">Personalizado</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - {formatCurrency(service.base_price)}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={item.description}
          onChange={(e) => onUpdate({ ...item, description: e.target.value })}
          disabled={disabled}
          placeholder="Descripción del artículo"
          className="w-full mt-2 p-2 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] outline-none"
        />
      </div>

      {/* Quantity */}
      <div className="w-24">
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Cantidad
        </label>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => onUpdate({ ...item, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
          disabled={disabled}
          min="1"
          className="w-full p-2 border border-gray-200 rounded-lg text-sm text-center focus:border-[var(--primary)] outline-none"
        />
      </div>

      {/* Unit Price */}
      <div className="w-32">
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Precio Unit.
        </label>
        <input
          type="number"
          value={item.unit_price}
          onChange={(e) => onUpdate({ ...item, unit_price: Math.max(0, parseFloat(e.target.value) || 0) })}
          disabled={disabled}
          min="0"
          className="w-full p-2 border border-gray-200 rounded-lg text-sm text-right focus:border-[var(--primary)] outline-none"
        />
      </div>

      {/* Discount */}
      <div className="w-24">
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Desc. %
        </label>
        <input
          type="number"
          value={item.discount_percent}
          onChange={(e) => onUpdate({ ...item, discount_percent: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })}
          disabled={disabled}
          min="0"
          max="100"
          className="w-full p-2 border border-gray-200 rounded-lg text-sm text-center focus:border-[var(--primary)] outline-none"
        />
      </div>

      {/* Line Total */}
      <div className="w-32 flex flex-col justify-between">
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Subtotal
        </label>
        <p className="p-2 font-medium text-[var(--text-primary)] text-right">
          {formatCurrency(lineTotal)}
        </p>
      </div>

      {/* Remove Button */}
      {!disabled && (
        <div className="flex items-end">
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Icons.Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
