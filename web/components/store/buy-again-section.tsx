'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { RefreshCw, Plus, Package, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/cart-context';

interface ReorderProduct {
  id: string;
  name: string;
  image_url: string | null;
  base_price: number;
  sale_price: number | null;
  stock_quantity: number;
  is_available: boolean;
  last_ordered_at: string;
  total_times_ordered: number;
}

interface BuyAgainSectionProps {
  maxItems?: number;
}

export default function BuyAgainSection({ maxItems = 4 }: BuyAgainSectionProps) {
  const { clinic } = useParams() as { clinic: string };
  const { addItem } = useCart();

  const [products, setProducts] = useState<ReorderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchReorderSuggestions = async () => {
      try {
        const res = await fetch(`/api/store/reorder-suggestions?clinic=${clinic}&limit=${maxItems + 2}`);

        if (res.status === 401) {
          // User not logged in - don't show section
          setProducts([]);
          return;
        }

        if (!res.ok) {
          throw new Error('Error al cargar sugerencias');
        }

        const data = await res.json();
        setProducts(data.products || []);
      } catch (e) {
        console.error('Error fetching reorder suggestions:', e);
        setError(e instanceof Error ? e.message : 'Error');
      } finally {
        setLoading(false);
      }
    };

    fetchReorderSuggestions();
  }, [clinic, maxItems]);

  const handleAddToCart = async (product: ReorderProduct) => {
    setAddingId(product.id);

    try {
      const result = addItem({
        id: product.id,
        name: product.name,
        price: product.sale_price || product.base_price,
        type: 'product',
        image_url: product.image_url || undefined,
        stock: product.stock_quantity,
      });

      if (result.success) {
        setAddedIds(prev => new Set(prev).add(product.id));
        setTimeout(() => {
          setAddedIds(prev => {
            const next = new Set(prev);
            next.delete(product.id);
            return next;
          });
        }, 2000);
      }
    } catch (e) {
      console.error('Error adding to cart:', e);
    } finally {
      setAddingId(null);
    }
  };

  const formatPrice = (price: number): string => {
    return `Gs ${price.toLocaleString('es-PY')}`;
  };

  // Don't show section if loading, error, or no products
  if (loading || error || products.length === 0) {
    return null;
  }

  const displayProducts = products.slice(0, maxItems);

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[var(--text-primary)]">Comprar de Nuevo</h2>
              <p className="text-sm text-[var(--text-muted)]">Productos de tus pedidos anteriores</p>
            </div>
          </div>
          <Link
            href={`/${clinic}/store/orders`}
            className="text-sm font-medium text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            Ver Pedidos
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-[var(--primary)]/30 transition-colors"
            >
              {/* Product Image */}
              <Link href={`/${clinic}/store/product/${product.id}`} className="block mb-3">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  {!product.is_available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-medium px-2 py-1 bg-red-500 rounded">
                        Sin Stock
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Info */}
              <Link href={`/${clinic}/store/product/${product.id}`} className="block">
                <h3 className="font-medium text-sm text-[var(--text-primary)] line-clamp-2 mb-1 hover:text-[var(--primary)]">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center justify-between mt-2">
                <div>
                  {product.sale_price ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--primary)]">
                        {formatPrice(product.sale_price)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.base_price)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-sm text-[var(--text-primary)]">
                      {formatPrice(product.base_price)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.is_available || addingId === product.id}
                  className={`p-2 rounded-lg transition-all ${
                    addedIds.has(product.id)
                      ? 'bg-green-500 text-white'
                      : product.is_available
                      ? 'bg-[var(--primary)] text-white hover:opacity-90'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title={product.is_available ? 'Agregar al carrito' : 'Sin stock'}
                >
                  {addingId === product.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : addedIds.has(product.id) ? (
                    <ShoppingBag className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
