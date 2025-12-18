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

  // Category icons mapping
  const categoryIcons: Record<string, any> = {
    'Alimentos': Icons.UtensilsCrossed,
    'Medicamentos': Icons.Pill,
    'Accesorios': Icons.Package,
    'Higiene': Icons.Sparkles,
    'Juguetes': Icons.Heart,
  };

  if (!clinic) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)] pb-20">
      {/* Header - Improved */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href={`/${clinic}`} className="flex items-center gap-2 font-bold text-[var(--primary)] hover:opacity-80 transition-opacity flex-shrink-0">
            <Icons.ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">{labels.back_home || "Volver"}</span>
          </Link>

          {/* Search - Desktop */}
          <div className="relative hidden md:block flex-1 max-w-md">
            <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={labels.search_placeholder || "Buscar productos..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
            />
          </div>

          <Link href={`/${clinic}/cart`} className="relative p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0">
            <Icons.ShoppingBag className="w-6 h-6 text-gray-700" />
          </Link>
        </div>
      </div>

      {/* Hero Section - Improved with better text contrast */}
      <div className="relative overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dark)] to-[var(--primary)]" />

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Decorative shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/5" style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)' }} />

        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white/90 text-sm font-medium mb-4">
                <Icons.Truck className="w-4 h-4" />
                Delivery Gratis +150.000 Gs
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                {labels.hero_title || "Lo Mejor para tu Mascota"}
              </h1>
              <p className="text-white/90 text-base md:text-lg leading-relaxed">
                {labels.hero_subtitle || "Encuentra alimentos premium, accesorios y medicamentos recomendados por nuestros veterinarios."}
              </p>
            </div>

            {/* Decorative Icon */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                <Icons.ShoppingBag className="w-16 h-16 text-white/40" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Mobile Search */}
        <div className="block md:hidden mb-6">
          <div className="relative">
            <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={labels.search_placeholder || "Buscar productos..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Sidebar */}
          <div className="lg:sticky lg:top-24">
            {/* Categories Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Icons.LayoutGrid className="w-5 h-5 text-[var(--primary)]" />
                Categorías
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => setCategory('')}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                    category === ''
                      ? "bg-[var(--primary)] text-white shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icons.Grid className="w-5 h-5" />
                  {labels.all_categories || "Todas"}
                </button>

                {categories.map((c: any) => {
                  const IconComponent = categoryIcons[c] || Icons.Package;
                  return (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={clsx(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                        category === c
                          ? "bg-[var(--primary)] text-white shadow-md"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <IconComponent className="w-5 h-5" />
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="mt-4 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/5 rounded-2xl p-6 border border-[var(--accent)]/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center">
                  <Icons.BadgePercent className="w-5 h-5 text-[var(--secondary-dark)]" />
                </div>
                <span className="font-bold text-[var(--text-primary)]">Ofertas</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                ¡10% de descuento en tu primera compra! Usa el código <span className="font-bold text-[var(--primary)]">PRIMERA10</span>
              </p>
            </div>
          </div>

          {/* Product Grid */}
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="font-bold text-xl text-[var(--text-primary)]">
                  {category || "Todos los productos"}
                </h2>
                {search && (
                  <p className="text-sm text-[var(--text-muted)]">
                    Resultados para "{search}"
                  </p>
                )}
              </div>
              <span className="text-sm text-[var(--text-muted)] font-medium bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                {filtered.length} productos
              </span>
            </div>

            {/* Empty State - Improved */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icons.PackageSearch className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  No encontramos productos
                </h3>
                <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                  {search
                    ? `No hay productos que coincidan con "${search}"`
                    : labels.empty_state || "No hay productos disponibles en esta categoría."}
                </p>
                <button
                  onClick={() => { setSearch(''); setCategory(''); }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
                >
                  <Icons.RotateCcw className="w-4 h-4" />
                  Limpiar filtros
                </button>

                {/* Suggestions */}
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <p className="text-sm text-[var(--text-muted)] mb-4">Explora otras categorías:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {categories.slice(0, 4).map((c: any) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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
