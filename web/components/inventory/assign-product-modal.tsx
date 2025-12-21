'use client';

import { useState } from 'react';
import { X, Package, DollarSign, MapPin, Loader2, CheckCircle, AlertCircle, Pill } from 'lucide-react';
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

interface AssignProductModalProps {
  product: CatalogProduct;
  clinic: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignProductModal({
  product,
  clinic,
  onClose,
  onSuccess
}: AssignProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [salePrice, setSalePrice] = useState(product.base_price.toString());
  const [minStockLevel, setMinStockLevel] = useState('5');
  const [location, setLocation] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [requiresPrescription, setRequiresPrescription] = useState(product.requires_prescription || false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const price = parseFloat(salePrice);
    if (isNaN(price) || price < 0) {
      setError('El precio de venta debe ser un número válido mayor o igual a 0');
      return;
    }

    const minStock = parseInt(minStockLevel);
    if (isNaN(minStock) || minStock < 0) {
      setError('El stock mínimo debe ser un número válido mayor o igual a 0');
      return;
    }

    const stock = initialStock ? parseInt(initialStock) : 0;
    if (isNaN(stock) || stock < 0) {
      setError('El stock inicial debe ser un número válido mayor o igual a 0');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/inventory/catalog/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          catalog_product_id: product.id,
          clinic_id: clinic,
          sale_price: price,
          min_stock_level: minStock,
          location: location.trim() || undefined,
          initial_stock: stock > 0 ? stock : undefined,
          requires_prescription: requiresPrescription
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al asignar el producto');
      }

      const result = await response.json();
      setSuccess(true);

      // Close modal after short delay to show success
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Producto Agregado!</h3>
            <p className="text-gray-600">
              {product.name} ha sido agregado exitosamente a tu inventario.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Agregar a Clínica</h2>
              <p className="text-gray-600 text-sm">{product.name}</p>
              <p className="text-xs text-gray-400 mt-1">SKU: {product.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-xl transition"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info Summary */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Precio Sugerido</span>
              <span className="font-bold text-gray-900">{formatPrice(product.base_price)}</span>
            </div>
            {product.store_brands && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Marca</span>
                <div className="flex items-center gap-2">
                  {product.store_brands.logo_url && (
                    <Image
                      src={product.store_brands.logo_url}
                      alt={product.store_brands.name}
                      width={16}
                      height={16}
                      className="w-4 h-4 object-contain"
                    />
                  )}
                  <span className="text-sm text-gray-900">{product.store_brands.name}</span>
                </div>
              </div>
            )}
            {product.store_categories && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Categoría</span>
                <span className="text-sm text-gray-900">{product.store_categories.name}</span>
              </div>
            )}
            {product.requires_prescription && (
              <div className="flex items-center gap-2 mt-3 p-2 bg-orange-50 rounded-lg">
                <Pill className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-orange-700 font-medium">Requiere receta médica</span>
              </div>
            )}
          </div>

          {/* Configuration Form */}
          <div className="space-y-6">
            {/* Sale Price */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Precio de Venta en tu Clínica *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Precio sugerido: {formatPrice(product.base_price)}
              </p>
            </div>

            {/* Min Stock Level */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Stock Mínimo
              </label>
              <input
                type="number"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="5"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nivel mínimo antes de recibir alertas de bajo stock
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ubicación en la Clínica
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="Ej: Estante A, Refrigerador, etc."
                />
              </div>
            </div>

            {/* Initial Stock */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Stock Inicial (Opcional)
              </label>
              <input
                type="number"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cantidad actual en inventario. Deja vacío si no tienes stock inicial.
              </p>
            </div>

            {/* Prescription Override */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-gray-900">Requiere Receta Médica</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {product.requires_prescription
                    ? 'Este producto requiere receta en el catálogo global'
                    : 'Este producto no requiere receta en el catálogo global'
                  }
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresPrescription}
                  onChange={(e) => setRequiresPrescription(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-700 transition"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Agregando...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Agregar Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
