"use client";
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { useParams } from 'next/navigation';
import { ProductCard } from '@/components/store/product-card';
import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
export default function StorePageClient({ config }: { readonly config: any }) {
  const { clinic } = useParams() as { clinic: string };
  const labels = config.ui_labels?.store || {};

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetch(`/api/store/products?clinic=${clinic}`).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    });
  }, [clinic]);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? p.category === category : true;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  if (!clinic) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/${clinic}`} className="flex items-center gap-2 font-bold text-[var(--primary)] hover:opacity-80 transition-opacity">
            <Icons.ArrowLeft className="w-5 h-5" />
            <span className="hidden md:inline">{labels.back_home || "Volver al Inicio"}</span>
          </Link>
          <div className="flex items-center gap-4">
             <div className="relative hidden md:block w-64">
                <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder={labels.search_placeholder || "Buscar..."} 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" 
                />
             </div>
             <Link href={`/${clinic}/cart`} className="p-2 hover:bg-gray-100 rounded-full transition relative">
                <Icons.ShoppingBag className="w-6 h-6 text-gray-700" />
                {/* We could show count here if we accessed context, but keeping it simple for now */}
             </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-[var(--primary)] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 transform origin-bottom"></div>
        <div className="container mx-auto px-4 py-16 relative z-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">{labels.hero_title || "Lo mejor para tu mascota"}</h1>
                <p className="opacity-90 text-lg md:text-xl leading-relaxed">{labels.hero_subtitle || "Encuentra alimentos, accesorios y medicamentos recomendados por nuestros veterinarios."}</p>
            </div>
             <div className="hidden md:block">
                 {/* Decorative Icon or Illustration could go here */}
                 <Icons.ShoppingBag className="w-32 h-32 opacity-20 rotate-12" />
             </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[260px_1fr] gap-10 items-start">
            {/* Sidebar (Desktop) / Horizontal List (Mobile) */}
            <div className="lg:sticky lg:top-24 space-y-8">
                {/* Search (Mobile Only) */}
                <div className="block md:hidden mb-6">
                    <div className="relative">
                        <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder={labels.search_placeholder || "Buscar..."} 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" 
                        />
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-gray-900 mb-4 px-2 flex items-center gap-2">
                        <Icons.Grid className="w-4 h-4" /> Categorías
                    </h3>
                    <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                        <button 
                            onClick={() => setCategory('')}
                            className={clsx(
                                "whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all text-left",
                                category === '' 
                                    ? "bg-[var(--primary)] text-white shadow-md" 
                                    : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            {labels.all_categories || "Todas"}
                        </button>
                        {categories.map((c: any) => (
                            <button 
                                key={c} 
                                onClick={() => setCategory(c)}
                                className={clsx(
                                    "whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all text-left",
                                    category === c
                                        ? "bg-[var(--primary)] text-white shadow-md" 
                                        : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="min-h-[500px]">
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-xl text-gray-800">
                        {category || (labels.all_categories || "Todos los productos")}
                    </h2>
                    <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                        {filtered.length} productos
                    </span>
                 </div>

                {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border dashed border-2 border-gray-200">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icons.Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No encontramos resultados</h3>
                    <p className="text-gray-500">{labels.empty_state || "Intenta con otra búsqueda o categoría."}</p>
                    <button 
                        onClick={() => {setSearch(''); setCategory('');}}
                        className="mt-6 text-[var(--primary)] font-bold hover:underline"
                    >
                        Limpiar filtros
                    </button>
                </div>
                ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map((product: any) => (
                    <ProductCard key={product.id} product={product} config={config} />
                    ))}
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
