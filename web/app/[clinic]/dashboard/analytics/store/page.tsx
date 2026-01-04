'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Gift,
  Loader2,
  BarChart3,
  ArrowLeft,
  Calendar,
  DollarSign,
  Percent,
  AlertTriangle,
  RotateCcw,
  PackageX,
  TrendingDown,
  Users,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface SalesSummary {
  today: { total: number; count: number }
  week: { total: number; count: number }
  month: { total: number; count: number }
  year: { total: number; count: number }
}

interface TopProduct {
  id: string
  name: string
  sku: string | null
  image_url: string | null
  category_name: string | null
  total_sold: number
  total_revenue: number
}

interface CategoryRevenue {
  category_id: string
  category_name: string
  total_revenue: number
  order_count: number
  percentage: number
  [key: string]: string | number
}

interface StatusDistribution {
  status: string
  count: number
  total: number
  percentage: number
}

interface DailyTrend {
  date: string
  revenue: number
  orders: number
  avg_order_value: number
}

interface CouponStats {
  total_coupons: number
  active_coupons: number
  total_usage: number
  total_discount_given: number
}

// Margin Analytics Types
interface ProductMargin {
  id: string
  name: string
  sku: string | null
  category_name: string | null
  base_price: number
  cost: number
  margin_amount: number
  margin_percentage: number
  units_sold: number
  total_revenue: number
  total_profit: number
}

interface CategoryMargin {
  category_id: string
  category_name: string
  total_revenue: number
  total_cost: number
  total_profit: number
  margin_percentage: number
  product_count: number
  [key: string]: string | number
}

interface MarginSummary {
  total_revenue: number
  total_cost: number
  total_profit: number
  average_margin: number
  low_margin_count: number
  low_margin_threshold: number
}

interface MarginAnalyticsData {
  summary: MarginSummary
  productMargins: ProductMargin[]
  categoryMargins: CategoryMargin[]
  generatedAt: string
}

// Turnover Analytics Types
interface ProductTurnover {
  id: string
  name: string
  sku: string | null
  category_name: string | null
  current_stock: number
  reorder_point: number | null
  avg_daily_sales: number
  days_of_inventory: number | null
  turnover_ratio: number
  status: 'critical' | 'low' | 'healthy' | 'overstocked' | 'slow_moving'
  last_sale_date: string | null
  cost_value: number
}

interface TurnoverSummary {
  total_inventory_value: number
  total_products: number
  critical_stock_count: number
  low_stock_count: number
  overstocked_count: number
  slow_moving_count: number
  avg_turnover_ratio: number
}

interface ReorderSuggestion {
  id: string
  name: string
  sku: string | null
  current_stock: number
  reorder_point: number
  suggested_quantity: number
  days_until_stockout: number | null
  priority: 'urgent' | 'high' | 'medium' | 'low'
}

interface TurnoverAnalyticsData {
  summary: TurnoverSummary
  productTurnover: ProductTurnover[]
  reorderSuggestions: ReorderSuggestion[]
  generatedAt: string
}

interface StoreAnalyticsData {
  summary: SalesSummary
  topProducts: TopProduct[]
  categoryRevenue: CategoryRevenue[]
  statusDistribution: StatusDistribution[]
  dailyTrend: DailyTrend[]
  couponStats: CouponStats
  generatedAt: string
}

// Chart colors - synchronized with CSS variables in globals.css (--chart-1 through --chart-8)
const CHART_COLORS = {
  blue: 'var(--chart-1)',
  green: 'var(--chart-2)',
  amber: 'var(--chart-3)',
  red: 'var(--chart-4)',
  purple: 'var(--chart-5)',
  pink: 'var(--chart-6)',
  cyan: 'var(--chart-7)',
  lime: 'var(--chart-8)',
}

// For recharts which needs actual values, we reference the CSS variable hex values
const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
]

// Status colors mapped to CSS variables
const STATUS_COLORS: Record<string, string> = {
  Pendiente: 'var(--status-warning)',
  Confirmado: 'var(--status-info)',
  'En Proceso': 'var(--accent-purple)',
  Listo: 'var(--status-success)',
  Enviado: 'var(--accent-cyan)',
  Entregado: 'var(--status-success)',
  Cancelado: 'var(--status-error)',
  Reembolsado: 'var(--text-muted)',
}

// Turnover status colors
const TURNOVER_STATUS_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  critical: {
    bg: 'var(--status-error-light)',
    text: 'var(--status-error)',
    icon: 'var(--status-error)',
  },
  low: {
    bg: 'var(--status-warning-light)',
    text: 'var(--status-warning)',
    icon: 'var(--status-warning)',
  },
  healthy: {
    bg: 'var(--status-success-light)',
    text: 'var(--status-success)',
    icon: 'var(--status-success)',
  },
  overstocked: {
    bg: 'var(--accent-purple-light)',
    text: 'var(--accent-purple)',
    icon: 'var(--accent-purple)',
  },
  slow_moving: {
    bg: 'var(--accent-orange-light)',
    text: 'var(--accent-orange)',
    icon: 'var(--accent-orange)',
  },
}

// Priority colors for reorder suggestions
const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  urgent: { bg: 'var(--status-error-light)', text: 'var(--status-error)' },
  high: { bg: 'var(--status-warning-light)', text: 'var(--status-warning)' },
  medium: { bg: 'var(--accent-blue-light)', text: 'var(--accent-blue)' },
  low: { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)' },
}

export default function StoreAnalyticsPage(): React.ReactElement {
  const params = useParams()
  const clinic = params?.clinic as string
  const [period, setPeriod] = useState<number>(30)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<StoreAnalyticsData | null>(null)
  const [marginData, setMarginData] = useState<MarginAnalyticsData | null>(null)
  const [turnoverData, setTurnoverData] = useState<TurnoverAnalyticsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'sales' | 'margins' | 'inventory'>('sales')

  useEffect(() => {
    const fetchAnalytics = async (): Promise<void> => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch all analytics in parallel
        const [storeResponse, marginsResponse, turnoverResponse] = await Promise.all([
          fetch(`/api/analytics/store?period=${period}&topProducts=10`),
          fetch(`/api/analytics/store/margins?period=${period}`),
          fetch(`/api/analytics/store/turnover?period=${period}`),
        ])

        if (storeResponse.ok) {
          const result = await storeResponse.json()
          setData(result)
        } else {
          const errorData = await storeResponse.json()
          setError(errorData.message || 'Error al cargar analíticas')
        }

        if (marginsResponse.ok) {
          const result = await marginsResponse.json()
          setMarginData(result)
        }

        if (turnoverResponse.ok) {
          const result = await turnoverResponse.json()
          setTurnoverData(result)
        }
      } catch (err) {
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching store analytics:', err)
        }
        setError('Error de conexión')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [period])

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M Gs.`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K Gs.`
    }
    return `${value.toLocaleString('es-PY')} Gs.`
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-PY', { month: 'short', day: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p style={{ color: 'var(--status-error)' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-white"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-[var(--text-secondary)]">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${clinic}/dashboard/analytics`}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-[var(--text-secondary)]" />
          </Link>
          <div className="rounded-lg bg-[var(--primary)] bg-opacity-10 p-2">
            <ShoppingCart className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analíticas de Tienda</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Métricas de ventas, productos y cupones
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1">
          {[
            { value: 7, label: '7 días' },
            { value: 30, label: '30 días' },
            { value: 90, label: '90 días' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-white text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'sales'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Ventas
        </button>
        <button
          onClick={() => setActiveTab('margins')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'margins'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Percent className="h-4 w-4" />
          Márgenes
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'inventory'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          Inventario
        </button>
        <Link
          href={`/${clinic}/dashboard/analytics/customers`}
          className="flex items-center gap-2 border-b-2 border-transparent px-6 py-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <Users className="h-4 w-4" />
          Clientes
        </Link>
      </div>

      {/* Sales Tab Content */}
      {activeTab === 'sales' && (
        <>
          {/* Sales Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Ventas Hoy</p>
                  <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                    {formatCurrency(data.summary.today.total)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {data.summary.today.count} pedidos
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--accent-blue-light)' }}
                >
                  <Calendar className="h-6 w-6" style={{ color: 'var(--accent-blue)' }} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Esta Semana</p>
                  <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                    {formatCurrency(data.summary.week.total)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {data.summary.week.count} pedidos
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--accent-green-light)' }}
                >
                  <TrendingUp className="h-6 w-6" style={{ color: 'var(--accent-green)' }} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Este Mes</p>
                  <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                    {formatCurrency(data.summary.month.total)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {data.summary.month.count} pedidos
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--accent-purple-light)' }}
                >
                  <DollarSign className="h-6 w-6" style={{ color: 'var(--accent-purple)' }} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Este Año</p>
                  <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                    {formatCurrency(data.summary.year.total)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {data.summary.year.count} pedidos
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--accent-orange-light)' }}
                >
                  <BarChart3 className="h-6 w-6" style={{ color: 'var(--accent-orange)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
              Tendencia de Ventas
            </h3>
            <div className="h-[300px]">
              {data.dailyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyTrend}>
                    <defs>
                      <linearGradient id="colorStoreRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={formatDate} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const numValue = typeof value === 'number' ? value : 0
                        if (name === 'revenue') return [formatCurrency(numValue), 'Ingresos']
                        if (name === 'orders') return [numValue, 'Pedidos']
                        return [formatCurrency(numValue), 'Ticket Promedio']
                      }}
                      labelFormatter={(label) => formatDate(String(label))}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorStoreRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[var(--text-secondary)]">
                  No hay datos de ventas en este período
                </div>
              )}
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Category Revenue Pie Chart */}
            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                Ingresos por Categoría
              </h3>
              <div className="h-[300px]">
                {data.categoryRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryRevenue}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="total_revenue"
                        nameKey="category_name"
                        label={({ name, percent }) =>
                          `${(name as string)?.substring(0, 10) || ''} ${Math.round((percent || 0) * 100)}%`
                        }
                      >
                        {data.categoryRevenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => {
                          const numValue = typeof value === 'number' ? value : 0
                          return [formatCurrency(numValue), 'Ingresos']
                        }}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--text-secondary)]">
                    No hay datos de categorías
                  </div>
                )}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                Estado de Pedidos
              </h3>
              <div className="h-[300px]">
                {data.statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.statusDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="status" tick={{ fontSize: 12 }} width={100} />
                      <Tooltip
                        formatter={(value, name) => {
                          const numValue = typeof value === 'number' ? value : 0
                          if (name === 'count') return [numValue, 'Cantidad']
                          return [formatCurrency(numValue), 'Total']
                        }}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                        }}
                      />
                      <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 4, 4, 0]}>
                        {data.statusDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--text-secondary)]">
                    No hay datos de pedidos
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Productos Más Vendidos
              </h3>
            </div>
            {data.topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                        Categoría
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Vendidos
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Ingresos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((product, index) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-[var(--text-secondary)]">
                              #{index + 1}
                            </span>
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-[var(--text-primary)]">
                                {product.name}
                              </p>
                              {product.sku && (
                                <p className="text-xs text-[var(--text-secondary)]">
                                  SKU: {product.sku}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[var(--text-secondary)]">
                            {product.category_name || 'Sin categoría'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-[var(--text-primary)]">
                            {product.total_sold}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium" style={{ color: 'var(--status-success)' }}>
                            {formatCurrency(product.total_revenue)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-[var(--text-secondary)]">
                No hay datos de productos vendidos
              </div>
            )}
          </div>

          {/* Coupon Stats */}
          <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Estadísticas de Cupones
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: 'var(--accent-blue-light)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--accent-blue)' }}>
                  Total Cupones
                </p>
                <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--accent-blue-dark)' }}>
                  {data.couponStats.total_coupons}
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: 'var(--accent-green-light)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--accent-green)' }}>
                  Cupones Activos
                </p>
                <p
                  className="mt-1 text-2xl font-bold"
                  style={{ color: 'var(--accent-green-dark)' }}
                >
                  {data.couponStats.active_coupons}
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: 'var(--accent-purple-light)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--accent-purple)' }}>
                  Usos Totales
                </p>
                <p
                  className="mt-1 text-2xl font-bold"
                  style={{ color: 'var(--accent-purple-dark)' }}
                >
                  {data.couponStats.total_usage}
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: 'var(--accent-orange-light)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--accent-orange)' }}>
                  Descuentos Dados
                </p>
                <p
                  className="mt-1 text-2xl font-bold"
                  style={{ color: 'var(--accent-orange-dark)' }}
                >
                  {formatCurrency(data.couponStats.total_discount_given)}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Margins Tab Content */}
      {activeTab === 'margins' && marginData && (
        <>
          {/* Margin Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Ingresos Totales
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                    {formatCurrency(marginData.summary.total_revenue)}
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--accent-blue-light)' }}
                >
                  <DollarSign className="h-6 w-6" style={{ color: 'var(--accent-blue)' }} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Ganancia Total</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--status-success)' }}>
                    {formatCurrency(marginData.summary.total_profit)}
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--accent-green-light)' }}
                >
                  <TrendingUp className="h-6 w-6" style={{ color: 'var(--accent-green)' }} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Margen Promedio
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                    {marginData.summary.average_margin.toFixed(1)}%
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--accent-purple-light)' }}
                >
                  <Percent className="h-6 w-6" style={{ color: 'var(--accent-purple)' }} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Productos Bajo Margen
                  </p>
                  <p
                    className="mt-1 text-2xl font-bold"
                    style={{
                      color:
                        marginData.summary.low_margin_count > 0
                          ? 'var(--status-warning)'
                          : 'var(--text-primary)',
                    }}
                  >
                    {marginData.summary.low_margin_count}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {`<${marginData.summary.low_margin_threshold}%`}
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--status-warning-light)' }}
                >
                  <AlertTriangle className="h-6 w-6" style={{ color: 'var(--status-warning)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Category Margins Chart */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                Margen por Categoría
              </h3>
              <div className="h-[300px]">
                {marginData.categoryMargins.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marginData.categoryMargins} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <YAxis
                        type="category"
                        dataKey="category_name"
                        tick={{ fontSize: 12 }}
                        width={120}
                      />
                      <Tooltip
                        formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Margen']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                        }}
                      />
                      <Bar dataKey="margin_percentage" fill="var(--chart-2)" radius={[0, 4, 4, 0]}>
                        {marginData.categoryMargins.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.margin_percentage < 15
                                ? 'var(--status-warning)'
                                : 'var(--chart-2)'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--text-secondary)]">
                    No hay datos de categorías
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                Ganancia por Categoría
              </h3>
              <div className="h-[300px]">
                {marginData.categoryMargins.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={marginData.categoryMargins}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="total_profit"
                        nameKey="category_name"
                        label={({ name, percent }) =>
                          `${(name as string)?.substring(0, 10) || ''} ${Math.round((percent || 0) * 100)}%`
                        }
                      >
                        {marginData.categoryMargins.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [formatCurrency(Number(value)), 'Ganancia']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--text-secondary)]">
                    No hay datos de categorías
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Low Margin Products Table */}
          <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-[var(--status-warning)]" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Productos con Menor Margen
              </h3>
            </div>
            {marginData.productMargins.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                        Categoría
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Costo
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Margen
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Vendidos
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Ganancia
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {marginData.productMargins.slice(0, 20).map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{product.name}</p>
                            {product.sku && (
                              <p className="text-xs text-[var(--text-secondary)]">
                                SKU: {product.sku}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[var(--text-secondary)]">
                            {product.category_name || 'Sin categoría'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-[var(--text-primary)]">
                            {formatCurrency(product.base_price)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[var(--text-secondary)]">
                            {formatCurrency(product.cost)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium"
                            style={{
                              backgroundColor:
                                product.margin_percentage < 15
                                  ? 'var(--status-warning-light)'
                                  : 'var(--status-success-light)',
                              color:
                                product.margin_percentage < 15
                                  ? 'var(--status-warning)'
                                  : 'var(--status-success)',
                            }}
                          >
                            {product.margin_percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[var(--text-primary)]">{product.units_sold}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className="font-medium"
                            style={{
                              color:
                                product.total_profit >= 0
                                  ? 'var(--status-success)'
                                  : 'var(--status-error)',
                            }}
                          >
                            {formatCurrency(product.total_profit)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-[var(--text-secondary)]">
                No hay datos de productos
              </div>
            )}
          </div>
        </>
      )}

      {/* Inventory Tab Content */}
      {activeTab === 'inventory' && turnoverData && (
        <>
          {/* Turnover Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Valor Inventario
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                    {formatCurrency(turnoverData.summary.total_inventory_value)}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {turnoverData.summary.total_products} productos
                  </p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--accent-blue-light)' }}
                >
                  <Package className="h-6 w-6" style={{ color: 'var(--accent-blue)' }} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Stock Crítico / Bajo
                  </p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--status-error)' }}>
                    {turnoverData.summary.critical_stock_count} /{' '}
                    {turnoverData.summary.low_stock_count}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">Requieren atención</p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--status-error-light)' }}
                >
                  <PackageX className="h-6 w-6" style={{ color: 'var(--status-error)' }} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Sobrestock / Lento
                  </p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--accent-orange)' }}>
                    {turnoverData.summary.overstocked_count} /{' '}
                    {turnoverData.summary.slow_moving_count}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">Optimizar rotación</p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--accent-orange-light)' }}
                >
                  <TrendingDown className="h-6 w-6" style={{ color: 'var(--accent-orange)' }} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Rotación Promedio
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                    {turnoverData.summary.avg_turnover_ratio.toFixed(2)}x
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">Veces en el período</p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--accent-green-light)' }}
                >
                  <RotateCcw className="h-6 w-6" style={{ color: 'var(--accent-green)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Reorder Suggestions */}
          {turnoverData.reorderSuggestions.length > 0 && (
            <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[var(--status-warning)]" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Sugerencias de Reposición
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                        Prioridad
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Stock Actual
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Punto Reorden
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Días hasta Agotarse
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Cantidad Sugerida
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {turnoverData.reorderSuggestions.map((suggestion) => (
                      <tr key={suggestion.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: PRIORITY_COLORS[suggestion.priority].bg,
                              color: PRIORITY_COLORS[suggestion.priority].text,
                            }}
                          >
                            {suggestion.priority === 'urgent' && 'Urgente'}
                            {suggestion.priority === 'high' && 'Alta'}
                            {suggestion.priority === 'medium' && 'Media'}
                            {suggestion.priority === 'low' && 'Baja'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">
                              {suggestion.name}
                            </p>
                            {suggestion.sku && (
                              <p className="text-xs text-[var(--text-secondary)]">
                                SKU: {suggestion.sku}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className="font-medium"
                            style={{
                              color:
                                suggestion.current_stock === 0
                                  ? 'var(--status-error)'
                                  : 'var(--text-primary)',
                            }}
                          >
                            {suggestion.current_stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[var(--text-secondary)]">
                            {suggestion.reorder_point}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {suggestion.days_until_stockout !== null ? (
                            <span
                              className="font-medium"
                              style={{
                                color:
                                  suggestion.days_until_stockout <= 3
                                    ? 'var(--status-error)'
                                    : suggestion.days_until_stockout <= 7
                                      ? 'var(--status-warning)'
                                      : 'var(--text-primary)',
                              }}
                            >
                              {suggestion.days_until_stockout} días
                            </span>
                          ) : (
                            <span className="text-[var(--text-secondary)]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-[var(--primary)]">
                            +{suggestion.suggested_quantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inventory Status Table */}
          <div className="rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Estado de Inventario por Producto
              </h3>
            </div>
            {turnoverData.productTurnover.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Venta Diaria
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Días Inventario
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Rotación
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {turnoverData.productTurnover.slice(0, 30).map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{
                              backgroundColor:
                                TURNOVER_STATUS_COLORS[product.status]?.bg || 'var(--bg-tertiary)',
                              color:
                                TURNOVER_STATUS_COLORS[product.status]?.text ||
                                'var(--text-secondary)',
                            }}
                          >
                            {product.status === 'critical' && 'Crítico'}
                            {product.status === 'low' && 'Bajo'}
                            {product.status === 'healthy' && 'Saludable'}
                            {product.status === 'overstocked' && 'Sobrestock'}
                            {product.status === 'slow_moving' && 'Lento'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{product.name}</p>
                            {product.category_name && (
                              <p className="text-xs text-[var(--text-secondary)]">
                                {product.category_name}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-[var(--text-primary)]">
                            {product.current_stock}
                          </span>
                          {product.reorder_point && (
                            <span className="block text-xs text-[var(--text-secondary)]">
                              (min: {product.reorder_point})
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[var(--text-primary)]">
                            {product.avg_daily_sales.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {product.days_of_inventory !== null ? (
                            <span
                              className="font-medium"
                              style={{
                                color:
                                  product.days_of_inventory <= 7
                                    ? 'var(--status-error)'
                                    : product.days_of_inventory <= 14
                                      ? 'var(--status-warning)'
                                      : product.days_of_inventory > 180
                                        ? 'var(--accent-purple)'
                                        : 'var(--text-primary)',
                              }}
                            >
                              {product.days_of_inventory}
                            </span>
                          ) : (
                            <span className="text-[var(--text-secondary)]">∞</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[var(--text-primary)]">
                            {product.turnover_ratio.toFixed(2)}x
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-[var(--text-primary)]">
                            {formatCurrency(product.cost_value)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-[var(--text-secondary)]">
                No hay datos de inventario
              </div>
            )}
          </div>
        </>
      )}

      {/* Generated At */}
      <div className="text-center text-sm text-[var(--text-secondary)]">
        Datos actualizados: {new Date(data.generatedAt).toLocaleString('es-PY')}
      </div>
    </div>
  )
}
