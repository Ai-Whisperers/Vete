'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Building2, Package, Plus, ShoppingCart, FileText } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface Supplier {
  id: string
  name: string
}

interface DraftOrder {
  id: string
  order_number: string
  supplier_id: string
  suppliers: { id: string; name: string } | null
  total: number
  purchase_order_items: { id: string }[]
}

interface AddToPOModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  productId: string
  productName: string
  productSku: string | null
  suggestedQuantity?: number
}

export function AddToPOModal({
  isOpen,
  onClose,
  onSuccess,
  productId,
  productName,
  productSku,
  suggestedQuantity = 10,
}: AddToPOModalProps): React.ReactElement | null {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [draftOrders, setDraftOrders] = useState<DraftOrder[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  // Form state
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [createNew, setCreateNew] = useState(false)
  const [newSupplierId, setNewSupplierId] = useState('')
  const [quantity, setQuantity] = useState(suggestedQuantity)
  const [unitCost, setUnitCost] = useState(0)

  // Fetch draft orders and suppliers
  useEffect(() => {
    if (!isOpen) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [ordersRes, suppliersRes] = await Promise.all([
          fetch('/api/procurement/orders?status=draft'),
          fetch('/api/suppliers?status=verified'),
        ])

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          setDraftOrders(ordersData.orders || [])
        }

        if (suppliersRes.ok) {
          const suppliersData = await suppliersRes.json()
          setSuppliers(suppliersData.suppliers || [])
        }
      } catch {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (quantity <= 0) {
      toast({
        title: 'Error',
        description: 'La cantidad debe ser mayor a 0',
        variant: 'destructive',
      })
      return
    }

    if (unitCost < 0) {
      toast({
        title: 'Error',
        description: 'El costo unitario no puede ser negativo',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      if (createNew || !selectedOrderId) {
        // Create new PO with this item
        if (!newSupplierId) {
          toast({
            title: 'Error',
            description: 'Selecciona un proveedor',
            variant: 'destructive',
          })
          setSubmitting(false)
          return
        }

        const res = await fetch('/api/procurement/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supplier_id: newSupplierId,
            items: [
              {
                catalog_product_id: productId,
                quantity,
                unit_cost: unitCost,
              },
            ],
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Error al crear la orden')
        }

        toast({
          title: 'Orden Creada',
          description: `Se creó una nueva orden de compra con ${productName}`,
        })
      } else {
        // Add to existing draft order
        // First, get the order details to check current items
        const orderRes = await fetch(`/api/procurement/orders/${selectedOrderId}`)
        if (!orderRes.ok) {
          throw new Error('Error al cargar la orden')
        }
        const order = await orderRes.json()

        // Check if product already exists in order
        const existingItem = order.purchase_order_items?.find(
          (item: { catalog_product_id: string }) => item.catalog_product_id === productId
        )

        if (existingItem) {
          toast({
            title: 'Producto ya existe',
            description: 'Este producto ya está en la orden de compra',
            variant: 'destructive',
          })
          setSubmitting(false)
          return
        }

        // Add item via direct insertion (need API support)
        // For now, we'll use a workaround: delete and recreate the order with new item
        const currentItems = order.purchase_order_items.map(
          (item: { catalog_product_id: string; quantity: number; unit_cost: number }) => ({
            catalog_product_id: item.catalog_product_id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
          })
        )

        // Delete old order
        await fetch(`/api/procurement/orders/${selectedOrderId}`, {
          method: 'DELETE',
        })

        // Create new order with all items
        const createRes = await fetch('/api/procurement/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supplier_id: order.supplier_id,
            items: [
              ...currentItems,
              {
                catalog_product_id: productId,
                quantity,
                unit_cost: unitCost,
              },
            ],
            expected_delivery_date: order.expected_delivery_date,
            shipping_address: order.shipping_address,
            notes: order.notes,
          }),
        })

        if (!createRes.ok) {
          const data = await createRes.json()
          throw new Error(data.error || 'Error al actualizar la orden')
        }

        toast({
          title: 'Producto Agregado',
          description: `Se agregó ${productName} a la orden de compra`,
        })
      }

      onSuccess()
      onClose()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error al procesar la solicitud',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
              <ShoppingCart className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Agregar a Orden de Compra</h2>
              <p className="text-sm text-gray-500">Agrega este producto a una OC</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Cerrar">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Product Info */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Package className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{productName}</p>
                    {productSku && <p className="text-xs text-gray-500">SKU: {productSku}</p>}
                  </div>
                </div>
              </div>

              {/* Order Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Orden de Compra <span className="text-[var(--status-error)]">*</span>
                </label>

                {/* Existing Orders */}
                {draftOrders.length > 0 && !createNew && (
                  <div className="space-y-2">
                    {draftOrders.map((order) => (
                      <label
                        key={order.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                          selectedOrderId === order.id
                            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="order"
                          value={order.id}
                          checked={selectedOrderId === order.id}
                          onChange={() => {
                            setSelectedOrderId(order.id)
                            setCreateNew(false)
                          }}
                          className="h-4 w-4 text-[var(--primary)]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-mono font-medium">{order.order_number}</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {order.suppliers?.name || 'Sin proveedor'} • {order.purchase_order_items.length} items
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Create New Option */}
                <div className="mt-3">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                      createNew
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="order"
                      checked={createNew}
                      onChange={() => {
                        setCreateNew(true)
                        setSelectedOrderId('')
                      }}
                      className="h-4 w-4 text-[var(--primary)]"
                    />
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Crear nueva orden de compra</span>
                    </div>
                  </label>
                </div>

                {/* New Order Supplier Selection */}
                {createNew && (
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Proveedor <span className="text-[var(--status-error)]">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <select
                        value={newSupplierId}
                        onChange={(e) => setNewSupplierId(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-[var(--primary)] focus:outline-none"
                      >
                        <option value="">Seleccionar proveedor...</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity and Cost */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Cantidad <span className="text-[var(--status-error)]">*</span>
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    min="1"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Costo Unitario <span className="text-[var(--status-error)]">*</span>
                  </label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="100"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-[var(--primary)] focus:outline-none"
                    placeholder="₲ 0"
                  />
                </div>
              </div>

              {/* Subtotal Preview */}
              <div className="rounded-lg bg-gray-50 p-3 text-right">
                <span className="text-sm text-gray-500">Subtotal: </span>
                <span className="font-bold text-[var(--primary)]">
                  ₲{(quantity * unitCost).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || (!createNew && !selectedOrderId) || (createNew && !newSupplierId)}
                className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Agregar a OC
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
