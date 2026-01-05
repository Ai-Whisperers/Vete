'use client'

import { useState } from 'react'
import {
  Camera,
  X,
  Loader2,
  AlertCircle,
  Check,
  ScanLine,
  Package,
  PackagePlus,
  ClipboardList,
  ArrowRight,
  Minus,
  Plus,
} from 'lucide-react'
import { BarcodeScanner } from './barcode-scanner'

// =============================================================================
// TYPES
// =============================================================================

export type ScannerMode = 'lookup' | 'receive' | 'count'

interface ScannedProduct {
  id: string
  sku: string | null
  name: string
  base_price: number
  stock_quantity: number
  barcode: string
}

interface MultiModeScannerProps {
  isOpen: boolean
  onClose: () => void
  clinic: string
  initialMode?: ScannerMode
  onActionComplete?: (action: {
    mode: ScannerMode
    product: ScannedProduct
    quantity: number
    notes?: string
  }) => void
}

// =============================================================================
// MODE CONFIGURATION
// =============================================================================

const MODE_CONFIG: Record<
  ScannerMode,
  {
    label: string
    icon: typeof Package
    color: string
    bgColor: string
    description: string
    actionLabel: string
  }
> = {
  lookup: {
    label: 'Consultar',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Ver información del producto',
    actionLabel: 'Ver Detalles',
  },
  receive: {
    label: 'Recibir Stock',
    icon: PackagePlus,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Agregar unidades al inventario',
    actionLabel: 'Agregar Stock',
  },
  count: {
    label: 'Conteo Físico',
    icon: ClipboardList,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Registrar conteo de inventario',
    actionLabel: 'Registrar Conteo',
  },
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ModeSelectionScreenProps {
  onModeSelect: (mode: ScannerMode) => void
  onClose: () => void
  continuousMode: boolean
  setContinuousMode: (value: boolean) => void
}

function ModeSelectionScreen({
  onModeSelect,
  onClose,
  continuousMode,
  setContinuousMode,
}: ModeSelectionScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div>
            <h3 className="font-bold text-gray-900">Escáner de Inventario</h3>
            <p className="mt-1 text-sm text-gray-500">Selecciona el modo de operación</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Cerrar escáner">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3 p-4">
          {(Object.keys(MODE_CONFIG) as ScannerMode[]).map((modeKey) => {
            const config = MODE_CONFIG[modeKey]
            const Icon = config.icon
            return (
              <button
                key={modeKey}
                onClick={() => onModeSelect(modeKey)}
                className="flex w-full items-center gap-4 rounded-xl border-2 border-gray-100 p-4 text-left transition-all hover:border-[var(--primary)] hover:bg-gray-50"
              >
                <div className={`rounded-xl p-3 ${config.bgColor}`}>
                  <Icon className={`h-6 w-6 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{config.label}</p>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </button>
            )
          })}
        </div>

        <div className="border-t bg-gray-50 p-4">
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Modo Continuo</p>
              <p className="text-xs text-gray-500">Escanear múltiples productos sin cerrar</p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={continuousMode}
                onChange={(e) => setContinuousMode(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-[var(--primary)]" />
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}

interface ErrorScreenProps {
  notFound: boolean
  error: string | null
  onChangMode: () => void
  onRetry: () => void
}

function ErrorScreen({ notFound, error, onChangMode, onRetry }: ErrorScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-6 text-center">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${notFound ? 'bg-amber-100' : 'bg-red-100'}`}
          >
            {notFound ? (
              <ScanLine className="h-8 w-8 text-amber-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          <h3 className="mb-2 font-bold text-gray-900">
            {notFound ? 'Producto No Encontrado' : 'Error'}
          </h3>
          <p className="text-sm text-gray-500">
            {notFound ? 'No existe un producto con ese código de barras' : error}
          </p>
        </div>

        <div className="flex gap-3 border-t bg-gray-50 p-4">
          <button
            onClick={onChangMode}
            className="flex-1 py-3 font-medium text-gray-500 hover:text-gray-700"
          >
            Cambiar Modo
          </button>
          <button
            onClick={onRetry}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 font-bold text-white hover:opacity-90"
          >
            <Camera className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    </div>
  )
}

interface ActionScreenProps {
  mode: ScannerMode
  product: ScannedProduct
  quantity: number
  setQuantity: (q: number | ((prev: number) => number)) => void
  notes: string
  setNotes: (n: string) => void
  error: string | null
  isSubmitting: boolean
  actionSuccess: boolean
  continuousMode: boolean
  scannedCount: number
  onAction: () => void
  onClose: () => void
  onScanAnother: () => void
}

function ActionScreen({
  mode,
  product,
  quantity,
  setQuantity,
  notes,
  setNotes,
  error,
  isSubmitting,
  actionSuccess,
  continuousMode,
  scannedCount,
  onAction,
  onClose,
  onScanAnother,
}: ActionScreenProps) {
  const config = MODE_CONFIG[mode]
  const Icon = config.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header with mode indicator */}
        <div className={`${config.bgColor} p-4`}>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/80 p-2">
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
              {continuousMode && scannedCount > 0 && (
                <p className="text-xs opacity-70">
                  {scannedCount} producto{scannedCount !== 1 ? 's' : ''} procesado
                  {scannedCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="border-b p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
              <p className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</p>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Stock actual: <span className="font-bold text-gray-900">{product.stock_quantity}</span>
                </span>
                <span className="text-sm text-gray-500">
                  Precio:{' '}
                  <span className="font-bold text-gray-900">
                    {new Intl.NumberFormat('es-PY', {
                      style: 'currency',
                      currency: 'PYG',
                      minimumFractionDigits: 0,
                    }).format(product.base_price)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Form */}
        {mode !== 'lookup' && !actionSuccess && (
          <div className="space-y-4 p-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {mode === 'receive' ? 'Cantidad a agregar' : 'Cantidad contada'}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-gray-200 hover:border-gray-300"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  className="h-12 flex-1 rounded-xl border-2 border-gray-200 text-center text-xl font-bold focus:border-[var(--primary)] focus:outline-none"
                  min={0}
                />
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-gray-200 hover:border-gray-300"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-2 flex gap-2">
                {[1, 5, 10, 25, 50].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuantity(q)}
                    className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
                      quantity === q
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {mode === 'count' && (
                <p className="mt-2 text-sm text-gray-500">
                  Diferencia:{' '}
                  <span
                    className={`font-bold ${
                      quantity - product.stock_quantity > 0
                        ? 'text-green-600'
                        : quantity - product.stock_quantity < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {quantity - product.stock_quantity > 0 ? '+' : ''}
                    {quantity - product.stock_quantity}
                  </span>
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Notas (opcional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={mode === 'receive' ? 'Ej: Factura #1234' : 'Ej: Conteo semanal'}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mr-2 inline h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Success State */}
        {actionSuccess && (
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 font-bold text-gray-900">¡Operación Exitosa!</h3>
            <p className="text-sm text-gray-500">
              {mode === 'receive'
                ? `Se agregaron ${quantity} unidades al stock`
                : `Stock actualizado a ${quantity} unidades`}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3 border-t bg-gray-50 p-4">
          {actionSuccess ? (
            <>
              <button onClick={onClose} className="flex-1 py-3 font-medium text-gray-500 hover:text-gray-700">
                Cerrar
              </button>
              <button
                onClick={onScanAnother}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 font-bold text-white hover:opacity-90"
              >
                <Camera className="h-4 w-4" />
                Escanear Otro
              </button>
            </>
          ) : (
            <>
              <button onClick={onScanAnother} className="flex-1 py-3 font-medium text-gray-500 hover:text-gray-700">
                Cancelar
              </button>
              <button
                onClick={onAction}
                disabled={isSubmitting || (mode !== 'lookup' && quantity < 1)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 font-bold text-white hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {config.actionLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Multi-mode barcode scanner for inventory operations
 * Supports: Lookup, Receive Stock, and Physical Count modes
 */
export function MultiModeScanner({
  isOpen,
  onClose,
  clinic,
  initialMode = 'lookup',
  onActionComplete,
}: MultiModeScannerProps) {
  const [mode, setMode] = useState<ScannerMode>(initialMode)
  const [step, setStep] = useState<'select-mode' | 'scanning' | 'action'>('select-mode')
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  // Action form state
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionSuccess, setActionSuccess] = useState(false)

  // Continuous scanning for batch operations
  const [continuousMode, setContinuousMode] = useState(false)
  const [scannedCount, setScannedCount] = useState(0)

  const resetState = () => {
    setScannedProduct(null)
    setError(null)
    setNotFound(false)
    setQuantity(1)
    setNotes('')
    setIsSubmitting(false)
    setActionSuccess(false)
  }

  const handleModeSelect = (selectedMode: ScannerMode) => {
    setMode(selectedMode)
    setStep('scanning')
    resetState()
  }

  const handleScan = async (barcode: string) => {
    setIsSearching(true)
    setError(null)
    setNotFound(false)

    try {
      const res = await fetch(
        `/api/inventory/barcode-lookup?barcode=${encodeURIComponent(barcode)}&clinic=${clinic}`
      )

      if (res.status === 404) {
        setNotFound(true)
        return
      }

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const product = await res.json()
      setScannedProduct({ ...product, barcode })
      setStep('action')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al buscar producto')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAction = async () => {
    if (!scannedProduct) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (mode === 'lookup') {
        onActionComplete?.({ mode, product: scannedProduct, quantity: 0 })
        handleClose()
        return
      }

      const endpoint = mode === 'receive' ? '/api/inventory/receive' : '/api/inventory/adjust'

      const body =
        mode === 'receive'
          ? {
              product_id: scannedProduct.id,
              quantity: quantity,
              notes: notes || `Recepción via escáner - ${scannedProduct.barcode}`,
            }
          : {
              product_id: scannedProduct.id,
              new_quantity: quantity,
              reason: 'physical_count',
              notes: notes || `Conteo físico via escáner - ${scannedProduct.barcode}`,
            }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.details?.message || 'Error al procesar')
      }

      setActionSuccess(true)
      setScannedCount((c) => c + 1)

      onActionComplete?.({ mode, product: scannedProduct, quantity, notes })

      if (continuousMode) {
        setTimeout(() => {
          resetState()
          setStep('scanning')
        }, 1500)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep('select-mode')
    setMode(initialMode)
    resetState()
    setScannedCount(0)
    setContinuousMode(false)
    onClose()
  }

  const handleScanAnother = () => {
    resetState()
    setStep('scanning')
  }

  if (!isOpen) return null

  // Mode selection screen
  if (step === 'select-mode') {
    return (
      <ModeSelectionScreen
        onModeSelect={handleModeSelect}
        onClose={handleClose}
        continuousMode={continuousMode}
        setContinuousMode={setContinuousMode}
      />
    )
  }

  // Scanning screen
  if (step === 'scanning') {
    const config = MODE_CONFIG[mode]

    if (isSearching) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[var(--primary)]" />
            <p className="font-medium text-gray-900">Buscando producto...</p>
          </div>
        </div>
      )
    }

    if (notFound || error) {
      return (
        <ErrorScreen
          notFound={notFound}
          error={error}
          onChangMode={() => setStep('select-mode')}
          onRetry={() => {
            setError(null)
            setNotFound(false)
          }}
        />
      )
    }

    return (
      <BarcodeScanner
        isOpen={true}
        onClose={() => setStep('select-mode')}
        onScan={handleScan}
        title={config.label}
        description={config.description}
      />
    )
  }

  // Action screen
  if (step === 'action' && scannedProduct) {
    return (
      <ActionScreen
        mode={mode}
        product={scannedProduct}
        quantity={quantity}
        setQuantity={setQuantity}
        notes={notes}
        setNotes={setNotes}
        error={error}
        isSubmitting={isSubmitting}
        actionSuccess={actionSuccess}
        continuousMode={continuousMode}
        scannedCount={scannedCount}
        onAction={handleAction}
        onClose={handleClose}
        onScanAnother={handleScanAnother}
      />
    )
  }

  return null
}
