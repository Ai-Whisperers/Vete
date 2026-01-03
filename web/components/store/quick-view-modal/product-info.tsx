'use client';

import { Star, Check, AlertTriangle, AlertCircle } from 'lucide-react';
import type { ProductInfoProps } from './types';

export function ProductInfo({
  product,
  stock,
  inStock,
  lowStock,
}: ProductInfoProps): React.ReactElement {
  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return 'Gs 0';
    return `Gs ${price.toLocaleString('es-PY')}`;
  };

  return (
    <div>
      {/* Brand */}
      {product.brand && (
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
          {product.brand.name}
        </span>
      )}

      {/* Name */}
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-1 mb-2">
        {product.name}
      </h2>

      {/* Rating */}
      {product.review_count > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(product.avg_rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-[var(--text-muted)]">
            ({product.review_count} reseñas)
          </span>
        </div>
      )}

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-[var(--text-primary)]">
            {formatPrice(product.current_price)}
          </span>
          {product.original_price && (
            <span className="text-lg text-[var(--text-muted)] line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>
      </div>

      {/* Short Description */}
      {product.short_description && (
        <p className="text-[var(--text-secondary)] mb-4 line-clamp-3">
          {product.short_description}
        </p>
      )}

      {/* Stock Status */}
      <StockStatus inStock={inStock} lowStock={lowStock} stock={stock} />

      {/* Prescription Warning */}
      {product.is_prescription_required && <PrescriptionWarning />}
    </div>
  );
}

function StockStatus({
  inStock,
  lowStock,
  stock,
}: {
  inStock: boolean;
  lowStock: boolean;
  stock: number;
}): React.ReactElement {
  return (
    <div className="mb-4">
      {inStock ? (
        lowStock ? (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">¡Solo {stock} disponibles!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-4 h-4" />
            <span className="font-medium">En Stock</span>
          </div>
        )
      ) : (
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">Sin Stock</span>
        </div>
      )}
    </div>
  );
}

function PrescriptionWarning(): React.ReactElement {
  return (
    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800">Requiere Receta</p>
          <p className="text-sm text-amber-700">
            Este producto necesita receta veterinaria para ser despachado.
          </p>
        </div>
      </div>
    </div>
  );
}
