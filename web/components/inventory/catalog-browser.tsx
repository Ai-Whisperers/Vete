'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Grid3X3, List, Package, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import CatalogFilters from './catalog-filters';
import CatalogProductCard from './catalog-product-card';
import AssignProductModal from './assign-product-modal';

interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  description?: string;
  short_description?: string;
  base_price: number;
  image_url?: string;
  images?: string[];
  target_species?: string[];
  requires_prescription?: boolean;
  is_assigned: boolean;
  assignment: {
    sale_price: number;
    is_active: boolean;
  } | null;
  store_categories?: {
    id: string;
    name: string;
    slug: string;
  };
  store_brands?: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CatalogResponse {
  products: CatalogProduct[];
  pagination: PaginationInfo;
  filters: {
    applied: {
      search: string | null;
      category: string | null;
      brand: string | null;
      show_assigned: boolean;
    };
  };
}

interface CatalogBrowserProps {
  clinic: string;
}

export default function CatalogBrowser({ clinic }: CatalogBrowserProps) {
  // State
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 24,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [showAssigned, setShowAssigned] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products
  const fetchProducts = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        clinic,
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (debouncedSearch) params.set('search', debouncedSearch);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedBrand !== 'all') params.set('brand', selectedBrand);
      if (showAssigned) params.set('show_assigned', 'true');

      const response = await fetch(`/api/inventory/catalog?${params}`);
      if (!response.ok) {
        throw new Error('Error al cargar el catálogo');
      }

      const data: CatalogResponse = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Catalog fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchProducts(1);
  }, [debouncedSearch, selectedCategory, selectedBrand, showAssigned]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage);
  };

  // Handle assign product
  const handleAssignProduct = (product: CatalogProduct) => {
    setSelectedProduct(product);
    setIsAssignModalOpen(true);
  };

  // Handle successful assignment
  const handleAssignmentSuccess = () => {
    setIsAssignModalOpen(false);
    setSelectedProduct(null);
    // Refresh the current page to show updated assignment status
    fetchProducts(pagination.page);
  };

  // Filter summary
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (debouncedSearch) count++;
    if (selectedCategory !== 'all') count++;
    if (selectedBrand !== 'all') count++;
    if (showAssigned) count++;
    return count;
  }, [debouncedSearch, selectedCategory, selectedBrand, showAssigned]);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos por nombre o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-50">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {pagination.total} producto{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
              {activeFiltersCount > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  ({activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Show Assigned Toggle */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showAssigned}
                onChange={(e) => setShowAssigned(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-600">Mostrar asignados</span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <CatalogFilters
            clinic={clinic}
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            onCategoryChange={setSelectedCategory}
            onBrandChange={setSelectedBrand}
          />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex gap-4 items-start">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-red-900">Error al cargar el catálogo</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando productos...</span>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && !error && (
            <>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No se encontraron productos</h3>
                  <p className="text-gray-500">
                    {activeFiltersCount > 0
                      ? 'Prueba ajustando los filtros de búsqueda'
                      : 'No hay productos disponibles en el catálogo global'
                    }
                  </p>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <CatalogProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                      onAssign={handleAssignProduct}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
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

                    <div className="flex items-center gap-1">
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
                            className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                              pagination.page === pageNum
                                ? 'bg-blue-600 text-white'
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
            </>
          )}
        </div>
      </div>

      {/* Assign Product Modal */}
      {isAssignModalOpen && selectedProduct && (
        <AssignProductModal
          product={selectedProduct}
          clinic={clinic}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={handleAssignmentSuccess}
        />
      )}
    </div>
  );
}
