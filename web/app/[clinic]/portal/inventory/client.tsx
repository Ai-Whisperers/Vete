"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Package, TrendingUp, Info, Tag, Search, Edit2, ChevronDown, ExternalLink, FileDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useParams } from 'next/navigation';
import { DatePicker } from '@/components/ui/date-picker';

interface InventoryClientProps {
    googleSheetUrl: string | null;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const stockFilterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'in_stock', label: 'En Stock' },
    { value: 'low_stock', label: 'Bajo Stock' },
    { value: 'out_of_stock', label: 'Sin Stock' },
];

// Type definitions
interface ImportResult {
    success: number;
    errors: string[];
    message?: string;
}

interface InventoryStats {
    totalProducts: number;
    lowStockCount: number;
    totalValue: number;
}

interface StockAlertItem {
    id: string;
    name: string;
    stock_quantity: number;
    min_stock_level: number;
    expiry_date?: string;
}

interface InventoryAlerts {
    hasAlerts: boolean;
    lowStock: StockAlertItem[];
    expiring: StockAlertItem[];
}

interface ProductInventory {
    stock_quantity?: number;
    min_stock_level?: number;
    expiry_date?: string;
    batch_number?: string;
    location?: string;
    bin_number?: string;
    supplier_name?: string;
}

interface Product {
    id: string;
    name: string;
    sku?: string;
    base_price?: number;
    price?: number;
    image_url?: string;
    image?: string;
    stock?: number;
    inventory?: ProductInventory;
    category?: { id: string; name: string; slug: string };
}

export default function InventoryClient({ googleSheetUrl }: InventoryClientProps) {
    const { clinic } = useParams() as { clinic: string };
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editValues, setEditValues] = useState({
      price: 0,
      stock: 0,
      expiry_date: '',
      batch_number: '',
      location: '',
      bin_number: '',
      supplier_name: '',
      min_stock_level: 0
    });
    const [activeTab, setActiveTab] = useState<'basic' | 'inventory' | 'location'>('basic');
    const [isSaving, setIsSaving] = useState(false);
    const [alerts, setAlerts] = useState<InventoryAlerts | null>(null);
    const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
    const templateDropdownRef = useRef<HTMLDivElement>(null);

    // Pagination state
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 25,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false,
    });

    // Filter state
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [stockFilter, setStockFilter] = useState<string>('all');

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/inventory/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to fetch stats', e);
            }
        }
    };

    const fetchAlerts = async () => {
        try {
            const res = await fetch('/api/inventory/alerts');
            if (res.ok) {
                const data = await res.json();
                setAlerts(data);
            }
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to fetch alerts', e);
            }
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (templateDropdownRef.current && !templateDropdownRef.current.contains(event.target as Node)) {
                setTemplateDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`/api/store/categories?clinic=${clinic}`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to fetch categories', e);
            }
        }
    };

    const fetchProducts = async (query = '', page = 1, limit = pagination.limit) => {
        setIsLoadingProducts(true);
        try {
            let url = `/api/store/products?clinic=${clinic}&search=${query}&page=${page}&limit=${limit}`;

            // Add category filter
            if (selectedCategory !== 'all') {
                url += `&category=${selectedCategory}`;
            }

            // Add stock filter
            if (stockFilter === 'in_stock') {
                url += '&in_stock_only=true';
            }

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            }
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to fetch products', e);
            }
        } finally {
            setIsLoadingProducts(false);
        }
    };

    // Apply local stock filtering for low_stock and out_of_stock
    const filteredProducts = useMemo(() => {
        if (stockFilter === 'low_stock') {
            return products.filter(p => (p.inventory?.stock_quantity ?? 0) > 0 && (p.inventory?.stock_quantity ?? 0) <= (p.inventory?.min_stock_level || 5));
        }
        if (stockFilter === 'out_of_stock') {
            return products.filter(p => (p.inventory?.stock_quantity || 0) === 0);
        }
        return products;
    }, [products, stockFilter]);

    useEffect(() => {
        fetchStats();
        fetchCategories();
        fetchProducts();
        fetchAlerts();
    }, [clinic]);

    // Refetch when filters change
    useEffect(() => {
        fetchProducts(searchQuery, 1, pagination.limit);
    }, [selectedCategory, stockFilter]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(searchQuery, 1, pagination.limit);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handlePageChange = (newPage: number) => {
        fetchProducts(searchQuery, newPage, pagination.limit);
    };

    const handleLimitChange = (newLimit: number) => {
        setPagination(prev => ({ ...prev, limit: newLimit }));
        fetchProducts(searchQuery, 1, newLimit);
    };

    const openEdit = (p: Product) => {
        setEditingProduct(p);
        setEditValues({
            price: p.base_price ?? p.price ?? 0,
            stock: p.inventory?.stock_quantity ?? p.stock ?? 0,
            expiry_date: p.inventory?.expiry_date ?? '',
            batch_number: p.inventory?.batch_number ?? '',
            location: p.inventory?.location ?? '',
            bin_number: p.inventory?.bin_number ?? '',
            supplier_name: p.inventory?.supplier_name ?? '',
            min_stock_level: p.inventory?.min_stock_level ?? 5
        });
    };

    const handleQuickEditSave = async () => {
        if (!editingProduct) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/inventory/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // We'll update the API to handle JSON too
                body: JSON.stringify({
                    rows: [{
                        operation: 'adjustment', // General adjustment operation
                        sku: editingProduct.sku ?? editingProduct.id,
                        name: editingProduct.name,
                        price: editValues.price,
                        quantity: editValues.stock - (editingProduct.inventory?.stock_quantity ?? editingProduct.stock ?? 0),
                        expiry_date: editValues.expiry_date || undefined,
                        batch_number: editValues.batch_number || undefined,
                        supplier_name: editValues.supplier_name || undefined,
                        min_stock_level: editValues.min_stock_level
                    }]
                })
            });

            if (res.ok) {
                setEditingProduct(null);
                fetchProducts(searchQuery);
                fetchStats();
            }
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Save failed', e);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = async (type: 'template' | 'catalog') => {
        try {
            const res = await fetch(`/api/inventory/export?type=${type}`);
            if (!res.ok) throw new Error('Export failed');
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventory_${type}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            // TICKET-TYPE-004: Proper error handling without any
            setError(e instanceof Error ? e.message : 'Error desconocido');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/inventory/import', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Import failed');
            }

            const data = await res.json();
            setResult(data);
            fetchStats(); // Update stats after import
        } catch (e) {
            // TICKET-TYPE-004: Proper error handling without any
            setError(e instanceof Error ? e.message : 'Error desconocido');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Gestión de Inventario</h1>
                    <p className="text-gray-500">Actualiza tu catálogo y stock mediante planillas Excel.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => window.location.href = `/${clinic}/portal/inventory/catalog`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg"
                    >
                        <Package className="w-4 h-4" /> Agregar Productos
                    </button>

                    <button
                        onClick={() => window.location.href = `/${clinic}/portal/campaigns`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm border border-gray-200"
                    >
                        <Tag className="w-4 h-4 text-[var(--primary)]" /> Ver Promociones
                    </button>

                    {/* Template Download Dropdown */}
                    <div className="relative" ref={templateDropdownRef}>
                        <button
                            onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition shadow-sm border border-gray-200"
                        >
                            <Download className="w-4 h-4" />
                            Obtener Plantilla
                            <ChevronDown className={`w-4 h-4 transition-transform ${templateDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {templateDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                                    <h4 className="font-bold text-sm">📋 Plantilla de Inventario</h4>
                                    <p className="text-xs text-gray-300 mt-1">Elige tu formato preferido</p>
                                </div>

                                <div className="p-2">
                                    {/* Google Sheets Option */}
                                    {googleSheetUrl && googleSheetUrl !== 'https://docs.google.com/spreadsheets/d/YOUR_TEMPLATE_ID/copy' && (
                                        <a
                                            href={googleSheetUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setTemplateDropdownOpen(false)}
                                            className="flex items-start gap-4 p-4 rounded-xl hover:bg-green-50 transition-colors group cursor-pointer"
                                        >
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9.75 15h-3v-3h3v3zm0-4.5h-3v-3h3v3zm0-4.5h-3V6h3v3zm4.5 9h-3v-3h3v3zm0-4.5h-3v-3h3v3zm0-4.5h-3V6h3v3zm4.5 9h-3v-3h3v3zm0-4.5h-3v-3h3v3zm0-4.5h-3V6h3v3z"/>
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">Google Sheets</span>
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Recomendado</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Crear una copia en tu Google Drive. Colabora en tiempo real.</p>
                                                <div className="flex items-center gap-1 text-xs text-green-600 mt-2 font-medium">
                                                    <ExternalLink className="w-3 h-3" />
                                                    Abrir en Google Sheets
                                                </div>
                                            </div>
                                        </a>
                                    )}

                                    {/* Excel Download Option */}
                                    <button
                                        onClick={() => {
                                            handleExport('template');
                                            setTemplateDropdownOpen(false);
                                        }}
                                        className="w-full flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50 transition-colors group text-left"
                                    >
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                            <FileDown className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900">Descargar Excel</span>
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">.xlsx</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Archivo compatible con Excel, LibreOffice y Google Sheets.</p>
                                            <div className="flex items-center gap-1 text-xs text-blue-600 mt-2 font-medium">
                                                <Download className="w-3 h-3" />
                                                Descargar archivo
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                <div className="p-3 bg-gray-50 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 text-center">
                                        💡 La plantilla incluye ejemplos y validaciones
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => handleExport('catalog')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-[var(--primary)]/90 transition shadow-lg"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> Exportar Catálogo
                    </button>
                </div>
            </div>

            {/* Alerts Banner */}
            {alerts?.hasAlerts && (
                <div className="space-y-4">
                    {alerts.lowStock && alerts.lowStock.length > 0 && (
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-2xl">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-orange-900 mb-2">⚠️ Low Stock Alert</h3>
                                    <p className="text-sm text-orange-800 mb-3">
                                        {alerts.lowStock.length} product{alerts.lowStock.length > 1 ? 's' : ''} below minimum stock level
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {alerts.lowStock.slice(0, 5).map((item: StockAlertItem) => (
                                            <span key={item.id} className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-orange-700 border border-orange-200">
                                                {item.name} ({item.stock_quantity}/{item.min_stock_level})
                                            </span>
                                        ))}
                                        {alerts.lowStock.length > 5 && (
                                            <span className="text-xs text-orange-600 font-bold">+{alerts.lowStock.length - 5} more</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {alerts.expiring && alerts.expiring.length > 0 && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-red-900 mb-2">🗓️ Expiring Products</h3>
                                    <p className="text-sm text-red-800 mb-3">
                                        {alerts.expiring.length} product{alerts.expiring.length > 1 ? 's' : ''} expiring within 30 days
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {alerts.expiring.slice(0, 5).map((item: StockAlertItem) => (
                                            <span key={item.id} className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-red-700 border border-red-200">
                                                {item.name} (Exp: {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'})
                                            </span>
                                        ))}
                                        {alerts.expiring.length > 5 && (
                                            <span className="text-xs text-red-600 font-bold">+{alerts.expiring.length - 5} more</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Upload className="w-10 h-10 text-[var(--primary)]" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Importar Actualizaciones</h2>
                    <p className="text-gray-400 text-center max-w-sm mb-8">Arrastra tu archivo Excel o haz clic abajo para procesar los cambios de stock y nuevos productos.</p>

                    <label className={`
                        relative cursor-pointer inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95
                        ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                    `}>
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        {isUploading ? 'Procesando...' : 'Seleccionar Archivo'}
                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                </div>

                {/* Results & Help */}
                <div className="space-y-6">
                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex gap-4 items-start animate-in fade-in slide-in-from-top-4">
                            <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                            <div>
                                <h3 className="font-bold text-red-900">Error en la importación</h3>
                                <p className="text-red-700 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success Alert */}
                    {result && (
                        <div className="bg-green-50 border border-green-100 p-6 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="flex gap-4 items-start">
                                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                                <div>
                                    <h3 className="font-bold text-green-900">Importación exitosa</h3>
                                    <p className="text-green-700 text-sm mt-1">Se han procesado **{result.success}** filas correctamente.</p>
                                </div>
                            </div>
                            
                            {result.errors.length > 0 && (
                                <div className="bg-white/50 rounded-2xl p-4">
                                     <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Observaciones ({result.errors.length}):</p>
                                     <ul className="text-xs text-gray-600 list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                                        {result.errors.map((err: string, i: number) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                     </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Instructions Card */}
                    <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl space-y-6 h-full">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                <Info className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-lg">Guía de Operaciones</h3>
                        </div>

                        <div className="grid gap-4">
                            <div className="flex gap-3">
                                <div className="text-xs font-black bg-[var(--primary)] text-white px-2 py-1 rounded h-fit shrink-0">NEW</div>
                                <p className="text-sm text-gray-400"><span className="text-white font-bold">New Product:</span> Deja el SKU vacío para crear un nuevo item.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="text-xs font-black bg-blue-500 text-white px-2 py-1 rounded h-fit shrink-0">BUY</div>
                                <p className="text-sm text-gray-400"><span className="text-white font-bold">Purchase:</span> Agrega cantidad positiva y costo por unidad.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="text-xs font-black bg-red-500 text-white px-2 py-1 rounded h-fit shrink-0">LOS</div>
                                <p className="text-sm text-gray-400"><span className="text-white font-bold">Damage/Theft:</span> Usa cantidad negativa para descontar stock.</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <p className="text-xs text-gray-500 italic">Cada compra (Purchase) actualiza automáticamente el Costo Promedio Ponderado para tus reportes de utilidad.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Productos Activos</p>
                        <p className="text-2xl font-black text-gray-900">{stats?.totalProducts ?? '...'}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bajo Stock</p>
                        <p className="text-2xl font-black text-gray-900">{stats?.lowStockCount ?? '...'}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Valor Inventario</p>
                        <p className="text-2xl font-black text-gray-900">
                            {stats ? new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(stats.totalValue) : '...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Edit Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Edición Rápida</h2>
                        <p className="text-sm text-gray-500">Busca y ajusta precios o stock directamente.</p>
                    </div>
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-2xl">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                        >
                            <option value="all">Todas las categorías</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Stock Filter Tabs */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                        {stockFilterOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setStockFilter(option.value)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                    stockFilter === option.value
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {/* Items per page */}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-gray-500">Mostrar:</span>
                        <select
                            value={pagination.limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                        >
                            {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                                <option key={n} value={n}>{n} items</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {isLoadingProducts ? (
                    <div className="py-12 text-center text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Cargando productos...
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                        No se encontraron productos.
                    </div>
                ) : (
                    <>
                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                            {filteredProducts.map((p) => {
                                const stock = p.inventory?.stock_quantity ?? p.stock ?? 0;
                                const minStock = p.inventory?.min_stock_level ?? 5;
                                const price = p.base_price ?? p.price ?? 0;
                                const imageUrl = p.image_url ?? p.image;
                                const sku = p.sku ?? p.id;

                                return (
                                    <div key={p.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                        <div className="flex items-start gap-3 mb-3">
                                            {imageUrl && <img src={imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{p.name}</p>
                                                {p.category?.name && (
                                                    <p className="text-xs text-gray-400">{p.category.name}</p>
                                                )}
                                                <p className="text-xs font-mono text-gray-400 mt-1">SKU: {sku}</p>
                                            </div>
                                            <button
                                                onClick={() => openEdit({ ...p, price, stock })}
                                                className="p-2 text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-xl transition flex-shrink-0"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-900">
                                                {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(price)}
                                            </span>
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                                stock === 0 ? 'bg-red-50 text-red-600' :
                                                stock <= minStock ? 'bg-orange-50 text-orange-600' :
                                                'bg-green-50 text-green-600'
                                            }`}>
                                                {stock} un.
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="px-4 py-4">Producto</th>
                                        <th className="px-4 py-4">SKU</th>
                                        <th className="px-4 py-4">Precio Base</th>
                                        <th className="px-4 py-4 text-center">Stock</th>
                                        <th className="px-4 py-4 text-right">Accion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredProducts.map((p) => {
                                        const stock = p.inventory?.stock_quantity ?? p.stock ?? 0;
                                        const minStock = p.inventory?.min_stock_level ?? 5;
                                        const price = p.base_price ?? p.price ?? 0;
                                        const imageUrl = p.image_url ?? p.image;
                                        const sku = p.sku ?? p.id;

                                        return (
                                            <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {imageUrl && <img src={imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                                                        <div>
                                                            <span className="font-bold text-gray-900 block">{p.name}</span>
                                                            {p.category?.name && (
                                                                <span className="text-xs text-gray-400">{p.category.name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm font-mono text-gray-500">{sku}</td>
                                                <td className="px-4 py-4 font-bold text-gray-900">
                                                    {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(price)}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${
                                                        stock === 0 ? 'bg-red-50 text-red-600' :
                                                        stock <= minStock ? 'bg-orange-50 text-orange-600' :
                                                        'bg-green-50 text-green-600'
                                                    }`}>
                                                        {stock} un.
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <button
                                                        onClick={() => openEdit({ ...p, price, stock })}
                                                        className="p-2 text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-xl transition"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                            Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} productos
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={!pagination.hasPrev}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Page numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                    // Show pages around current page
                                    let pageNum: number;
                                    if (pagination.pages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.pages - 2) {
                                        pageNum = pagination.pages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                                                pagination.page === pageNum
                                                    ? 'bg-[var(--primary)] text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={!pagination.hasNext}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Editing Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Actualizar Producto</h3>
                                <p className="text-sm text-gray-500">{editingProduct.name} ({editingProduct.id})</p>
                            </div>
                            <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-50 rounded-xl transition">
                                <Search className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        {/* Tab Navigation */}
                        <div className="px-8 pt-6">
                            <div className="flex border-b border-gray-100">
                                {[
                                    { id: 'basic', label: 'Básico', icon: '💰' },
                                    { id: 'inventory', label: 'Inventario', icon: '📦' },
                                    { id: 'location', label: 'Ubicación', icon: '📍' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as 'basic' | 'inventory' | 'location')}
                                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${
                                            activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        <span className="mr-2">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Basic Tab */}
                            {activeTab === 'basic' && (
                                <>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Precio de Venta</label>
                                            <input
                                                type="number"
                                                value={editValues.price}
                                                onChange={(e) => setEditValues({ ...editValues, price: Number(e.target.value) })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Actual</label>
                                            <input
                                                type="number"
                                                value={editValues.stock}
                                                onChange={(e) => setEditValues({ ...editValues, stock: Number(e.target.value) })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-2xl flex gap-3">
                                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                        <div className="text-xs text-blue-700 leading-relaxed">
                                            <p className="font-medium mb-1">Cambios de Stock:</p>
                                            <p>Al cambiar el stock manualmente se generará una transacción de ajuste. Para compras a proveedores, utiliza la carga de planilla Excel para registrar el costo de compra correctamente.</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Inventory Tab */}
                            {activeTab === 'inventory' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha de Vencimiento</label>
                                            <DatePicker
                                                value={editValues.expiry_date}
                                                onChange={(date) => setEditValues({ ...editValues, expiry_date: date })}
                                                placeholder="Seleccionar fecha"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Número de Lote</label>
                                            <input
                                                type="text"
                                                value={editValues.batch_number}
                                                onChange={(e) => setEditValues({ ...editValues, batch_number: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                placeholder="Ej: LOTE-2024-001"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Mínimo (Alerta)</label>
                                        <input
                                            type="number"
                                            value={editValues.min_stock_level}
                                            onChange={(e) => setEditValues({ ...editValues, min_stock_level: Number(e.target.value) })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                                            min="0"
                                            placeholder="5"
                                        />
                                        <p className="text-xs text-gray-500">Cantidad mínima antes de mostrar alerta de bajo stock</p>
                                    </div>
                                </div>
                            )}

                            {/* Location Tab */}
                            {activeTab === 'location' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ubicación</label>
                                            <input
                                                type="text"
                                                value={editValues.location}
                                                onChange={(e) => setEditValues({ ...editValues, location: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                placeholder="Ej: Estante A, Refrigerador"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Número de Bandeja</label>
                                            <input
                                                type="text"
                                                value={editValues.bin_number}
                                                onChange={(e) => setEditValues({ ...editValues, bin_number: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                placeholder="Ej: BIN-01, Cajón 3"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Proveedor</label>
                                        <input
                                            type="text"
                                            value={editValues.supplier_name}
                                            onChange={(e) => setEditValues({ ...editValues, supplier_name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                                            placeholder="Nombre del proveedor"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-8 bg-gray-50 flex gap-3">
                            <button 
                                onClick={() => setEditingProduct(null)}
                                className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-700 transition"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleQuickEditSave}
                                disabled={isSaving}
                                className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
