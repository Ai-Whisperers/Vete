"use client";
import { useState, useEffect } from 'react';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Package, TrendingUp, Info, Tag, Search, Edit2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function InventoryClient() {
    const { clinic } = useParams() as { clinic: string };
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [editValues, setEditValues] = useState({ price: 0, stock: 0 });
    const [isSaving, setIsSaving] = useState(false);
    const [alerts, setAlerts] = useState<any>(null);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/inventory/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (e) {
            console.error('Failed to fetch stats', e);
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
            console.error('Failed to fetch alerts', e);
        }
    };

    const fetchProducts = async (query = '') => {
        setIsLoadingProducts(true);
        try {
            const res = await fetch(`/api/store/products?clinic=${clinic}&search=${query}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (e) {
            console.error('Failed to fetch products', e);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchProducts();
        fetchAlerts();
    }, [clinic]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const openEdit = (p: any) => {
        setEditingProduct(p);
        setEditValues({
            price: p.price,
            stock: p.stock
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
                        operation: 'price update', // Or adjustment
                        sku: editingProduct.id,
                        price: editValues.price,
                        quantity: editValues.stock - editingProduct.stock, // Adjustment delta
                    }]
                })
            });

            if (res.ok) {
                setEditingProduct(null);
                fetchProducts(searchQuery);
                fetchStats();
            }
        } catch (e) {
            console.error('Save failed', e);
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
                        onClick={() => window.location.href = `/${clinic}/portal/campaigns`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm border border-gray-200"
                    >
                        <Tag className="w-4 h-4 text-[var(--primary)]" /> Ver Promociones
                    </button>
                    <button 
                        onClick={() => handleExport('template')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition shadow-sm border border-gray-200"
                    >
                        <Download className="w-4 h-4" /> Bajar Plantilla
                    </button>
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
                                        {alerts.lowStock.slice(0, 5).map((item: any) => (
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
                                        {alerts.expiring.slice(0, 5).map((item: any) => (
                                            <span key={item.id} className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-red-700 border border-red-200">
                                                {item.name} (Exp: {new Date(item.expiry_date).toLocaleDateString()})
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

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-4 py-4">Producto</th>
                                <th className="px-4 py-4">SKU</th>
                                <th className="px-4 py-4">Precio Base</th>
                                <th className="px-4 py-4 text-center">Stock</th>
                                <th className="px-4 py-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoadingProducts ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Cargando productos...
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                                        No se encontraron productos.
                                    </td>
                                </tr>
                            ) : products.map((p) => (
                                <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                                            <span className="font-bold text-gray-900">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm font-mono text-gray-500">{p.id}</td>
                                    <td className="px-4 py-4 font-bold text-gray-900">
                                        {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(p.price)}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${p.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            {p.stock} un.
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button 
                                            onClick={() => openEdit(p)}
                                            className="p-2 text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-xl transition"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                        <div className="p-8 space-y-6">
                            {/* Image Upload */}
                            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <div className="w-24 h-24 bg-white rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                                    {editingProduct.image ? (
                                        <img src={editingProduct.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-8 h-8 text-gray-200" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-900">Imagen del Producto</p>
                                    <p className="text-xs text-gray-500">JPG, PNG o WebP. Máx 2MB.</p>
                                    <label className="inline-block mt-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 cursor-pointer transition">
                                        Cambiar Imagen
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                // We'll handle immediate upload here or just preview
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                formData.append('sku', editingProduct.id);
                                                formData.append('type', 'image');
                                                
                                                try {
                                                    const res = await fetch('/api/inventory/import', {
                                                        method: 'POST',
                                                        body: formData
                                                    });
                                                    if (res.ok) {
                                                        fetchProducts(searchQuery);
                                                    }
                                                } catch (err) {
                                                    console.error('Upload failed', err);
                                                }
                                            }} 
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Precio de Venta</label>
                                    <input 
                                        type="number"
                                        value={editValues.price}
                                        onChange={(e) => setEditValues({ ...editValues, price: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Actual</label>
                                    <input 
                                        type="number"
                                        value={editValues.stock}
                                        onChange={(e) => setEditValues({ ...editValues, stock: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                                    />
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded-2xl flex gap-3">
                                <Info className="w-5 h-5 text-blue-500 shrink-0" />
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Al cambiar el stock manualmente se generará una transacción de ajuste. 
                                    Para compras a proveedores, utiliza la carga de planilla Excel para registrar el costo de compra.
                                </p>
                            </div>
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
