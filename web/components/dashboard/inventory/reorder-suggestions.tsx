'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  ShoppingCart,
  AlertCircle,
  AlertTriangle,
  Package,
  Loader2,
  Building2,
  TrendingDown,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import Link from 'next/link'

interface ReorderSuggestion {
  id: string
  name: string
  sku: string | null
  image_url: string | null
  category_name: string | null
  stock_quantity: number
  available_quantity: number
  min_stock_level: number
  reorder_point: number | null
  reorder_quantity: number | null
  weighted_average_cost: number | null
  supplier_id: string | null
  supplier_name: string | null
  urgency: 'critical' | 'low' | 'reorder'
}

interface SupplierGroup {
  supplier_id: string | null
  supplier_name: string
  products: ReorderSuggestion[]
  total_cost: number
  total_items: number
}

interface Summary {
  total_products: number
  critical_count: number
  low_count: number
  total_estimated_cost?: number
}

interface ReorderSuggestionsProps {
  clinic: string
}

const urgencyConfig = {
  critical: {
    label: 'Sin Stock',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    icon: <AlertCircle className="h-4 w-4 text-red-500" />,
  },
  low: {
    label: 'Stock Bajo',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
  },
  reorder: {
    label: 'Reordenar',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    icon: <ShoppingCart className="h-4 w-4 text-yellow-600" />,
  },
}

export default function ReorderSuggestions({ clinic }: ReorderSuggestionsProps): React.ReactElement {
  const [groups, setGroups] = useState<SupplierGroup[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const fetchSuggestions = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/inventory/reorder-suggestions?groupBySupplier=true')

      if (!response.ok) {
        throw new Error('Error al cargar sugerencias')
      }

      const data = await response.json()
      setGroups(data.grouped || [])
      setSummary(data.summary || null)

      // Auto-expand first group
      if (data.grouped?.length > 0) {
        setExpandedGroups(new Set([data.grouped[0].supplier_id || 'no-supplier']))
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching reorder suggestions:', err)
      }
      setError('Error al cargar las sugerencias de reorden')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  const toggleGroup = (groupId: string): void => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[var(--primary)]" />
          <p className="text-[var(--text-secondary)]">Analizando inventario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        <AlertCircle className="h-5 w-5" />
        {error}
        <button
          onClick={fetchSuggestions}
          className="ml-auto flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1 text-sm font-medium hover:bg-red-200"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <Package className="mx-auto mb-4 h-12 w-12 text-green-300" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          ¡Inventario en orden!
        </h3>
        <p className="mt-1 text-[var(--text-secondary)]">
          No hay productos que necesiten reposición en este momento.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <TrendingDown className="h-5 w-5" />
            <span className="text-sm">Total</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
            {summary?.total_products || 0}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">productos a reordenar</div>
        </div>

        <div className="rounded-xl border border-red-100 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Críticos</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-700">{summary?.critical_count || 0}</div>
          <div className="text-xs text-red-600">sin stock</div>
        </div>

        <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-orange-500">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">Stock Bajo</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-orange-700">{summary?.low_count || 0}</div>
          <div className="text-xs text-orange-600">necesitan atención</div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <ShoppingCart className="h-5 w-5" />
            <span className="text-sm">Costo Est.</span>
          </div>
          <div className="mt-2 text-xl font-bold text-[var(--text-primary)]">
            {formatCurrency(summary?.total_estimated_cost || 0)}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">para reposición</div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchSuggestions}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Supplier Groups */}
      {groups.map((group) => {
        const groupId = group.supplier_id || 'no-supplier'
        const isExpanded = expandedGroups.has(groupId)

        return (
          <div
            key={groupId}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <button
              onClick={() => toggleGroup(groupId)}
              className="flex w-full items-center justify-between bg-gray-50 p-4 hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                  <Building2 className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold text-[var(--text-primary)]">{group.supplier_name}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {group.products.length} producto{group.products.length !== 1 ? 's' : ''} •{' '}
                    {formatCurrency(group.total_cost)} estimado
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {group.supplier_id && (
                  <Link
                    href={`/${clinic}/dashboard/procurement/orders/new?supplier=${group.supplier_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Crear Orden
                  </Link>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="divide-y divide-gray-100">
                {group.products.map((product) => {
                  const config = urgencyConfig[product.urgency]

                  return (
                    <div key={product.id} className="p-4 transition-colors hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        {/* Product Image */}
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[var(--text-primary)]">
                              {product.name}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor}`}
                            >
                              {config.icon}
                              {config.label}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                            {product.sku && (
                              <span className="font-mono text-xs">SKU: {product.sku}</span>
                            )}
                            {product.category_name && <span>{product.category_name}</span>}
                          </div>
                        </div>

                        {/* Stock Info */}
                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">
                              {product.available_quantity} / {product.min_stock_level}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)]">
                              actual / mínimo
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[var(--primary)]">
                              +{product.reorder_quantity || 10}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)]">sugerido</div>
                          </div>
                          {product.weighted_average_cost && (
                            <div>
                              <div className="text-sm font-medium text-[var(--text-primary)]">
                                {formatCurrency(
                                  product.weighted_average_cost * (product.reorder_quantity || 10)
                                )}
                              </div>
                              <div className="text-xs text-[var(--text-secondary)]">costo est.</div>
                            </div>
                          )}
                        </div>

                        {/* Quick Action */}
                        <Link
                          href={`/${clinic}/dashboard/inventory?search=${encodeURIComponent(product.name)}`}
                          className="flex-shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
