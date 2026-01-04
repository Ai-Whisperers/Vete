"use client";

import { useState, useCallback, useEffect } from 'react';
import {
    Upload, FileSpreadsheet, ClipboardPaste, ArrowRight, ArrowLeft, Check,
    AlertCircle, Loader2, X, Save, ChevronDown, Trash2, Info
} from 'lucide-react';
import { ClipboardImport } from './clipboard-import';

// =============================================================================
// TYPES
// =============================================================================

export interface ImportMapping {
    id?: string;
    name: string;
    description?: string;
    mapping: Record<string, string>; // source column -> target field
}

export interface ParsedRow {
    rowNumber: number;
    rawData: Record<string, string>;
    mappedData?: Record<string, unknown>;
    errors?: string[];
}

export interface PreviewResult {
    preview: Array<{
        rowNumber: number;
        operation: string;
        sku: string;
        name: string;
        status: 'new' | 'update' | 'adjustment' | 'error' | 'skip';
        message: string;
        currentStock?: number;
        newStock?: number;
        priceChange?: { old: number; new: number };
    }>;
    summary: {
        totalRows: number;
        newProducts: number;
        updates: number;
        adjustments: number;
        errors: number;
        skipped: number;
    };
}

interface ImportWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: () => void;
    clinic: string;
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
];

// =============================================================================
// STEP INDICATORS
// =============================================================================

function StepIndicator({ currentStep, steps }: { currentStep: number; steps: string[] }) {
    return (
        <div className="flex items-center justify-center gap-2">
            {steps.map((step, idx) => (
                <div key={idx} className="flex items-center">
                    <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                        ${idx < currentStep ? 'bg-green-500 text-white' : ''}
                        ${idx === currentStep ? 'bg-[var(--primary)] text-white' : ''}
                        ${idx > currentStep ? 'bg-gray-200 text-gray-400' : ''}
                    `}>
                        {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    {idx < steps.length - 1 && (
                        <div className={`w-12 h-1 mx-2 rounded ${idx < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

// =============================================================================
// MAIN WIZARD COMPONENT
// =============================================================================

export function ImportWizard({ isOpen, onClose, onImportComplete, clinic }: ImportWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const steps = ['Origen', 'Vista Previa', 'Mapear Columnas', 'Revisar', 'Confirmar'];

    // Step 1: Source selection
    const [sourceType, setSourceType] = useState<'file' | 'clipboard' | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [clipboardData, setClipboardData] = useState<string[][] | null>(null);

    // Step 2: Raw data preview
    const [rawHeaders, setRawHeaders] = useState<string[]>([]);
    const [rawRows, setRawRows] = useState<string[][]>([]);
    const [isParsingFile, setIsParsingFile] = useState(false);

    // Step 3: Column mapping
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
    const [savedMappings, setSavedMappings] = useState<ImportMapping[]>([]);
    const [selectedMappingId, setSelectedMappingId] = useState<string | null>(null);
    const [newMappingName, setNewMappingName] = useState('');
    const [showSaveMapping, setShowSaveMapping] = useState(false);
    const [isSavingMapping, setIsSavingMapping] = useState(false);

    // Step 4: Preview results
    const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    // Step 5: Import
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load saved mappings
    useEffect(() => {
        if (isOpen) {
            loadSavedMappings();
        }
    }, [isOpen]);

    const loadSavedMappings = async () => {
        try {
            const res = await fetch(`/api/inventory/mappings?clinic=${clinic}`);
            if (res.ok) {
                const data = await res.json();
                setSavedMappings(data.mappings || []);
            }
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Error loading mappings:', e);
            }
        }
    };

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setSourceType('file');
        setIsParsingFile(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const res = await fetch('/api/inventory/import/preview?parseOnly=true', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const data = await res.json();
            setRawHeaders(data.headers || []);
            setRawRows(data.rows || []);

            // Auto-detect column mappings
            autoDetectMappings(data.headers || []);
            setCurrentStep(1);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al leer el archivo');
        } finally {
            setIsParsingFile(false);
        }
    };

    const handleClipboardData = (headers: string[], rows: string[][]) => {
        setClipboardData([headers, ...rows]);
        setRawHeaders(headers);
        setRawRows(rows);
        setSourceType('clipboard');
        autoDetectMappings(headers);
        setCurrentStep(1);
    };

    const autoDetectMappings = (headers: string[]) => {
        const mapping: Record<string, string> = {};
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
        };

        headers.forEach((header, idx) => {
            const headerKey = `col_${idx}`;
            for (const [field, regexes] of Object.entries(patterns)) {
                if (regexes.some(regex => regex.test(header))) {
                    if (!Object.values(mapping).includes(field)) {
                        mapping[headerKey] = field;
                        break;
                    }
                }
            }
        });

        setColumnMapping(mapping);
    };

    const handleMappingChange = (colKey: string, targetField: string) => {
        setColumnMapping(prev => ({
            ...prev,
            [colKey]: targetField
        }));
        setSelectedMappingId(null); // Clear selected preset when manually changed
    };

    const applyPresetMapping = (mappingId: string) => {
        const preset = savedMappings.find(m => m.id === mappingId);
        if (preset) {
            setColumnMapping(preset.mapping);
            setSelectedMappingId(mappingId);
        }
    };

    const saveCurrentMapping = async () => {
        if (!newMappingName.trim()) return;

        setIsSavingMapping(true);
        try {
            const res = await fetch(`/api/inventory/mappings?clinic=${clinic}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newMappingName.trim(),
                    mapping: columnMapping
                })
            });

            if (res.ok) {
                await loadSavedMappings();
                setNewMappingName('');
                setShowSaveMapping(false);
            } else {
                throw new Error(await res.text());
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al guardar mapeo');
        } finally {
            setIsSavingMapping(false);
        }
    };

    const deleteMapping = async (mappingId: string) => {
        try {
            const res = await fetch(`/api/inventory/mappings/${mappingId}?clinic=${clinic}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                await loadSavedMappings();
                if (selectedMappingId === mappingId) {
                    setSelectedMappingId(null);
                }
            }
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Error deleting mapping:', e);
            }
        }
    };

    const runPreview = async () => {
        setIsLoadingPreview(true);
        setError(null);

        try {
            // Build mapped data from raw rows using current mapping
            const mappedRows = rawRows.map((row, idx) => {
                const mapped: Record<string, string> = {};
                rawHeaders.forEach((_, colIdx) => {
                    const colKey = `col_${colIdx}`;
                    const targetField = columnMapping[colKey];
                    if (targetField) {
                        mapped[targetField] = row[colIdx] || '';
                    }
                });
                return { rowNumber: idx + 2, ...mapped }; // +2 for Excel 1-indexed + header row
            });

            const res = await fetch('/api/inventory/import/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows: mappedRows })
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const data = await res.json();
            setPreviewResult(data);
            setCurrentStep(3);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error en vista previa');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const executeImport = async () => {
        setIsImporting(true);
        setError(null);

        try {
            // Build mapped data from raw rows
            const mappedRows = rawRows.map((row, idx) => {
                const mapped: Record<string, string> = {};
                rawHeaders.forEach((_, colIdx) => {
                    const colKey = `col_${colIdx}`;
                    const targetField = columnMapping[colKey];
                    if (targetField) {
                        mapped[targetField] = row[colIdx] || '';
                    }
                });
                return mapped;
            });

            const res = await fetch('/api/inventory/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows: mappedRows })
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const data = await res.json();
            setImportResult(data);
            setCurrentStep(4);

            // Update mapping usage count if using a preset
            if (selectedMappingId) {
                await fetch(`/api/inventory/mappings/${selectedMappingId}/use?clinic=${clinic}`, {
                    method: 'POST'
                });
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error en importación');
        } finally {
            setIsImporting(false);
        }
    };

    const handleClose = () => {
        // Reset all state
        setCurrentStep(0);
        setSourceType(null);
        setFile(null);
        setClipboardData(null);
        setRawHeaders([]);
        setRawRows([]);
        setColumnMapping({});
        setSelectedMappingId(null);
        setPreviewResult(null);
        setImportResult(null);
        setError(null);
        onClose();
    };

    const handleFinish = () => {
        handleClose();
        onImportComplete();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Importar Inventario</h2>
                        <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <StepIndicator currentStep={currentStep} steps={steps} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-red-800">Error</p>
                                <p className="text-sm text-red-600 mt-1">{error}</p>
                            </div>
                            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Step 0: Source Selection */}
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    Elige el origen de los datos
                                </h3>
                                <p className="text-gray-500">
                                    Sube un archivo Excel/CSV o pega datos desde una hoja de cálculo
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* File Upload */}
                                <label className={`
                                    relative cursor-pointer p-8 border-2 border-dashed rounded-2xl text-center transition-all
                                    ${isParsingFile ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-gray-200 hover:border-[var(--primary)] hover:bg-gray-50'}
                                `}>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        className="hidden"
                                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                        disabled={isParsingFile}
                                    />
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        {isParsingFile ? (
                                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                        ) : (
                                            <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                                        )}
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2">Subir Archivo</h4>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Excel (.xlsx, .xls) o CSV
                                    </p>
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg">
                                        <Upload className="w-4 h-4" />
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

                            <div className="border rounded-xl overflow-hidden">
                                <div className="overflow-x-auto max-h-[300px]">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 uppercase w-12">#</th>
                                                {rawHeaders.map((header, idx) => (
                                                    <th key={idx} className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase whitespace-nowrap">
                                                        {header || `Columna ${idx + 1}`}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {rawRows.slice(0, 10).map((row, rowIdx) => (
                                                <tr key={rowIdx} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2 text-gray-400 font-mono">{rowIdx + 1}</td>
                                                    {row.map((cell, cellIdx) => (
                                                        <td key={cellIdx} className="px-3 py-2 max-w-[200px] truncate">
                                                            {cell || <span className="text-gray-300">—</span>}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {rawRows.length > 10 && (
                                    <div className="p-2 bg-gray-50 text-center text-sm text-gray-500 border-t">
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
                                            className="px-4 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium appearance-none cursor-pointer"
                                        >
                                            <option value="">Cargar mapeo guardado...</option>
                                            {savedMappings.map((m) => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                )}
                            </div>

                            {/* Mapping Grid */}
                            <div className="grid gap-3">
                                {rawHeaders.map((header, idx) => {
                                    const colKey = `col_${idx}`;
                                    return (
                                        <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {header || `Columna ${idx + 1}`}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    Ej: {rawRows[0]?.[idx] || '—'}
                                                </p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                                            <select
                                                value={columnMapping[colKey] || ''}
                                                onChange={(e) => handleMappingChange(colKey, e.target.value)}
                                                className={`
                                                    w-48 px-3 py-2 border rounded-lg text-sm font-medium
                                                    ${columnMapping[colKey] ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]' : 'bg-white border-gray-200 text-gray-600'}
                                                `}
                                            >
                                                {TARGET_FIELDS.map((field) => (
                                                    <option key={field.value} value={field.value}>
                                                        {field.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    );
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
                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                        <button
                                            onClick={saveCurrentMapping}
                                            disabled={!newMappingName.trim() || isSavingMapping}
                                            className="px-4 py-2 bg-[var(--primary)] text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isSavingMapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Guardar
                                        </button>
                                        <button
                                            onClick={() => { setShowSaveMapping(false); setNewMappingName(''); }}
                                            className="px-4 py-2 text-gray-500 hover:text-gray-700"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowSaveMapping(true)}
                                        className="text-sm text-[var(--primary)] hover:underline flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                <div className="bg-gray-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-gray-900">{previewResult.summary.totalRows}</div>
                                    <div className="text-xs text-gray-500">Total</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-green-600">{previewResult.summary.newProducts}</div>
                                    <div className="text-xs text-gray-500">Nuevos</div>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-blue-600">{previewResult.summary.updates}</div>
                                    <div className="text-xs text-gray-500">Actualizaciones</div>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-amber-600">{previewResult.summary.adjustments}</div>
                                    <div className="text-xs text-gray-500">Ajustes</div>
                                </div>
                                <div className="bg-red-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-red-600">{previewResult.summary.errors}</div>
                                    <div className="text-xs text-gray-500">Errores</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-gray-400">{previewResult.summary.skipped}</div>
                                    <div className="text-xs text-gray-500">Omitidos</div>
                                </div>
                            </div>

                            {/* Preview Table */}
                            <div className="border rounded-xl overflow-hidden">
                                <div className="overflow-x-auto max-h-[300px]">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 uppercase">Fila</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 uppercase">Estado</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 uppercase">SKU</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 uppercase">Nombre</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 uppercase">Stock</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 uppercase">Mensaje</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {previewResult.preview.map((row, idx) => (
                                                <tr key={idx} className={row.status === 'error' ? 'bg-red-50' : row.status === 'skip' ? 'bg-gray-50 opacity-60' : ''}>
                                                    <td className="px-3 py-2 font-mono text-gray-500">{row.rowNumber}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`
                                                            inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                                                            ${row.status === 'new' ? 'bg-green-100 text-green-700' : ''}
                                                            ${row.status === 'update' ? 'bg-blue-100 text-blue-700' : ''}
                                                            ${row.status === 'adjustment' ? 'bg-amber-100 text-amber-700' : ''}
                                                            ${row.status === 'error' ? 'bg-red-100 text-red-700' : ''}
                                                            ${row.status === 'skip' ? 'bg-gray-100 text-gray-500' : ''}
                                                        `}>
                                                            {row.status === 'new' && 'Nuevo'}
                                                            {row.status === 'update' && 'Actualizar'}
                                                            {row.status === 'adjustment' && 'Ajuste'}
                                                            {row.status === 'error' && 'Error'}
                                                            {row.status === 'skip' && 'Omitir'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 font-mono">{row.sku || '—'}</td>
                                                    <td className="px-3 py-2 max-w-[200px] truncate">{row.name || '—'}</td>
                                                    <td className="px-3 py-2">
                                                        {row.currentStock !== undefined && row.newStock !== undefined ? (
                                                            <span className="flex items-center gap-1">
                                                                <span className="text-gray-400">{row.currentStock}</span>
                                                                <span className="text-gray-300">→</span>
                                                                <span className={row.newStock > row.currentStock ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                                    {row.newStock}
                                                                </span>
                                                            </span>
                                                        ) : '—'}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-500 max-w-[200px] truncate">{row.message}</td>
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
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Importación Completada
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Se procesaron <strong>{importResult.success}</strong> registros exitosamente
                            </p>

                            {importResult.errors.length > 0 && (
                                <div className="max-w-md mx-auto p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
                                    <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Observaciones ({importResult.errors.length})
                                    </div>
                                    <ul className="text-sm text-amber-600 list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
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
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between">
                    <button
                        onClick={() => currentStep === 0 ? handleClose() : setCurrentStep(Math.max(0, currentStep - 1))}
                        className="px-6 py-3 text-gray-500 hover:text-gray-700 font-medium flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {currentStep === 0 ? 'Cancelar' : 'Atrás'}
                    </button>

                    {currentStep < 4 && (
                        <button
                            onClick={() => {
                                if (currentStep === 1) {
                                    setCurrentStep(2); // Go to mapping
                                } else if (currentStep === 2) {
                                    runPreview(); // Run preview
                                } else if (currentStep === 3) {
                                    executeImport(); // Execute import
                                }
                            }}
                            disabled={
                                (currentStep === 0) ||
                                (currentStep === 2 && isLoadingPreview) ||
                                (currentStep === 3 && (isImporting || (previewResult?.summary.newProducts === 0 && previewResult?.summary.updates === 0 && previewResult?.summary.adjustments === 0)))
                            }
                            className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoadingPreview || isImporting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : currentStep === 3 ? (
                                <Upload className="w-4 h-4" />
                            ) : (
                                <ArrowRight className="w-4 h-4" />
                            )}
                            {currentStep === 2 && (isLoadingPreview ? 'Analizando...' : 'Revisar Cambios')}
                            {currentStep === 3 && (isImporting ? 'Importando...' : 'Confirmar Importación')}
                            {currentStep === 1 && 'Continuar'}
                        </button>
                    )}

                    {currentStep === 4 && (
                        <button
                            onClick={handleFinish}
                            className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Finalizar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
