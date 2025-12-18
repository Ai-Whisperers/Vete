"use client";

import type { JSX } from 'react';
import SignaturePad from './signature-pad';

interface WitnessSignatureProps {
  witnessName: string;
  onWitnessNameChange: (name: string) => void;
  signatureMode: 'draw' | 'type';
  onModeChange: (mode: 'draw' | 'type') => void;
  signatureText: string;
  onSignatureTextChange: (text: string) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  onStartDrawing: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  onDraw: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  onStopDrawing: () => void;
  onClearSignature: () => void;
}

export default function WitnessSignature({
  witnessName,
  onWitnessNameChange,
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
}: WitnessSignatureProps): JSX.Element {
  return (
    <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Firma del testigo <span className="text-red-600">*</span>
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Nombre del testigo <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={witnessName}
          onChange={(e) => onWitnessNameChange(e.target.value)}
          required
          className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
        />
      </div>

      <SignaturePad
        signatureMode={signatureMode}
        onModeChange={onModeChange}
        signatureText={signatureText}
        onSignatureTextChange={onSignatureTextChange}
        canvasRef={canvasRef}
        canvasContainerRef={canvasContainerRef}
        onStartDrawing={onStartDrawing}
        onDraw={onDraw}
        onStopDrawing={onStopDrawing}
        onClearSignature={onClearSignature}
        label=""
        required={false}
      />
    </div>
  );
}
