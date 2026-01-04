"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, Bell, Check, AlertCircle, Loader2 } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { formatPriceGs } from "@/lib/utils/pet-size";

interface WishlistProduct {
  id: string;
  wishlistId: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string | null;
  isActive: boolean;
  inStock: boolean;
  stockQuantity: number;
  addedAt: string;
}

interface WishlistClientProps {
  clinic: string;
  initialProducts: WishlistProduct[];
}

export function WishlistClient({ clinic, initialProducts }: WishlistClientProps) {
  const { removeFromWishlist, isLoading: wishlistLoading } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState(initialProducts);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [addingToCartIds, setAddingToCartIds] = useState<Set<string>>(new Set());
  const [notifyingIds, setNotifyingIds] = useState<Set<string>>(new Set());
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

  const handleRemove = async (productId: string) => {
    setRemovingIds(prev => new Set(prev).add(productId));
    try {
      await removeFromWishlist(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } finally {
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleAddToCart = async (product: WishlistProduct) => {
    setAddingToCartIds(prev => new Set(prev).add(product.id));
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        type: "product",
        image_url: product.imageUrl ?? undefined,
        stock: product.stockQuantity
      });
      // Brief delay for UX feedback
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setAddingToCartIds(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const handleAddAllToCart = async () => {
    const inStockProducts = products.filter(p => p.inStock && p.isActive);
    for (const product of inStockProducts) {
      await handleAddToCart(product);
    }
  };

  const handleNotifyWhenAvailable = async (productId: string) => {
    setNotifyingIds(prev => new Set(prev).add(productId));
    try {
      const response = await fetch("/api/store/stock-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        setNotifiedIds(prev => new Set(prev).add(productId));
      }
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Error subscribing to stock alert:", error);
      }
    } finally {
      setNotifyingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const inStockCount = products.filter(p => p.inStock && p.isActive).length;

  return (
    <div>
      {/* Action Bar */}
      {inStockCount > 0 && (
        <div className="flex justify-end mb-6">
          <button
            onClick={handleAddAllToCart}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white font-bold rounded-lg hover:brightness-110 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar todo al carrito ({inStockCount})
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md ${
              !product.isActive ? 'opacity-60' : ''
            }`}
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-gray-300" />
                </div>
              )}

              {/* Status Badge */}
              {!product.isActive ? (
                <span className="absolute top-2 left-2 px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded">
                  No disponible
                </span>
              ) : !product.inStock ? (
                <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                  Agotado
                </span>
              ) : product.originalPrice ? (
                <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                  Oferta
                </span>
              ) : null}

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(product.id)}
                disabled={removingIds.has(product.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center hover:bg-red-50 transition shadow-sm disabled:opacity-50"
                aria-label="Eliminar de lista de deseos"
              >
                {removingIds.has(product.id) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <Link 
                href={`/${clinic}/store/products/${product.id}`}
                className="block mb-2 hover:text-[var(--primary)] transition"
              >
                <h3 className="font-bold text-[var(--text-primary)] line-clamp-2">
                  {product.name}
                </h3>
              </Link>

              {product.description && (
                <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-lg font-black text-[var(--primary)]">
                  {formatPriceGs(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-[var(--text-muted)] line-through">
                    {formatPriceGs(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Actions */}
              {product.isActive && product.inStock ? (
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={addingToCartIds.has(product.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white font-bold rounded-lg hover:brightness-110 transition disabled:opacity-50"
                >
                  {addingToCartIds.has(product.id) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Agregando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Agregar al carrito
                    </>
                  )}
                </button>
              ) : product.isActive && !product.inStock ? (
                notifiedIds.has(product.id) ? (
                  <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 font-medium rounded-lg">
                    <Check className="w-4 h-4" />
                    Te notificaremos
                  </div>
                ) : (
                  <button
                    onClick={() => handleNotifyWhenAvailable(product.id)}
                    disabled={notifyingIds.has(product.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 transition disabled:opacity-50"
                  >
                    {notifyingIds.has(product.id) ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        Notificarme
                      </>
                    )}
                  </button>
                )
              ) : (
                <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-500 font-medium rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  No disponible
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
