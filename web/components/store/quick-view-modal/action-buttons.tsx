'use client';

import { Heart, ShoppingCart, Check, Loader2 } from 'lucide-react';
import type { ActionButtonsProps } from './types';

export function ActionButtons({
  inStock,
  addingToCart,
  addedToCart,
  productIsWishlisted,
  togglingWishlist,
  onAddToCart,
  onWishlistToggle,
}: ActionButtonsProps): React.ReactElement {
  return (
    <div className="flex gap-3 mb-6">
      <button
        onClick={onAddToCart}
        disabled={!inStock || addingToCart}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
          inStock
            ? addedToCart
              ? 'bg-green-500 text-white'
              : 'bg-[var(--primary)] text-white hover:opacity-90'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {addingToCart ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : addedToCart ? (
          <>
            <Check className="w-5 h-5" />
            Agregado
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Agregar al Carrito
          </>
        )}
      </button>

      <button
        onClick={onWishlistToggle}
        disabled={togglingWishlist}
        className={`p-3 rounded-xl border transition-colors ${
          productIsWishlisted
            ? 'bg-red-50 border-red-200 text-red-500'
            : 'border-[var(--border-default)] text-gray-500 hover:text-red-500 hover:border-red-200'
        } disabled:opacity-50`}
        aria-label={productIsWishlisted ? 'Quitar de lista de deseos' : 'Agregar a lista de deseos'}
      >
        {togglingWishlist ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Heart className={`w-5 h-5 ${productIsWishlisted ? 'fill-current' : ''}`} />
        )}
      </button>
    </div>
  );
}
