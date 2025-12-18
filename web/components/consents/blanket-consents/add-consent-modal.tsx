"use client";

import type { JSX } from 'react';
import { useState, useRef, useEffect } from 'react';
import { X, Check, Edit3, Type, RotateCcw } from 'lucide-react';

interface AddConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    consent_type: string;
    scope: string;
    conditions: string;
    signature_data: string;
    expires_at: string;
  }) => Promise<void>;
}

export default function AddConsentModal({
  isOpen,
  onClose,
  onSubmit
}: AddConsentModalProps): JSX.Element | null {
  const [consentType, setConsentType] = useState('');
  const [scope, setScope] = useState('');
  const [conditions, setConditions] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [signatureText, setSignatureText] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Resize canvas to match container
  const resizeCanvas = (): void => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = Math.min(rect.width * 0.3, 150) * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
  };

  useEffect(() => {
    if (signatureMode === 'draw' && isOpen) {
      setTimeout(resizeCanvas, 100);
    }
  }, [signatureMode, isOpen]);

  useEffect(() => {
    const handleResize = (): void => {
      if (signatureMode === 'draw' && isOpen) {
        resizeCanvas();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [signatureMode, isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);

    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): void => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (): void => {
    setIsDrawing(false);
  };

  const clearSignature = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getSignatureData = (): string => {
    if (signatureMode === 'draw') {
      return canvasRef.current?.toDataURL() || '';
    }
    return signatureText;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const signatureData = getSignatureData();
    if (!signatureData) {
      alert('Debe proporcionar una firma');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        consent_type: consentType,
        scope,
        conditions,
        signature_data: signatureData,
        expires_at: expiresAt
      });

      // Reset form
      setConsentType('');
      setScope('');
      setConditions('');
      setExpiresAt('');
      setSignatureText('');
      clearSignature();
      onClose();
    } catch (error) {
      alert('Error al crear el consentimiento permanente');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-[var(--bg-paper)] rounded-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--bg-paper)] border-b border-[var(--primary)]/20 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg sm:text-2xl font-bold text-[var(--text-primary)]">
              Nuevo Consentimiento Permanente
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Tipo de consentimiento <span className="text-red-600">*</span>
            </label>
            <select
              value={consentType}
              onChange={(e) => setConsentType(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
            >
              <option value="">Seleccionar...</option>
              <option value="emergency_treatment">Tratamiento de Emergencia</option>
              <option value="routine_procedures">Procedimientos de Rutina</option>
              <option value="vaccination">Vacunación</option>
              <option value="diagnostic_tests">Pruebas Diagnósticas</option>
              <option value="grooming">Peluquería</option>
              <option value="boarding">Hospedaje</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Alcance <span className="text-red-600">*</span>
            </label>
            <textarea
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              required
              rows={3}
              placeholder="Describa el alcance de este consentimiento..."
              className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Condiciones (opcional)
            </label>
            <textarea
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              rows={2}
              placeholder="Condiciones especiales o limitaciones..."
              className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Fecha de expiración (opcional)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
            />
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Dejar vacío para consentimiento sin fecha de expiración
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Firma <span className="text-red-600">*</span>
            </label>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSignatureMode('draw')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  signatureMode === 'draw'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-default)] text-[var(--text-primary)] border border-[var(--primary)]/20'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Dibujar
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('type')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  signatureMode === 'type'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-default)] text-[var(--text-primary)] border border-[var(--primary)]/20'
                }`}
              >
                <Type className="w-4 h-4" />
                Escribir
              </button>
            </div>

            {signatureMode === 'draw' ? (
              <div className="space-y-2">
                <div ref={canvasContainerRef} className="w-full">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => { e.preventDefault(); startDrawing(e); }}
                    onTouchMove={(e) => { e.preventDefault(); draw(e); }}
                    onTouchEnd={stopDrawing}
                    className="w-full border-2 border-dashed border-[var(--primary)]/20 rounded-lg cursor-crosshair bg-white touch-none"
                    style={{ height: 'min(30vw, 150px)', minHeight: '100px' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px]"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpiar firma
                </button>
              </div>
            ) : (
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Escriba su nombre completo"
                className="w-full px-4 py-3 text-2xl font-serif border-2 border-dashed border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white text-black"
                style={{ fontFamily: 'cursive' }}
              />
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-[var(--primary)]/20">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 sm:px-6 py-3 bg-[var(--bg-default)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--primary)]/10 transition-colors border border-[var(--primary)]/20 disabled:opacity-50 min-h-[48px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[48px]"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
