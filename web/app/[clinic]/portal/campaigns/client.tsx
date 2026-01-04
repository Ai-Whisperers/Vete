"use client";
import { useState, useEffect } from 'react';
import { Plus, Tag, Calendar, Trash2, Loader2, Search, Percent, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CampaignsClient() {
    const { clinic } = useParams() as { clinic: string };
    const supabase = createClient();
    
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]); // {id, discount_type, discount_value}
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [clinic]);

    const fetchData = async () => {
        setLoading(true);
        const { data: camps } = await supabase
            .from('store_campaigns')
            .select('*, store_campaign_items(*, store_products(name))')
            .eq('tenant_id', clinic)
            .order('created_at', { ascending: false });
        
        const { data: prods } = await supabase
            .from('store_products')
            .select('id, sku, name, base_price')
            .eq('tenant_id', clinic)
            .eq('is_active', true);

        setCampaigns(camps || []);
        setProducts(prods || []);
        setLoading(false);
    };

    const handleAddProduct = (p: any) => {
        if (selectedProducts.find(sp => sp.id === p.id)) return;
        setSelectedProducts([...selectedProducts, { ...p, discount_type: 'percentage', discount_value: 10 }]);
    };

    const handleSave = async () => {
        if (!name || !startDate || !endDate || selectedProducts.length === 0) return;
        setIsSaving(true);
        
        try {
            const { data: camp, error: cError } = await supabase
                .from('store_campaigns')
                .insert({
                    tenant_id: clinic,
                    name,
                    start_date: new Date(startDate).toISOString(),
                    end_date: new Date(endDate).toISOString(),
                })
                .select()
                .single();

            if (cError) throw cError;

            const items = selectedProducts.map(sp => ({
                campaign_id: camp.id,
                product_id: sp.id,
                discount_type: sp.discount_type,
                discount_value: sp.discount_value
            }));

            const { error: iError } = await supabase
                .from('store_campaign_items')
                .insert(items);

            if (iError) throw iError;

            setShowNewForm(false);
            setName('');
            setStartDate('');
            setEndDate('');
            setSelectedProducts([]);
            fetchData();
        } catch (e) {
            // Client-side error logging - only in development
            if (process.env.NODE_ENV === 'development') {
                console.error(e);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que quieres eliminar esta campaña?')) return;
        await supabase.from('store_campaigns').delete().eq('id', id);
        fetchData();
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Promociones</h1>
                    <p className="text-gray-500">Crea eventos de descuento por tiempo limitado.</p>
                </div>
                <button 
                    onClick={() => setShowNewForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-2xl hover:bg-[var(--primary)]/90 transition shadow-lg shrink-0"
                >
                    <Plus className="w-5 h-5" /> Nueva Campaña
                </button>
            </div>

            {showNewForm && (
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-[var(--primary)]/20 animate-in zoom-in-95 duration-200">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-[var(--primary)]" /> Configurar Nueva Campaña
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Nombre del Evento</label>
                            <input 
                                type="text" 
                                placeholder="Ej: Black Friday, Navidad..." 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[var(--primary)]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Inicio</label>
                                <input 
                                    type="datetime-local" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Fin</label>
                                <input 
                                    type="datetime-local" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                        {/* Selector de Productos */}
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar productos para agregar..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl"
                                />
                            </div>
                            
                            <div className="max-h-60 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                                {products.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{p.name}</p>
                                            <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleAddProduct(p)}
                                            className="p-2 bg-white text-[var(--primary)] border border-gray-100 rounded-lg hover:bg-[var(--primary)] hover:text-white transition"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Productos Seleccionados */}
                        <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Productos Seleccionados ({selectedProducts.length})</p>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                {selectedProducts.map((sp, idx) => (
                                    <div key={sp.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group">
                                        <button 
                                            onClick={() => setSelectedProducts(selectedProducts.filter(p => p.id !== sp.id))}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                        <p className="font-bold text-sm mb-3">{sp.name}</p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    const updated = [...selectedProducts];
                                                    updated[idx].discount_type = 'percentage';
                                                    setSelectedProducts(updated);
                                                }}
                                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1 transition-all ${sp.discount_type === 'percentage' ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 text-gray-400'}`}
                                            >
                                                <Percent className="w-3 h-3" /> Porcentaje
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const updated = [...selectedProducts];
                                                    updated[idx].discount_type = 'fixed_amount';
                                                    setSelectedProducts(updated);
                                                }}
                                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1 transition-all ${sp.discount_type === 'fixed_amount' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                                            >
                                                <DollarSign className="w-3 h-3" /> Monto Fijo
                                            </button>
                                        </div>
                                        <input 
                                            type="number" 
                                            value={sp.discount_value}
                                            onChange={(e) => {
                                                const updated = [...selectedProducts];
                                                updated[idx].discount_value = parseFloat(e.target.value) || 0;
                                                setSelectedProducts(updated);
                                            }}
                                            className="w-full mt-3 px-3 py-2 bg-gray-50 border-none rounded-lg text-sm text-center font-bold"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button 
                            onClick={() => setShowNewForm(false)}
                            className="px-6 py-3 font-bold text-gray-500 hover:text-gray-900 transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving || selectedProducts.length === 0}
                            className="px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-2xl hover:bg-[var(--primary)]/90 transition shadow-lg disabled:opacity-50"
                        >
                            {isSaving ? 'Guardando...' : 'Crear Campaña'}
                        </button>
                    </div>
                </div>
            )}

            {/* Listado de Campañas */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map(camp => {
                    const isActive = new Date(camp.start_date) <= new Date() && new Date(camp.end_date) >= new Date();
                    return (
                        <div key={camp.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group overflow-hidden">
                            <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${isActive ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {isActive ? 'Activa' : 'Programada'}
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{camp.name}</h3>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    <span>{new Date(camp.start_date).toLocaleDateString()} - {new Date(camp.end_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <Tag className="w-4 h-4 shrink-0" />
                                    <span>{camp.store_campaign_items?.length || 0} productos en descuento</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                <button 
                                    onClick={() => handleDelete(camp.id)}
                                    className="p-2 text-red-100 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <span className={`text-[10px] font-black uppercase py-1 px-3 rounded-full ${isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                    {isActive ? 'Dando beneficios' : 'Pendiente'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
