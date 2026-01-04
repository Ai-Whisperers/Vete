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
  Tag,
  Search,
  Edit2,
  ChevronDown,
  ExternalLink,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Trash2,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Copy,
  Clock,
  Store,
  Globe,
  Layers,
  Wand2,
  ScanLine,
  History,
  ShoppingCart,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ImportWizard, MultiModeScanner } from '@/components/dashboard/inventory'
import { StockHistoryModal } from '@/components/dashboard/inventory/stock-history-modal'
import Image from 'next/image'

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

interface NewProductForm {
  name: string
  sku: string
  barcode: string
  category: string
  description: string
  base_price: number
  stock: number
  cost: number
  min_stock: number
}

type SortField = 'name' | 'sku' | 'base_price' | 'stock' | 'category'
type SortDirection = 'asc' | 'desc'

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

const stockFilterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'in_stock', label: 'En Stock' },
  { value: 'low_stock', label: 'Stock Bajo' },
  { value: 'out_of_stock', label: 'Sin Stock' },
]

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

const initialNewProduct: NewProductForm = {
  name: '',
  sku: '',
  barcode: '',
  category: '',
  description: '',
  base_price: 0,
  stock: 0,
  cost: 0,
  min_stock: 5,
}

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
  const [editValues, setEditValues] = useState({ price: 0, stock: 0 })
  const [isSaving, setIsSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProduct, setNewProduct] = useState<NewProductForm>(initialNewProduct)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [historyProduct, setHistoryProduct] = useState<{ id: string; name: string } | null>(null)
  const [showProductDetail, setShowProductDetail] = useState<Product | null>(null)

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
    setEditValues({
      price: p.base_price || 0,
      stock: p.inventory?.stock_quantity || 0,
    })
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

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)))
    }
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

  const handleQuickEditSave = async () => {
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
              price: editValues.price,
              quantity: editValues.stock - (editingProduct.inventory?.stock_quantity || 0),
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

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.base_price) {
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
              sku: newProduct.sku || undefined,
              barcode: newProduct.barcode || undefined,
              name: newProduct.name,
              category: newProduct.category || undefined,
              description: newProduct.description || undefined,
              price: newProduct.base_price,
              quantity: newProduct.stock,
              unit_cost: newProduct.cost || undefined,
              min_stock: newProduct.min_stock,
            },
          ],
        }),
      })

      if (res.ok) {
        setShowAddModal(false)
        setNewProduct(initialNewProduct)
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

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="inline-flex items-center gap-1 transition-colors hover:text-[var(--primary)]"
    >
      {label}
      {sortField === field ? (
        sortDirection === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  )

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gestión de Inventario</h1>
          <p className="mt-1 text-sm text-gray-500">
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
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 font-bold text-white transition hover:bg-purple-700"
            title="Escanear código de barras para buscar o editar producto"
          >
            <ScanLine className="h-4 w-4" /> Escanear
          </button>

          <button
            onClick={() => setShowImportWizard(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white transition hover:bg-emerald-700"
          >
            <Wand2 className="h-4 w-4" /> Importar con Asistente
          </button>

          <button
            onClick={() => (window.location.href = `/${clinic}/portal/inventory/catalog`)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white transition hover:bg-blue-700"
          >
            <Globe className="h-4 w-4" /> Catálogo Global
          </button>

          <div className="relative" ref={templateDropdownRef}>
            <button
              onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 font-bold text-gray-700 transition hover:bg-gray-200"
            >
              <Download className="h-4 w-4" />
              Plantilla
              <ChevronDown
                className={`h-4 w-4 transition-transform ${templateDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {templateDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
                <div className="bg-gray-900 p-3 text-white">
                  <h4 className="text-sm font-bold">Plantilla de Inventario</h4>
                </div>
                <div className="p-2">
                  {googleSheetUrl && (
                    <a
                      href={googleSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setTemplateDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-green-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <ExternalLink className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <span className="block font-bold text-gray-900">Google Sheets</span>
                        <span className="text-xs text-gray-500">Crear copia en Drive</span>
                      </div>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      handleExport('template')
                      setTemplateDropdownOpen(false)
                    }}
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-blue-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <FileDown className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="block font-bold text-gray-900">Descargar Excel</span>
                      <span className="text-xs text-gray-500">Archivo .xlsx</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleExport('catalog')}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 font-bold text-white transition hover:bg-gray-800"
          >
            <FileSpreadsheet className="h-4 w-4" /> Exportar
          </button>
        </div>
      </div>

      {/* Source Tabs */}
      <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row">
          {sourceTabOptions.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSourceFilter(tab.value)}
              className={`flex flex-1 items-center justify-center gap-3 rounded-xl px-4 py-3 transition-all ${
                sourceFilter === tab.value
                  ? 'bg-[var(--primary)] text-white shadow-lg'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className={sourceFilter === tab.value ? 'text-white' : 'text-gray-400'}>
                {tab.icon}
              </span>
              <span className="font-bold">{tab.label}</span>
              {tab.value !== 'all' && sourceSummary[tab.value] !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    sourceFilter === tab.value
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
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
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-600'
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
            <div className="rounded-xl border-l-4 border-orange-500 bg-orange-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-orange-500" />
                <div className="flex-1">
                  <h3 className="font-bold text-orange-900">Alerta de Stock Bajo</h3>
                  <p className="mt-1 text-sm text-orange-700">
                    {alerts.lowStock.length} producto{alerts.lowStock.length > 1 ? 's' : ''} por
                    debajo del nivel mínimo
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {alerts.lowStock.slice(0, 5).map((item: StockAlertItem) => (
                      <span
                        key={item.id}
                        className="rounded border border-orange-200 bg-white px-2 py-1 text-xs font-medium text-orange-700"
                      >
                        {item.name} ({item.stock_quantity}/{item.min_stock_level})
                      </span>
                    ))}
                    {alerts.lowStock.length > 5 && (
                      <span className="text-xs font-medium text-orange-600">
                        +{alerts.lowStock.length - 5} más
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {alerts.expiring?.length > 0 && (
            <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-red-900">Productos por Vencer</h3>
                    <button
                      onClick={() =>
                        (window.location.href = `/${clinic}/dashboard/inventory/expiring`)
                      }
                      className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline"
                    >
                      Ver todo →
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-red-700">
                    {alerts.expiring.length} producto{alerts.expiring.length > 1 ? 's' : ''} vencen
                    en los próximos 30 días
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {alerts.expiring.slice(0, 5).map((item: StockAlertItem) => (
                      <span
                        key={item.id}
                        className="rounded border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700"
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
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Productos Activos</p>
            <p className="text-2xl font-black text-gray-900">{stats?.totalProducts ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Stock Bajo</p>
            <p className="text-2xl font-black text-gray-900">{stats?.lowStockCount ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Valor Inventario</p>
            <p className="text-2xl font-black text-gray-900">
              {stats ? formatPrice(stats.totalValue) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Link
          href={`/${clinic}/dashboard/inventory/reorders`}
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-[var(--text-primary)]">Reorden</p>
            <p className="text-xs text-[var(--text-secondary)]">Sugerencias</p>
          </div>
        </Link>
        <Link
          href={`/${clinic}/dashboard/inventory/expiring`}
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
            <Clock className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-[var(--text-primary)]">Vencimientos</p>
            <p className="text-xs text-[var(--text-secondary)]">Control</p>
          </div>
        </Link>
        <button
          onClick={() => setShowBarcodeScanner(true)}
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 text-left transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
            <ScanLine className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-[var(--text-primary)]">Escáner</p>
            <p className="text-xs text-[var(--text-secondary)]">Código de barras</p>
          </div>
        </button>
        <button
          onClick={() => {/* TODO: Add new product modal */}}
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 text-left transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
            <Plus className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-[var(--text-primary)]">Nuevo</p>
            <p className="text-xs text-[var(--text-secondary)]">Producto</p>
          </div>
        </button>
      </div>

      {/* Import Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-6">
          <div className="bg-[var(--primary)]/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Upload className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Importar Actualizaciones</h2>
          <p className="mb-6 max-w-sm text-center text-sm text-gray-400">
            Sube tu archivo Excel para actualizar stock, precios o agregar productos.
          </p>
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-bold text-white transition-all hover:bg-gray-800 ${isUploading || isLoadingPreview ? 'pointer-events-none opacity-50' : ''} `}
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
          <p className="mt-3 text-center text-xs text-gray-400">
            Se mostrará una vista previa antes de importar
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div>
                <h3 className="font-bold text-red-900">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {result && (
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <div className="flex-1">
                  <h3 className="font-bold text-green-900">Importación Exitosa</h3>
                  <p className="mt-1 text-sm text-green-700">
                    Se procesaron <strong>{result.success}</strong> filas correctamente.
                  </p>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="text-green-400 hover:text-green-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {result.errors?.length > 0 && (
                <div className="mt-3 rounded-lg bg-white/50 p-3">
                  <p className="mb-2 text-xs font-bold uppercase text-orange-600">
                    Observaciones ({result.errors.length}):
                  </p>
                  <ul className="max-h-32 list-inside list-disc space-y-1 overflow-y-auto text-xs text-gray-600">
                    {result.errors.map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl bg-gray-900 p-5 text-white">
            <div className="mb-4 flex items-center gap-2">
              <Info className="h-5 w-5" />
              <h3 className="font-bold">Guía Rápida</h3>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex gap-2">
                <span className="rounded bg-[var(--primary)] px-2 py-0.5 text-xs font-bold text-white">
                  NEW
                </span>
                <span className="text-gray-300">Crear producto (SKU vacío)</span>
              </div>
              <div className="flex gap-2">
                <span className="rounded bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                  BUY
                </span>
                <span className="text-gray-300">Compra (cantidad + costo)</span>
              </div>
              <div className="flex gap-2">
                <span className="rounded bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  ADJ
                </span>
                <span className="text-gray-300">Ajuste de inventario (+/-)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {/* Table Header */}
        <div className="border-b border-gray-100 p-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Catálogo de Productos</h2>
              <p className="text-sm text-gray-500">{pagination.total} productos en total</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="focus:ring-[var(--primary)]/20 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-medium outline-none focus:ring-2"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 p-1">
              {stockFilterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStockFilter(option.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    stockFilter === option.value
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-500">Mostrar:</span>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="focus:ring-[var(--primary)]/20 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-medium outline-none focus:ring-2"
              >
                {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {isLoadingProducts ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin" />
            Cargando productos...
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto mb-3 h-12 w-12 text-gray-200" />
            <p className="text-gray-400">No se encontraron productos</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Agregar Producto
            </button>
          </div>
        ) : (
          <>
            {/* Bulk Actions Toolbar */}
            {selectedProducts.size > 0 && (
              <div className="mb-4 flex items-center justify-between rounded-lg bg-[var(--primary)]/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-[var(--primary)]">
                    {selectedProducts.size} producto{selectedProducts.size !== 1 ? 's' : ''} seleccionado{selectedProducts.size !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Deseleccionar
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkExport}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                  </button>
                </div>
              </div>
            )}

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <th className="w-12 px-4 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts(new Set(filteredAndSortedProducts.map((p) => p.id)))
                          } else {
                            setSelectedProducts(new Set())
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-4">
                      <SortButton field="name" label="Producto" />
                    </th>
                    <th className="px-4 py-4">
                      <SortButton field="sku" label="SKU" />
                    </th>
                    <th className="px-4 py-4">
                      <SortButton field="category" label="Categoría" />
                    </th>
                    <th className="px-4 py-4 text-right">
                      <SortButton field="base_price" label="Precio" />
                    </th>
                    <th className="px-4 py-4 text-center">
                      <SortButton field="stock" label="Stock" />
                    </th>
                    <th className="px-4 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAndSortedProducts.map((p) => {
                    const stock = p.inventory?.stock_quantity ?? 0
                    const minStock = p.inventory?.min_stock_level ?? 5

                    return (
                      <tr key={p.id} className="group transition-colors hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selectedProducts.has(p.id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedProducts)
                              if (e.target.checked) {
                                newSet.add(p.id)
                              } else {
                                newSet.delete(p.id)
                              }
                              setSelectedProducts(newSet)
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              {p.image_url ? (
                                <Image
                                  src={p.image_url}
                                  alt={p.name}
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-300" />
                                </div>
                              )}
                              {/* Source indicator badge */}
                              {p.source && sourceFilter === 'all' && (
                                <div
                                  className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full ${
                                    p.source === 'catalog' ? 'bg-blue-500' : 'bg-green-500'
                                  }`}
                                  title={p.source === 'catalog' ? 'Del catálogo' : 'Propio'}
                                >
                                  {p.source === 'catalog' ? (
                                    <Globe className="h-2.5 w-2.5 text-white" />
                                  ) : (
                                    <Store className="h-2.5 w-2.5 text-white" />
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate font-bold text-gray-900">{p.name}</p>
                                {p.source === 'catalog' && p.assignment?.margin_percentage && (
                                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                                    +{p.assignment.margin_percentage.toFixed(0)}%
                                  </span>
                                )}
                              </div>
                              {p.brand?.name && (
                                <p className="text-xs text-gray-400">{p.brand.name}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-gray-500">{p.sku || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{p.category?.name || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div>
                            <span className="font-bold text-gray-900">
                              {formatPrice(
                                p.sale_price || p.assignment?.sale_price || p.base_price
                              )}
                            </span>
                            {p.inventory?.weighted_average_cost && (
                              <p className="text-[10px] text-gray-400">
                                Costo: {formatPrice(p.inventory.weighted_average_cost)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block rounded-lg px-2 py-1 text-xs font-bold ${
                              stock === 0
                                ? 'bg-red-50 text-red-600'
                                : stock <= minStock
                                  ? 'bg-orange-50 text-orange-600'
                                  : 'bg-green-50 text-green-600'
                            }`}
                          >
                            {stock} un.
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setHistoryProduct({ id: p.id, name: p.name })}
                              className="hover:bg-purple-50 rounded-lg p-2 text-gray-400 transition hover:text-purple-600"
                              title="Ver Historial"
                            >
                              <History className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEdit(p)}
                              className="hover:bg-[var(--primary)]/5 rounded-lg p-2 text-gray-400 transition hover:text-[var(--primary)]"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(p.id)}
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-gray-50 md:hidden">
              {filteredAndSortedProducts.map((p) => {
                const stock = p.inventory?.stock_quantity ?? 0
                const minStock = p.inventory?.min_stock_level ?? 5

                return (
                  <div key={p.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {p.image_url ? (
                          <Image
                            src={p.image_url}
                            alt={p.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                        {/* Source indicator badge */}
                        {p.source && sourceFilter === 'all' && (
                          <div
                            className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full ${
                              p.source === 'catalog' ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                          >
                            {p.source === 'catalog' ? (
                              <Globe className="h-3 w-3 text-white" />
                            ) : (
                              <Store className="h-3 w-3 text-white" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-bold text-gray-900">{p.name}</p>
                          {p.source === 'catalog' && p.assignment?.margin_percentage && (
                            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                              +{p.assignment.margin_percentage.toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {p.category?.name || 'Sin categoría'}
                        </p>
                        <p className="mt-1 font-mono text-xs text-gray-400">SKU: {p.sku || '—'}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setHistoryProduct({ id: p.id, name: p.name })}
                          className="p-2 text-gray-400 hover:text-purple-600"
                          title="Historial"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 text-gray-400 hover:text-[var(--primary)]"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900">
                          {formatPrice(p.sale_price || p.assignment?.sale_price || p.base_price)}
                        </span>
                        {p.inventory?.weighted_average_cost && (
                          <span className="ml-2 text-[10px] text-gray-400">
                            Costo: {formatPrice(p.inventory.weighted_average_cost)}
                          </span>
                        )}
                      </div>
                      <span
                        className={`rounded-lg px-2 py-1 text-xs font-bold ${
                          stock === 0
                            ? 'bg-red-50 text-red-600'
                            : stock <= minStock
                              ? 'bg-orange-50 text-orange-600'
                              : 'bg-green-50 text-green-600'
                        }`}
                      >
                        {stock} un.
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 p-4">
            <div className="text-sm text-gray-500">
              Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum: number
                if (pagination.pages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`h-10 w-10 rounded-lg text-sm font-bold transition ${
                      pagination.page === pageNum
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edición Rápida</h3>
                <p className="max-w-[280px] truncate text-sm text-gray-500">
                  {editingProduct.name}
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-gray-400">
                    Precio de Venta
                  </label>
                  <input
                    type="number"
                    value={editValues.price}
                    onChange={(e) =>
                      setEditValues({ ...editValues, price: Number(e.target.value) })
                    }
                    className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-lg font-bold outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-gray-400">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    value={editValues.stock}
                    onChange={(e) =>
                      setEditValues({ ...editValues, stock: Number(e.target.value) })
                    }
                    className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-lg font-bold outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 rounded-xl bg-blue-50 p-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <p className="text-xs text-blue-700">
                  Los cambios de stock generan un ajuste automático. Para compras, usa la
                  importación Excel.
                </p>
              </div>
            </div>
            <div className="flex gap-3 bg-gray-50 p-6">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 py-3 font-bold text-gray-500 transition hover:text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleQuickEditSave}
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-hidden overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white p-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Nuevo Producto</h3>
                <p className="text-sm text-gray-500">Agregar producto al inventario</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-gray-400">
                  Nombre del Producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Ej: Royal Canin Adult 15kg"
                  className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 outline-none focus:ring-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-gray-400">
                    SKU (opcional)
                  </label>
                  <input
                    type="text"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="Auto-generado"
                    className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-gray-400">
                    Código de Barras
                  </label>
                  <input
                    type="text"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    placeholder="7891234567890"
                    className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-gray-400">
                  Categoría
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 outline-none focus:ring-2"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-gray-400">
                  Descripción
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Descripción del producto..."
                  rows={2}
                  className="focus:ring-[var(--primary)]/20 w-full resize-none rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 outline-none focus:ring-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-gray-400">
                    Precio de Venta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newProduct.base_price || ''}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, base_price: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-gray-400">
                    Costo Unitario
                  </label>
                  <input
                    type="number"
                    value={newProduct.cost || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, cost: Number(e.target.value) })}
                    placeholder="0"
                    className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-gray-400">
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock || ''}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-gray-400">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    value={newProduct.min_stock || ''}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, min_stock: Number(e.target.value) })
                    }
                    placeholder="5"
                    className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 outline-none focus:ring-2"
                  />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 flex gap-3 bg-gray-50 p-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewProduct(initialNewProduct)
                }}
                className="flex-1 py-3 font-bold text-gray-500 transition hover:text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProduct}
                disabled={isCreating || !newProduct.name || !newProduct.base_price}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                Crear Producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">Eliminar Producto</h3>
              <p className="text-sm text-gray-500">
                ¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3 bg-gray-50 p-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 font-bold text-gray-500 transition hover:text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirm)}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Vista Previa de Importación</h2>
                <p className="mt-1 text-sm text-gray-500">Revisa los cambios antes de confirmar</p>
              </div>
              <button
                onClick={handleCancelImport}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Summary Cards */}
            <div className="border-b border-gray-100 bg-gray-50 p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {previewData.summary.totalRows}
                  </div>
                  <div className="text-xs text-gray-500">Total Filas</div>
                </div>
                <div className="rounded-xl border border-green-100 bg-white p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {previewData.summary.newProducts}
                  </div>
                  <div className="text-xs text-gray-500">Nuevos</div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-white p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {previewData.summary.updates}
                  </div>
                  <div className="text-xs text-gray-500">Actualizaciones</div>
                </div>
                <div className="rounded-xl border border-amber-100 bg-white p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {previewData.summary.adjustments}
                  </div>
                  <div className="text-xs text-gray-500">Ajustes Stock</div>
                </div>
                <div className="rounded-xl border border-red-100 bg-white p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {previewData.summary.errors}
                  </div>
                  <div className="text-xs text-gray-500">Errores</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
                  <div className="text-2xl font-bold text-gray-400">
                    {previewData.summary.skipped}
                  </div>
                  <div className="text-xs text-gray-500">Omitidos</div>
                </div>
              </div>

              {previewData.summary.errors > 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
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
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">
                      Fila
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">
                      Estado
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">
                      Operación
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">
                      SKU
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">
                      Nombre
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">
                      Stock
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">
                      Mensaje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewData.preview.map((row, idx) => (
                    <tr
                      key={idx}
                      className={` ${row.status === 'error' ? 'bg-red-50' : ''} ${row.status === 'skip' ? 'bg-gray-50 text-gray-400' : ''} `}
                    >
                      <td className="px-3 py-2 font-mono text-gray-500">{row.rowNumber}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.status === 'new' ? 'bg-green-100 text-green-700' : ''} ${row.status === 'update' ? 'bg-blue-100 text-blue-700' : ''} ${row.status === 'adjustment' ? 'bg-amber-100 text-amber-700' : ''} ${row.status === 'error' ? 'bg-red-100 text-red-700' : ''} ${row.status === 'skip' ? 'bg-gray-100 text-gray-500' : ''} `}
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
                            <span className="text-gray-400">{row.currentStock}</span>
                            <span className="text-gray-300">→</span>
                            <span
                              className={
                                row.newStock > row.currentStock
                                  ? 'font-medium text-green-600'
                                  : row.newStock < row.currentStock
                                    ? 'font-medium text-red-600'
                                    : ''
                              }
                            >
                              {row.newStock}
                            </span>
                          </span>
                        ) : row.newStock !== undefined ? (
                          <span className="text-green-600">{row.newStock}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="max-w-[250px] truncate px-3 py-2 text-gray-500">
                        {row.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-gray-100 bg-gray-50 p-6">
              <button
                onClick={handleCancelImport}
                className="flex-1 py-3 font-bold text-gray-500 transition hover:text-gray-700"
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
