"use client";

import { useRef, useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

interface DigitalSignatureProps {
    onSave: (dataUrl: string) => void;
    onClear: () => void;
}

export function DigitalSignature({ onSave, onClear }: DigitalSignatureProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            onSave(canvas.toDataURL());
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        let x, y;

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsEmpty(false);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            setIsEmpty(true);
            onClear();
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative border-2 border-gray-100 rounded-2xl overflow-hidden bg-white shadow-inner">
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={200}
                    className="w-full h-[200px] cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 italic text-sm">
                        Firme aquí
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
                <p>Usa tu mouse o pantalla táctil para firmar</p>
                <button 
                    onClick={clear}
                    className="flex items-center gap-1 text-[var(--primary)] font-bold hover:underline"
                >
                    <Icons.RotateCcw className="w-3 h-3" /> Limpiar
                </button>
            </div>
        </div>
    );
}
