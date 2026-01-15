'use client'

import { useState } from 'react'
import { Loader2, Download, FileText } from 'lucide-react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'

// Types matching the analytics API export types
export type ExportType = 'revenue' | 'appointments' | 'clients' | 'services' | 'inventory' | 'customers'

export interface ExportColumn {
  key: string
  header: string
}

export interface AnalyticsExportData {
  type: ExportType
  title: string
  columns: ExportColumn[]
  data: Record<string, unknown>[]
  period: {
    startDate: string
    endDate: string
  }
  clinicName: string
  generatedAt: string
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  reportInfo: {
    textAlign: 'right',
  },
  reportType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  dateRange: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  generatedAt: {
    fontSize: 8,
    color: '#999',
    marginTop: 2,
  },
  summarySection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a2e',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#666',
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    padding: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 9,
    color: 'white',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#999',
  },
  pageNumber: {
    fontSize: 8,
    color: '#666',
  },
  noData: {
    textAlign: 'center',
    padding: 40,
    color: '#666',
    fontSize: 12,
  },
})

// Helper to get nested value from object
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

// Format value for display in PDF
function formatValue(value: unknown, key: string): string {
  if (value === null || value === undefined) return '-'

  // Currency formatting
  if (key.includes('price') || key.includes('total') || key.includes('amount') || key.includes('revenue') || key.includes('cost')) {
    const num = typeof value === 'number' ? value : parseFloat(String(value)) || 0
    return `Gs ${num.toLocaleString('es-PY')}`
  }

  // Date formatting
  if (key.includes('date') || key.includes('_at') || key.includes('time')) {
    const date = new Date(String(value))
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('es-PY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(key.includes('time') && { hour: '2-digit', minute: '2-digit' }),
      })
    }
  }

  // Boolean formatting
  if (typeof value === 'boolean') {
    return value ? 'Si' : 'No'
  }

  return String(value)
}

// Report title mapping
const reportTitles: Record<ExportType, string> = {
  revenue: 'Reporte de Ingresos',
  appointments: 'Reporte de Citas',
  clients: 'Reporte de Clientes',
  services: 'Reporte de Servicios',
  inventory: 'Reporte de Inventario',
  customers: 'Reporte de Segmentacion de Clientes',
}

// PDF Document Component
export function AnalyticsPDFDocument({ exportData }: { exportData: AnalyticsExportData }) {
  const { type, title, columns, data, period, clinicName, generatedAt } = exportData

  // Calculate summary stats
  const totalRecords = data.length

  // Calculate totals for numeric columns
  const numericSummary: { label: string; value: string }[] = []

  if (type === 'revenue') {
    const totalRevenue = data.reduce((sum, row) => {
      const val = getNestedValue(row, 'total')
      return sum + (typeof val === 'number' ? val : parseFloat(String(val)) || 0)
    }, 0)
    numericSummary.push({ label: 'Ingresos Totales', value: `Gs ${totalRevenue.toLocaleString('es-PY')}` })
  }

  if (type === 'inventory') {
    const totalStock = data.reduce((sum, row) => {
      const val = getNestedValue(row, 'inventory.stock_quantity')
      return sum + (typeof val === 'number' ? val : parseInt(String(val)) || 0)
    }, 0)
    numericSummary.push({ label: 'Stock Total', value: totalStock.toLocaleString('es-PY') })
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{clinicName}</Text>
            <Text style={styles.subtitle}>Sistema de Gestion Veterinaria</Text>
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportType}>{title || reportTitles[type]}</Text>
            <Text style={styles.dateRange}>
              {period.startDate} - {period.endDate}
            </Text>
            <Text style={styles.generatedAt}>Generado: {generatedAt}</Text>
          </View>
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Resumen</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de Registros:</Text>
            <Text style={styles.summaryValue}>{totalRecords}</Text>
          </View>
          {numericSummary.map((item, index) => (
            <View key={index} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{item.label}:</Text>
              <Text style={styles.summaryValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Data Table */}
        {data.length > 0 ? (
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              {columns.map((col, index) => (
                <Text key={index} style={styles.tableCellHeader}>
                  {col.header}
                </Text>
              ))}
            </View>

            {/* Table Rows - limit to 50 for performance */}
            {data.slice(0, 50).map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={rowIndex % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                {columns.map((col, colIndex) => (
                  <Text key={colIndex} style={styles.tableCell}>
                    {formatValue(getNestedValue(row, col.key), col.key)}
                  </Text>
                ))}
              </View>
            ))}

            {data.length > 50 && (
              <View style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, fontStyle: 'italic', color: '#666' }}>
                  ... y {data.length - 50} registros mas
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.noData}>No hay datos para el periodo seleccionado</Text>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {clinicName} - Reporte generado automaticamente
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}

// Download Button Component
interface AnalyticsPDFButtonProps {
  exportType: ExportType
  startDate: string
  endDate: string
  clinicName: string
  variant?: 'button' | 'icon'
  className?: string
}

export function AnalyticsPDFButton({
  exportType,
  startDate,
  endDate,
  clinicName,
  variant = 'button',
  className = '',
}: AnalyticsPDFButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      // Fetch data from API
      const params = new URLSearchParams({
        type: exportType,
        format: 'json', // We'll request JSON and generate PDF client-side
        startDate,
        endDate,
      })

      const response = await fetch(`/api/analytics/export?${params}`)

      if (!response.ok) {
        throw new Error('Error al obtener datos')
      }

      const result = await response.json()

      // If API returns the data structure we need
      const exportData: AnalyticsExportData = {
        type: exportType,
        title: reportTitles[exportType],
        columns: result.columns || getDefaultColumns(exportType),
        data: result.data || [],
        period: { startDate, endDate },
        clinicName,
        generatedAt: new Date().toLocaleString('es-PY'),
      }

      // Generate PDF
      const blob = await pdf(<AnalyticsPDFDocument exportData={exportData} />).toBlob()

      // Trigger download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${exportType}-${startDate}-${endDate}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      // Fallback: try CSV export
      window.open(`/api/analytics/export?type=${exportType}&format=csv&startDate=${startDate}&endDate=${endDate}`)
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 transition-colors hover:bg-gray-100 disabled:opacity-50 ${className}`}
        title="Descargar PDF"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-[var(--text-secondary)]" />
        ) : (
          <FileText className="h-5 w-5 text-[var(--text-secondary)]" />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-[var(--text-primary)] hover:bg-gray-50 disabled:opacity-50 ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Exportar PDF
    </button>
  )
}

// Default columns for each export type
function getDefaultColumns(type: ExportType): ExportColumn[] {
  const columnMap: Record<ExportType, ExportColumn[]> = {
    revenue: [
      { key: 'invoice_number', header: 'Nro. Factura' },
      { key: 'client.full_name', header: 'Cliente' },
      { key: 'total', header: 'Total' },
      { key: 'status', header: 'Estado' },
      { key: 'created_at', header: 'Fecha' },
    ],
    appointments: [
      { key: 'start_time', header: 'Fecha/Hora' },
      { key: 'pet.name', header: 'Mascota' },
      { key: 'service.name', header: 'Servicio' },
      { key: 'vet.full_name', header: 'Veterinario' },
      { key: 'status', header: 'Estado' },
    ],
    clients: [
      { key: 'full_name', header: 'Nombre' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Telefono' },
      { key: 'created_at', header: 'Fecha Registro' },
    ],
    services: [
      { key: 'name', header: 'Servicio' },
      { key: 'category', header: 'Categoria' },
      { key: 'base_price', header: 'Precio Base' },
      { key: 'duration_minutes', header: 'Duracion (min)' },
      { key: 'is_active', header: 'Activo' },
    ],
    inventory: [
      { key: 'sku', header: 'SKU' },
      { key: 'name', header: 'Producto' },
      { key: 'base_price', header: 'Precio' },
      { key: 'inventory.stock_quantity', header: 'Stock' },
      { key: 'inventory.reorder_point', header: 'Punto Reorden' },
    ],
    customers: [
      { key: 'full_name', header: 'Cliente' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Telefono' },
      { key: 'created_at', header: 'Cliente desde' },
    ],
  }

  return columnMap[type] || []
}

// Export modal component for selecting export options
interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  clinicName: string
  defaultType?: ExportType
}

export function AnalyticsExportModal({
  isOpen,
  onClose,
  clinicName,
  defaultType = 'revenue',
}: ExportModalProps) {
  const [exportType, setExportType] = useState<ExportType>(defaultType)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf')
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      if (format === 'csv') {
        // Direct CSV download
        window.location.href = `/api/analytics/export?type=${exportType}&format=csv&startDate=${startDate}&endDate=${endDate}`
      } else {
        // PDF generation (will be handled by AnalyticsPDFButton internally)
        const params = new URLSearchParams({
          type: exportType,
          format: 'json',
          startDate,
          endDate,
        })

        const response = await fetch(`/api/analytics/export?${params}`)

        if (!response.ok) {
          throw new Error('Error al obtener datos')
        }

        const result = await response.json()

        const exportData: AnalyticsExportData = {
          type: exportType,
          title: reportTitles[exportType],
          columns: result.columns || getDefaultColumns(exportType),
          data: result.data || [],
          period: { startDate, endDate },
          clinicName,
          generatedAt: new Date().toLocaleString('es-PY'),
        }

        const blob = await pdf(<AnalyticsPDFDocument exportData={exportData} />).toBlob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${exportType}-${startDate}-${endDate}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
      onClose()
    } catch {
      // Error handled silently - could add toast notification
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-[var(--text-primary)]">
          Exportar Datos
        </h2>

        {/* Export Type */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Tipo de Reporte
          </label>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value as ExportType)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="revenue">Ingresos</option>
            <option value="appointments">Citas</option>
            <option value="clients">Clientes</option>
            <option value="services">Servicios</option>
            <option value="inventory">Inventario</option>
            <option value="customers">Segmentacion de Clientes</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
        </div>

        {/* Format */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Formato
          </label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                value="pdf"
                checked={format === 'pdf'}
                onChange={() => setFormat('pdf')}
                className="text-[var(--primary)]"
              />
              <span className="text-sm">PDF</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                value="csv"
                checked={format === 'csv'}
                onChange={() => setFormat('csv')}
                className="text-[var(--primary)]"
              />
              <span className="text-sm">CSV</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-[var(--text-secondary)] hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Exportar
          </button>
        </div>
      </div>
    </div>
  )
}
