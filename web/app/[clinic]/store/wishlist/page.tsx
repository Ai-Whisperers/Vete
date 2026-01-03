"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Package,
  Loader2,
  Share2,
  AlertCircle,
} from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";

interface WishlistProduct {
  id: string;
  name: string;
  sku: string | null;
  short_description: string | null;
  base_price: number;
  sale_price: number | null;
  image_url: string | null;
  is_active: boolean;
}

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  store_products: WishlistProduct | null;
}

export default function WishlistPage(): React.ReactElement {
  const params = useParams();
  const clinic = params?.clinic as string;
  const { items: wishlistIds, removeFromWishlist, isLoading: contextLoading, isLoggedIn } = useWishlist();
  const { addItem } = useCart();

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  // Fetch full wishlist data
  useEffect(() => {
    const fetchWishlist = async (): Promise<void> => {
      try {
        const response = await fetch("/api/store/wishlist");
        if (response.ok) {
          const data = await response.json();
          setWishlistItems(data.items || []);
        } else {
          setError("Error al cargar lista de deseos");
        }
      } catch (e) {
        console.error("Error fetching wishlist:", e);
        setError("Error de conexión");
      } finally {
        setIsLoading(false);
      }
    };

    if (!contextLoading) {
      fetchWishlist();
    }
  }, [contextLoading, wishlistIds]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToCart = async (item: WishlistItem): Promise<void> => {
    if (!item.store_products) return;
    setAddingToCart(item.product_id);

    try {
      addItem({
        id: item.product_id,
        name: item.store_products.name,
        price: item.store_products.sale_price || item.store_products.base_price,
        type: "product",
        image_url: item.store_products.image_url || undefined,
        sku: item.store_products.sku || undefined,
      }, 1);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleRemove = async (productId: string): Promise<void> => {
    setRemovingItem(productId);
    try {
      await removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
    } finally {
      setRemovingItem(null);
    }
  };

  const handleShare = async (): Promise<void> => {
    const shareUrl = window.location.href;
    const shareText = `Mi lista de deseos en ${clinic}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Lista de Deseos",
          text: shareText,
          url: shareUrl,
        });
      } catch (e) {
        // User cancelled or error
        console.error("Share failed:", e);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Enlace copiado al portapapeles");
      } catch (e) {
        console.error("Failed to copy:", e);
      }
    }
  };

  if (isLoading || contextLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Inicia sesión para ver tu lista de deseos
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Guarda tus productos favoritos iniciando sesión en tu cuenta.
          </p>
          <Link
            href={`/${clinic}/auth/login?redirect=/${clinic}/store/wishlist`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link
            href={`/${clinic}/store`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Lista de Deseos
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                {wishlistItems.length} {wishlistItems.length === 1 ? "producto" : "productos"}
              </p>
            </div>
          </div>
        </div>

        {wishlistItems.length > 0 && (
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100 rounded-lg transition"
          >
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {wishlistItems.length === 0 && !error && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Tu lista de deseos está vacía
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
            Explora nuestra tienda y guarda los productos que te gusten para comprarlos después.
          </p>
          <Link
            href={`/${clinic}/store`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition"
          >
            <Package className="w-5 h-5" />
            Explorar Tienda
          </Link>
        </div>
      )}

      {/* Wishlist Grid */}
      {wishlistItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const product = item.store_products;
            if (!product) return null;

            const isOnSale = product.sale_price && product.sale_price < product.base_price;
            const isAvailable = product.is_active;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden group ${
                  !isAvailable ? "opacity-75" : ""
                }`}
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100">
                  <Link href={`/${clinic}/store/product/${item.product_id}`}>
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </Link>

                  {/* Sale Badge */}
                  {isOnSale && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      OFERTA
                    </div>
                  )}

                  {/* Unavailable Badge */}
                  {!isAvailable && (
                    <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                      NO DISPONIBLE
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    disabled={removingItem === item.product_id}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Eliminar de lista de deseos"
                  >
                    {removingItem === item.product_id ? (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-500" />
                    )}
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/${clinic}/store/product/${item.product_id}`}>
                    <h3 className="font-medium text-[var(--text-primary)] mb-1 line-clamp-2 hover:text-[var(--primary)] transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {product.sku && (
                    <p className="text-xs text-[var(--text-secondary)] mb-2">
                      SKU: {product.sku}
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    {isOnSale ? (
                      <>
                        <span className="text-lg font-bold text-[var(--primary)]">
                          {formatCurrency(product.sale_price!)}
                        </span>
                        <span className="text-sm text-[var(--text-secondary)] line-through">
                          {formatCurrency(product.base_price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-[var(--text-primary)]">
                        {formatCurrency(product.base_price)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!isAvailable || addingToCart === item.product_id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart === item.product_id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Agregando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Agregar al Carrito
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Continue Shopping Link */}
      {wishlistItems.length > 0 && (
        <div className="text-center mt-8">
          <Link
            href={`/${clinic}/store`}
            className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Seguir Comprando
          </Link>
        </div>
      )}
    </div>
  );
}
