'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  Dog,
  Cat,
  Sparkles,
  TrendingUp,
  Tag,
  Clock,
} from 'lucide-react';
import { clsx } from 'clsx';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { ClinicConfig } from '@/lib/clinics';
import type {
  ProductFilters,
  AvailableFilters,
  StoreProductWithDetails,
  SortOption,
  ProductListResponse,
  Species,
  LifeStage,
  BreedSize,
  HealthCondition,
} from '@/lib/types/store';
import { SPECIES } from '@/lib/types/store';
import FilterSidebar from '@/components/store/filters/filter-sidebar';
import FilterDrawer from '@/components/store/filters/filter-drawer';
import SortDropdown from '@/components/store/filters/sort-dropdown';
import FilterChips from '@/components/store/filters/filter-chips';
import EnhancedProductCard from '@/components/store/enhanced-product-card';
import QuickViewModal from '@/components/store/quick-view-modal';
import { useCart } from '@/context/cart-context';

interface StorePageClientProps {
  readonly config: ClinicConfig;
  readonly heroImage?: string | null;
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

export default function StorePageClient({ config, heroImage }: StorePageClientProps) {
  const { clinic } = useParams() as { clinic: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const labels = config.ui_labels?.store || {};
  const { items: cartItems } = useCart();

  // State
  const [products, setProducts] = useState<StoreProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

  // Filter state
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>(DEFAULT_AVAILABLE_FILTERS);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // UI state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<StoreProductWithDetails | null>(null);

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

  // Fetch user and wishlist
  useEffect(() => {
    const supabase = createClient();

    const fetchUserAndWishlist = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);

        // Fetch wishlist
        const { data: wishlist } = await supabase
          .from('store_wishlist')
          .select('product_id')
          .eq('customer_id', session.user.id)
          .eq('tenant_id', clinic);

        if (wishlist) {
          setWishlistedIds(new Set(wishlist.map(w => w.product_id)));
        }
      }
    };

    fetchUserAndWishlist();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data: wishlist } = await supabase
            .from('store_wishlist')
            .select('product_id')
            .eq('customer_id', session.user.id)
            .eq('tenant_id', clinic);

          if (wishlist) {
            setWishlistedIds(new Set(wishlist.map(w => w.product_id)));
          }
        } else {
          setWishlistedIds(new Set());
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [clinic]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('clinic', clinic);
      params.set('page', page.toString());
      params.set('limit', '12');
      params.set('sort', sort);

      // Add search from debounced
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }

      // Add filters
      if (filters.category) params.set('category', filters.category);
      if (filters.subcategory) params.set('subcategory', filters.subcategory);
      if (filters.brand) params.set('brand', filters.brand);
      if (filters.species?.length) params.set('species', filters.species.join(','));
      if (filters.life_stages?.length) params.set('life_stages', filters.life_stages.join(','));
      if (filters.breed_sizes?.length) params.set('breed_sizes', filters.breed_sizes.join(','));
      if (filters.health_conditions?.length) params.set('health_conditions', filters.health_conditions.join(','));
      if (filters.price_min !== undefined) params.set('price_min', filters.price_min.toString());
      if (filters.price_max !== undefined) params.set('price_max', filters.price_max.toString());
      if (filters.in_stock_only) params.set('in_stock_only', 'true');
      if (filters.on_sale) params.set('on_sale', 'true');
      if (filters.new_arrivals) params.set('new_arrivals', 'true');
      if (filters.best_sellers) params.set('best_sellers', 'true');
      if (filters.featured) params.set('featured', 'true');
      if (filters.min_rating) params.set('min_rating', filters.min_rating.toString());

      const res = await fetch(`/api/store/products?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data: ProductListResponse = await res.json();

      setProducts(data.products);
      setTotalPages(data.pagination.pages);
      setTotalProducts(data.pagination.total);
      setAvailableFilters(data.filters.available);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('No se pudieron cargar los productos. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [clinic, page, sort, debouncedSearch, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  const handleWishlistToggle = useCallback(async (productId: string) => {
    if (!user) {
      router.push(`/${clinic}/portal/signup`);
      return;
    }

    const isWishlisted = wishlistedIds.has(productId);

    try {
      if (isWishlisted) {
        await fetch(`/api/store/wishlist?product_id=${productId}`, {
          method: 'DELETE',
        });
        setWishlistedIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await fetch('/api/store/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId, clinic }),
        });
        setWishlistedIds(prev => new Set([...prev, productId]));
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  }, [user, wishlistedIds, clinic, router]);

  const handleQuickView = useCallback((product: StoreProductWithDetails) => {
    setQuickViewProduct(product);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchInput);
    setPage(1);
  };

  if (!clinic) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Left: Back + Branding */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href={`/${clinic}`}
              className="flex items-center gap-2 text-[var(--primary)] hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-bold text-lg text-[var(--text-primary)]">{config.name}</span>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-500">Tienda</span>
            </div>
          </div>

          {/* Search - Desktop */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={labels.search_placeholder || 'Buscar productos, marcas, categorías...'}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setDebouncedSearch('');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </form>

          {/* Right: Cart */}
          <Link
            href={`/${clinic}/cart`}
            className="relative p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0 hidden lg:flex"
          >
            <ShoppingBag className="w-6 h-6 text-gray-700" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--primary)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Hero Section - Compact */}
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
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          </>
        )}

        <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-white/90 text-xs font-medium mb-3">
                <Truck className="w-3.5 h-3.5" />
                Delivery Gratis +150.000 Gs
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 leading-tight">
                {labels.hero_title || 'Lo Mejor para tu Mascota'}
              </h1>
              <p className="text-white/90 text-sm md:text-base leading-relaxed hidden md:block">
                {labels.hero_subtitle ||
                  'Alimentos, accesorios y medicamentos recomendados por veterinarios.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Category Chips */}
      <div className="bg-white border-b border-gray-100 py-3 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => handleFiltersChange({ ...filters, species: ['perro'] })}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
                filters.species?.includes('perro')
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <Dog className="w-4 h-4" />
              Perros
            </button>
            <button
              onClick={() => handleFiltersChange({ ...filters, species: ['gato'] })}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
                filters.species?.includes('gato')
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <Cat className="w-4 h-4" />
              Gatos
            </button>
            <button
              onClick={() => handleFiltersChange({ ...filters, on_sale: !filters.on_sale })}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
                filters.on_sale
                  ? 'bg-red-500 text-white'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              )}
            >
              <Tag className="w-4 h-4" />
              Ofertas
            </button>
            <button
              onClick={() => handleFiltersChange({ ...filters, new_arrivals: !filters.new_arrivals })}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
                filters.new_arrivals
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              )}
            >
              <Sparkles className="w-4 h-4" />
              Nuevos
            </button>
            <button
              onClick={() => handleFiltersChange({ ...filters, best_sellers: !filters.best_sellers })}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
                filters.best_sellers
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Top Ventas
            </button>
            {/* Category quick links */}
            {availableFilters.categories.slice(0, 4).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleFiltersChange({ ...filters, category: cat.slug })}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
                  filters.category === cat.slug
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Mobile Search */}
        <form onSubmit={handleSearchSubmit} className="block md:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={labels.search_placeholder || 'Buscar productos...'}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setDebouncedSearch('');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </form>

        {/* Mobile Filter & Sort - Grid Layout */}
        <div className="grid grid-cols-2 gap-3 mb-4 lg:hidden">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-[var(--primary)] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="font-medium">Filtros</span>
            {Object.keys(filters).filter(k => k !== 'search' && filters[k as keyof ProductFilters]).length > 0 && (
              <span className="w-5 h-5 bg-[var(--primary)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {Object.keys(filters).filter(k => k !== 'search' && filters[k as keyof ProductFilters]).length}
              </span>
            )}
          </button>

          <SortDropdown value={sort} onChange={handleSortChange} />
        </div>

        {/* Promo Banner - Above Products */}
        <div className="bg-gradient-to-r from-[var(--accent)]/20 to-[var(--primary)]/10 rounded-xl p-4 mb-6 border border-[var(--accent)]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/30 flex items-center justify-center flex-shrink-0">
              <BadgePercent className="w-5 h-5 text-[var(--secondary-dark)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                ¡10% OFF en tu primera compra! Código: <span className="font-bold text-[var(--primary)]">PRIMERA10</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Sidebar - Wider */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              availableFilters={availableFilters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Products Area */}
          <div className="flex-1 min-w-0">
            {/* Header with count and sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-bold text-xl text-[var(--text-primary)]">
                  {debouncedSearch
                    ? `Resultados para "${debouncedSearch}"`
                    : filters.category || 'Todos los productos'}
                  <span className="font-normal text-[var(--text-muted)] ml-2">({totalProducts})</span>
                </h2>
              </div>

              <div className="hidden lg:block">
                <SortDropdown value={sort} onChange={handleSortChange} />
              </div>
            </div>

            {/* Active Filter Chips */}
            <div className="mb-4">
              <FilterChips
                filters={filters}
                availableFilters={availableFilters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearFilters}
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin mx-auto mb-3" />
                  <p className="text-[var(--text-secondary)]">Cargando productos...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center max-w-md">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Error al cargar</h2>
                  <p className="text-[var(--text-secondary)] mb-6">{error}</p>
                  <button
                    onClick={() => fetchProducts()}
                    className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <PackageSearch className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No encontramos productos</h3>
                <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                  {debouncedSearch
                    ? `No hay productos que coincidan con "${debouncedSearch}"`
                    : 'No hay productos disponibles con los filtros seleccionados.'}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpiar filtros
                </button>

                {availableFilters.categories.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-gray-100">
                    <p className="text-sm text-[var(--text-muted)] mb-4">Explora categorías:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {availableFilters.categories.slice(0, 4).map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleFiltersChange({ ...filters, category: cat.slug })}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Product Grid */}
            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {products.map((product) => (
                    <EnhancedProductCard
                      key={product.id}
                      product={product}
                      clinic={clinic}
                      currencySymbol="Gs"
                      onQuickView={handleQuickView}
                      showWishlist={true}
                      isWishlisted={wishlistedIds.has(product.id)}
                      onWishlistToggle={handleWishlistToggle}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center gap-4 mt-8">
                    {/* Page Info */}
                    <p className="text-sm text-[var(--text-muted)]">
                      Página {page} de {totalPages}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={clsx(
                          'flex items-center gap-1 px-4 py-2.5 rounded-lg font-medium transition-colors',
                          page === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-[var(--primary)] hover:bg-gray-50'
                        )}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Anterior</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={clsx(
                                'w-10 h-10 rounded-lg font-medium transition-colors',
                                page === pageNum
                                  ? 'bg-[var(--primary)] text-white shadow-sm'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:border-[var(--primary)] hover:bg-gray-50'
                              )}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={clsx(
                          'flex items-center gap-1 px-4 py-2.5 rounded-lg font-medium transition-colors',
                          page === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-[var(--primary)] hover:bg-gray-50'
                        )}
                      >
                        <span className="hidden sm:inline">Siguiente</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Recently Viewed Section */}
        {products.length > 0 && (
          <div className="mt-10 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[var(--text-muted)]" />
              <h3 className="font-bold text-lg text-[var(--text-primary)]">Vistos recientemente</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {products.slice(0, 6).map((product) => (
                <Link
                  key={`recent-${product.id}`}
                  href={`/${clinic}/store/product/${product.id}`}
                  className="group bg-white rounded-lg border border-gray-100 p-2 hover:shadow-md hover:border-[var(--primary)]/30 transition-all"
                >
                  <div className="aspect-square relative mb-2 bg-gray-50 rounded overflow-hidden">
                    <img
                      src={product.image_url || '/placeholder-product.svg'}
                      alt={product.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--primary)]">
                    {product.name}
                  </p>
                  <p className="text-xs font-bold text-[var(--primary)] mt-1">
                    Gs {product.current_price?.toLocaleString('es-PY')}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Button - Mobile Only */}
      <Link
        href={`/${clinic}/cart`}
        className="fixed bottom-6 right-6 z-40 lg:hidden w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        <ShoppingBag className="w-6 h-6" />
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
            {cartItemCount > 9 ? '9+' : cartItemCount}
          </span>
        )}
      </Link>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={pendingFilters}
        availableFilters={availableFilters}
        onFiltersChange={setPendingFilters}
        onClearFilters={() => {
          setPendingFilters(DEFAULT_FILTERS);
        }}
        onApply={handleApplyMobileFilters}
        resultCount={totalProducts}
      />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          clinic={clinic}
          isWishlisted={wishlistedIds.has(quickViewProduct.id)}
          onWishlistToggle={handleWishlistToggle}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
