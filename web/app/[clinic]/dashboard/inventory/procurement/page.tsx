'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, FileText, TrendingDown } from 'lucide-react'
import { PurchaseOrderList, PurchaseOrderForm, PriceComparison } from '@/components/dashboard/procurement'

type TabId = 'orders' | 'compare'

interface Tab {
  id: TabId
  label: string
  icon: React.ElementType
}

const TABS: Tab[] = [
  { id: 'orders', label: 'Órdenes de Compra', icon: FileText },
  { id: 'compare', label: 'Comparar Precios', icon: TrendingDown },
]

export default function ProcurementPage(): React.ReactElement {
  const params = useParams()
  const clinic = params?.clinic as string

  const [activeTab, setActiveTab] = useState<TabId>('orders')
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // For price comparison - in a real app, these would come from user selection
  const [selectedProducts] = useState<string[]>([])

  const handleCreateOrder = () => {
    setShowOrderForm(true)
  }

  const handleOrderSuccess = () => {
    setShowOrderForm(false)
    setRefreshKey(k => k + 1)
  }

  const handleViewOrder = (order: unknown) => {
    // TODO: Implement order detail modal
    console.log('View order:', order)
  }

  const handleEditOrder = (order: unknown) => {
    // TODO: Implement order edit
    console.log('Edit order:', order)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/${clinic}/dashboard/inventory`}
          className="rounded-xl p-2 transition-colors hover:bg-gray-100"
          aria-label="Volver al inventario"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10">
            <ShoppingCart className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">
              Compras y Abastecimiento
            </h1>
            <p className="text-sm text-gray-500">
              Gestiona órdenes de compra y compara precios
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-[var(--text-primary)] shadow-sm'
                  : 'text-gray-600 hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <PurchaseOrderList
          key={refreshKey}
          onCreateClick={handleCreateOrder}
          onViewClick={handleViewOrder}
          onEditClick={handleEditOrder}
        />
      )}

      {activeTab === 'compare' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="font-medium text-blue-900">Comparación de Precios</h3>
            <p className="mt-1 text-sm text-blue-700">
              Selecciona productos desde el inventario para comparar precios entre proveedores.
              Puedes agregar cotizaciones desde la sección de Proveedores.
            </p>
          </div>

          <PriceComparison
            productIds={selectedProducts}
            onSelectSupplier={(supplierId, productId, unitCost) => {
              console.log('Selected:', { supplierId, productId, unitCost })
              // TODO: Add to purchase order
            }}
          />
        </div>
      )}

      {/* Create Order Modal */}
      {showOrderForm && (
        <PurchaseOrderForm
          onClose={() => setShowOrderForm(false)}
          onSuccess={handleOrderSuccess}
        />
      )}
    </div>
  )
}
