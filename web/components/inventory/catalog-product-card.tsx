'use client';

import { Plus, CheckCircle, Package, Pill, Heart } from 'lucide-react';
import Image from 'next/image';

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

interface CatalogProductCardProps {
  product: CatalogProduct;
  viewMode: 'grid' | 'list';
  onAssign: (product: CatalogProduct) => void;
}

export default function CatalogProductCard({
  product,
  viewMode,
  onAssign
}: CatalogProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getSpeciesDisplay = (species?: string[]) => {
    if (!species || species.length === 0) return null;
    const speciesMap: Record<string, string> = {
      'perro': '🐕',
      'gato': '🐱',
      'ave': '🐦',
      'reptil': '🦎',
      'pez': '🐠',
      'roedor': '🐹'
    };
    return species.slice(0, 3).map(s => speciesMap[s] || s).join(' ');
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all">
        <div className="flex items-center gap-6">
          {/* Product Image */}
          <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {product.store_brands?.logo_url && (
                    <Image
                      src={product.store_brands.logo_url}
                      alt={product.store_brands.name}
                      width={16}
                      height={16}
                      className="w-4 h-4 object-contain"
                    />
                  )}
                  <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                  {product.requires_prescription && (
                    <Pill className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <span>SKU: {product.sku}</span>
                  {product.store_categories && (
                    <span>{product.store_categories.name}</span>
                  )}
                  {getSpeciesDisplay(product.target_species) && (
                    <span>{getSpeciesDisplay(product.target_species)}</span>
                  )}
                </div>

                {product.short_description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.short_description}
                  </p>
                )}
              </div>

              {/* Price and Action */}
              <div className="flex items-center gap-4 ml-6">
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">
                    {formatPrice(product.base_price)}
                  </div>
                  {product.is_assigned && product.assignment && (
                    <div className="text-xs text-green-600 font-medium">
                      Tu precio: {formatPrice(product.assignment.sale_price)}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {product.is_assigned ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-bold">Agregado</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onAssign(product)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
      {/* Product Image */}
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {product.is_assigned ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              <CheckCircle className="w-3 h-3" />
              Agregado
            </div>
          ) : product.requires_prescription ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
              <Pill className="w-3 h-3" />
              Receta
            </div>
          ) : null}
        </div>

        {/* Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onAssign(product)}
            disabled={product.is_assigned}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              product.is_assigned
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
            }`}
          >
            {product.is_assigned ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Agregado
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Agregar a Clínica
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        {/* Brand */}
        {product.store_brands && (
          <div className="flex items-center gap-2 mb-2">
            {product.store_brands.logo_url && (
              <Image
                src={product.store_brands.logo_url}
                alt={product.store_brands.name}
                width={16}
                height={16}
                className="w-4 h-4 object-contain"
              />
            )}
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {product.store_brands.name}
            </span>
          </div>
        )}

        {/* Product Name */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* SKU and Category */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span>SKU: {product.sku}</span>
          {product.store_categories && (
            <>
              <span>•</span>
              <span>{product.store_categories.name}</span>
            </>
          )}
        </div>

        {/* Species */}
        {getSpeciesDisplay(product.target_species) && (
          <div className="text-sm mb-3">
            {getSpeciesDisplay(product.target_species)}
          </div>
        )}

        {/* Description */}
        {product.short_description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {product.short_description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-lg text-gray-900">
              {formatPrice(product.base_price)}
            </div>
            {product.is_assigned && product.assignment && (
              <div className="text-xs text-green-600 font-medium">
                Tu precio: {formatPrice(product.assignment.sale_price)}
              </div>
            )}
          </div>

          {/* Action Button (Mobile) */}
          <div className="lg:hidden">
            {product.is_assigned ? (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg">
                <CheckCircle className="w-3 h-3" />
                Agregado
              </div>
            ) : (
              <button
                onClick={() => onAssign(product)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-3 h-3" />
                Agregar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
