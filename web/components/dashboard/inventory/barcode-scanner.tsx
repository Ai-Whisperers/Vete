"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, X, Loader2, AlertCircle, Check, Keyboard, ScanLine } from 'lucide-react';

// Local type definition for html5-qrcode (avoids bundling issues)
// The actual library is dynamically imported in startScanner()
interface Html5QrcodeInstance {
    start(
        cameraId: string | { facingMode: string },
        config: { fps: number; qrbox: { width: number; height: number }; aspectRatio?: number },
        onSuccess: (decodedText: string) => void,
        onError?: (error: string) => void
    ): Promise<null>;
    stop(): Promise<void>;
    clear(): void;
}

interface BarcodeScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (barcode: string) => void;
    title?: string;
    description?: string;
}

interface ProductResult {
    id: string;
    sku: string;
    name: string;
    base_price: number;
    stock_quantity: number;
}

interface BarcodeScanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductFound: (product: ProductResult, barcode: string) => void;
    clinic: string;
}

/**
 * Camera-based barcode scanner using html5-qrcode
 * Supports EAN-13, UPC-A, Code128 and other common formats
 */
export function BarcodeScanner({ isOpen, onClose, onScan, title = "Escanear Código de Barras", description }: BarcodeScannerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [manualMode, setManualMode] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const scannerRef = useRef<Html5QrcodeInstance | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const startScanner = useCallback(async () => {
        if (!containerRef.current) return;

        setIsLoading(true);
        setError(null);

        try {
            // Dynamically import html5-qrcode (client-side only)
            const { Html5Qrcode } = await import('html5-qrcode');

            // Clear any existing scanner
            if (scannerRef.current) {
                try {
                    await scannerRef.current.stop();
                    scannerRef.current.clear();
                } catch {
                    // Ignore cleanup errors
                }
            }

            const html5Qrcode = new Html5Qrcode("barcode-scanner-container");
            scannerRef.current = html5Qrcode;

            await html5Qrcode.start(
                { facingMode: "environment" }, // Use back camera
                {
                    fps: 10,
                    qrbox: { width: 250, height: 150 },
                    aspectRatio: 1.5
                },
                (decodedText) => {
                    // Barcode scanned successfully
                    onScan(decodedText);
                },
                (errorMessage) => {
                    // Scan error - ignore, keep scanning
                    console.debug('Scanning...', errorMessage);
                }
            );

            setIsLoading(false);
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Camera error:', e);
            }
            setError(
                e instanceof Error
                    ? e.message.includes('NotAllowedError') || e.message.includes('Permission')
                        ? 'Permiso de cámara denegado. Por favor permite el acceso a la cámara.'
                        : e.message.includes('NotFoundError')
                            ? 'No se encontró cámara en este dispositivo.'
                            : e.message
                    : 'Error al iniciar la cámara'
            );
            setIsLoading(false);
            setManualMode(true);
        }
    }, [onScan]);

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch {
                // Ignore cleanup errors
            }
            scannerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isOpen && !manualMode) {
            startScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isOpen, manualMode, startScanner, stopScanner]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualInput.trim()) {
            onScan(manualInput.trim());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900">{title}</h3>
                        {description && (
                            <p className="text-sm text-gray-500 mt-1">{description}</p>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            stopScanner();
                            onClose();
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {manualMode ? (
                        /* Manual Entry Mode */
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Keyboard className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500">
                                    Ingresa el código de barras manualmente
                                </p>
                            </div>

                            <input
                                type="text"
                                value={manualInput}
                                onChange={(e) => setManualInput(e.target.value)}
                                placeholder="Ej: 7891234567890"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg font-mono focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none"
                                autoFocus
                            />

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setManualMode(false);
                                        setManualInput('');
                                    }}
                                    className="flex-1 py-3 text-gray-500 hover:text-gray-700 font-medium flex items-center justify-center gap-2"
                                >
                                    <Camera className="w-4 h-4" />
                                    Usar Cámara
                                </button>
                                <button
                                    type="submit"
                                    disabled={!manualInput.trim()}
                                    className="flex-1 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
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
                                className="relative bg-black rounded-xl overflow-hidden aspect-[4/3]"
                            >
                                <div id="barcode-scanner-container" className="w-full h-full" />

                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                        <div className="text-center text-white">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                            <p className="text-sm">Iniciando cámara...</p>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
                                        <div className="text-center text-white">
                                            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                                            <p className="text-sm">{error}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Scan Guide Overlay */}
                                {!isLoading && !error && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="relative w-64 h-24 border-2 border-white/50 rounded-lg">
                                                {/* Corner marks */}
                                                <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-[var(--primary)]" />
                                                <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-[var(--primary)]" />
                                                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-[var(--primary)]" />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-[var(--primary)]" />
                                                {/* Scan line animation */}
                                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/70 animate-pulse" />
                                            </div>
                                        </div>
                                        <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                                            Centra el código de barras en el recuadro
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Manual entry button */}
                            <button
                                onClick={() => setManualMode(true)}
                                className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium flex items-center justify-center gap-2"
                            >
                                <Keyboard className="w-4 h-4" />
                                Ingresar código manualmente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Complete barcode scan modal with product lookup
 * Shows scanner, looks up product, and returns result
 */
export function BarcodeScanModal({ isOpen, onClose, onProductFound, clinic }: BarcodeScanModalProps) {
    const [isSearching, setIsSearching] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async (barcode: string) => {
        setScannedBarcode(barcode);
        setIsSearching(true);
        setNotFound(false);
        setError(null);

        try {
            const res = await fetch(`/api/inventory/barcode-lookup?barcode=${encodeURIComponent(barcode)}&clinic=${clinic}`);

            if (res.status === 404) {
                setNotFound(true);
                return;
            }

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const product = await res.json();
            onProductFound(product, barcode);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al buscar producto');
        } finally {
            setIsSearching(false);
        }
    };

    const handleClose = () => {
        setScannedBarcode(null);
        setNotFound(false);
        setError(null);
        onClose();
    };

    const handleScanAgain = () => {
        setScannedBarcode(null);
        setNotFound(false);
        setError(null);
    };

    if (!isOpen) return null;

    // Show result screen if we have a scanned barcode
    if (scannedBarcode) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-6 text-center">
                        {isSearching ? (
                            <div>
                                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[var(--primary)]" />
                                <p className="font-medium text-gray-900">Buscando producto...</p>
                                <p className="text-sm text-gray-500 mt-1 font-mono">{scannedBarcode}</p>
                            </div>
                        ) : notFound ? (
                            <div>
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ScanLine className="w-8 h-8 text-amber-600" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Producto No Encontrado</h3>
                                <p className="text-sm text-gray-500 mb-1">
                                    No se encontró un producto con el código:
                                </p>
                                <p className="font-mono text-lg text-gray-900">{scannedBarcode}</p>
                            </div>
                        ) : error ? (
                            <div>
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Error</h3>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        ) : null}
                    </div>

                    {!isSearching && (notFound || error) && (
                        <div className="p-6 bg-gray-50 border-t flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3 text-gray-500 hover:text-gray-700 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleScanAgain}
                                className="flex-1 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
                            >
                                <Camera className="w-4 h-4" />
                                Escanear Otro
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <BarcodeScanner
            isOpen={isOpen}
            onClose={handleClose}
            onScan={handleScan}
            title="Escanear Producto"
            description="Escanea el código de barras para buscar el producto"
        />
    );
}
