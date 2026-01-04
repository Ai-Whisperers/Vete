'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Package,
  Loader2,
  Share2,
  AlertCircle,
} from 'lucide-react'
import { useWishlist } from '@/context/wishlist-context'
import { useCart } from '@/context/cart-context'

interface WishlistProduct {
  id: string
  name: string
  sku: string | null
  short_description: string | null
  base_price: number
  sale_price: number | null
  image_url: string | null
  is_active: boolean
}

interface WishlistItem {
  id: string
  product_id: string
  created_at: string
  store_products: WishlistProduct | null
}

export default function WishlistPage(): React.ReactElement {
  const params = useParams()
  const clinic = params?.clinic as string
  const {
    items: wishlistIds,
    removeFromWishlist,
    isLoading: contextLoading,
    isLoggedIn,
  } = useWishlist()
  const { addItem } = useCart()

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [removingItem, setRemovingItem] = useState<string | null>(null)

  // Fetch full wishlist data
  useEffect(() => {
    const fetchWishlist = async (): Promise<void> => {
      try {
        const response = await fetch('/api/store/wishlist')
        if (response.ok) {
          const data = await response.json()
          setWishlistItems(data.items || [])
        } else {
          setError('Error al cargar lista de deseos')
        }
      } catch (e) {
        console.error('Error fetching wishlist:', e)
        setError('Error de conexión')
      } finally {
        setIsLoading(false)
      }
    }

    if (!contextLoading) {
      fetchWishlist()
    }
  }, [contextLoading, wishlistIds])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleAddToCart = async (item: WishlistItem): Promise<void> => {
    if (!item.store_products) return
    setAddingToCart(item.product_id)

    try {
      addItem(
        {
          id: item.product_id,
          name: item.store_products.name,
          price: item.store_products.sale_price || item.store_products.base_price,
          type: 'product',
          image_url: item.store_products.image_url || undefined,
          sku: item.store_products.sku || undefined,
        },
        1
      )
    } finally {
      setAddingToCart(null)
    }
  }

  const handleRemove = async (productId: string): Promise<void> => {
    setRemovingItem(productId)
    try {
      await removeFromWishlist(productId)
      setWishlistItems((prev) => prev.filter((item) => item.product_id !== productId))
    } finally {
      setRemovingItem(null)
    }
  }

  const handleShare = async (): Promise<void> => {
    const shareUrl = window.location.href
    const shareText = `Mi lista de deseos en ${clinic}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lista de Deseos',
          text: shareText,
          url: shareUrl,
        })
      } catch (e) {
        // User cancelled or error
        console.error('Share failed:', e)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('Enlace copiado al portapapeles')
      } catch (e) {
        console.error('Failed to copy:', e)
      }
    }
  }

  if (isLoading || contextLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
            Inicia sesión para ver tu lista de deseos
          </h2>
          <p className="mb-6 text-[var(--text-secondary)]">
            Guarda tus productos favoritos iniciando sesión en tu cuenta.
          </p>
          <Link
            href={`/${clinic}/auth/login?redirect=/${clinic}/store/wishlist`}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-white transition hover:opacity-90"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${clinic}/store`}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-[var(--text-secondary)]" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pink-100 p-2">
              <Heart className="h-6 w-6 text-pink-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Lista de Deseos</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>
        </div>

        {wishlistItems.length > 0 && (
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[var(--text-secondary)] transition hover:bg-gray-100 hover:text-[var(--text-primary)]"
          >
            <Share2 className="h-4 w-4" />
            Compartir
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {wishlistItems.length === 0 && !error && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Heart className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
            Tu lista de deseos está vacía
          </h2>
          <p className="mx-auto mb-6 max-w-sm text-[var(--text-secondary)]">
            Explora nuestra tienda y guarda los productos que te gusten para comprarlos después.
          </p>
          <Link
            href={`/${clinic}/store`}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-white transition hover:opacity-90"
          >
            <Package className="h-5 w-5" />
            Explorar Tienda
          </Link>
        </div>
      )}

      {/* Wishlist Grid */}
      {wishlistItems.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((item) => {
            const product = item.store_products
            if (!product) return null

            const isOnSale = product.sale_price && product.sale_price < product.base_price
            const isAvailable = product.is_active

            return (
              <div
                key={item.id}
                className={`group overflow-hidden rounded-xl border border-[var(--border-color)] bg-white shadow-sm ${
                  !isAvailable ? 'opacity-75' : ''
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
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </Link>

                  {/* Sale Badge */}
                  {isOnSale && (
                    <div className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
                      OFERTA
                    </div>
                  )}

                  {/* Unavailable Badge */}
                  {!isAvailable && (
                    <div className="absolute left-2 top-2 rounded bg-gray-500 px-2 py-1 text-xs font-bold text-white">
                      NO DISPONIBLE
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    disabled={removingItem === item.product_id}
                    className="absolute right-2 top-2 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-red-50 disabled:opacity-50"
                    title="Eliminar de lista de deseos"
                  >
                    {removingItem === item.product_id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-500" />
                    )}
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/${clinic}/store/product/${item.product_id}`}>
                    <h3 className="mb-1 line-clamp-2 font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--primary)]">
                      {product.name}
                    </h3>
                  </Link>

                  {product.sku && (
                    <p className="mb-2 text-xs text-[var(--text-secondary)]">SKU: {product.sku}</p>
                  )}

                  {/* Price */}
                  <div className="mb-4 flex items-baseline gap-2">
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
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {addingToCart === item.product_id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Agregando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        Agregar al Carrito
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Continue Shopping Link */}
      {wishlistItems.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            href={`/${clinic}/store`}
            className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Seguir Comprando
          </Link>
        </div>
      )}
    </div>
  )
}
