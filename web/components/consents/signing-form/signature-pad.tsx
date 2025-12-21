"use client";

import type { JSX } from 'react';
import { Edit3, Type, RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  signatureMode: 'draw' | 'type';
  onModeChange: (mode: 'draw' | 'type') => void;
  signatureText: string;
  onSignatureTextChange: (text: string) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  onStartDrawing: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  onDraw: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  onStopDrawing: () => void;
  onClearSignature: () => void;
  label: string;
  required?: boolean;
}

export default function SignaturePad({
  signatureMode,
  onModeChange,
  signatureText,
  onSignatureTextChange,
  canvasRef,
  canvasContainerRef,
  onStartDrawing,
  onDraw,
  onStopDrawing,
  onClearSignature,
  label,
  required = true,
}: SignaturePadProps): JSX.Element {
  return (
    <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        {label} {required && <span className="text-red-600">*</span>}
      </h3>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => onModeChange('draw')}
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
          onClick={() => onModeChange('type')}
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
              onMouseDown={onStartDrawing}
              onMouseMove={onDraw}
              onMouseUp={onStopDrawing}
              onMouseLeave={onStopDrawing}
              onTouchStart={(e) => { e.preventDefault(); onStartDrawing(e); }}
              onTouchMove={(e) => { e.preventDefault(); onDraw(e); }}
              onTouchEnd={onStopDrawing}
              className="w-full border-2 border-dashed border-[var(--primary)]/20 rounded-lg cursor-crosshair bg-white touch-none"
              style={{ height: 'min(35vw, 200px)', minHeight: '120px' }}
            />
          </div>
          <button
            type="button"
            onClick={onClearSignature}
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
          onChange={(e) => onSignatureTextChange(e.target.value)}
          placeholder="Escriba su nombre completo"
          className="w-full px-4 py-3 text-2xl font-serif border-2 border-dashed border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white text-black"
          style={{ fontFamily: 'cursive' }}
        />
      )}
    </div>
  );
}
