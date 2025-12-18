'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn, Sparkles, Trophy, Percent } from 'lucide-react';
import type { StoreProductImage } from '@/lib/types/store';

interface Props {
  images: StoreProductImage[];
  productName: string;
  hasDiscount?: boolean;
  discountPercentage?: number | null;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

export default function ProductGallery({
  images,
  productName,
  hasDiscount,
  discountPercentage,
  isNewArrival,
  isBestSeller,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentImage = images[selectedIndex];

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-[var(--border-default)]">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {hasDiscount && discountPercentage && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
              <Percent className="w-4 h-4" />
              -{discountPercentage}%
            </span>
          )}
          {isNewArrival && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-sm font-bold rounded-full">
              <Sparkles className="w-4 h-4" />
              Nuevo
            </span>
          )}
          {isBestSeller && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-sm font-bold rounded-full">
              <Trophy className="w-4 h-4" />
              Top Venta
            </span>
          )}
        </div>

        {/* Zoom Button */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>

        {/* Image */}
        <div className="relative w-full h-full">
          <Image
            src={currentImage?.image_url || '/placeholder-product.png'}
            alt={currentImage?.alt_text || productName}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20'
                  : 'border-[var(--border-default)] hover:border-[var(--primary)]/50'
              }`}
            >
              <Image
                src={image.image_url}
                alt={image.alt_text || `${productName} - Imagen ${index + 1}`}
                fill
                className="object-contain p-1"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <span className="sr-only">Cerrar</span>
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative w-full max-w-4xl aspect-square">
            <Image
              src={currentImage?.image_url || '/placeholder-product.png'}
              alt={currentImage?.alt_text || productName}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Zoom Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          {/* Zoom Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    selectedIndex === index
                      ? 'bg-white scale-125'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
