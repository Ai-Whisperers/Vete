'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Icons from 'lucide-react'
import { PetSelector } from './pet-selector'
import { LineItems } from './line-items'
import { TotalsSummary } from './totals-summary'
import { createInvoice, updateInvoice } from '@/app/actions/invoices'
import { calculateLineTotal } from '@/lib/types/invoicing'

interface Pet {
  id: string
  name: string
  species: string
  breed?: string
  photo_url?: string
  owner?: {
    id: string
    full_name: string
    phone?: string
    email?: string
  }
}

interface Service {
  id: string
  name: string
  price: number
  category?: string
}

interface LineItem {
  id: string
  service_id: string | null
  description: string
  quantity: number
  unit_price: number
  discount_percent: number
  line_total?: number
}

interface InvoiceFormProps {
  clinic: string
  pets: Pet[]
  services: Service[]
  initialData?: {
    id?: string
    pet_id?: string
    items?: LineItem[]
    notes?: string
    due_date?: string
    tax_rate?: number
  }
  mode?: 'create' | 'edit'
}

export function InvoiceForm({
  clinic,
  pets,
  services,
  initialData,
  mode = 'create'
}: InvoiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedPetId, setSelectedPetId] = useState<string | null>(initialData?.pet_id || null)
  const [items, setItems] = useState<LineItem[]>(initialData?.items || [])
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [dueDate, setDueDate] = useState(
    initialData?.due_date?.split('T')[0] ||
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const taxRate = initialData?.tax_rate || 10

  // Calculate line totals for items
  const itemsWithTotals = items.map(item => ({
    ...item,
    line_total: calculateLineTotal(item.quantity, item.unit_price, item.discount_percent)
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // FORM-004: Prevent double-submit
    if (loading) return

    setLoading(true)
    setError(null)

    if (!selectedPetId) {
      setError('Debe seleccionar una mascota')
      setLoading(false)
      return
    }

    if (items.length === 0) {
      setError('Debe agregar al menos un artículo')
      setLoading(false)
      return
    }

    // Validate items
    const invalidItems = items.filter(i => !i.description || i.unit_price <= 0)
    if (invalidItems.length > 0) {
      setError('Todos los artículos deben tener descripción y precio')
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('pet_id', selectedPetId)
    formData.append('items', JSON.stringify(itemsWithTotals))
    formData.append('notes', notes)
    formData.append('due_date', dueDate)
    formData.append('tax_rate', taxRate.toString())

    try {
      let result
      if (mode === 'edit' && initialData?.id) {
        result = await updateInvoice(initialData.id, formData)
      } else {
        result = await createInvoice(formData)
      }

      if (!result.success) {
        setError(result.error || 'Error al guardar')
        setLoading(false)
        return
      }

      if (mode === 'create' && result.invoiceId) {
        router.push(`/${clinic}/dashboard/invoices/${result.invoiceId}`)
      } else {
        router.push(`/${clinic}/dashboard/invoices`)
      }
    } catch (e) {
      setError('Error al guardar la factura')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* TICKET-A11Y-004: Added role="alert" for screen readers */}
      {error && (
        <div role="alert" aria-live="assertive" className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <Icons.AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Pet Selector */}
          <PetSelector
            pets={pets}
            selectedPetId={selectedPetId}
            onSelect={setSelectedPetId}
            disabled={loading}
          />

          {/* Due Date */}
          <div>
            <label htmlFor="due-date-field" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Fecha de vencimiento
            </label>
            <input
              id="due-date-field"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={loading}
              aria-invalid={error && !dueDate ? "true" : "false"}
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes-field" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Notas
            </label>
            <textarea
              id="notes-field"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              rows={3}
              placeholder="Notas adicionales para la factura..."
              aria-invalid="false"
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none resize-none"
            />
          </div>
        </div>

        {/* Right Column - Totals */}
        <div>
          <TotalsSummary
            items={itemsWithTotals}
            taxRate={taxRate}
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <LineItems
          items={items}
          services={services}
          onChange={setItems}
          disabled={loading}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-4 py-2 text-[var(--text-secondary)] hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Icons.Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Icons.Save className="w-4 h-4" />
              {mode === 'edit' ? 'Guardar cambios' : 'Crear factura'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
