'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
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
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { DatePicker } from '@/components/ui/date-picker'

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

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

const stockFilterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'in_stock', label: 'En Stock' },
  { value: 'low_stock', label: 'Bajo Stock' },
  { value: 'out_of_stock', label: 'Sin Stock' },
]

// Type definitions
interface ImportResult {
  success: number
  errors: string[]
  message?: string
}

interface InventoryStats {
  totalProducts: number
  lowStockCount: number
  totalValue: number
}

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

interface ProductInventory {
  stock_quantity?: number
  min_stock_level?: number
  expiry_date?: string
  batch_number?: string
  location?: string
  bin_number?: string
  supplier_name?: string
}

interface Product {
  id: string
  name: string
  sku?: string
  base_price?: number
  price?: number
  image_url?: string
  image?: string
  stock?: number
  inventory?: ProductInventory
  category?: { id: string; name: string; slug: string }
}

export default function InventoryClient({ googleSheetUrl }: InventoryClientProps) {
  const { clinic } = useParams() as { clinic: string }
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editValues, setEditValues] = useState({
    price: 0,
    stock: 0,
    expiry_date: '',
    batch_number: '',
    location: '',
    bin_number: '',
    supplier_name: '',
    min_stock_level: 0,
  })
  const [activeTab, setActiveTab] = useState<'basic' | 'inventory' | 'location'>('basic')
  const [isSaving, setIsSaving] = useState(false)
  const [alerts, setAlerts] = useState<InventoryAlerts | null>(null)
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false)
  const templateDropdownRef = useRef<HTMLDivElement>(null)

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  })

  // Filter state
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/inventory/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch stats', e)
      }
    }
  }

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/inventory/alerts')
      if (res.ok) {
        const data = await res.json()
        setAlerts(data)
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch alerts', e)
      }
    }
  }

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

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/store/categories?clinic=${clinic}`)
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch categories', e)
      }
    }
  }

  const fetchProducts = async (query = '', page = 1, limit = pagination.limit) => {
    setIsLoadingProducts(true)
    try {
      let url = `/api/store/products?clinic=${clinic}&search=${query}&page=${page}&limit=${limit}`

      // Add category filter
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`
      }

      // Add stock filter
      if (stockFilter === 'in_stock') {
        url += '&in_stock_only=true'
      }

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
        if (data.pagination) {
          setPagination(data.pagination)
        }
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch products', e)
      }
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // Apply local stock filtering for low_stock and out_of_stock
  const filteredProducts = useMemo(() => {
    if (stockFilter === 'low_stock') {
      return products.filter(
        (p) =>
          (p.inventory?.stock_quantity ?? 0) > 0 &&
          (p.inventory?.stock_quantity ?? 0) <= (p.inventory?.min_stock_level || 5)
      )
    }
    if (stockFilter === 'out_of_stock') {
      return products.filter((p) => (p.inventory?.stock_quantity || 0) === 0)
    }
    return products
  }, [products, stockFilter])

  useEffect(() => {
    fetchStats()
    fetchCategories()
    fetchProducts()
    fetchAlerts()
  }, [clinic])

  // Refetch when filters change
  useEffect(() => {
    fetchProducts(searchQuery, 1, pagination.limit)
  }, [selectedCategory, stockFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(searchQuery, 1, pagination.limit)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handlePageChange = (newPage: number) => {
    fetchProducts(searchQuery, newPage, pagination.limit)
  }

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit }))
    fetchProducts(searchQuery, 1, newLimit)
  }

  const openEdit = (p: Product) => {
    setEditingProduct(p)
    setEditValues({
      price: p.base_price ?? p.price ?? 0,
      stock: p.inventory?.stock_quantity ?? p.stock ?? 0,
      expiry_date: p.inventory?.expiry_date ?? '',
      batch_number: p.inventory?.batch_number ?? '',
      location: p.inventory?.location ?? '',
      bin_number: p.inventory?.bin_number ?? '',
      supplier_name: p.inventory?.supplier_name ?? '',
      min_stock_level: p.inventory?.min_stock_level ?? 5,
    })
  }

  const handleQuickEditSave = async () => {
    if (!editingProduct) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/inventory/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // We'll update the API to handle JSON too
        body: JSON.stringify({
          rows: [
            {
              operation: 'adjustment', // General adjustment operation
              sku: editingProduct.sku ?? editingProduct.id,
              name: editingProduct.name,
              price: editValues.price,
              quantity:
                editValues.stock -
                (editingProduct.inventory?.stock_quantity ?? editingProduct.stock ?? 0),
              expiry_date: editValues.expiry_date || undefined,
              batch_number: editValues.batch_number || undefined,
              supplier_name: editValues.supplier_name || undefined,
              min_stock_level: editValues.min_stock_level,
            },
          ],
        }),
      })

      if (res.ok) {
        setEditingProduct(null)
        fetchProducts(searchQuery)
        fetchStats()
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Save failed', e)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = async (type: 'template' | 'catalog') => {
    try {
      const res = await fetch(`/api/inventory/export?type=${type}`)
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inventory_${type}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (e) {
      // TICKET-TYPE-004: Proper error handling without any
      setError(e instanceof Error ? e.message : 'Error desconocido')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/inventory/import', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Import failed')
      }

      const data = await res.json()
      setResult(data)
      fetchStats() // Update stats after import
    } catch (e) {
      // TICKET-TYPE-004: Proper error handling without any
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header Area */}
      <div className="flex flex-col justify-between gap-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-black text-gray-900">Gestión de Inventario</h1>
          <p className="text-gray-500">Actualiza tu catálogo y stock mediante planillas Excel.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => (window.location.href = `/${clinic}/portal/inventory/catalog`)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white shadow-lg transition hover:bg-blue-700"
          >
            <Package className="h-4 w-4" /> Agregar Productos
          </button>

          <button
            onClick={() => (window.location.href = `/${clinic}/portal/campaigns`)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Tag className="h-4 w-4 text-[var(--primary)]" /> Ver Promociones
          </button>

          {/* Template Download Dropdown */}
          <div className="relative" ref={templateDropdownRef}>
            <button
              onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-5 py-2.5 font-bold text-gray-700 shadow-sm transition hover:bg-gray-100"
            >
              <Download className="h-4 w-4" />
              Obtener Plantilla
              <ChevronDown
                className={`h-4 w-4 transition-transform ${templateDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {templateDropdownOpen && (
              <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl duration-200">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 text-white">
                  <h4 className="text-sm font-bold">📋 Plantilla de Inventario</h4>
                  <p className="mt-1 text-xs text-gray-300">Elige tu formato preferido</p>
                </div>

                <div className="p-2">
                  {/* Google Sheets Option */}
                  {googleSheetUrl &&
                    googleSheetUrl !==
                      'https://docs.google.com/spreadsheets/d/YOUR_TEMPLATE_ID/copy' && (
                      <a
                        href={googleSheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setTemplateDropdownOpen(false)}
                        className="group flex cursor-pointer items-start gap-4 rounded-xl p-4 transition-colors hover:bg-green-50"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 transition-transform group-hover:scale-110">
                          <svg
                            className="h-6 w-6 text-green-600"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9.75 15h-3v-3h3v3zm0-4.5h-3v-3h3v3zm0-4.5h-3V6h3v3zm4.5 9h-3v-3h3v3zm0-4.5h-3v-3h3v3zm0-4.5h-3V6h3v3zm4.5 9h-3v-3h3v3zm0-4.5h-3v-3h3v3zm0-4.5h-3V6h3v3z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">Google Sheets</span>
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                              Recomendado
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Crear una copia en tu Google Drive. Colabora en tiempo real.
                          </p>
                          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
                            <ExternalLink className="h-3 w-3" />
                            Abrir en Google Sheets
                          </div>
                        </div>
                      </a>
                    )}

                  {/* Excel Download Option */}
                  <button
                    onClick={() => {
                      handleExport('template')
                      setTemplateDropdownOpen(false)
                    }}
                    className="group flex w-full items-start gap-4 rounded-xl p-4 text-left transition-colors hover:bg-blue-50"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 transition-transform group-hover:scale-110">
                      <FileDown className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Descargar Excel</span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                          .xlsx
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Archivo compatible con Excel, LibreOffice y Google Sheets.
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600">
                        <Download className="h-3 w-3" />
                        Descargar archivo
                      </div>
                    </div>
                  </button>
                </div>

                <div className="border-t border-gray-100 bg-gray-50 p-3">
                  <p className="text-center text-xs text-gray-400">
                    💡 La plantilla incluye ejemplos y validaciones
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleExport('catalog')}
            className="hover:bg-[var(--primary)]/90 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 font-bold text-white shadow-lg transition"
          >
            <FileSpreadsheet className="h-4 w-4" /> Exportar Catálogo
          </button>
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts?.hasAlerts && (
        <div className="space-y-4">
          {alerts.lowStock && alerts.lowStock.length > 0 && (
            <div className="rounded-2xl border-l-4 border-orange-500 bg-orange-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 font-black text-orange-900">⚠️ Low Stock Alert</h3>
                  <p className="mb-3 text-sm text-orange-800">
                    {alerts.lowStock.length} product{alerts.lowStock.length > 1 ? 's' : ''} below
                    minimum stock level
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {alerts.lowStock.slice(0, 5).map((item: StockAlertItem) => (
                      <span
                        key={item.id}
                        className="rounded-lg border border-orange-200 bg-white px-3 py-1 text-xs font-bold text-orange-700"
                      >
                        {item.name} ({item.stock_quantity}/{item.min_stock_level})
                      </span>
                    ))}
                    {alerts.lowStock.length > 5 && (
                      <span className="text-xs font-bold text-orange-600">
                        +{alerts.lowStock.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {alerts.expiring && alerts.expiring.length > 0 && (
            <div className="rounded-2xl border-l-4 border-red-500 bg-red-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 font-black text-red-900">🗓️ Expiring Products</h3>
                  <p className="mb-3 text-sm text-red-800">
                    {alerts.expiring.length} product{alerts.expiring.length > 1 ? 's' : ''} expiring
                    within 30 days
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {alerts.expiring.slice(0, 5).map((item: StockAlertItem) => (
                      <span
                        key={item.id}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-bold text-red-700"
                      >
                        {item.name} (Exp:{' '}
                        {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}
                        )
                      </span>
                    ))}
                    {alerts.expiring.length > 5 && (
                      <span className="text-xs font-bold text-red-600">
                        +{alerts.expiring.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upload Section */}
        <div className="group relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>

          <div className="bg-[var(--primary)]/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full transition-transform group-hover:scale-110">
            <Upload className="h-10 w-10 text-[var(--primary)]" />
          </div>

          <h2 className="mb-2 text-2xl font-bold text-gray-900">Importar Actualizaciones</h2>
          <p className="mb-8 max-w-sm text-center text-gray-400">
            Arrastra tu archivo Excel o haz clic abajo para procesar los cambios de stock y nuevos
            productos.
          </p>

          <label
            className={`relative inline-flex cursor-pointer items-center gap-3 rounded-2xl bg-gray-900 px-8 py-4 font-bold text-white shadow-xl transition-all hover:-translate-y-1 active:scale-95 ${isUploading ? 'pointer-events-none opacity-50' : ''} `}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            {isUploading ? 'Procesando...' : 'Seleccionar Archivo'}
            <input
              type="file"
              className="hidden"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Results & Help */}
        <div className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="animate-in fade-in slide-in-from-top-4 flex items-start gap-4 rounded-3xl border border-red-100 bg-red-50 p-6">
              <AlertCircle className="h-6 w-6 shrink-0 text-red-500" />
              <div>
                <h3 className="font-bold text-red-900">Error en la importación</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {result && (
            <div className="animate-in fade-in slide-in-from-top-4 space-y-4 rounded-3xl border border-green-100 bg-green-50 p-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
                <div>
                  <h3 className="font-bold text-green-900">Importación exitosa</h3>
                  <p className="mt-1 text-sm text-green-700">
                    Se han procesado **{result.success}** filas correctamente.
                  </p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="rounded-2xl bg-white/50 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500">
                    Observaciones ({result.errors.length}):
                  </p>
                  <ul className="max-h-40 list-inside list-disc space-y-1 overflow-y-auto text-xs text-gray-600">
                    {result.errors.map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Instructions Card */}
          <div className="h-full space-y-6 rounded-3xl bg-gray-900 p-8 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Info className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Guía de Operaciones</h3>
            </div>

            <div className="grid gap-4">
              <div className="flex gap-3">
                <div className="h-fit shrink-0 rounded bg-[var(--primary)] px-2 py-1 text-xs font-black text-white">
                  NEW
                </div>
                <p className="text-sm text-gray-400">
                  <span className="font-bold text-white">New Product:</span> Deja el SKU vacío para
                  crear un nuevo item.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="h-fit shrink-0 rounded bg-blue-500 px-2 py-1 text-xs font-black text-white">
                  BUY
                </div>
                <p className="text-sm text-gray-400">
                  <span className="font-bold text-white">Purchase:</span> Agrega cantidad positiva y
                  costo por unidad.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="h-fit shrink-0 rounded bg-red-500 px-2 py-1 text-xs font-black text-white">
                  LOS
                </div>
                <p className="text-sm text-gray-400">
                  <span className="font-bold text-white">Damage/Theft:</span> Usa cantidad negativa
                  para descontar stock.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs italic text-gray-500">
                Cada compra (Purchase) actualiza automáticamente el Costo Promedio Ponderado para
                tus reportes de utilidad.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Productos Activos
            </p>
            <p className="text-2xl font-black text-gray-900">{stats?.totalProducts ?? '...'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Bajo Stock</p>
            <p className="text-2xl font-black text-gray-900">{stats?.lowStockCount ?? '...'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Valor Inventario
            </p>
            <p className="text-2xl font-black text-gray-900">
              {stats
                ? new Intl.NumberFormat('es-PY', {
                    style: 'currency',
                    currency: 'PYG',
                    maximumFractionDigits: 0,
                  }).format(stats.totalValue)
                : '...'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Edit Section */}
      <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edición Rápida</h2>
            <p className="text-sm text-gray-500">Busca y ajusta precios o stock directamente.</p>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:ring-[var(--primary)]/20 w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium transition-all focus:outline-none focus:ring-2"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-4 sm:flex-row">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="focus:ring-[var(--primary)]/20 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:ring-2"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter Tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
            {stockFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStockFilter(option.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  stockFilter === option.value
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Items per page */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-500">Mostrar:</span>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="focus:ring-[var(--primary)]/20 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:ring-2"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} items
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingProducts ? (
          <div className="py-12 text-center text-gray-400">
            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
            Cargando productos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No se encontraron productos.</div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="space-y-3 md:hidden">
              {filteredProducts.map((p) => {
                const stock = p.inventory?.stock_quantity ?? p.stock ?? 0
                const minStock = p.inventory?.min_stock_level ?? 5
                const price = p.base_price ?? p.price ?? 0
                const imageUrl = p.image_url ?? p.image
                const sku = p.sku ?? p.id

                return (
                  <div key={p.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-3 flex items-start gap-3">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt=""
                          className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-gray-900">{p.name}</p>
                        {p.category?.name && (
                          <p className="text-xs text-gray-400">{p.category.name}</p>
                        )}
                        <p className="mt-1 font-mono text-xs text-gray-400">SKU: {sku}</p>
                      </div>
                      <button
                        onClick={() => openEdit({ ...p, price, stock })}
                        className="hover:bg-[var(--primary)]/5 flex-shrink-0 rounded-xl p-2 text-gray-400 transition hover:text-[var(--primary)]"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">
                        {new Intl.NumberFormat('es-PY', {
                          style: 'currency',
                          currency: 'PYG',
                          maximumFractionDigits: 0,
                        }).format(price)}
                      </span>
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

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <th className="px-4 py-4">Producto</th>
                    <th className="px-4 py-4">SKU</th>
                    <th className="px-4 py-4">Precio Base</th>
                    <th className="px-4 py-4 text-center">Stock</th>
                    <th className="px-4 py-4 text-right">Accion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((p) => {
                    const stock = p.inventory?.stock_quantity ?? p.stock ?? 0
                    const minStock = p.inventory?.min_stock_level ?? 5
                    const price = p.base_price ?? p.price ?? 0
                    const imageUrl = p.image_url ?? p.image
                    const sku = p.sku ?? p.id

                    return (
                      <tr key={p.id} className="group transition-colors hover:bg-gray-50/50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {imageUrl && (
                              <img
                                src={imageUrl}
                                alt=""
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <span className="block font-bold text-gray-900">{p.name}</span>
                              {p.category?.name && (
                                <span className="text-xs text-gray-400">{p.category.name}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-sm text-gray-500">{sku}</td>
                        <td className="px-4 py-4 font-bold text-gray-900">
                          {new Intl.NumberFormat('es-PY', {
                            style: 'currency',
                            currency: 'PYG',
                            maximumFractionDigits: 0,
                          }).format(price)}
                        </td>
                        <td className="px-4 py-4 text-center">
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
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => openEdit({ ...p, price, stock })}
                            className="hover:bg-[var(--primary)]/5 rounded-xl p-2 text-gray-400 transition hover:text-[var(--primary)]"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="text-sm text-gray-500">
              Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}{' '}
              productos
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  // Show pages around current page
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
                      className={`h-10 w-10 rounded-xl text-sm font-bold transition ${
                        pagination.page === pageNum
                          ? 'bg-[var(--primary)] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editing Modal */}
      {editingProduct && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
          <div className="animate-in zoom-in-95 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
            <div className="flex items-center justify-between border-b border-gray-50 p-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Actualizar Producto</h3>
                <p className="text-sm text-gray-500">
                  {editingProduct.name} ({editingProduct.id})
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="rounded-xl p-2 transition hover:bg-gray-50"
              >
                <Search className="h-5 w-5 rotate-45" />
              </button>
            </div>
            {/* Tab Navigation */}
            <div className="px-8 pt-6">
              <div className="flex border-b border-gray-100">
                {[
                  { id: 'basic', label: 'Básico', icon: '💰' },
                  { id: 'inventory', label: 'Inventario', icon: '📦' },
                  { id: 'location', label: 'Ubicación', icon: '📍' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'basic' | 'inventory' | 'location')}
                    className={`border-b-2 px-4 py-3 text-sm font-bold transition-all ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 p-8">
              {/* Basic Tab */}
              {activeTab === 'basic' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Precio de Venta
                      </label>
                      <input
                        type="number"
                        value={editValues.price}
                        onChange={(e) =>
                          setEditValues({ ...editValues, price: Number(e.target.value) })
                        }
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Stock Actual
                      </label>
                      <input
                        type="number"
                        value={editValues.stock}
                        onChange={(e) =>
                          setEditValues({ ...editValues, stock: Number(e.target.value) })
                        }
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-2xl bg-blue-50 p-4">
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                    <div className="text-xs leading-relaxed text-blue-700">
                      <p className="mb-1 font-medium">Cambios de Stock:</p>
                      <p>
                        Al cambiar el stock manualmente se generará una transacción de ajuste. Para
                        compras a proveedores, utiliza la carga de planilla Excel para registrar el
                        costo de compra correctamente.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Inventory Tab */}
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Fecha de Vencimiento
                      </label>
                      <DatePicker
                        value={editValues.expiry_date}
                        onChange={(date) => setEditValues({ ...editValues, expiry_date: date })}
                        placeholder="Seleccionar fecha"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Número de Lote
                      </label>
                      <input
                        type="text"
                        value={editValues.batch_number}
                        onChange={(e) =>
                          setEditValues({ ...editValues, batch_number: e.target.value })
                        }
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Ej: LOTE-2024-001"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Stock Mínimo (Alerta)
                    </label>
                    <input
                      type="number"
                      value={editValues.min_stock_level}
                      onChange={(e) =>
                        setEditValues({ ...editValues, min_stock_level: Number(e.target.value) })
                      }
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                      min="0"
                      placeholder="5"
                    />
                    <p className="text-xs text-gray-500">
                      Cantidad mínima antes de mostrar alerta de bajo stock
                    </p>
                  </div>
                </div>
              )}

              {/* Location Tab */}
              {activeTab === 'location' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={editValues.location}
                        onChange={(e) => setEditValues({ ...editValues, location: e.target.value })}
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Ej: Estante A, Refrigerador"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Número de Bandeja
                      </label>
                      <input
                        type="text"
                        value={editValues.bin_number}
                        onChange={(e) =>
                          setEditValues({ ...editValues, bin_number: e.target.value })
                        }
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Ej: BIN-01, Cajón 3"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Proveedor
                    </label>
                    <input
                      type="text"
                      value={editValues.supplier_name}
                      onChange={(e) =>
                        setEditValues({ ...editValues, supplier_name: e.target.value })
                      }
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Nombre del proveedor"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 bg-gray-50 p-8">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 py-4 font-bold text-gray-500 transition hover:text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleQuickEditSave}
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 font-bold text-white shadow-xl transition-all hover:-translate-y-1 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
