'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Heart,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
  Check,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import type { StoreProductWithDetails } from '@/lib/types/store';
import { useCart } from '@/context/cart-context';

interface Props {
  product: StoreProductWithDetails;
  clinic: string;
  isWishlisted?: boolean;
  onWishlistToggle?: (productId: string) => void;
  onClose: () => void;
}

export default function QuickViewModal({
  product,
  clinic,
  isWishlisted = false,
  onWishlistToggle,
  onClose,
}: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [localWishlisted, setLocalWishlisted] = useState(isWishlisted);

  const stock = product.inventory?.stock_quantity || 0;
  const inStock = stock > 0;
  const lowStock = stock > 0 && stock <= 5;

  // Combine main image with gallery images
  const images = product.image_url
    ? [{ id: 'main', image_url: product.image_url, alt_text: product.name }, ...product.images]
    : product.images.length > 0
    ? product.images
    : [{ id: 'placeholder', image_url: '/placeholder-product.svg', alt_text: product.name }];

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return 'Gs 0';
    return `Gs ${price.toLocaleString('es-PY')}`;
  };

  const handleAddToCart = () => {
    if (!inStock || addingToCart) return;

    setAddingToCart(true);

    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.current_price,
        type: 'product',
        image_url: product.image_url || undefined,
        description: product.short_description || undefined,
        stock,
        sku: product.sku || undefined,
      },
      quantity
    );

    setTimeout(() => {
      setAddingToCart(false);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }, 300);
  };

  const handleWishlistToggle = () => {
    setLocalWishlisted(!localWishlisted);
    onWishlistToggle?.(product.id);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row max-h-[90vh]">
          {/* Image Gallery */}
          <div className="relative w-full md:w-1/2 bg-gray-50">
            <div className="aspect-square relative">
              <Image
                src={images[currentImageIndex]?.image_url || '/placeholder-product.svg'}
                alt={images[currentImageIndex]?.alt_text || product.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Out of Stock Overlay */}
              {!inStock && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                  <span className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-full flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Sin Stock
                  </span>
                </div>
              )}

              {/* Discount Badge */}
              {product.has_discount && product.discount_percentage && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                  -{product.discount_percentage}%
                </span>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex
                        ? 'border-[var(--primary)]'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto">
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

            {/* Prescription Warning */}
            {product.is_prescription_required && (
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
            )}

            {/* Quantity Selector */}
            {inStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  Cantidad:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 rounded-lg border border-[var(--border-default)] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    disabled={quantity >= stock}
                    className="p-2 rounded-lg border border-[var(--border-default)] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
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
                onClick={handleWishlistToggle}
                className={`p-3 rounded-xl border transition-colors ${
                  localWishlisted
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'border-[var(--border-default)] text-gray-500 hover:text-red-500 hover:border-red-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${localWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="flex flex-col items-center text-center p-3 bg-[var(--bg-subtle)] rounded-xl">
                <Truck className="w-5 h-5 text-[var(--primary)] mb-1" />
                <span className="text-xs text-[var(--text-secondary)]">Envío Gratis</span>
                <span className="text-xs text-[var(--text-muted)]">+150k Gs</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-[var(--bg-subtle)] rounded-xl">
                <Shield className="w-5 h-5 text-[var(--primary)] mb-1" />
                <span className="text-xs text-[var(--text-secondary)]">Garantía</span>
                <span className="text-xs text-[var(--text-muted)]">Calidad</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-[var(--bg-subtle)] rounded-xl">
                <RotateCcw className="w-5 h-5 text-[var(--primary)] mb-1" />
                <span className="text-xs text-[var(--text-secondary)]">Devolución</span>
                <span className="text-xs text-[var(--text-muted)]">7 días</span>
              </div>
            </div>

            {/* View Full Details Link */}
            <Link
              href={`/${clinic}/store/product/${product.id}`}
              className="block text-center text-[var(--primary)] font-medium hover:underline"
            >
              Ver todos los detalles →
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
