"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  X,
  Loader2,
  Package,
  AlertCircle,
  CheckCircle,
  ScanLine,
  Flashlight,
  SwitchCamera,
} from "lucide-react";
import { useDashboardLabels } from "@/lib/hooks/use-dashboard-labels";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

interface ScannedProduct {
  id: string;
  sku: string;
  name: string;
  stock: number;
  price: number;
}

export function BarcodeScanner({
  onScan,
  onClose,
  isOpen,
}: BarcodeScannerProps): React.ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchEnabled, setTorchEnabled] = useState(false);
  const labels = useDashboardLabels();

  const startCamera = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Camera error:", err);
      setError("No se pudo acceder a la cámara. Verifica los permisos.");
      setIsLoading(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback((): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Simulated barcode detection (in production, use a library like quagga2 or zxing)
  useEffect(() => {
    if (!isOpen || isLoading || error) return;

    const detectBarcode = async (): Promise<void> => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // In production, use BarcodeDetector API or a library
      if ("BarcodeDetector" in window) {
        try {
          // @ts-ignore - BarcodeDetector is not in TypeScript types yet
          const barcodeDetector = new window.BarcodeDetector({
            formats: ["ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e", "qr_code"],
          });
          const barcodes = await barcodeDetector.detect(canvas);

          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            handleBarcodeDetected(code);
          }
        } catch (err) {
          console.error("Barcode detection error:", err);
        }
      }
    };

    const interval = setInterval(detectBarcode, 500);
    return () => clearInterval(interval);
  }, [isOpen, isLoading, error]);

  const handleBarcodeDetected = async (code: string): Promise<void> => {
    if (scannedCode === code || isSearching) return;

    setScannedCode(code);
    setIsSearching(true);

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    try {
      // Search for product by barcode
      const response = await fetch(`/api/inventory/barcode/${code}`);
      if (response.ok) {
        const product = await response.json();
        setScannedProduct(product);
      } else {
        setScannedProduct(null);
      }
    } catch (err) {
      console.error("Error searching product:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmScan = (): void => {
    if (scannedCode) {
      onScan(scannedCode);
      onClose();
    }
  };

  const handleManualEntry = (): void => {
    const code = prompt("Ingrese el código de barras manualmente:");
    if (code) {
      handleBarcodeDetected(code);
    }
  };

  const toggleTorch = async (): Promise<void> => {
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    // @ts-ignore - torch is not in TypeScript types
    if (capabilities.torch) {
      try {
        // @ts-ignore
        await track.applyConstraints({ advanced: [{ torch: !torchEnabled }] });
        setTorchEnabled(!torchEnabled);
      } catch (err) {
        console.error("Torch error:", err);
      }
    }
  };

  const switchCamera = (): void => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const resetScan = (): void => {
    setScannedCode(null);
    setScannedProduct(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50"
          />

          {/* Scanner Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:h-[600px] bg-black rounded-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/50">
              <div className="flex items-center gap-2 text-white">
                <ScanLine className="w-5 h-5" />
                <span className="font-semibold">{labels.inventory.barcode_scanner.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTorch}
                  className={`p-2 rounded-full transition-colors ${
                    torchEnabled ? "bg-yellow-500 text-black" : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                  title="Linterna"
                >
                  <Flashlight className="w-5 h-5" />
                </button>
                <button
                  onClick={switchCamera}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                  title="Cambiar cámara"
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Camera View */}
            <div className="flex-1 relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-4">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <p className="text-white text-center mb-4">{error}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-white text-black rounded-lg font-medium"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scan Frame Overlay */}
              {!isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-48">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />

                    {/* Scan Line Animation */}
                    <motion.div
                      className="absolute left-2 right-2 h-0.5 bg-[var(--primary)]"
                      animate={{ top: ["10%", "90%", "10%"] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Scanned Result Overlay */}
              {scannedCode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4"
                >
                  {isSearching ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
                      <span className="ml-2 text-gray-600">{labels.inventory.barcode_scanner.searching}</span>
                    </div>
                  ) : scannedProduct ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{scannedProduct.name}</p>
                          <p className="text-sm text-gray-500">SKU: {scannedProduct.sku}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">{labels.inventory.barcode_scanner.stock_available}</span>
                        <span className={`font-bold ${scannedProduct.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                          {scannedProduct.stock} {labels.common.units}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">{labels.inventory.barcode_scanner.price}</span>
                        <span className="font-bold text-gray-900">
                          {scannedProduct.price.toLocaleString("es-PY")} Gs.
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleConfirmScan}
                          className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-colors"
                        >
                          {labels.inventory.barcode_scanner.use_code}
                        </button>
                        <button
                          onClick={resetScan}
                          className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          {labels.inventory.barcode_scanner.scan_another}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <AlertCircle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Código: {scannedCode}</p>
                          <p className="text-sm text-gray-500">{labels.inventory.barcode_scanner.not_found}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleConfirmScan}
                          className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-colors"
                        >
                          {labels.inventory.barcode_scanner.use_code}
                        </button>
                        <button
                          onClick={resetScan}
                          className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          {labels.inventory.barcode_scanner.scan_another}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {!scannedCode && (
              <div className="p-4 bg-black/50">
                <button
                  onClick={handleManualEntry}
                  className="w-full py-3 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
                >
                  {labels.inventory.barcode_scanner.manual_entry}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
