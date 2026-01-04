'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Upload,
  FileSpreadsheet,
  ClipboardPaste,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  X,
  Save,
  ChevronDown,
  Trash2,
  Info,
} from 'lucide-react'
import { ClipboardImport } from './clipboard-import'

// =============================================================================
// TYPES
// =============================================================================

export interface ImportMapping {
  id?: string
  name: string
  description?: string
  mapping: Record<string, string> // source column -> target field
}

export interface ParsedRow {
  rowNumber: number
  rawData: Record<string, string>
  mappedData?: Record<string, unknown>
  errors?: string[]
}

export interface PreviewResult {
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
}

interface ImportWizardProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
  clinic: string
}

// Target fields for mapping
const TARGET_FIELDS = [
  { value: '', label: '-- No importar --' },
  { value: 'operation', label: 'Operación (NEW/BUY/ADJ)' },
  { value: 'sku', label: 'SKU' },
  { value: 'barcode', label: 'Código de Barras' },
  { value: 'name', label: 'Nombre del Producto' },
  { value: 'category', label: 'Categoría' },
  { value: 'description', label: 'Descripción' },
  { value: 'price', label: 'Precio de Venta' },
  { value: 'unit_cost', label: 'Costo Unitario' },
  { value: 'quantity', label: 'Cantidad' },
  { value: 'min_stock', label: 'Stock Mínimo' },
  { value: 'expiry_date', label: 'Fecha de Vencimiento' },
  { value: 'batch_number', label: 'Número de Lote' },
]

// =============================================================================
// STEP INDICATORS
// =============================================================================

function StepIndicator({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${idx < currentStep ? 'bg-green-500 text-white' : ''} ${idx === currentStep ? 'bg-[var(--primary)] text-white' : ''} ${idx > currentStep ? 'bg-gray-200 text-gray-400' : ''} `}
          >
            {idx < currentStep ? <Check className="h-4 w-4" /> : idx + 1}
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`mx-2 h-1 w-12 rounded ${idx < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// MAIN WIZARD COMPONENT
// =============================================================================

export function ImportWizard({ isOpen, onClose, onImportComplete, clinic }: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = ['Origen', 'Vista Previa', 'Mapear Columnas', 'Revisar', 'Confirmar']

  // Step 1: Source selection
  const [sourceType, setSourceType] = useState<'file' | 'clipboard' | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [clipboardData, setClipboardData] = useState<string[][] | null>(null)

  // Step 2: Raw data preview
  const [rawHeaders, setRawHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<string[][]>([])
  const [isParsingFile, setIsParsingFile] = useState(false)

  // Step 3: Column mapping
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [savedMappings, setSavedMappings] = useState<ImportMapping[]>([])
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(null)
  const [newMappingName, setNewMappingName] = useState('')
  const [showSaveMapping, setShowSaveMapping] = useState(false)
  const [isSavingMapping, setIsSavingMapping] = useState(false)

  // Step 4: Preview results
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  // Step 5: Import
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  // Load saved mappings
  useEffect(() => {
    if (isOpen) {
      loadSavedMappings()
    }
  }, [isOpen])

  const loadSavedMappings = async () => {
    try {
      const res = await fetch(`/api/inventory/mappings?clinic=${clinic}`)
      if (res.ok) {
        const data = await res.json()
        setSavedMappings(data.mappings || [])
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading mappings:', e)
      }
    }
  }

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)
    setSourceType('file')
    setIsParsingFile(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch('/api/inventory/import/preview?parseOnly=true', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const data = await res.json()
      setRawHeaders(data.headers || [])
      setRawRows(data.rows || [])

      // Auto-detect column mappings
      autoDetectMappings(data.headers || [])
      setCurrentStep(1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al leer el archivo')
    } finally {
      setIsParsingFile(false)
    }
  }

  const handleClipboardData = (headers: string[], rows: string[][]) => {
    setClipboardData([headers, ...rows])
    setRawHeaders(headers)
    setRawRows(rows)
    setSourceType('clipboard')
    autoDetectMappings(headers)
    setCurrentStep(1)
  }

  const autoDetectMappings = (headers: string[]) => {
    const mapping: Record<string, string> = {}
    const patterns: Record<string, RegExp[]> = {
      operation: [/operaci[oó]n/i, /^op$/i, /tipo/i],
      sku: [/sku/i, /c[oó]digo/i, /^id$/i, /product.*id/i],
      barcode: [/barcode/i, /c[oó]digo.*barra/i, /ean/i, /upc/i],
      name: [/nombre/i, /producto/i, /descripci[oó]n.*corta/i, /^name$/i],
      category: [/categor[ií]a/i, /^cat$/i],
      description: [/descripci[oó]n/i, /^desc$/i, /detalle/i],
      price: [/precio.*venta/i, /^precio$/i, /price/i, /venta/i],
      unit_cost: [/costo/i, /cost/i, /precio.*compra/i],
      quantity: [/cantidad/i, /stock/i, /qty/i, /quantity/i],
      min_stock: [/m[ií]nimo/i, /min.*stock/i, /reorder/i],
      expiry_date: [/vencimiento/i, /expir/i, /fecha.*exp/i],
      batch_number: [/lote/i, /batch/i],
    }

    headers.forEach((header, idx) => {
      const headerKey = `col_${idx}`
      for (const [field, regexes] of Object.entries(patterns)) {
        if (regexes.some((regex) => regex.test(header))) {
          if (!Object.values(mapping).includes(field)) {
            mapping[headerKey] = field
            break
          }
        }
      }
    })

    setColumnMapping(mapping)
  }

  const handleMappingChange = (colKey: string, targetField: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [colKey]: targetField,
    }))
    setSelectedMappingId(null) // Clear selected preset when manually changed
  }

  const applyPresetMapping = (mappingId: string) => {
    const preset = savedMappings.find((m) => m.id === mappingId)
    if (preset) {
      setColumnMapping(preset.mapping)
      setSelectedMappingId(mappingId)
    }
  }

  const saveCurrentMapping = async () => {
    if (!newMappingName.trim()) return

    setIsSavingMapping(true)
    try {
      const res = await fetch(`/api/inventory/mappings?clinic=${clinic}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMappingName.trim(),
          mapping: columnMapping,
        }),
      })

      if (res.ok) {
        await loadSavedMappings()
        setNewMappingName('')
        setShowSaveMapping(false)
      } else {
        throw new Error(await res.text())
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar mapeo')
    } finally {
      setIsSavingMapping(false)
    }
  }

  const deleteMapping = async (mappingId: string) => {
    try {
      const res = await fetch(`/api/inventory/mappings/${mappingId}?clinic=${clinic}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await loadSavedMappings()
        if (selectedMappingId === mappingId) {
          setSelectedMappingId(null)
        }
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting mapping:', e)
      }
    }
  }

  const runPreview = async () => {
    setIsLoadingPreview(true)
    setError(null)

    try {
      // Build mapped data from raw rows using current mapping
      const mappedRows = rawRows.map((row, idx) => {
        const mapped: Record<string, string> = {}
        rawHeaders.forEach((_, colIdx) => {
          const colKey = `col_${colIdx}`
          const targetField = columnMapping[colKey]
          if (targetField) {
            mapped[targetField] = row[colIdx] || ''
          }
        })
        return { rowNumber: idx + 2, ...mapped } // +2 for Excel 1-indexed + header row
      })

      const res = await fetch('/api/inventory/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: mappedRows }),
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const data = await res.json()
      setPreviewResult(data)
      setCurrentStep(3)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error en vista previa')
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const executeImport = async () => {
    setIsImporting(true)
    setError(null)

    try {
      // Build mapped data from raw rows
      const mappedRows = rawRows.map((row, idx) => {
        const mapped: Record<string, string> = {}
        rawHeaders.forEach((_, colIdx) => {
          const colKey = `col_${colIdx}`
          const targetField = columnMapping[colKey]
          if (targetField) {
            mapped[targetField] = row[colIdx] || ''
          }
        })
        return mapped
      })

      const res = await fetch('/api/inventory/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: mappedRows }),
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const data = await res.json()
      setImportResult(data)
      setCurrentStep(4)

      // Update mapping usage count if using a preset
      if (selectedMappingId) {
        await fetch(`/api/inventory/mappings/${selectedMappingId}/use?clinic=${clinic}`, {
          method: 'POST',
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error en importación')
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    // Reset all state
    setCurrentStep(0)
    setSourceType(null)
    setFile(null)
    setClipboardData(null)
    setRawHeaders([])
    setRawRows([])
    setColumnMapping({})
    setSelectedMappingId(null)
    setPreviewResult(null)
    setImportResult(null)
    setError(null)
    onClose()
  }

  const handleFinish = () => {
    handleClose()
    onImportComplete()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-100 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Importar Inventario</h2>
            <button onClick={handleClose} className="rounded-lg p-2 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          <StepIndicator currentStep={currentStep} steps={steps} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-red-800">Error</p>
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step 0: Source Selection */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="mb-8 text-center">
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  Elige el origen de los datos
                </h3>
                <p className="text-gray-500">
                  Sube un archivo Excel/CSV o pega datos desde una hoja de cálculo
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* File Upload */}
                <label
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${isParsingFile ? 'bg-[var(--primary)]/5 border-[var(--primary)]' : 'border-gray-200 hover:border-[var(--primary)] hover:bg-gray-50'} `}
                >
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    disabled={isParsingFile}
                  />
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    {isParsingFile ? (
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    ) : (
                      <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                  <h4 className="mb-2 font-bold text-gray-900">Subir Archivo</h4>
                  <p className="mb-4 text-sm text-gray-500">Excel (.xlsx, .xls) o CSV</p>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white">
                    <Upload className="h-4 w-4" />
                    Seleccionar Archivo
                  </span>
                </label>

                {/* Clipboard Paste */}
                <ClipboardImport onDataParsed={handleClipboardData} />
              </div>
            </div>
          )}

          {/* Step 1: Data Preview */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Vista Previa de Datos</h3>
                  <p className="text-sm text-gray-500">
                    {rawRows.length} filas detectadas - {rawHeaders.length} columnas
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border">
                <div className="max-h-[300px] overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        <th className="w-12 px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">
                          #
                        </th>
                        {rawHeaders.map((header, idx) => (
                          <th
                            key={idx}
                            className="whitespace-nowrap px-3 py-2 text-left text-xs font-bold uppercase text-gray-600"
                          >
                            {header || `Columna ${idx + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rawRows.slice(0, 10).map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-mono text-gray-400">{rowIdx + 1}</td>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="max-w-[200px] truncate px-3 py-2">
                              {cell || <span className="text-gray-300">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rawRows.length > 10 && (
                  <div className="border-t bg-gray-50 p-2 text-center text-sm text-gray-500">
                    ... y {rawRows.length - 10} filas más
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Mapear Columnas</h3>
                  <p className="text-sm text-gray-500">
                    Indica a qué campo corresponde cada columna
                  </p>
                </div>

                {/* Saved Mappings Dropdown */}
                {savedMappings.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedMappingId || ''}
                      onChange={(e) => e.target.value && applyPresetMapping(e.target.value)}
                      className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 pr-10 text-sm font-medium"
                    >
                      <option value="">Cargar mapeo guardado...</option>
                      {savedMappings.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Mapping Grid */}
              <div className="grid gap-3">
                {rawHeaders.map((header, idx) => {
                  const colKey = `col_${idx}`
                  return (
                    <div key={idx} className="flex items-center gap-4 rounded-xl bg-gray-50 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">
                          {header || `Columna ${idx + 1}`}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          Ej: {rawRows[0]?.[idx] || '—'}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-gray-300" />
                      <select
                        value={columnMapping[colKey] || ''}
                        onChange={(e) => handleMappingChange(colKey, e.target.value)}
                        className={`w-48 rounded-lg border px-3 py-2 text-sm font-medium ${columnMapping[colKey] ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]' : 'border-gray-200 bg-white text-gray-600'} `}
                      >
                        {TARGET_FIELDS.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>

              {/* Save Mapping */}
              <div className="border-t pt-4">
                {showSaveMapping ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newMappingName}
                      onChange={(e) => setNewMappingName(e.target.value)}
                      placeholder="Nombre del mapeo (ej: Proveedor ABC)"
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm"
                    />
                    <button
                      onClick={saveCurrentMapping}
                      disabled={!newMappingName.trim() || isSavingMapping}
                      className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-white disabled:opacity-50"
                    >
                      {isSavingMapping ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveMapping(false)
                        setNewMappingName('')
                      }}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSaveMapping(true)}
                    className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                  >
                    <Save className="h-4 w-4" />
                    Guardar este mapeo para futuras importaciones
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review Preview */}
          {currentStep === 3 && previewResult && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Revisar Cambios</h3>
                <p className="text-sm text-gray-500">
                  Verifica los cambios antes de confirmar la importación
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <div className="rounded-xl bg-gray-50 p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {previewResult.summary.totalRows}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="rounded-xl bg-green-50 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {previewResult.summary.newProducts}
                  </div>
                  <div className="text-xs text-gray-500">Nuevos</div>
                </div>
                <div className="rounded-xl bg-blue-50 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {previewResult.summary.updates}
                  </div>
                  <div className="text-xs text-gray-500">Actualizaciones</div>
                </div>
                <div className="rounded-xl bg-amber-50 p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {previewResult.summary.adjustments}
                  </div>
                  <div className="text-xs text-gray-500">Ajustes</div>
                </div>
                <div className="rounded-xl bg-red-50 p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {previewResult.summary.errors}
                  </div>
                  <div className="text-xs text-gray-500">Errores</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 text-center">
                  <div className="text-2xl font-bold text-gray-400">
                    {previewResult.summary.skipped}
                  </div>
                  <div className="text-xs text-gray-500">Omitidos</div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="overflow-hidden rounded-xl border">
                <div className="max-h-[300px] overflow-x-auto">
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
                      {previewResult.preview.map((row, idx) => (
                        <tr
                          key={idx}
                          className={
                            row.status === 'error'
                              ? 'bg-red-50'
                              : row.status === 'skip'
                                ? 'bg-gray-50 opacity-60'
                                : ''
                          }
                        >
                          <td className="px-3 py-2 font-mono text-gray-500">{row.rowNumber}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${row.status === 'new' ? 'bg-green-100 text-green-700' : ''} ${row.status === 'update' ? 'bg-blue-100 text-blue-700' : ''} ${row.status === 'adjustment' ? 'bg-amber-100 text-amber-700' : ''} ${row.status === 'error' ? 'bg-red-100 text-red-700' : ''} ${row.status === 'skip' ? 'bg-gray-100 text-gray-500' : ''} `}
                            >
                              {row.status === 'new' && 'Nuevo'}
                              {row.status === 'update' && 'Actualizar'}
                              {row.status === 'adjustment' && 'Ajuste'}
                              {row.status === 'error' && 'Error'}
                              {row.status === 'skip' && 'Omitir'}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono">{row.sku || '—'}</td>
                          <td className="max-w-[200px] truncate px-3 py-2">{row.name || '—'}</td>
                          <td className="px-3 py-2">
                            {row.currentStock !== undefined && row.newStock !== undefined ? (
                              <span className="flex items-center gap-1">
                                <span className="text-gray-400">{row.currentStock}</span>
                                <span className="text-gray-300">→</span>
                                <span
                                  className={
                                    row.newStock > row.currentStock
                                      ? 'font-medium text-green-600'
                                      : 'font-medium text-red-600'
                                  }
                                >
                                  {row.newStock}
                                </span>
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="max-w-[200px] truncate px-3 py-2 text-gray-500">
                            {row.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Import Complete */}
          {currentStep === 4 && importResult && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Importación Completada</h3>
              <p className="mb-6 text-gray-500">
                Se procesaron <strong>{importResult.success}</strong> registros exitosamente
              </p>

              {importResult.errors.length > 0 && (
                <div className="mx-auto max-w-md rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                  <div className="mb-2 flex items-center gap-2 font-medium text-amber-700">
                    <AlertCircle className="h-4 w-4" />
                    Observaciones ({importResult.errors.length})
                  </div>
                  <ul className="max-h-32 list-inside list-disc space-y-1 overflow-y-auto text-sm text-amber-600">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between border-t border-gray-100 bg-gray-50 p-6">
          <button
            onClick={() =>
              currentStep === 0 ? handleClose() : setCurrentStep(Math.max(0, currentStep - 1))
            }
            className="flex items-center gap-2 px-6 py-3 font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep === 0 ? 'Cancelar' : 'Atrás'}
          </button>

          {currentStep < 4 && (
            <button
              onClick={() => {
                if (currentStep === 1) {
                  setCurrentStep(2) // Go to mapping
                } else if (currentStep === 2) {
                  runPreview() // Run preview
                } else if (currentStep === 3) {
                  executeImport() // Execute import
                }
              }}
              disabled={
                currentStep === 0 ||
                (currentStep === 2 && isLoadingPreview) ||
                (currentStep === 3 &&
                  (isImporting ||
                    (previewResult?.summary.newProducts === 0 &&
                      previewResult?.summary.updates === 0 &&
                      previewResult?.summary.adjustments === 0)))
              }
              className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isLoadingPreview || isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : currentStep === 3 ? (
                <Upload className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {currentStep === 2 && (isLoadingPreview ? 'Analizando...' : 'Revisar Cambios')}
              {currentStep === 3 && (isImporting ? 'Importando...' : 'Confirmar Importación')}
              {currentStep === 1 && 'Continuar'}
            </button>
          )}

          {currentStep === 4 && (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
