'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  ShoppingCart,
  Star,
  Eye,
  Sparkles,
  Trophy,
  Percent,
  Loader2,
  Check,
  Truck,
  AlertCircle,
  Gift,
} from 'lucide-react';
import type { StoreProductWithDetails } from '@/lib/types/store';
import { useCart } from '@/context/cart-context';

interface Props {
  product: StoreProductWithDetails;
  clinic: string;
  currencySymbol?: string;
  onQuickView?: (product: StoreProductWithDetails) => void;
  showWishlist?: boolean;
  isWishlisted?: boolean;
  onWishlistToggle?: (productId: string) => void;
}

export default function EnhancedProductCard({
  product,
  clinic,
  currencySymbol = 'Gs',
  onQuickView,
  showWishlist = true,
  isWishlisted = false,
  onWishlistToggle,
}: Props) {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [localWishlisted, setLocalWishlisted] = useState(isWishlisted);

  const stock = product.inventory?.stock_quantity || 0;
  const inStock = stock > 0;
  const lowStock = stock > 0 && stock <= 5;

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return `${currencySymbol} 0`;
    return `${currencySymbol} ${price.toLocaleString('es-PY')}`;
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock || addingToCart) return;

    setAddingToCart(true);

    addItem({
      id: product.id,
      name: product.name,
      price: product.current_price,
      type: 'product',
      image_url: product.image_url || undefined,
      description: product.short_description || undefined,
      stock,
      sku: product.sku || undefined,
    }, 1);

    setTimeout(() => {
      setAddingToCart(false);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }, 300);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalWishlisted(!localWishlisted);
    onWishlistToggle?.(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <Link
      href={`/${clinic}/store/product/${product.id}`}
      className="group block bg-white rounded-xl border border-[var(--border-default)] overflow-hidden hover:shadow-lg hover:border-[var(--primary)]/30 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {/* Wishlist Button */}
        {showWishlist && (
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all ${
              localWishlisted
                ? 'bg-red-50 text-red-500'
                : 'bg-white/80 backdrop-blur text-gray-400 hover:text-red-500'
            } shadow-sm`}
          >
            <Heart className={`w-5 h-5 ${localWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.has_discount && product.discount_percentage && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              <Percent className="w-3 h-3" />
              -{product.discount_percentage}%
            </span>
          )}
          {product.is_new_arrival && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
              <Sparkles className="w-3 h-3" />
              Nuevo
            </span>
          )}
          {product.is_best_seller && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
              <Trophy className="w-3 h-3" />
              Top
            </span>
          )}
        </div>

        {/* Product Image */}
        <div className="relative w-full h-full">
          <Image
            src={product.image_url || '/placeholder-product.svg'}
            alt={product.name}
            fill
            className={`object-contain p-4 transition-transform duration-300 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-full flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Sin Stock
            </span>
          </div>
        )}

        {/* Quick View Button */}
        {onQuickView && isHovered && inStock && (
          <button
            onClick={handleQuickView}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur text-sm font-medium rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <Eye className="w-4 h-4" />
            Vista Rápida
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand - More Visible */}
        {product.brand && (
          <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wide">
            {product.brand.name}
          </span>
        )}

        {/* Name */}
        <h3 className="font-medium text-[var(--text-primary)] line-clamp-2 mt-1 group-hover:text-[var(--primary)] transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating - Larger Stars */}
        {product.review_count > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(product.avg_rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {product.avg_rating.toFixed(1)} ({product.review_count})
            </span>
          </div>
        )}

        {/* Price - Larger and Bolder */}
        <div className="mt-3">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-black text-[var(--text-primary)]">
              {formatPrice(product.current_price)}
            </span>
            {product.original_price && product.original_price > product.current_price && (
              <span className="text-sm text-[var(--text-muted)] line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Stock Status - Compact */}
        <div className="mt-2 flex items-center gap-1 text-xs">
          {inStock ? (
            lowStock ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                ¡Últimos {stock}!
              </span>
            ) : (
              <span className="text-green-600 flex items-center gap-1 font-medium">
                <Truck className="w-3.5 h-3.5" />
                Envío disponible
              </span>
            )
          ) : (
            <span className="text-red-500 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Sin Stock
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock || addingToCart}
          className={`w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
            inStock
              ? addedToCart
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-[var(--primary)] text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {addingToCart ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : addedToCart ? (
            <>
              <Check className="w-4 h-4" />
              ¡Agregado!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Agregar al carrito
            </>
          )}
        </button>

        {/* Loyalty Points - More Visible */}
        {inStock && product.current_price > 10000 && (
          <p className="mt-2 text-xs text-center text-[var(--text-muted)] flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Gana {Math.floor(product.current_price / 10000)} puntos
          </p>
        )}
      </div>
    </Link>
  );
}
