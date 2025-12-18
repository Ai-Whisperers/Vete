'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircle,
  ArrowDown,
  ArrowUp,
  ArrowDownToLine,
  ArrowUpToLine,
  Minus,
  TrendingUp,
  TrendingDown,
  Loader2,
  FileText,
  Download,
  AlertTriangle,
  Clock
} from 'lucide-react'

interface LabResult {
  id: string
  value_numeric?: number
  value_text?: string
  flag?: string
  verified_at?: string
  verified_by?: string
  result_date: string
  order_item: {
    test: {
      id: string
      code: string
      name: string
      unit: string
    }
  }
}

interface HistoricalResult {
  date: string
  value: number
  flag: string
}

interface ResultViewerProps {
  orderId: string
  petId?: string
  showHistory?: boolean
  onDownloadPdf?: () => void
}

type ResultFlag = 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high'

export function ResultViewer({ orderId, petId, showHistory = true, onDownloadPdf }: ResultViewerProps) {
  const [results, setResults] = useState<LabResult[]>([])
  const [historicalData, setHistoricalData] = useState<Record<string, HistoricalResult[]>>({})
  const [loading, setLoading] = useState(true)
  const [expandedTest, setExpandedTest] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchResults()
    if (showHistory && petId) {
      fetchHistoricalData()
    }
  }, [orderId, petId, showHistory])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('lab_results')
        .select(`
          id,
          value_numeric,
          value_text,
          flag,
          verified_at,
          verified_by,
          result_date,
          lab_order_items!inner(
            test:lab_test_catalog!inner(id, code, name, unit),
            order:lab_orders!inner(id)
          )
        `)
        .eq('lab_order_items.order.id', orderId)
        .order('result_date', { ascending: false })

      const formattedResults = data?.map(r => ({
        id: r.id,
        value_numeric: r.value_numeric,
        value_text: r.value_text,
        flag: r.flag,
        verified_at: r.verified_at,
        verified_by: r.verified_by,
        result_date: r.result_date,
        order_item: {
          test: r.lab_order_items.test
        }
      })) || []

      setResults(formattedResults)
    } catch {
      // Error fetching results - silently fail
    } finally {
      setLoading(false)
    }
  }

  const fetchHistoricalData = async () => {
    if (!petId) return

    try {
      const testIds = results.map(r => r.order_item.test.id)

      const { data } = await supabase
        .from('lab_results')
        .select(`
          id,
          value_numeric,
          flag,
          result_date,
          lab_order_items!inner(
            test_id,
            order:lab_orders!inner(pet_id)
          )
        `)
        .eq('lab_order_items.order.pet_id', petId)
        .in('lab_order_items.test_id', testIds)
        .not('value_numeric', 'is', null)
        .order('result_date', { ascending: true })
        .limit(50)

      const grouped: Record<string, HistoricalResult[]> = {}
      data?.forEach(result => {
        const testId = result.lab_order_items.test_id
        if (!grouped[testId]) grouped[testId] = []
        if (result.value_numeric !== null) {
          grouped[testId].push({
            date: result.result_date,
            value: result.value_numeric,
            flag: result.flag || 'normal'
          })
        }
      })

      setHistoricalData(grouped)
    } catch {
      // Error fetching historical data - silently fail
    }
  }

  const getFlagColor = (flag?: string): string => {
    switch (flag) {
      case 'normal':
        return 'text-[var(--status-success,#16a34a)] bg-[var(--status-success-bg,#dcfce7)] border-[var(--status-success,#22c55e)]/30'
      case 'low':
      case 'high':
        return 'text-[var(--status-warning-dark,#a16207)] bg-[var(--status-warning-bg,#fef3c7)] border-[var(--status-warning,#eab308)]/30'
      case 'critical_low':
      case 'critical_high':
        return 'text-[var(--status-error,#dc2626)] bg-[var(--status-error-bg,#fee2e2)] border-[var(--status-error,#ef4444)]/30'
      default:
        return 'text-[var(--text-secondary)] bg-[var(--bg-subtle)] border-[var(--border,#e5e7eb)]'
    }
  }

  const getFlagIcon = (flag?: string) => {
    switch (flag) {
      case 'normal':
        return <CheckCircle className="w-5 h-5" />
      case 'low':
        return <ArrowDown className="w-5 h-5" />
      case 'high':
        return <ArrowUp className="w-5 h-5" />
      case 'critical_low':
        return <ArrowDownToLine className="w-5 h-5" />
      case 'critical_high':
        return <ArrowUpToLine className="w-5 h-5" />
      default:
        return <Minus className="w-5 h-5" />
    }
  }

  const getFlagLabel = (flag?: string): string => {
    switch (flag) {
      case 'normal':
        return 'Normal'
      case 'low':
        return 'Bajo'
      case 'high':
        return 'Alto'
      case 'critical_low':
        return 'Crítico Bajo'
      case 'critical_high':
        return 'Crítico Alto'
      default:
        return 'Sin evaluar'
    }
  }

  const renderTrendIndicator = (testId: string, currentValue?: number) => {
    const history = historicalData[testId]
    if (!history || history.length < 2 || currentValue === undefined) return null

    const previousValue = history[history.length - 2]?.value
    if (previousValue === undefined) return null

    const percentChange = ((currentValue - previousValue) / previousValue) * 100
    const isIncreasing = currentValue > previousValue
    const isSignificant = Math.abs(percentChange) > 10

    if (!isSignificant) {
      return (
        <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
          <Minus className="w-3 h-3" />
          Estable
        </span>
      )
    }

    return (
      <span className={`text-xs flex items-center gap-1 ${isIncreasing ? 'text-[var(--status-error,#dc2626)]' : 'text-[var(--status-info,#2563eb)]'}`}>
        {isIncreasing ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        {Math.abs(percentChange).toFixed(1)}%
      </span>
    )
  }

  const renderMiniChart = (history: HistoricalResult[]) => {
    if (history.length < 2) return null

    const values = history.map(h => h.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min

    return (
      <div className="h-12 flex items-end gap-1">
        {history.map((point, idx) => {
          const height = range > 0 ? ((point.value - min) / range) * 100 : 50
          const color = point.flag === 'normal' ? 'bg-green-500' :
                       point.flag === 'low' || point.flag === 'high' ? 'bg-yellow-500' :
                       'bg-red-500'

          return (
            <div
              key={idx}
              className={`flex-1 ${color} rounded-t transition-all hover:opacity-75`}
              style={{ height: `${height}%` }}
              title={`${point.date}: ${point.value}`}
            />
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--bg-subtle)] rounded-xl">
        <FileText className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)]" />
        <p className="text-[var(--text-secondary)]">No hay resultados disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      {onDownloadPdf && (
        <div className="flex justify-end">
          <button
            onClick={onDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                  Prueba
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                  Resultado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                  Unidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                  Estado
                </th>
                {showHistory && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                    Tendencia
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                  Verificado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map(result => {
                const testId = result.order_item.test.id
                const history = historicalData[testId] || []
                const isExpanded = expandedTest === testId

                return (
                  <>
                    <tr
                      key={result.id}
                      className={`hover:bg-gray-50 cursor-pointer ${getFlagColor(result.flag)} bg-opacity-30`}
                      onClick={() => showHistory && history.length > 0 && setExpandedTest(isExpanded ? null : testId)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-[var(--text-primary)]">
                            {result.order_item.test.name}
                          </div>
                          <div className="text-sm text-[var(--text-secondary)]">
                            {result.order_item.test.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {result.value_numeric !== null && result.value_numeric !== undefined
                            ? result.value_numeric.toFixed(2)
                            : result.value_text || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">
                        {result.order_item.test.unit || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getFlagColor(result.flag)}`}>
                          {getFlagIcon(result.flag)}
                          {getFlagLabel(result.flag)}
                        </span>
                      </td>
                      {showHistory && (
                        <td className="px-6 py-4">
                          {renderTrendIndicator(testId, result.value_numeric || undefined)}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        {result.verified_at ? (
                          <div className="flex items-center gap-2 text-sm text-[var(--status-success,#16a34a)]">
                            <CheckCircle className="w-4 h-4" />
                            Sí
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <Clock className="w-4 h-4" />
                            Pendiente
                          </div>
                        )}
                      </td>
                    </tr>
                    {isExpanded && history.length > 0 && (
                      <tr>
                        <td colSpan={showHistory ? 6 : 5} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                              Historial (últimos {history.length} resultados)
                            </h4>
                            {renderMiniChart(history)}
                            <div className="grid grid-cols-6 gap-2 text-xs">
                              {history.slice(-6).map((point, idx) => (
                                <div key={idx} className="text-center">
                                  <div className="text-[var(--text-secondary)]">
                                    {new Date(point.date).toLocaleDateString('es-PY', { month: 'short', day: 'numeric' })}
                                  </div>
                                  <div className="font-semibold text-[var(--text-primary)]">
                                    {point.value.toFixed(1)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Values Warning */}
      {results.some(r => r.flag === 'critical_low' || r.flag === 'critical_high') && (
        <div className="flex items-start gap-3 p-4 bg-[var(--status-error-bg,#fee2e2)] border border-[var(--status-error,#ef4444)]/30 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-[var(--status-error,#dc2626)] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-[var(--status-error,#dc2626)] mb-1">Valores Críticos Detectados</h4>
            <p className="text-sm text-[var(--status-error,#dc2626)]/80">
              Esta orden contiene valores críticos que requieren atención inmediata del veterinario.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
