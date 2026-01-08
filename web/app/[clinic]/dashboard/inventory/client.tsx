'use client'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Download,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  TrendingUp,
  Info,
  ChevronDown,
  ExternalLink,
  FileDown,
  Plus,
  X,
  Clock,
  Store,
  Globe,
  Layers,
  Wand2,
  ScanLine,
  ShoppingCart,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ImportWizard,
  MultiModeScanner,
  InventoryFilters,
  InventoryTable,
  ProductEditModal,
  AddProductModal,
  DeleteConfirmModal,
  type InventoryProduct,
  type SortField,
  type SortDirection,
  type NewProductForm,
} from '@/components/dashboard/inventory'
import { StockHistoryModal } from '@/components/dashboard/inventory/stock-history-modal'

type ProductSource = 'all' | 'own' | 'catalog'

interface InventoryClientProps {
  googleSheetUrl: string | null
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  sku: string
  name: string
  short_description?: string
  description?: string
  image_url?: string
  base_price: number
  sale_price?: number
  category_id?: string
  category?: { id: string; name: string; slug: string }
  brand?: { id: string; name: string }
  inventory?: {
    stock_quantity: number
    min_stock_level?: number
    weighted_average_cost?: number
    expiry_date?: string
    batch_number?: string
  }
  is_active: boolean
  created_at: string
  source?: 'own' | 'catalog'
  assignment?: {
    sale_price: number
    min_stock_level: number
    location?: string
    margin_percentage?: number
  }
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

const sourceTabOptions: {
  value: ProductSource
  label: string
  icon: React.ReactNode
  description: string
}[] = [
  {
    value: 'all',
    label: 'Todos',
    icon: <Layers className="h-4 w-4" />,
    description: 'Todos los productos',
  },
  {
    value: 'own',
    label: 'Mis Productos',
    icon: <Store className="h-4 w-4" />,
    description: 'Productos propios de la clínica',
  },
  {
    value: 'catalog',
    label: 'Del Catálogo',
    icon: <Globe className="h-4 w-4" />,
    description: 'Productos del catálogo global',
  },
]

export default function InventoryClient({ googleSheetUrl }: InventoryClientProps) {
  const { clinic } = useParams() as { clinic: string }

  // Import Result Type
  interface ImportResult {
    success: number
    errors: string[]
    message?: string
  }

  // Inventory Stats Type
  interface InventoryStats {
    totalProducts: number
    lowStockCount: number
    totalValue: number
  }

  // Inventory Alerts Type
  interface StockAlertItem {
    id: string
    name: string
    stock_quantity: number
    min_stock_level: number
    expiry_date?: string
  }

  interface InventoryAlerts {
    hasAlerts: boolean
    lowStock: StockAlertItem[]
    expiring: StockAlertItem[]
  }

  // UI State
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false)
  const templateDropdownRef = useRef<HTMLDivElement>(null)

  // Data State
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [alerts, setAlerts] = useState<InventoryAlerts | null>(null)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // Bulk Selection State
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false)

  // Filter/Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<ProductSource>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [sourceSummary, setSourceSummary] = useState<{ own?: number; catalog?: number }>({})

  // Pagination State
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  })

  // Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [historyProduct, setHistoryProduct] = useState<{ id: string; name: string } | null>(null)

  // Import Wizard State
  const [showImportWizard, setShowImportWizard] = useState(false)

  // Barcode Scanner State
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)

  // Import Preview State (legacy - for direct file upload)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<{
    preview: Array<{
      rowNumber: number
      operation: string
      sku: string
      name: string
      status: 'new' | 'update' | 'adjustment' | 'error' | 'skip'
      message: string
      currentStock?: number
      newStock?: number
      priceChange?: { old: number; new: number }
    }>
    summary: {
      totalRows: number
      newProducts: number
      updates: number
      adjustments: number
      errors: number
      skipped: number
    }
  } | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  // Fetch functions
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al cargar estadísticas', e)
      }
    }
  }, [])

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory/alerts')
      if (res.ok) {
        const data = await res.json()
        setAlerts(data)
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al cargar alertas', e)
      }
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`/api/store/categories?clinic=${clinic}`)
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al cargar categorías', e)
      }
    }
  }, [clinic])

  const fetchProducts = useCallback(
    async (query = '', page = 1, limit = pagination.limit) => {
      setIsLoadingProducts(true)
      try {
        // Use the new dashboard inventory API that supports source filtering
        let url = `/api/dashboard/inventory?clinic=${clinic}&search=${encodeURIComponent(query)}&page=${page}&limit=${limit}&source=${sourceFilter}`

        if (selectedCategory !== 'all') {
          url += `&category=${selectedCategory}`
        }

        if (stockFilter !== 'all') {
          url += `&stock_status=${stockFilter}`
        }

        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products || [])
          setSelectedProducts(new Set()) // Clear selection when products change
          if (data.pagination) {
            setPagination(data.pagination)
          }
          if (data.summary) {
            setSourceSummary(data.summary)
          }
        }
      } catch (e) {
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error al cargar productos', e)
        }
      } finally {
        setIsLoadingProducts(false)
      }
    },
    [clinic, selectedCategory, stockFilter, sourceFilter, pagination.limit]
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        templateDropdownRef.current &&
        !templateDropdownRef.current.contains(event.target as Node)
      ) {
        setTemplateDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Initial data load
  useEffect(() => {
    fetchStats()
    fetchCategories()
    fetchProducts()
    fetchAlerts()
  }, [clinic])

  // Refetch when filters change
  useEffect(() => {
    fetchProducts(searchQuery, 1, pagination.limit)
  }, [selectedCategory, stockFilter, sourceFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(searchQuery, 1, pagination.limit)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Apply local stock filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]

    // Local stock filtering
    if (stockFilter === 'low_stock') {
      filtered = filtered.filter(
        (p) =>
          (p.inventory?.stock_quantity || 0) > 0 &&
          (p.inventory?.stock_quantity || 0) <= (p.inventory?.min_stock_level || 5)
      )
    } else if (stockFilter === 'out_of_stock') {
      filtered = filtered.filter((p) => (p.inventory?.stock_quantity || 0) === 0)
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'es')
          break
        case 'sku':
          comparison = (a.sku || '').localeCompare(b.sku || '')
          break
        case 'base_price':
          comparison = (a.base_price || 0) - (b.base_price || 0)
          break
        case 'stock':
          comparison = (a.inventory?.stock_quantity || 0) - (b.inventory?.stock_quantity || 0)
          break
        case 'category':
          comparison = (a.category?.name || '').localeCompare(b.category?.name || '', 'es')
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [products, stockFilter, sortField, sortDirection])

  // Handlers
  const handlePageChange = (newPage: number) => {
    fetchProducts(searchQuery, newPage, pagination.limit)
  }

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit }))
    fetchProducts(searchQuery, 1, newLimit)
  }

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedCategory('all')
    setStockFilter('all')
    setSourceFilter('all')
  }, [])

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchQuery) count++
    if (selectedCategory !== 'all') count++
    if (stockFilter !== 'all') count++
    if (sourceFilter !== 'all') count++
    return count
  }, [searchQuery, selectedCategory, stockFilter, sourceFilter])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const openEdit = (p: Product) => {
    setEditingProduct(p)
  }

  // Bulk Selection Handlers
  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const clearSelection = () => {
    setSelectedProducts(new Set())
  }

  const handleBulkExport = () => {
    const selected = products.filter((p) => selectedProducts.has(p.id))
    const csvContent = [
      ['SKU', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Stock Mínimo'].join(','),
      ...selected.map((p) =>
        [
          p.sku || '',
          `"${p.name.replace(/"/g, '""')}"`,
          p.category?.name || '',
          p.base_price || 0,
          p.inventory?.stock_quantity || 0,
          p.inventory?.min_stock_level || 0,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventario-seleccionado-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleQuickEditSave = async (values: { price: number; stock: number }) => {
    if (!editingProduct) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/inventory/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: [
            {
              operation: 'adjustment',
              sku: editingProduct.sku || editingProduct.id,
              price: values.price,
              quantity: values.stock - (editingProduct.inventory?.stock_quantity || 0),
            },
          ],
        }),
      })

      if (res.ok) {
        setEditingProduct(null)
        fetchProducts(searchQuery, pagination.page, pagination.limit)
        fetchStats()
      } else {
        const text = await res.text()
        setError(text || 'Error al guardar')
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al guardar', e)
      }
      setError('Error de conexión')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateProduct = async (product: NewProductForm) => {
    if (!product.name || !product.base_price) {
      setError('Nombre y Precio son obligatorios')
      return
    }
    setIsCreating(true)
    try {
      const res = await fetch('/api/inventory/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: [
            {
              operation: 'new product',
              sku: product.sku || undefined,
              barcode: product.barcode || undefined,
              name: product.name,
              category: product.category || undefined,
              description: product.description || undefined,
              price: product.base_price,
              quantity: product.stock,
              unit_cost: product.cost || undefined,
              min_stock: product.min_stock,
            },
          ],
        }),
      })

      if (res.ok) {
        setShowAddModal(false)
        fetchProducts(searchQuery, pagination.page, pagination.limit)
        fetchStats()
        setResult({ success: 1, errors: [], message: 'Producto creado exitosamente' })
      } else {
        const text = await res.text()
        setError(text || 'Error al crear producto')
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al crear producto', e)
      }
      setError('Error de conexión')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    setIsDeleting(true)
    try {
      // Use delete-product server action via API
      const res = await fetch(`/api/store/products/${productId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setDeleteConfirm(null)
        fetchProducts(searchQuery, pagination.page, pagination.limit)
        fetchStats()
      } else {
        const data = await res.json()
        setError(data.error || 'Error al eliminar producto')
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al eliminar', e)
      }
      setError('Error de conexión')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = async (type: 'template' | 'catalog') => {
    try {
      const res = await fetch(`/api/inventory/export?type=${type}`)
      if (!res.ok) throw new Error('Error en la exportación')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inventario_${type}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // First, get a preview of the import
    setIsLoadingPreview(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/inventory/import/preview', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Error en la vista previa')
      }

      const data = await res.json()
      setPreviewData(data)
      setPendingFile(file)
      setShowPreview(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setIsLoadingPreview(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleConfirmImport = async () => {
    if (!pendingFile) return

    setIsUploading(true)
    setShowPreview(false)
    setError(null)

    const formData = new FormData()
    formData.append('file', pendingFile)

    try {
      const res = await fetch('/api/inventory/import', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Error en la importación')
      }

      const data = await res.json()
      setResult(data)
      fetchStats()
      fetchProducts(searchQuery, pagination.page, pagination.limit)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setIsUploading(false)
      setPendingFile(null)
      setPreviewData(null)
    }
  }

  const handleCancelImport = () => {
    setShowPreview(false)
    setPendingFile(null)
    setPreviewData(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-default)] p-6 shadow-sm lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Gestión de Inventario</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Administra productos, stock y precios de{' '}
            <span className="font-semibold text-[var(--primary)]">{clinic}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 font-bold text-white shadow-lg transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Nuevo Producto
          </button>

          <button
            onClick={() => setShowBarcodeScanner(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--status-special)] px-4 py-2.5 font-bold text-white transition hover:bg-[var(--status-special-dark)]"
            title="Escanear código de barras para buscar o editar producto"
          >
            <ScanLine className="h-4 w-4" /> Escanear
          </button>

          <button
            onClick={() => setShowImportWizard(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--status-success)] px-4 py-2.5 font-bold text-white transition hover:bg-[var(--status-success-dark)]"
          >
            <Wand2 className="h-4 w-4" /> Importar con Asistente
          </button>

          <button
            onClick={() => (window.location.href = `/${clinic}/portal/inventory/catalog`)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--status-info)] px-4 py-2.5 font-bold text-white transition hover:bg-[var(--status-info-dark)]"
          >
            <Globe className="h-4 w-4" /> Catálogo Global
          </button>

          <div className="relative" ref={templateDropdownRef}>
            <button
              onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg-subtle)] px-4 py-2.5 font-bold text-[var(--text-secondary)] transition hover:bg-[var(--bg-muted)]"
            >
              <Download className="h-4 w-4" />
              Plantilla
              <ChevronDown
                className={`h-4 w-4 transition-transform ${templateDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {templateDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-default)] shadow-xl">
                <div className="bg-[var(--bg-dark)] p-3 text-white">
                  <h4 className="text-sm font-bold">Plantilla de Inventario</h4>
                </div>
                <div className="p-2">
                  {googleSheetUrl && (
                    <a
                      href={googleSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setTemplateDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-[var(--status-success-bg)]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--status-success-bg)]">
                        <ExternalLink className="h-5 w-5 text-[var(--status-success)]" />
                      </div>
                      <div>
                        <span className="block font-bold text-[var(--text-primary)]">Google Sheets</span>
                        <span className="text-xs text-[var(--text-muted)]">Crear copia en Drive</span>
                      </div>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      handleExport('template')
                      setTemplateDropdownOpen(false)
                    }}
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-[var(--status-info-bg)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--status-info-bg)]">
                      <FileDown className="h-5 w-5 text-[var(--status-info)]" />
                    </div>
                    <div>
                      <span className="block font-bold text-[var(--text-primary)]">Descargar Excel</span>
                      <span className="text-xs text-[var(--text-muted)]">Archivo .xlsx</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleExport('catalog')}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg-dark)] px-4 py-2.5 font-bold text-white transition hover:bg-[var(--bg-inverse)]"
          >
            <FileSpreadsheet className="h-4 w-4" /> Exportar
          </button>
        </div>
      </div>

      {/* Source Tabs */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-default)] p-2 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row">
          {sourceTabOptions.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSourceFilter(tab.value)}
              className={`flex flex-1 items-center justify-center gap-3 rounded-xl px-4 py-3 transition-all ${
                sourceFilter === tab.value
                  ? 'bg-[var(--primary)] text-white shadow-lg'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              <span className={sourceFilter === tab.value ? 'text-white' : 'text-[var(--text-muted)]'}>
                {tab.icon}
              </span>
              <span className="font-bold">{tab.label}</span>
              {tab.value !== 'all' && sourceSummary[tab.value] !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    sourceFilter === tab.value
                      ? 'bg-[var(--bg-default)]/20 text-white'
                      : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'
                  }`}
                >
                  {sourceSummary[tab.value]}
                </span>
              )}
              {tab.value === 'all' &&
                (sourceSummary.own !== undefined || sourceSummary.catalog !== undefined) && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      sourceFilter === tab.value
                        ? 'bg-[var(--bg-default)]/20 text-white'
                        : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {(sourceSummary.own || 0) + (sourceSummary.catalog || 0)}
                  </span>
                )}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts?.hasAlerts && (
        <div className="space-y-3">
          {alerts.lowStock?.length > 0 && (
            <div className="rounded-xl border-l-4 border-[var(--status-warning)] bg-[var(--status-warning-bg)] p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-[var(--status-warning)]" />
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--status-warning-dark)]">Alerta de Stock Bajo</h3>
                  <p className="mt-1 text-sm text-[var(--status-warning)]">
                    {alerts.lowStock.length} producto{alerts.lowStock.length > 1 ? 's' : ''} por
                    debajo del nivel mínimo
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {alerts.lowStock.slice(0, 5).map((item: StockAlertItem) => (
                      <span
                        key={item.id}
                        className="rounded border border-[var(--status-warning-light)] bg-[var(--bg-default)] px-2 py-1 text-xs font-medium text-[var(--status-warning)]"
                      >
                        {item.name} ({item.stock_quantity}/{item.min_stock_level})
                      </span>
                    ))}
                    {alerts.lowStock.length > 5 && (
                      <span className="text-xs font-medium text-[var(--status-warning)]">
                        +{alerts.lowStock.length - 5} más
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {alerts.expiring?.length > 0 && (
            <div className="rounded-xl border-l-4 border-[var(--status-error)] bg-[var(--status-error-bg)] p-4">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-[var(--status-error)]" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[var(--status-error-text)]">Productos por Vencer</h3>
                    <button
                      onClick={() =>
                        (window.location.href = `/${clinic}/dashboard/inventory/expiring`)
                      }
                      className="text-xs font-medium text-[var(--status-error)] hover:text-[var(--status-error-text)] hover:underline"
                    >
                      Ver todo →
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-[var(--status-error-text)]">
                    {alerts.expiring.length} producto{alerts.expiring.length > 1 ? 's' : ''} vencen
                    en los próximos 30 días
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {alerts.expiring.slice(0, 5).map((item: StockAlertItem) => (
                      <span
                        key={item.id}
                        className="rounded border border-[var(--status-error-border)] bg-[var(--bg-default)] px-2 py-1 text-xs font-medium text-[var(--status-error-text)]"
                      >
                        {item.name} (Vence:{' '}
                        {item.expiry_date
                          ? new Date(item.expiry_date).toLocaleDateString('es-PY')
                          : 'N/A'}
                        )
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-default)] p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--status-info-bg)] text-[var(--status-info)]">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">Productos Activos</p>
            <p className="text-2xl font-black text-[var(--text-primary)]">{stats?.totalProducts ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-default)] p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--status-warning-bg)] text-[var(--status-warning)]">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">Stock Bajo</p>
            <p className="text-2xl font-black text-[var(--text-primary)]">{stats?.lowStockCount ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-default)] p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--status-success-bg)] text-[var(--status-success)]">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">Valor Inventario</p>
            <p className="text-2xl font-black text-[var(--text-primary)]">
              {stats ? formatPrice(stats.totalValue) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Link
          href={`/${clinic}/dashboard/inventory/reorders`}
          className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-default)] p-4 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--status-info-bg)]">
            <ShoppingCart className="h-5 w-5 text-[var(--status-info)]" />
          </div>
          <div>
            <p className="font-medium text-[var(--text-primary)]">Reorden</p>
            <p className="text-xs text-[var(--text-secondary)]">Sugerencias</p>
          </div>
        </Link>
        <Link
          href={`/${clinic}/dashboard/inventory/expiring`}
          className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-default)] p-4 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--status-error-bg)]">
            <Clock className="h-5 w-5 text-[var(--status-error)]" />
          </div>
          <div>
            <p className="font-medium text-[var(--text-primary)]">Vencimientos</p>
            <p className="text-xs text-[var(--text-secondary)]">Control</p>
          </div>
        </Link>
        <button
          onClick={() => setShowBarcodeScanner(true)}
          className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-default)] p-4 text-left transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--status-special-bg)]">
            <ScanLine className="h-5 w-5 text-[var(--status-special)]" />
          </div>
          <div>
            <p className="font-medium text-[var(--text-primary)]">Escáner</p>
            <p className="text-xs text-[var(--text-secondary)]">Código de barras</p>
          </div>
        </button>
        <button
          onClick={() => {/* TODO: Add new product modal */}}
          className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-default)] p-4 text-left transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--status-success-bg)]">
            <Plus className="h-5 w-5 text-[var(--status-success)]" />
          </div>
          <div>
            <p className="font-medium text-[var(--text-primary)]">Nuevo</p>
            <p className="text-xs text-[var(--text-secondary)]">Producto</p>
          </div>
        </button>
      </div>

      {/* Import Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-default)] p-6">
          <div className="bg-[var(--primary)]/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Upload className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-[var(--text-primary)]">Importar Actualizaciones</h2>
          <p className="mb-6 max-w-sm text-center text-sm text-[var(--text-muted)]">
            Sube tu archivo Excel para actualizar stock, precios o agregar productos.
          </p>
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--bg-dark)] px-6 py-3 font-bold text-white transition-all hover:bg-[var(--bg-inverse)] ${isUploading || isLoadingPreview ? 'pointer-events-none opacity-50' : ''} `}
          >
            {isUploading || isLoadingPreview ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            {isLoadingPreview
              ? 'Analizando...'
              : isUploading
                ? 'Importando...'
                : 'Seleccionar Archivo'}
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={isUploading || isLoadingPreview}
            />
          </label>
          <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
            Se mostrará una vista previa antes de importar
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--status-error)]" />
              <div>
                <h3 className="font-bold text-[var(--status-error-text)]">Error</h3>
                <p className="mt-1 text-sm text-[var(--status-error-text)]">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-[var(--status-error)] hover:text-[var(--status-error-text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {result && (
            <div className="rounded-xl border border-[var(--status-success-border)] bg-[var(--status-success-bg)] p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--status-success)]" />
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--status-success-text)]">Importación Exitosa</h3>
                  <p className="mt-1 text-sm text-[var(--status-success-text)]">
                    Se procesaron <strong>{result.success}</strong> filas correctamente.
                  </p>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="text-[var(--status-success)] hover:text-[var(--status-success-text)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {result.errors?.length > 0 && (
                <div className="mt-3 rounded-lg bg-[var(--bg-default)]/50 p-3">
                  <p className="mb-2 text-xs font-bold uppercase text-[var(--status-warning)]">
                    Observaciones ({result.errors.length}):
                  </p>
                  <ul className="max-h-32 list-inside list-disc space-y-1 overflow-y-auto text-xs text-[var(--text-secondary)]">
                    {result.errors.map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl bg-[var(--bg-dark)] p-5 text-white">
            <div className="mb-4 flex items-center gap-2">
              <Info className="h-5 w-5" />
              <h3 className="font-bold">Guía Rápida</h3>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex gap-2">
                <span className="rounded bg-[var(--primary)] px-2 py-0.5 text-xs font-bold text-white">
                  NEW
                </span>
                <span className="text-[var(--text-muted)]">Crear producto (SKU vacío)</span>
              </div>
              <div className="flex gap-2">
                <span className="rounded bg-[var(--status-info-bg)]0 px-2 py-0.5 text-xs font-bold text-white">
                  BUY
                </span>
                <span className="text-[var(--text-muted)]">Compra (cantidad + costo)</span>
              </div>
              <div className="flex gap-2">
                <span className="rounded bg-[var(--status-error-bg)]0 px-2 py-0.5 text-xs font-bold text-white">
                  ADJ
                </span>
                <span className="text-[var(--text-muted)]">Ajuste de inventario (+/-)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-default)]">
        {/* Table Header with Filters */}
        <InventoryFilters
          search={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          stockFilter={stockFilter}
          onStockChange={setStockFilter}
          onClearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
          itemsPerPage={pagination.limit}
          onItemsPerPageChange={handleLimitChange}
          itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
          totalCount={pagination.total}
        />

        {/* Table Content */}
        <InventoryTable
          products={filteredAndSortedProducts as InventoryProduct[]}
          isLoading={isLoadingProducts}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={toggleSort}
          onEdit={openEdit}
          onDelete={(productId) => setDeleteConfirm(productId)}
          onViewHistory={setHistoryProduct}
          selectedProducts={selectedProducts}
          onSelectionChange={toggleSelectProduct}
          onSelectAll={(selected) => {
            if (selected) {
              setSelectedProducts(new Set(filteredAndSortedProducts.map((p) => p.id)))
            } else {
              setSelectedProducts(new Set())
            }
          }}
          onClearSelection={clearSelection}
          onBulkExport={handleBulkExport}
          onAddProduct={() => setShowAddModal(true)}
          sourceFilter={sourceFilter}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Quick Edit Modal */}
      <ProductEditModal
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleQuickEditSave}
        isSaving={isSaving}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateProduct}
        categories={categories}
        isCreating={isCreating}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeleteProduct(deleteConfirm)}
        isDeleting={isDeleting}
      />

      {/* Import Wizard */}
      <ImportWizard
        isOpen={showImportWizard}
        onClose={() => setShowImportWizard(false)}
        onImportComplete={() => {
          fetchStats()
          fetchProducts(searchQuery, pagination.page, pagination.limit)
        }}
        clinic={clinic}
      />

      {/* Multi-Mode Barcode Scanner */}
      <MultiModeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        clinic={clinic}
        onActionComplete={(action) => {
          // Handle different modes
          if (action.mode === 'lookup') {
            // Find the product in our list and open edit modal
            const foundProduct = products.find((p) => p.id === action.product.id)
            if (foundProduct) {
              openEdit(foundProduct)
            } else {
              // Product not in current view, search for it
              setSearchQuery(action.product.sku || action.product.name)
              setResult({
                success: 1,
                errors: [],
                message: `Producto encontrado: ${action.product.name}`,
              })
            }
          } else if (action.mode === 'receive' || action.mode === 'count') {
            // Refresh products to reflect stock changes
            fetchProducts()
            setResult({
              success: 1,
              errors: [],
              message:
                action.mode === 'receive'
                  ? `Stock actualizado: +${action.quantity} unidades de ${action.product.name}`
                  : `Conteo registrado: ${action.product.name} → ${action.quantity} unidades`,
            })
          }
        }}
      />

      {/* Import Preview Modal (Legacy - for direct file upload) */}
      {showPreview && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-[var(--bg-default)] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Vista Previa de Importación</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Revisa los cambios antes de confirmar</p>
              </div>
              <button
                onClick={handleCancelImport}
                className="rounded-lg p-2 transition-colors hover:bg-[var(--bg-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Summary Cards */}
            <div className="border-b border-[var(--border)] bg-[var(--bg-subtle)] p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-default)] p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {previewData.summary.totalRows}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Total Filas</div>
                </div>
                <div className="rounded-xl border border-[var(--status-success-light)] bg-[var(--bg-default)] p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--status-success)]">
                    {previewData.summary.newProducts}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Nuevos</div>
                </div>
                <div className="rounded-xl border border-[var(--status-info-light)] bg-[var(--bg-default)] p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--status-info)]">
                    {previewData.summary.updates}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Actualizaciones</div>
                </div>
                <div className="rounded-xl border border-[var(--status-warning-light)] bg-[var(--bg-default)] p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--status-warning)]">
                    {previewData.summary.adjustments}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Ajustes Stock</div>
                </div>
                <div className="rounded-xl border border-[var(--status-error-light)] bg-[var(--bg-default)] p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--status-error)]">
                    {previewData.summary.errors}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Errores</div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-default)] p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--text-muted)]">
                    {previewData.summary.skipped}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Omitidos</div>
                </div>
              </div>

              {previewData.summary.errors > 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--status-error-light)] bg-[var(--status-error-bg)] p-3 text-sm text-[var(--status-error)]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Hay {previewData.summary.errors} errores que no se procesarán. Revisa la tabla
                    para más detalles.
                  </span>
                </div>
              )}
            </div>

            {/* Preview Table */}
            <div className="flex-1 overflow-auto p-6">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[var(--bg-subtle)]">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-[var(--text-muted)]">
                      Fila
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-[var(--text-muted)]">
                      Estado
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-[var(--text-muted)]">
                      Operación
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-[var(--text-muted)]">
                      SKU
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-[var(--text-muted)]">
                      Nombre
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-[var(--text-muted)]">
                      Stock
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-[var(--text-muted)]">
                      Mensaje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewData.preview.map((row, idx) => (
                    <tr
                      key={idx}
                      className={` ${row.status === 'error' ? 'bg-[var(--status-error-bg)]' : ''} ${row.status === 'skip' ? 'bg-[var(--bg-subtle)] text-[var(--text-muted)]' : ''} `}
                    >
                      <td className="px-3 py-2 font-mono text-[var(--text-muted)]">{row.rowNumber}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.status === 'new' ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' : ''} ${row.status === 'update' ? 'bg-[var(--status-info-bg)] text-[var(--status-info)]' : ''} ${row.status === 'adjustment' ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]' : ''} ${row.status === 'error' ? 'bg-[var(--status-error-bg)] text-[var(--status-error)]' : ''} ${row.status === 'skip' ? 'bg-[var(--bg-muted)] text-[var(--text-muted)]' : ''} `}
                        >
                          {row.status === 'new' && 'Nuevo'}
                          {row.status === 'update' && 'Actualizar'}
                          {row.status === 'adjustment' && 'Ajuste'}
                          {row.status === 'error' && 'Error'}
                          {row.status === 'skip' && 'Omitir'}
                        </span>
                      </td>
                      <td className="px-3 py-2 capitalize">{row.operation || '-'}</td>
                      <td className="px-3 py-2 font-mono">{row.sku || '-'}</td>
                      <td className="max-w-[200px] truncate px-3 py-2">{row.name || '-'}</td>
                      <td className="px-3 py-2">
                        {row.currentStock !== undefined && row.newStock !== undefined ? (
                          <span className="flex items-center gap-1">
                            <span className="text-[var(--text-muted)]">{row.currentStock}</span>
                            <span className="text-[var(--text-muted)]">→</span>
                            <span
                              className={
                                row.newStock > row.currentStock
                                  ? 'font-medium text-[var(--status-success)]'
                                  : row.newStock < row.currentStock
                                    ? 'font-medium text-[var(--status-error)]'
                                    : ''
                              }
                            >
                              {row.newStock}
                            </span>
                          </span>
                        ) : row.newStock !== undefined ? (
                          <span className="text-[var(--status-success)]">{row.newStock}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="max-w-[250px] truncate px-3 py-2 text-[var(--text-muted)]">
                        {row.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-[var(--border)] bg-[var(--bg-subtle)] p-6">
              <button
                onClick={handleCancelImport}
                className="flex-1 py-3 font-bold text-[var(--text-muted)] transition hover:text-[var(--text-secondary)]"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={
                  previewData.summary.newProducts === 0 &&
                  previewData.summary.updates === 0 &&
                  previewData.summary.adjustments === 0
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <Upload className="h-5 w-5" />
                Confirmar Importación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {historyProduct && (
        <StockHistoryModal
          productId={historyProduct.id}
          productName={historyProduct.name}
          isOpen={!!historyProduct}
          onClose={() => setHistoryProduct(null)}
          clinic={clinic}
        />
      )}
    </div>
  )
}
