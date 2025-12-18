'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, Sparkles, Trophy } from 'lucide-react';

interface RelatedProduct {
  relation_type: string;
  product: {
    id: string;
    name: string;
    short_description: string | null;
    image_url: string | null;
    base_price: number;
    avg_rating: number;
    review_count: number;
    is_new_arrival: boolean;
    is_best_seller: boolean;
    store_inventory: { stock_quantity: number } | null;
  };
}

interface Props {
  products: RelatedProduct[];
  clinic: string;
  currencySymbol: string;
}

export default function RelatedProducts({ products, clinic, currencySymbol }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return `${currencySymbol} 0`;
    return `${currencySymbol} ${price.toLocaleString('es-PY')}`;
  };

  // Group products by relation type
  const similarProducts = products.filter(p => p.relation_type === 'similar');
  const complementaryProducts = products.filter(p => p.relation_type === 'complementary' || p.relation_type === 'accessory');
  const frequentlyBought = products.filter(p => p.relation_type === 'frequently_bought');

  const renderProductCard = (item: RelatedProduct) => {
    const p = item.product;
    const inStock = (p.store_inventory?.stock_quantity || 0) > 0;

    return (
      <Link
        key={p.id}
        href={`/${clinic}/store/product/${p.id}`}
        className="flex-shrink-0 w-64 bg-white rounded-xl border border-[var(--border-default)] overflow-hidden hover:shadow-lg transition-shadow group"
      >
        <div className="relative aspect-square bg-gray-50">
          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {p.is_new_arrival && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                <Sparkles className="w-3 h-3" />
                Nuevo
              </span>
            )}
            {p.is_best_seller && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                <Trophy className="w-3 h-3" />
                Top
              </span>
            )}
          </div>

          <Image
            src={p.image_url || '/placeholder-product.png'}
            alt={p.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="256px"
          />

          {!inStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <span className="px-3 py-1 bg-gray-800 text-white text-sm font-medium rounded-full">
                Sin Stock
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-medium text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
            {p.name}
          </h3>

          {p.review_count > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-[var(--text-secondary)]">
                {p.avg_rating.toFixed(1)} ({p.review_count})
              </span>
            </div>
          )}

          <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
            {formatPrice(p.base_price)}
          </p>
        </div>
      </Link>
    );
  };

  const renderSection = (title: string, items: RelatedProduct[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-8 last:mb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map(renderProductCard)}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderSection('Productos Similares', similarProducts)}
      {renderSection('Complementá tu Compra', complementaryProducts)}
      {renderSection('Frecuentemente Comprados Juntos', frequentlyBought)}

      {/* If no grouped products, show all */}
      {similarProducts.length === 0 && complementaryProducts.length === 0 && frequentlyBought.length === 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              También te Puede Interesar
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-full border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-full border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map(renderProductCard)}
          </div>
        </div>
      )}
    </div>
  );
}
