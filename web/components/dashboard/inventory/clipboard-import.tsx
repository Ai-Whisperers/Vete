"use client";

import { useState, useCallback, useRef } from 'react';
import { ClipboardPaste, Loader2, Check, AlertCircle, X } from 'lucide-react';

interface ClipboardImportProps {
    onDataParsed: (headers: string[], rows: string[][]) => void;
}

/**
 * Component for pasting spreadsheet data (from Excel or Google Sheets)
 * Parses tab-separated values from clipboard
 */
export function ClipboardImport({ onDataParsed }: ClipboardImportProps) {
    const [isPasting, setIsPasting] = useState(false);
    const [showPasteArea, setShowPasteArea] = useState(false);
    const [pasteValue, setPasteValue] = useState('');
    const [parseError, setParseError] = useState<string | null>(null);
    const [rowCount, setRowCount] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const parseClipboardData = useCallback((text: string): { headers: string[]; rows: string[][] } | null => {
        if (!text.trim()) {
            return null;
        }

        // Split by lines, handling both \r\n and \n
        const lines = text.trim().split(/\r?\n/);

        if (lines.length < 2) {
            throw new Error('Se necesitan al menos 2 filas (encabezados + datos)');
        }

        // Parse each line as tab-separated values
        const parseLine = (line: string): string[] => {
            // Handle quoted values with tabs inside
            const values: string[] = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];

                if (char === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        // Escaped quote
                        current += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === '\t' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            return values;
        };

        const headers = parseLine(lines[0]);
        const rows = lines.slice(1)
            .map(line => parseLine(line))
            .filter(row => row.some(cell => cell.length > 0)); // Filter empty rows

        if (headers.length === 0) {
            throw new Error('No se detectaron columnas');
        }

        if (rows.length === 0) {
            throw new Error('No se detectaron filas de datos');
        }

        // Normalize row lengths to match headers
        const normalizedRows = rows.map(row => {
            while (row.length < headers.length) {
                row.push('');
            }
            return row.slice(0, headers.length);
        });

        return { headers, rows: normalizedRows };
    }, []);

    const handlePasteFromClipboard = async () => {
        setIsPasting(true);
        setParseError(null);

        try {
            const text = await navigator.clipboard.readText();

            if (!text.trim()) {
                throw new Error('El portapapeles está vacío');
            }

            const result = parseClipboardData(text);
            if (result) {
                onDataParsed(result.headers, result.rows);
            }
        } catch (e) {
            if (e instanceof Error) {
                if (e.name === 'NotAllowedError') {
                    // Clipboard API not allowed, show paste area instead
                    setShowPasteArea(true);
                    setTimeout(() => textareaRef.current?.focus(), 100);
                } else {
                    setParseError(e.message);
                }
            } else {
                setParseError('Error al leer el portapapeles');
            }
        } finally {
            setIsPasting(false);
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setPasteValue(text);
        setParseError(null);

        // Count rows for preview
        const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
        setRowCount(Math.max(0, lines.length - 1)); // -1 for header
    };

    const handleTextareaPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        setPasteValue(text);
        setParseError(null);

        // Count rows
        const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
        setRowCount(Math.max(0, lines.length - 1));
    };

    const handleProcessPastedData = () => {
        setParseError(null);

        try {
            const result = parseClipboardData(pasteValue);
            if (result) {
                onDataParsed(result.headers, result.rows);
                setShowPasteArea(false);
                setPasteValue('');
            }
        } catch (e) {
            setParseError(e instanceof Error ? e.message : 'Error al procesar datos');
        }
    };

    const handleCancelPaste = () => {
        setShowPasteArea(false);
        setPasteValue('');
        setParseError(null);
        setRowCount(0);
    };

    if (showPasteArea) {
        return (
            <div className="p-6 border-2 border-dashed border-[var(--primary)] rounded-2xl bg-[var(--primary)]/5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <ClipboardPaste className="w-5 h-5 text-[var(--primary)]" />
                        <h4 className="font-bold text-gray-900">Pegar Datos</h4>
                    </div>
                    <button
                        onClick={handleCancelPaste}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-3">
                        Copia las celdas desde Excel o Google Sheets y pégalas aquí:
                    </p>
                    <textarea
                        ref={textareaRef}
                        value={pasteValue}
                        onChange={handleTextareaChange}
                        onPaste={handleTextareaPaste}
                        placeholder="Pega los datos aquí (Ctrl+V o Cmd+V)..."
                        className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono resize-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none"
                    />
                </div>

                {parseError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {parseError}
                    </div>
                )}

                {rowCount > 0 && !parseError && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-600">
                        <Check className="w-4 h-4" />
                        {rowCount} filas de datos detectadas
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={handleCancelPaste}
                        className="flex-1 py-2.5 text-gray-500 hover:text-gray-700 font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleProcessPastedData}
                        disabled={!pasteValue.trim() || rowCount === 0}
                        className="flex-1 py-2.5 bg-[var(--primary)] text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Procesar Datos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={handlePasteFromClipboard}
            disabled={isPasting}
            className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-[var(--primary)] hover:bg-gray-50 transition-all"
        >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {isPasting ? (
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                ) : (
                    <ClipboardPaste className="w-8 h-8 text-purple-600" />
                )}
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Pegar desde Hoja de Cálculo</h4>
            <p className="text-sm text-gray-500 mb-4">
                Excel, Google Sheets, etc.
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg">
                <ClipboardPaste className="w-4 h-4" />
                {isPasting ? 'Leyendo...' : 'Pegar del Portapapeles'}
            </span>
            <p className="text-xs text-gray-400 mt-3">
                Copia las celdas en Excel y haz clic aquí
            </p>
        </button>
    );
}
