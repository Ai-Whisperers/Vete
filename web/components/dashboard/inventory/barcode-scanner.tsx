'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Camera,
  X,
  Loader2,
  AlertCircle,
  Check,
  Keyboard,
  ScanLine,
  Package,
  PackagePlus,
  ClipboardList,
  ShoppingCart,
  ArrowRight,
  Minus,
  Plus,
} from 'lucide-react'

// Local type definition for html5-qrcode (avoids bundling issues)
// The actual library is dynamically imported in startScanner()
interface Html5QrcodeInstance {
  start(
    cameraId: string | { facingMode: string },
    config: { fps: number; qrbox: { width: number; height: number }; aspectRatio?: number },
    onSuccess: (decodedText: string) => void,
    onError?: (error: string) => void
  ): Promise<null>
  stop(): Promise<void>
  clear(): void
}

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (barcode: string) => void
  title?: string
  description?: string
}

interface ProductResult {
  id: string
  sku: string
  name: string
  base_price: number
  stock_quantity: number
}

interface BarcodeScanModalProps {
  isOpen: boolean
  onClose: () => void
  onProductFound: (product: ProductResult, barcode: string) => void
  clinic: string
}

/**
 * Camera-based barcode scanner using html5-qrcode
 * Supports EAN-13, UPC-A, Code128 and other common formats
 */
export function BarcodeScanner({
  isOpen,
  onClose,
  onScan,
  title = 'Escanear Código de Barras',
  description,
}: BarcodeScannerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const scannerRef = useRef<Html5QrcodeInstance | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      // Dynamically import html5-qrcode (client-side only)
      const { Html5Qrcode } = await import('html5-qrcode')

      // Clear any existing scanner
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop()
          scannerRef.current.clear()
        } catch {
          // Ignore cleanup errors
        }
      }

      const html5Qrcode = new Html5Qrcode('barcode-scanner-container')
      scannerRef.current = html5Qrcode

      await html5Qrcode.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          // Barcode scanned successfully
          onScan(decodedText)
        },
        (errorMessage) => {
          // Scan error - ignore, keep scanning
          console.debug('Scanning...', errorMessage)
        }
      )

      setIsLoading(false)
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Camera error:', e)
      }
      setError(
        e instanceof Error
          ? e.message.includes('NotAllowedError') || e.message.includes('Permission')
            ? 'Permiso de cámara denegado. Por favor permite el acceso a la cámara.'
            : e.message.includes('NotFoundError')
              ? 'No se encontró cámara en este dispositivo.'
              : e.message
          : 'Error al iniciar la cámara'
      )
      setIsLoading(false)
      setManualMode(true)
    }
  }, [onScan])

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch {
        // Ignore cleanup errors
      }
      scannerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isOpen && !manualMode) {
      startScanner()
    }

    return () => {
      stopScanner()
    }
  }, [isOpen, manualMode, startScanner, stopScanner])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      onScan(manualInput.trim())
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          <button
            onClick={() => {
              stopScanner()
              onClose()
            }}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {manualMode ? (
            /* Manual Entry Mode */
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Keyboard className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Ingresa el código de barras manualmente</p>
              </div>

              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Ej: 7891234567890"
                className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 px-4 py-3 text-center font-mono text-lg outline-none focus:border-[var(--primary)] focus:ring-2"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setManualMode(false)
                    setManualInput('')
                  }}
                  className="flex flex-1 items-center justify-center gap-2 py-3 font-medium text-gray-500 hover:text-gray-700"
                >
                  <Camera className="h-4 w-4" />
                  Usar Cámara
                </button>
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 font-bold text-white hover:opacity-90 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  Buscar
                </button>
              </div>
            </form>
          ) : (
            /* Camera Mode */
            <div className="space-y-4">
              {/* Scanner Container */}
              <div
                ref={containerRef}
                className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black"
              >
                <div id="barcode-scanner-container" className="h-full w-full" />

                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
                      <p className="text-sm">Iniciando cámara...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
                    <div className="text-center text-white">
                      <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Scan Guide Overlay */}
                {!isLoading && !error && (
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative h-24 w-64 rounded-lg border-2 border-white/50">
                        {/* Corner marks */}
                        <div className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-[var(--primary)]" />
                        <div className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-[var(--primary)]" />
                        <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-[var(--primary)]" />
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-[var(--primary)]" />
                        {/* Scan line animation */}
                        <div className="absolute left-0 right-0 top-1/2 h-0.5 animate-pulse bg-red-500/70" />
                      </div>
                    </div>
                    <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-white">
                      Centra el código de barras en el recuadro
                    </p>
                  </div>
                )}
              </div>

              {/* Manual entry button */}
              <button
                onClick={() => setManualMode(true)}
                className="flex w-full items-center justify-center gap-2 py-3 font-medium text-gray-500 hover:text-gray-700"
              >
                <Keyboard className="h-4 w-4" />
                Ingresar código manualmente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Complete barcode scan modal with product lookup
 * Shows scanner, looks up product, and returns result
 */
export function BarcodeScanModal({
  isOpen,
  onClose,
  onProductFound,
  clinic,
}: BarcodeScanModalProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async (barcode: string) => {
    setScannedBarcode(barcode)
    setIsSearching(true)
    setNotFound(false)
    setError(null)

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
      onProductFound(product, barcode)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al buscar producto')
    } finally {
      setIsSearching(false)
    }
  }

  const handleClose = () => {
    setScannedBarcode(null)
    setNotFound(false)
    setError(null)
    onClose()
  }

  const handleScanAgain = () => {
    setScannedBarcode(null)
    setNotFound(false)
    setError(null)
  }

  if (!isOpen) return null

  // Show result screen if we have a scanned barcode
  if (scannedBarcode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="p-6 text-center">
            {isSearching ? (
              <div>
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[var(--primary)]" />
                <p className="font-medium text-gray-900">Buscando producto...</p>
                <p className="mt-1 font-mono text-sm text-gray-500">{scannedBarcode}</p>
              </div>
            ) : notFound ? (
              <div>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  <ScanLine className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="mb-2 font-bold text-gray-900">Producto No Encontrado</h3>
                <p className="mb-1 text-sm text-gray-500">
                  No se encontró un producto con el código:
                </p>
                <p className="font-mono text-lg text-gray-900">{scannedBarcode}</p>
              </div>
            ) : error ? (
              <div>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="mb-2 font-bold text-gray-900">Error</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : null}
          </div>

          {!isSearching && (notFound || error) && (
            <div className="flex gap-3 border-t bg-gray-50 p-6">
              <button
                onClick={handleClose}
                className="flex-1 py-3 font-medium text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleScanAgain}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 font-bold text-white hover:opacity-90"
              >
                <Camera className="h-4 w-4" />
                Escanear Otro
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <BarcodeScanner
      isOpen={isOpen}
      onClose={handleClose}
      onScan={handleScan}
      title="Escanear Producto"
      description="Escanea el código de barras para buscar el producto"
    />
  )
}

// =============================================================================
// MULTI-MODE BARCODE SCANNER
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
        // Just notify and close
        onActionComplete?.({
          mode,
          product: scannedProduct,
          quantity: 0,
        })
        handleClose()
        return
      }

      // For receive and count modes, call API
      const endpoint =
        mode === 'receive'
          ? '/api/inventory/receive'
          : '/api/inventory/adjust'

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

      onActionComplete?.({
        mode,
        product: scannedProduct,
        quantity,
        notes,
      })

      // If continuous mode, go back to scanning after delay
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <div>
              <h3 className="font-bold text-gray-900">Escáner de Inventario</h3>
              <p className="mt-1 text-sm text-gray-500">Selecciona el modo de operación</p>
            </div>
            <button onClick={handleClose} className="rounded-lg p-2 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3 p-4">
            {(Object.keys(MODE_CONFIG) as ScannerMode[]).map((modeKey) => {
              const config = MODE_CONFIG[modeKey]
              const Icon = config.icon
              return (
                <button
                  key={modeKey}
                  onClick={() => handleModeSelect(modeKey)}
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

          {/* Continuous mode toggle */}
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

  // Scanning screen
  if (step === 'scanning') {
    const config = MODE_CONFIG[mode]

    // Show searching state
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

    // Show not found / error state
    if (notFound || error) {
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
                {notFound
                  ? 'No existe un producto con ese código de barras'
                  : error}
              </p>
            </div>

            <div className="flex gap-3 border-t bg-gray-50 p-4">
              <button
                onClick={() => setStep('select-mode')}
                className="flex-1 py-3 font-medium text-gray-500 hover:text-gray-700"
              >
                Cambiar Modo
              </button>
              <button
                onClick={() => {
                  setError(null)
                  setNotFound(false)
                }}
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
                <h3 className="font-bold text-gray-900 truncate">{scannedProduct.name}</h3>
                <p className="text-sm text-gray-500">SKU: {scannedProduct.sku || 'N/A'}</p>
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Stock actual:{' '}
                    <span className="font-bold text-gray-900">{scannedProduct.stock_quantity}</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    Precio:{' '}
                    <span className="font-bold text-gray-900">
                      {new Intl.NumberFormat('es-PY', {
                        style: 'currency',
                        currency: 'PYG',
                        minimumFractionDigits: 0,
                      }).format(scannedProduct.base_price)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Form */}
          {mode !== 'lookup' && !actionSuccess && (
            <div className="space-y-4 p-4">
              {/* Quantity Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {mode === 'receive' ? 'Cantidad a agregar' : 'Cantidad contada'}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-gray-200 hover:border-gray-300"
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
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                {/* Quick quantity buttons */}
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

                {/* Show resulting stock for count mode */}
                {mode === 'count' && (
                  <p className="mt-2 text-sm text-gray-500">
                    Diferencia:{' '}
                    <span
                      className={`font-bold ${
                        quantity - scannedProduct.stock_quantity > 0
                          ? 'text-green-600'
                          : quantity - scannedProduct.stock_quantity < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {quantity - scannedProduct.stock_quantity > 0 ? '+' : ''}
                      {quantity - scannedProduct.stock_quantity}
                    </span>
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Notas (opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    mode === 'receive' ? 'Ej: Factura #1234' : 'Ej: Conteo semanal'
                  }
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
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 font-medium text-gray-500 hover:text-gray-700"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleScanAnother}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 font-bold text-white hover:opacity-90"
                >
                  <Camera className="h-4 w-4" />
                  Escanear Otro
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleScanAnother}
                  className="flex-1 py-3 font-medium text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAction}
                  disabled={isSubmitting || (mode !== 'lookup' && quantity < 1)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 font-bold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {config.actionLabel}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
