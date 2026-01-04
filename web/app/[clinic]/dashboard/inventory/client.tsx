"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2,
    Package, TrendingUp, Info, Tag, Search, Edit2, ChevronDown, ExternalLink,
    FileDown, ChevronLeft, ChevronRight, Filter, Plus, Trash2, X, ArrowUpDown,
    ArrowUp, ArrowDown, MoreHorizontal, Eye, Copy, Clock, Store, Globe, Layers,
    Wand2, ScanLine
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { ImportWizard, BarcodeScanModal } from '@/components/dashboard/inventory';
import Image from 'next/image';

type ProductSource = 'all' | 'own' | 'catalog';

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

interface Product {
    id: string;
    sku: string;
    name: string;
    short_description?: string;
    description?: string;
    image_url?: string;
    base_price: number;
    sale_price?: number;
    category_id?: string;
    category?: { id: string; name: string; slug: string };
    brand?: { id: string; name: string };
    inventory?: {
        stock_quantity: number;
        min_stock_level?: number;
        weighted_average_cost?: number;
        expiry_date?: string;
        batch_number?: string;
    };
    is_active: boolean;
    created_at: string;
    source?: 'own' | 'catalog';
    assignment?: {
        sale_price: number;
        min_stock_level: number;
        location?: string;
        margin_percentage?: number;
    };
}

interface NewProductForm {
    name: string;
    sku: string;
    barcode: string;
    category: string;
    description: string;
    base_price: number;
    stock: number;
    cost: number;
    min_stock: number;
}

type SortField = 'name' | 'sku' | 'base_price' | 'stock' | 'category';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const stockFilterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'in_stock', label: 'En Stock' },
    { value: 'low_stock', label: 'Stock Bajo' },
    { value: 'out_of_stock', label: 'Sin Stock' },
];

const sourceTabOptions: { value: ProductSource; label: string; icon: React.ReactNode; description: string }[] = [
    { value: 'all', label: 'Todos', icon: <Layers className="w-4 h-4" />, description: 'Todos los productos' },
    { value: 'own', label: 'Mis Productos', icon: <Store className="w-4 h-4" />, description: 'Productos propios de la clínica' },
    { value: 'catalog', label: 'Del Catálogo', icon: <Globe className="w-4 h-4" />, description: 'Productos del catálogo global' },
];

const initialNewProduct: NewProductForm = {
    name: '',
    sku: '',
    barcode: '',
    category: '',
    description: '',
    base_price: 0,
    stock: 0,
    cost: 0,
    min_stock: 5,
};

export default function InventoryClient({ googleSheetUrl }: InventoryClientProps) {
    const { clinic } = useParams() as { clinic: string };

    // Import Result Type
    interface ImportResult {
        success: number;
        errors: string[];
        message?: string;
    }

    // Inventory Stats Type
    interface InventoryStats {
        totalProducts: number;
        lowStockCount: number;
        totalValue: number;
    }

    // Inventory Alerts Type
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

    // UI State
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
    const templateDropdownRef = useRef<HTMLDivElement>(null);

    // Data State
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [alerts, setAlerts] = useState<InventoryAlerts | null>(null);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    // Filter/Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [stockFilter, setStockFilter] = useState<string>('all');
    const [sourceFilter, setSourceFilter] = useState<ProductSource>('all');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [sourceSummary, setSourceSummary] = useState<{ own?: number; catalog?: number }>({});

    // Pagination State
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 25,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false,
    });

    // Modal State
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editValues, setEditValues] = useState({ price: 0, stock: 0 });
    const [isSaving, setIsSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState<NewProductForm>(initialNewProduct);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [showProductDetail, setShowProductDetail] = useState<Product | null>(null);

    // Import Wizard State
    const [showImportWizard, setShowImportWizard] = useState(false);

    // Barcode Scanner State
    const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

    // Import Preview State (legacy - for direct file upload)
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<{
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
    } | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    // Fetch functions
    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/inventory/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Error al cargar estadísticas', e);
            }
        }
    }, []);

    const fetchAlerts = useCallback(async () => {
        try {
            const res = await fetch('/api/inventory/alerts');
            if (res.ok) {
                const data = await res.json();
                setAlerts(data);
            }
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Error al cargar alertas', e);
            }
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch(`/api/store/categories?clinic=${clinic}`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Error al cargar categorías', e);
            }
        }
    }, [clinic]);

    const fetchProducts = useCallback(async (query = '', page = 1, limit = pagination.limit) => {
        setIsLoadingProducts(true);
        try {
            // Use the new dashboard inventory API that supports source filtering
            let url = `/api/dashboard/inventory?clinic=${clinic}&search=${encodeURIComponent(query)}&page=${page}&limit=${limit}&source=${sourceFilter}`;

            if (selectedCategory !== 'all') {
                url += `&category=${selectedCategory}`;
            }

            if (stockFilter !== 'all') {
                url += `&stock_status=${stockFilter}`;
            }

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
                if (data.summary) {
                    setSourceSummary(data.summary);
                }
            }
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Error al cargar productos', e);
            }
        } finally {
            setIsLoadingProducts(false);
        }
    }, [clinic, selectedCategory, stockFilter, sourceFilter, pagination.limit]);

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

    // Initial data load
    useEffect(() => {
        fetchStats();
        fetchCategories();
        fetchProducts();
        fetchAlerts();
    }, [clinic]);

    // Refetch when filters change
    useEffect(() => {
        fetchProducts(searchQuery, 1, pagination.limit);
    }, [selectedCategory, stockFilter, sourceFilter]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(searchQuery, 1, pagination.limit);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Apply local stock filtering and sorting
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...products];

        // Local stock filtering
        if (stockFilter === 'low_stock') {
            filtered = filtered.filter(p =>
                (p.inventory?.stock_quantity || 0) > 0 &&
                (p.inventory?.stock_quantity || 0) <= (p.inventory?.min_stock_level || 5)
            );
        } else if (stockFilter === 'out_of_stock') {
            filtered = filtered.filter(p => (p.inventory?.stock_quantity || 0) === 0);
        }

        // Sorting
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name, 'es');
                    break;
                case 'sku':
                    comparison = (a.sku || '').localeCompare(b.sku || '');
                    break;
                case 'base_price':
                    comparison = (a.base_price || 0) - (b.base_price || 0);
                    break;
                case 'stock':
                    comparison = (a.inventory?.stock_quantity || 0) - (b.inventory?.stock_quantity || 0);
                    break;
                case 'category':
                    comparison = (a.category?.name || '').localeCompare(b.category?.name || '', 'es');
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [products, stockFilter, sortField, sortDirection]);

    // Handlers
    const handlePageChange = (newPage: number) => {
        fetchProducts(searchQuery, newPage, pagination.limit);
    };

    const handleLimitChange = (newLimit: number) => {
        setPagination(prev => ({ ...prev, limit: newLimit }));
        fetchProducts(searchQuery, 1, newLimit);
    };

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const openEdit = (p: Product) => {
        setEditingProduct(p);
        setEditValues({
            price: p.base_price || 0,
            stock: p.inventory?.stock_quantity || 0
        });
    };

    const handleQuickEditSave = async () => {
        if (!editingProduct) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/inventory/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rows: [{
                        operation: 'adjustment',
                        sku: editingProduct.sku || editingProduct.id,
                        price: editValues.price,
                        quantity: editValues.stock - (editingProduct.inventory?.stock_quantity || 0),
                    }]
                })
            });

            if (res.ok) {
                setEditingProduct(null);
                fetchProducts(searchQuery, pagination.page, pagination.limit);
                fetchStats();
            } else {
                const text = await res.text();
                setError(text || 'Error al guardar');
            }
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Error al guardar', e);
            }
            setError('Error de conexión');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateProduct = async () => {
        if (!newProduct.name || !newProduct.base_price) {
            setError('Nombre y Precio son obligatorios');
            return;
        }
        setIsCreating(true);
        try {
            const res = await fetch('/api/inventory/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rows: [{
                        operation: 'new product',
                        sku: newProduct.sku || undefined,
                        barcode: newProduct.barcode || undefined,
                        name: newProduct.name,
                        category: newProduct.category || undefined,
                        description: newProduct.description || undefined,
                        price: newProduct.base_price,
                        quantity: newProduct.stock,
                        unit_cost: newProduct.cost || undefined,
                        min_stock: newProduct.min_stock,
                    }]
                })
            });

            if (res.ok) {
                setShowAddModal(false);
                setNewProduct(initialNewProduct);
                fetchProducts(searchQuery, pagination.page, pagination.limit);
                fetchStats();
                setResult({ success: 1, errors: [], message: 'Producto creado exitosamente' });
            } else {
                const text = await res.text();
                setError(text || 'Error al crear producto');
            }
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Error al crear producto', e);
            }
            setError('Error de conexión');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        setIsDeleting(true);
        try {
            // Use delete-product server action via API
            const res = await fetch(`/api/store/products/${productId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setDeleteConfirm(null);
                fetchProducts(searchQuery, pagination.page, pagination.limit);
                fetchStats();
            } else {
                const data = await res.json();
                setError(data.error || 'Error al eliminar producto');
            }
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Error al eliminar', e);
            }
            setError('Error de conexión');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExport = async (type: 'template' | 'catalog') => {
        try {
            const res = await fetch(`/api/inventory/export?type=${type}`);
            if (!res.ok) throw new Error('Error en la exportación');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventario_${type}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error desconocido');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // First, get a preview of the import
        setIsLoadingPreview(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/inventory/import/preview', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Error en la vista previa');
            }

            const data = await res.json();
            setPreviewData(data);
            setPendingFile(file);
            setShowPreview(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error desconocido');
        } finally {
            setIsLoadingPreview(false);
            // Reset file input
            e.target.value = '';
        }
    };

    const handleConfirmImport = async () => {
        if (!pendingFile) return;

        setIsUploading(true);
        setShowPreview(false);
        setError(null);

        const formData = new FormData();
        formData.append('file', pendingFile);

        try {
            const res = await fetch('/api/inventory/import', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Error en la importación');
            }

            const data = await res.json();
            setResult(data);
            fetchStats();
            fetchProducts(searchQuery, pagination.page, pagination.limit);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error desconocido');
        } finally {
            setIsUploading(false);
            setPendingFile(null);
            setPreviewData(null);
        }
    };

    const handleCancelImport = () => {
        setShowPreview(false);
        setPendingFile(null);
        setPreviewData(null);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: 'PYG',
            maximumFractionDigits: 0
        }).format(price);
    };

    const SortButton = ({ field, label }: { field: SortField; label: string }) => (
        <button
            onClick={() => toggleSort(field)}
            className="inline-flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
        >
            {label}
            {sortField === field ? (
                sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
            ) : (
                <ArrowUpDown className="w-3 h-3 opacity-40" />
            )}
        </button>
    );

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Gestión de Inventario</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Administra productos, stock y precios de <span className="font-semibold text-[var(--primary)]">{clinic}</span>
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Producto
                    </button>

                    <button
                        onClick={() => setShowBarcodeScanner(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition"
                        title="Escanear código de barras para buscar o editar producto"
                    >
                        <ScanLine className="w-4 h-4" /> Escanear
                    </button>

                    <button
                        onClick={() => setShowImportWizard(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition"
                    >
                        <Wand2 className="w-4 h-4" /> Importar con Asistente
                    </button>

                    <button
                        onClick={() => window.location.href = `/${clinic}/portal/inventory/catalog`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                    >
                        <Globe className="w-4 h-4" /> Catálogo Global
                    </button>

                    <div className="relative" ref={templateDropdownRef}>
                        <button
                            onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                        >
                            <Download className="w-4 h-4" />
                            Plantilla
                            <ChevronDown className={`w-4 h-4 transition-transform ${templateDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {templateDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                <div className="p-3 bg-gray-900 text-white">
                                    <h4 className="font-bold text-sm">Plantilla de Inventario</h4>
                                </div>
                                <div className="p-2">
                                    {googleSheetUrl && (
                                        <a
                                            href={googleSheetUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setTemplateDropdownOpen(false)}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition"
                                        >
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <ExternalLink className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-900 block">Google Sheets</span>
                                                <span className="text-xs text-gray-500">Crear copia en Drive</span>
                                            </div>
                                        </a>
                                    )}
                                    <button
                                        onClick={() => { handleExport('template'); setTemplateDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition text-left"
                                    >
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <FileDown className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-900 block">Descargar Excel</span>
                                            <span className="text-xs text-gray-500">Archivo .xlsx</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => handleExport('catalog')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> Exportar
                    </button>
                </div>
            </div>

            {/* Source Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                <div className="flex flex-col sm:flex-row gap-2">
                    {sourceTabOptions.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setSourceFilter(tab.value)}
                            className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                sourceFilter === tab.value
                                    ? 'bg-[var(--primary)] text-white shadow-lg'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <span className={sourceFilter === tab.value ? 'text-white' : 'text-gray-400'}>
                                {tab.icon}
                            </span>
                            <span className="font-bold">{tab.label}</span>
                            {tab.value !== 'all' && sourceSummary[tab.value] !== undefined && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    sourceFilter === tab.value
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {sourceSummary[tab.value]}
                                </span>
                            )}
                            {tab.value === 'all' && (sourceSummary.own !== undefined || sourceSummary.catalog !== undefined) && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    sourceFilter === tab.value
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {(sourceSummary.own || 0) + (sourceSummary.catalog || 0)}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alerts */}
            {alerts?.hasAlerts && (
                <div className="space-y-3">
                    {alerts.lowStock?.length > 0 && (
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-orange-900">
                                        Alerta de Stock Bajo
                                    </h3>
                                    <p className="text-sm text-orange-700 mt-1">
                                        {alerts.lowStock.length} producto{alerts.lowStock.length > 1 ? 's' : ''} por debajo del nivel mínimo
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {alerts.lowStock.slice(0, 5).map((item: StockAlertItem) => (
                                            <span key={item.id} className="bg-white px-2 py-1 rounded text-xs font-medium text-orange-700 border border-orange-200">
                                                {item.name} ({item.stock_quantity}/{item.min_stock_level})
                                            </span>
                                        ))}
                                        {alerts.lowStock.length > 5 && (
                                            <span className="text-xs text-orange-600 font-medium">+{alerts.lowStock.length - 5} más</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {alerts.expiring?.length > 0 && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-red-500 mt-0.5" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-red-900">
                                            Productos por Vencer
                                        </h3>
                                        <button
                                            onClick={() => window.location.href = `/${clinic}/dashboard/inventory/expiring`}
                                            className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline"
                                        >
                                            Ver todo →
                                        </button>
                                    </div>
                                    <p className="text-sm text-red-700 mt-1">
                                        {alerts.expiring.length} producto{alerts.expiring.length > 1 ? 's' : ''} vencen en los próximos 30 días
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {alerts.expiring.slice(0, 5).map((item: StockAlertItem) => (
                                            <span key={item.id} className="bg-white px-2 py-1 rounded text-xs font-medium text-red-700 border border-red-200">
                                                {item.name} (Vence: {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('es-PY') : 'N/A'})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Productos Activos</p>
                        <p className="text-2xl font-black text-gray-900">{stats?.totalProducts ?? '—'}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Stock Bajo</p>
                        <p className="text-2xl font-black text-gray-900">{stats?.lowStockCount ?? '—'}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Valor Inventario</p>
                        <p className="text-2xl font-black text-gray-900">
                            {stats ? formatPrice(stats.totalValue) : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Import Section */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col items-center justify-center min-h-[280px]">
                    <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-[var(--primary)]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Importar Actualizaciones</h2>
                    <p className="text-gray-400 text-center text-sm max-w-sm mb-6">
                        Sube tu archivo Excel para actualizar stock, precios o agregar productos.
                    </p>
                    <label className={`
                        cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl transition-all hover:bg-gray-800
                        ${(isUploading || isLoadingPreview) ? 'opacity-50 pointer-events-none' : ''}
                    `}>
                        {(isUploading || isLoadingPreview) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        {isLoadingPreview ? 'Analizando...' : isUploading ? 'Importando...' : 'Seleccionar Archivo'}
                        <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} disabled={isUploading || isLoadingPreview} />
                    </label>
                    <p className="text-xs text-gray-400 mt-3 text-center">
                        Se mostrará una vista previa antes de importar
                    </p>
                </div>

                <div className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-red-900">Error</h3>
                                <p className="text-red-700 text-sm mt-1">{error}</p>
                            </div>
                            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {result && (
                        <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                            <div className="flex gap-3 items-start">
                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-green-900">Importación Exitosa</h3>
                                    <p className="text-green-700 text-sm mt-1">
                                        Se procesaron <strong>{result.success}</strong> filas correctamente.
                                    </p>
                                </div>
                                <button onClick={() => setResult(null)} className="text-green-400 hover:text-green-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            {result.errors?.length > 0 && (
                                <div className="mt-3 p-3 bg-white/50 rounded-lg">
                                    <p className="text-xs font-bold text-orange-600 uppercase mb-2">
                                        Observaciones ({result.errors.length}):
                                    </p>
                                    <ul className="text-xs text-gray-600 list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                                        {result.errors.map((err: string, i: number) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-gray-900 text-white p-5 rounded-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-5 h-5" />
                            <h3 className="font-bold">Guía Rápida</h3>
                        </div>
                        <div className="grid gap-2 text-sm">
                            <div className="flex gap-2">
                                <span className="bg-[var(--primary)] text-white px-2 py-0.5 rounded text-xs font-bold">NEW</span>
                                <span className="text-gray-300">Crear producto (SKU vacío)</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-bold">BUY</span>
                                <span className="text-gray-300">Compra (cantidad + costo)</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">ADJ</span>
                                <span className="text-gray-300">Ajuste de inventario (+/-)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Table Header */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Catálogo de Productos</h2>
                            <p className="text-sm text-gray-500">{pagination.total} productos en total</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mt-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                            >
                                <option value="all">Todas las categorías</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                            {stockFilterOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setStockFilter(option.value)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                        stockFilter === option.value
                                            ? 'bg-[var(--primary)] text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-sm text-gray-500">Mostrar:</span>
                            <select
                                value={pagination.limit}
                                onChange={(e) => handleLimitChange(Number(e.target.value))}
                                className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                            >
                                {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                {isLoadingProducts ? (
                    <div className="py-16 text-center text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                        Cargando productos...
                    </div>
                ) : filteredAndSortedProducts.length === 0 ? (
                    <div className="py-16 text-center">
                        <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400">No se encontraron productos</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white font-medium rounded-lg hover:opacity-90"
                        >
                            <Plus className="w-4 h-4" /> Agregar Producto
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="px-4 py-4 w-12">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedProducts(new Set(filteredAndSortedProducts.map(p => p.id)));
                                                    } else {
                                                        setSelectedProducts(new Set());
                                                    }
                                                }}
                                            />
                                        </th>
                                        <th className="px-4 py-4">
                                            <SortButton field="name" label="Producto" />
                                        </th>
                                        <th className="px-4 py-4">
                                            <SortButton field="sku" label="SKU" />
                                        </th>
                                        <th className="px-4 py-4">
                                            <SortButton field="category" label="Categoría" />
                                        </th>
                                        <th className="px-4 py-4 text-right">
                                            <SortButton field="base_price" label="Precio" />
                                        </th>
                                        <th className="px-4 py-4 text-center">
                                            <SortButton field="stock" label="Stock" />
                                        </th>
                                        <th className="px-4 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredAndSortedProducts.map((p) => {
                                        const stock = p.inventory?.stock_quantity ?? 0;
                                        const minStock = p.inventory?.min_stock_level ?? 5;

                                        return (
                                            <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300"
                                                        checked={selectedProducts.has(p.id)}
                                                        onChange={(e) => {
                                                            const newSet = new Set(selectedProducts);
                                                            if (e.target.checked) {
                                                                newSet.add(p.id);
                                                            } else {
                                                                newSet.delete(p.id);
                                                            }
                                                            setSelectedProducts(newSet);
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                            {p.image_url ? (
                                                                <Image
                                                                    src={p.image_url}
                                                                    alt={p.name}
                                                                    width={40}
                                                                    height={40}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package className="w-5 h-5 text-gray-300" />
                                                                </div>
                                                            )}
                                                            {/* Source indicator badge */}
                                                            {p.source && sourceFilter === 'all' && (
                                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                                                                    p.source === 'catalog' ? 'bg-blue-500' : 'bg-green-500'
                                                                }`} title={p.source === 'catalog' ? 'Del catálogo' : 'Propio'}>
                                                                    {p.source === 'catalog' ? (
                                                                        <Globe className="w-2.5 h-2.5 text-white" />
                                                                    ) : (
                                                                        <Store className="w-2.5 h-2.5 text-white" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-gray-900 truncate">{p.name}</p>
                                                                {p.source === 'catalog' && p.assignment?.margin_percentage && (
                                                                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">
                                                                        +{p.assignment.margin_percentage.toFixed(0)}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {p.brand?.name && (
                                                                <p className="text-xs text-gray-400">{p.brand.name}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm font-mono text-gray-500">{p.sku || '—'}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-600">{p.category?.name || '—'}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div>
                                                        <span className="font-bold text-gray-900">
                                                            {formatPrice(p.sale_price || p.assignment?.sale_price || p.base_price)}
                                                        </span>
                                                        {p.inventory?.weighted_average_cost && (
                                                            <p className="text-[10px] text-gray-400">
                                                                Costo: {formatPrice(p.inventory.weighted_average_cost)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${
                                                        stock === 0 ? 'bg-red-50 text-red-600' :
                                                        stock <= minStock ? 'bg-orange-50 text-orange-600' :
                                                        'bg-green-50 text-green-600'
                                                    }`}>
                                                        {stock} un.
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => openEdit(p)}
                                                            className="p-2 text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg transition"
                                                            title="Editar"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(p.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-gray-50">
                            {filteredAndSortedProducts.map((p) => {
                                const stock = p.inventory?.stock_quantity ?? 0;
                                const minStock = p.inventory?.min_stock_level ?? 5;

                                return (
                                    <div key={p.id} className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                {p.image_url ? (
                                                    <Image src={p.image_url} alt={p.name} width={48} height={48} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                )}
                                                {/* Source indicator badge */}
                                                {p.source && sourceFilter === 'all' && (
                                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                                                        p.source === 'catalog' ? 'bg-blue-500' : 'bg-green-500'
                                                    }`}>
                                                        {p.source === 'catalog' ? (
                                                            <Globe className="w-3 h-3 text-white" />
                                                        ) : (
                                                            <Store className="w-3 h-3 text-white" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-900 truncate">{p.name}</p>
                                                    {p.source === 'catalog' && p.assignment?.margin_percentage && (
                                                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">
                                                            +{p.assignment.margin_percentage.toFixed(0)}%
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400">{p.category?.name || 'Sin categoría'}</p>
                                                <p className="text-xs font-mono text-gray-400 mt-1">SKU: {p.sku || '—'}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-[var(--primary)]">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeleteConfirm(p.id)} className="p-2 text-gray-400 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <div>
                                                <span className="font-bold text-gray-900">
                                                    {formatPrice(p.sale_price || p.assignment?.sale_price || p.base_price)}
                                                </span>
                                                {p.inventory?.weighted_average_cost && (
                                                    <span className="text-[10px] text-gray-400 ml-2">
                                                        Costo: {formatPrice(p.inventory.weighted_average_cost)}
                                                    </span>
                                                )}
                                            </div>
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
                    </>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                            Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={!pagination.hasPrev}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
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
                                        className={`w-10 h-10 rounded-lg text-sm font-bold transition ${
                                            pagination.page === pageNum
                                                ? 'bg-[var(--primary)] text-white'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={!pagination.hasNext}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Edición Rápida</h3>
                                <p className="text-sm text-gray-500 truncate max-w-[280px]">{editingProduct.name}</p>
                            </div>
                            <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Precio de Venta</label>
                                    <input
                                        type="number"
                                        value={editValues.price}
                                        onChange={(e) => setEditValues({ ...editValues, price: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-lg focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Stock Actual</label>
                                    <input
                                        type="number"
                                        value={editValues.stock}
                                        onChange={(e) => setEditValues({ ...editValues, stock: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-lg focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-xl flex gap-2">
                                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700">
                                    Los cambios de stock generan un ajuste automático. Para compras, usa la importación Excel.
                                </p>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-3">
                            <button
                                onClick={() => setEditingProduct(null)}
                                className="flex-1 py-3 font-bold text-gray-500 hover:text-gray-700 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleQuickEditSave}
                                disabled={isSaving}
                                className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Nuevo Producto</h3>
                                <p className="text-sm text-gray-500">Agregar producto al inventario</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                                    Nombre del Producto <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    placeholder="Ej: Royal Canin Adult 15kg"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">SKU (opcional)</label>
                                    <input
                                        type="text"
                                        value={newProduct.sku}
                                        onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                                        placeholder="Auto-generado"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Código de Barras</label>
                                    <input
                                        type="text"
                                        value={newProduct.barcode}
                                        onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                                        placeholder="7891234567890"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Categoría</label>
                                <select
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Descripción</label>
                                <textarea
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    placeholder="Descripción del producto..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 outline-none resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                                        Precio de Venta <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={newProduct.base_price || ''}
                                        onChange={(e) => setNewProduct({ ...newProduct, base_price: Number(e.target.value) })}
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Costo Unitario</label>
                                    <input
                                        type="number"
                                        value={newProduct.cost || ''}
                                        onChange={(e) => setNewProduct({ ...newProduct, cost: Number(e.target.value) })}
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Stock Inicial</label>
                                    <input
                                        type="number"
                                        value={newProduct.stock || ''}
                                        onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Stock Mínimo</label>
                                    <input
                                        type="number"
                                        value={newProduct.min_stock || ''}
                                        onChange={(e) => setNewProduct({ ...newProduct, min_stock: Number(e.target.value) })}
                                        placeholder="5"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-3 sticky bottom-0">
                            <button
                                onClick={() => { setShowAddModal(false); setNewProduct(initialNewProduct); }}
                                className="flex-1 py-3 font-bold text-gray-500 hover:text-gray-700 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateProduct}
                                disabled={isCreating || !newProduct.name || !newProduct.base_price}
                                className="flex-1 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                Crear Producto
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar Producto</h3>
                            <p className="text-gray-500 text-sm">
                                ¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-3 font-bold text-gray-500 hover:text-gray-700 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteProduct(deleteConfirm)}
                                disabled={isDeleting}
                                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Wizard */}
            <ImportWizard
                isOpen={showImportWizard}
                onClose={() => setShowImportWizard(false)}
                onImportComplete={() => {
                    fetchStats();
                    fetchProducts(searchQuery, pagination.page, pagination.limit);
                }}
                clinic={clinic}
            />

            {/* Barcode Scanner Modal */}
            <BarcodeScanModal
                isOpen={showBarcodeScanner}
                onClose={() => setShowBarcodeScanner(false)}
                clinic={clinic}
                onProductFound={(product, barcode) => {
                    setShowBarcodeScanner(false);
                    // Find the product in our list and open edit modal
                    const foundProduct = products.find(p => p.id === product.id);
                    if (foundProduct) {
                        openEdit(foundProduct);
                    } else {
                        // Product not in current view, search for it
                        setSearchQuery(product.sku || product.name);
                        // Show success toast
                        setResult({
                            success: 1,
                            errors: [],
                            message: `Producto encontrado: ${product.name}`
                        });
                    }
                }}
            />

            {/* Import Preview Modal (Legacy - for direct file upload) */}
            {showPreview && previewData && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Vista Previa de Importación</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Revisa los cambios antes de confirmar
                                </p>
                            </div>
                            <button
                                onClick={handleCancelImport}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className="p-6 bg-gray-50 border-b border-gray-100">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                                    <div className="text-2xl font-bold text-gray-900">{previewData.summary.totalRows}</div>
                                    <div className="text-xs text-gray-500">Total Filas</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-green-100 text-center">
                                    <div className="text-2xl font-bold text-green-600">{previewData.summary.newProducts}</div>
                                    <div className="text-xs text-gray-500">Nuevos</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-blue-100 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{previewData.summary.updates}</div>
                                    <div className="text-xs text-gray-500">Actualizaciones</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-amber-100 text-center">
                                    <div className="text-2xl font-bold text-amber-600">{previewData.summary.adjustments}</div>
                                    <div className="text-xs text-gray-500">Ajustes Stock</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-red-100 text-center">
                                    <div className="text-2xl font-bold text-red-600">{previewData.summary.errors}</div>
                                    <div className="text-xs text-gray-500">Errores</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                                    <div className="text-2xl font-bold text-gray-400">{previewData.summary.skipped}</div>
                                    <div className="text-xs text-gray-500">Omitidos</div>
                                </div>
                            </div>

                            {previewData.summary.errors > 0 && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-sm text-red-700">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>Hay {previewData.summary.errors} errores que no se procesarán. Revisa la tabla para más detalles.</span>
                                </div>
                            )}
                        </div>

                        {/* Preview Table */}
                        <div className="flex-1 overflow-auto p-6">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 uppercase">Fila</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 uppercase">Estado</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 uppercase">Operación</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 uppercase">SKU</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 uppercase">Nombre</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 uppercase">Stock</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 uppercase">Mensaje</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {previewData.preview.map((row, idx) => (
                                        <tr key={idx} className={`
                                            ${row.status === 'error' ? 'bg-red-50' : ''}
                                            ${row.status === 'skip' ? 'bg-gray-50 text-gray-400' : ''}
                                        `}>
                                            <td className="px-3 py-2 font-mono text-gray-500">{row.rowNumber}</td>
                                            <td className="px-3 py-2">
                                                <span className={`
                                                    inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
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
                                            <td className="px-3 py-2 capitalize">{row.operation || '-'}</td>
                                            <td className="px-3 py-2 font-mono">{row.sku || '-'}</td>
                                            <td className="px-3 py-2 max-w-[200px] truncate">{row.name || '-'}</td>
                                            <td className="px-3 py-2">
                                                {row.currentStock !== undefined && row.newStock !== undefined ? (
                                                    <span className="flex items-center gap-1">
                                                        <span className="text-gray-400">{row.currentStock}</span>
                                                        <span className="text-gray-300">→</span>
                                                        <span className={row.newStock > row.currentStock ? 'text-green-600 font-medium' : row.newStock < row.currentStock ? 'text-red-600 font-medium' : ''}>
                                                            {row.newStock}
                                                        </span>
                                                    </span>
                                                ) : row.newStock !== undefined ? (
                                                    <span className="text-green-600">{row.newStock}</span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-gray-500 max-w-[250px] truncate">{row.message}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={handleCancelImport}
                                className="flex-1 py-3 font-bold text-gray-500 hover:text-gray-700 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                disabled={previewData.summary.newProducts === 0 && previewData.summary.updates === 0 && previewData.summary.adjustments === 0}
                                className="flex-1 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                Confirmar Importación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
