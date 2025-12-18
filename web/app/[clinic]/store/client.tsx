"use client";
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  Truck,
  LayoutGrid,
  Grid,
  Package,
  BadgePercent,
  PackageSearch,
  RotateCcw,
  UtensilsCrossed,
  Pill,
  Sparkles,
  Heart,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { ProductCard } from '@/components/store/product-card';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { clsx } from 'clsx';
import { ClinicConfig } from '@/lib/clinics';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image_url?: string;
  discount_price?: number;
}

interface StorePageClientProps {
  readonly config: ClinicConfig;
  readonly heroImage?: string | null;
}

export default function StorePageClient({ config, heroImage }: StorePageClientProps) {
  const { clinic } = useParams() as { clinic: string };
  const labels = config.ui_labels?.store || {};

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/store/products?clinic=${clinic}`);
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('No se pudieron cargar los productos. Por favor intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [clinic]);

  // Debounced search using useMemo
  const debouncedSearch = useMemo(() => search.toLowerCase(), [search]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearch) ||
        (p.description?.toLowerCase().includes(debouncedSearch) ?? false);
      const matchesCategory = category ? p.category === category : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearch, category]);

  const categories = useMemo(() =>
    Array.from(new Set(products.map((p) => p.category))).filter(Boolean) as string[],
    [products]
  );

  // Category icons mapping
  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    'Alimentos': UtensilsCrossed,
    'Medicamentos': Pill,
    'Accesorios': Package,
    'Higiene': Sparkles,
    'Juguetes': Heart,
  };

  if (!clinic) return null;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-subtle)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Cargando productos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-subtle)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Error al cargar</h2>
          <p className="text-[var(--text-secondary)] mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)] pb-20">
      {/* Header - Improved */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href={`/${clinic}`} className="flex items-center gap-2 font-bold text-[var(--primary)] hover:opacity-80 transition-opacity flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">{labels.back_home || "Volver"}</span>
          </Link>

          {/* Search - Desktop */}
          <div className="relative hidden md:block flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={labels.search_placeholder || "Buscar productos..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
            />
          </div>

          <Link href={`/${clinic}/cart`} className="relative p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0">
            <ShoppingBag className="w-6 h-6 text-gray-700" />
          </Link>
        </div>
      </div>

      {/* Hero Section - Improved with better text contrast */}
      <div className="relative overflow-hidden">
        {/* Background - Image or Gradient */}
        {heroImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${heroImage}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/90 via-[var(--primary)]/70 to-[var(--primary)]/50" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dark)] to-[var(--primary)]" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/5" style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)' }} />
          </>
        )}

        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white/90 text-sm font-medium mb-4">
                <Truck className="w-4 h-4" />
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
                <ShoppingBag className="w-16 h-16 text-white/40" />
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                <LayoutGrid className="w-5 h-5 text-[var(--primary)]" />
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
                  <Grid className="w-5 h-5" />
                  {labels.all_categories || "Todas"}
                </button>

                {categories.map((c) => {
                  const IconComponent = categoryIcons[c] || Package;
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
                  <BadgePercent className="w-5 h-5 text-[var(--secondary-dark)]" />
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
                  <PackageSearch className="w-10 h-10 text-gray-400" />
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
                  <RotateCcw className="w-4 h-4" />
                  Limpiar filtros
                </button>

                {/* Suggestions */}
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <p className="text-sm text-[var(--text-muted)] mb-4">Explora otras categorías:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {categories.slice(0, 4).map((c) => (
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
                {filtered.map((product) => (
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
