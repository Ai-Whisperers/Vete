'use client';

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  Truck,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  PackageSearch,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BadgePercent,
  X,
} from 'lucide-react';
import type { ClinicConfig } from '@/lib/clinics';
import type {
  ProductFilters,
  AvailableFilters,
  StoreProductWithDetails,
  SortOption,
  ProductListResponse,
  Species,
} from '@/lib/types/store';
import { SPECIES } from '@/lib/types/store';
import SortDropdown from '@/components/store/filters/sort-dropdown';
import FilterChips from '@/components/store/filters/filter-chips';
import EnhancedProductCard from '@/components/store/enhanced-product-card';

// Lazy load heavy components to reduce initial bundle size

const LazyFilterSidebar = lazy(() =>
  import('@/components/store/filters/filter-sidebar').then(mod => ({ default: mod.default }))
);
const LazyFilterDrawer = lazy(() =>
  import('@/components/store/filters/filter-drawer').then(mod => ({ default: mod.default }))
);
const LazyQuickViewModal = lazy(() =>
  import('@/components/store/quick-view-modal').then(mod => ({ default: mod.default }))
);

// Dynamically import components that aren't needed immediately
import { useCart } from '@/context/cart-context';
import BuyAgainSection from '@/components/store/buy-again-section';

const queryClient = new QueryClient();

export default function StorePageClientWrapper(props: StorePageClientProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <StorePageClient {...props} />
    </QueryClientProvider>
  );
}

interface StorePageClientProps {
  readonly config: ClinicConfig;
  readonly heroImage?: string | null;
  readonly initialProductData?: ProductListResponse;
}

const DEFAULT_FILTERS: ProductFilters = {};

const DEFAULT_AVAILABLE_FILTERS: AvailableFilters = {
  categories: [],
  subcategories: [],
  brands: [],
  species: SPECIES.map((s) => ({ value: s, label: s, count: 0 })),
  life_stages: [],
  breed_sizes: [],
  health_conditions: [],
  price_range: { min: 0, max: 1000000 },
};

function StorePageClient({ config, heroImage, initialProductData }: StorePageClientProps) {
  const { clinic } = useParams() as { clinic: string };
  const searchParams = useSearchParams();
  const labels = config.ui_labels?.store || {};
  const { items: cartItems } = useCart();

  // Filter state
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [page, setPage] = useState(1);

  // UI state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<StoreProductWithDetails | null>(null);

  const {
    data: productData,
    error,
    isLoading: loading,
  } = useQuery<ProductListResponse>({
    queryKey: ['products', clinic, page, sort, debouncedSearch, filters],
    queryFn: async () => {
      // Use public API - no auth required for browsing products
      const params = new URLSearchParams({
        clinic,
        page: String(page),
        limit: '12',
        sort,
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filters.category) params.set('category', filters.category);
      if (filters.brand) params.set('brand', filters.brand);
      if (filters.species?.length) {
        filters.species.forEach(s => params.append('species', s));
      }

      const response = await fetch(`/api/store/products?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al cargar productos');
      }
      return response.json();
    },
    initialData: initialProductData,
  });

  const {
    products = [],
    pagination: { pages: totalPages = 1, total: totalProducts = 0 } = {},
    filters: { available: availableFilters = DEFAULT_AVAILABLE_FILTERS } = {},
  } = productData || {};
  
  const cartItemCount = useMemo(() =>
    cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  // Initialize filters from URL
  useEffect(() => {
    const initialFilters: ProductFilters = {};

    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('q');
    const species = searchParams.get('species');

    if (category) initialFilters.category = category;
    if (brand) initialFilters.brand = brand;
    if (search) {
      initialFilters.search = search;
      setSearchInput(search);
      setDebouncedSearch(search);
    }
    if (species) initialFilters.species = species.split(',') as Species[];

    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
      setPendingFilters(initialFilters);
    }
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handlers
  const handleFiltersChange = useCallback((newFilters: ProductFilters) => {
    setPendingFilters(newFilters);
    // For desktop sidebar, apply immediately
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPendingFilters(DEFAULT_FILTERS);
    setSearchInput('');
    setDebouncedSearch('');
    setPage(1);
  }, []);

  const handleRemoveFilter = useCallback((key: keyof ProductFilters, value?: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (value && Array.isArray(prev[key])) {
        const arrayValue = prev[key] as string[];
        const filtered = arrayValue.filter(v => v !== value);
        if (filtered.length > 0) {
          (newFilters[key] as string[]) = filtered;
        } else {
          delete newFilters[key];
        }
      } else if (key === 'price_min') {
        delete newFilters.price_min;
        delete newFilters.price_max;
      } else {
        delete newFilters[key];
      }

      return newFilters;
    });
    setPendingFilters((prev) => {
      const newFilters = { ...prev };
      if (value && Array.isArray(prev[key])) {
        const arrayValue = prev[key] as string[];
        const filtered = arrayValue.filter(v => v !== value);
        if (filtered.length > 0) {
          (newFilters[key] as string[]) = filtered;
        } else {
          delete newFilters[key];
        }
      } else if (key === 'price_min') {
        delete newFilters.price_min;
        delete newFilters.price_max;
      } else {
        delete newFilters[key];
      }
      return newFilters;
    });
    setPage(1);
  }, []);

  const handleApplyMobileFilters = useCallback(() => {
    setFilters(pendingFilters);
    setPage(1);
  }, [pendingFilters]);

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
  }, []);

  const handleQuickView = useCallback((product: StoreProductWithDetails) => {
    setQuickViewProduct(product);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchInput);
    setPage(1);
  };

  if (!clinic) return null;

  // Loading state
  if (loading && !products.length) {
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
          <p className="text-[var(--text-secondary)] mb-6">{error.message}</p>
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

  const hasActiveFilters = Object.keys(filters).length > 0 || debouncedSearch;

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href={`/${clinic}`} className="flex items-center gap-2 font-bold text-[var(--primary)] hover:opacity-80 transition-opacity flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">{labels.back_home || "Volver"}</span>
          </Link>

          {/* Search - Desktop */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={labels.search_placeholder || "Buscar productos..."}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
            />
          </form>

          <Link href={`/${clinic}/cart`} className="relative p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0">
            <ShoppingBag className="w-6 h-6 text-gray-700" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--primary)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
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
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-white/40" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Again Section - Only shown for logged in users with purchase history */}
      <BuyAgainSection maxItems={4} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Mobile Search */}
        <form onSubmit={handleSearchSubmit} className="block md:hidden mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={labels.search_placeholder || "Buscar productos..."}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
            />
          </div>
        </form>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6 flex items-center gap-4">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-medium">Filtros</span>
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-[var(--primary)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {Object.keys(filters).length}
              </span>
            )}
          </button>
          <SortDropdown value={sort} onChange={handleSortChange} />
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block lg:sticky lg:top-24">
            <Suspense fallback={<div className="bg-white rounded-2xl p-6 animate-pulse h-96" />}>
              <LazyFilterSidebar
                filters={filters}
                availableFilters={availableFilters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
            </Suspense>

            {/* Promo Card */}
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
            {/* Header with Sort */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="font-bold text-xl text-[var(--text-primary)]">
                  {filters.category || "Todos los productos"}
                </h2>
                {debouncedSearch && (
                  <p className="text-sm text-[var(--text-muted)]">
                    Resultados para &quot;{debouncedSearch}&quot;
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[var(--text-muted)] font-medium bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                  {totalProducts} productos
                </span>
                <div className="hidden lg:block">
                  <SortDropdown value={sort} onChange={handleSortChange} />
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="mb-6 space-y-2">
                {debouncedSearch && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--text-muted)]">Búsqueda:</span>
                    <button
                      onClick={() => { setSearchInput(''); setDebouncedSearch(''); }}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-sm rounded-full hover:bg-[var(--primary)]/20 transition-colors"
                    >
                      <span>&quot;{debouncedSearch}&quot;</span>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <FilterChips
                  filters={filters}
                  availableFilters={availableFilters}
                  onRemoveFilter={handleRemoveFilter}
                  onClearAll={handleClearFilters}
                />
              </div>
            )}

            {/* Products or Empty State */}
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <PackageSearch className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  No encontramos productos
                </h3>
                <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                  {debouncedSearch
                    ? `No hay productos que coincidan con "${debouncedSearch}"`
                    : labels.empty_state || "No hay productos disponibles con estos filtros."}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <EnhancedProductCard
                      key={product.id}
                      product={product}
                      clinic={clinic}
                      onQuickView={handleQuickView}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)]">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Suspense fallback={null}>
        <LazyFilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          filters={pendingFilters}
          availableFilters={availableFilters}
          onFiltersChange={setPendingFilters}
          onApply={handleApplyMobileFilters}
          onClearFilters={handleClearFilters}
          resultCount={totalProducts}
        />
      </Suspense>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <Suspense fallback={null}>
          <LazyQuickViewModal
            product={quickViewProduct}
            clinic={clinic}
            onClose={() => setQuickViewProduct(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
