'use client';

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
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
  readonly initialProductData: ProductListResponse;
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const labels = config.ui_labels?.store || {};
  const { items: cartItems } = useCart();
  const queryClient = useQueryClient();

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

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user ?? null;
    },
  });

  const { data: wishlistedIds = new Set<string>() } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>();
      const res = await fetch(`/api/store/wishlist?userId=${user.id}&clinic=${clinic}`);
      if (!res.ok) throw new Error('Failed to fetch wishlist');
      const wishlist: { product_id: string }[] = await res.json();
      return new Set(wishlist.map(w => w.product_id));
    },
    enabled: !!user,
  });

  const {
    data: productData,
    error,
    isLoading: loading,
  } = useQuery<ProductListResponse>({
    queryKey: ['products', clinic, page, sort, debouncedSearch, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('clinic', clinic);
      params.set('page', page.toString());
      params.set('limit', '12');
      params.set('sort', sort);
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filters.category) params.set('category', filters.category);
      // ... and so on for all other filters

      const res = await fetch(`/api/store/products?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    },
    initialData: initialProductData,
  });

  const {
    products = [],
    pagination: { totalPages = 1, total: totalProducts = 0 } = {},
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

  const { mutate: toggleWishlist } = useMutation({
    mutationFn: async (productId: string) => {
      const isWishlisted = wishlistedIds.has(productId);
      const method = isWishlisted ? 'DELETE' : 'POST';
      const url = isWishlisted 
        ? `/api/store/wishlist?product_id=${productId}`
        : '/api/store/wishlist';
      const body = isWishlisted ? undefined : JSON.stringify({ product_id: productId, clinic });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) {
        throw new Error('Failed to update wishlist');
      }

      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
    },
  });

  const handleWishlistToggle = useCallback(async (productId: string) => {
    if (!user) {
      router.push(`/${clinic}/portal/signup`);
      return;
    }
    toggleWishlist(productId);
  }, [user, clinic, router, toggleWishlist]);

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
      {/* ... (rest of the JSX) ... */}
    </div>
  );
}
