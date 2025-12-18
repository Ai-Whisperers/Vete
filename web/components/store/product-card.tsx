"use client";

import { Image } from 'lucide-react';
import { AddToCartButton } from '../cart/add-to-cart-button';
import { useState } from 'react';

interface ProductCardProps {
  readonly product: any;
  readonly config: any;
}

export function ProductCard({ product, config }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const labels = config.ui_labels?.store?.product_card || { add: "Agregar", added: "Agregado" };
  const currency = config.settings?.currency || 'PYG';

  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full">
        <div className="h-64 overflow-hidden relative bg-white flex items-center justify-center p-4">
            {product.image ? (
                <img src={product.image} alt={product.name} className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500" />
            ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                    <Image className="w-12 h-12" />
                </div>
            )}
            
            {/* Top Info Tags */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-gray-100 italic">
                    {product.category}
                </span>
                {product.hasDiscount && (
                    <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md animate-pulse">
                        ¡Oferta!
                    </span>
                )}
            </div>

            {product.stock <= 5 && product.stock > 0 && (
                <div className="absolute bottom-4 left-4 bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm">
                    Últimas {product.stock} unidades
                </div>
            )}
            
            {product.stock <= 0 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <span className="bg-gray-900 text-white text-xs font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-2xl">
                        Agotado
                    </span>
                </div>
            )}
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
            <h3 className="font-bold text-xl text-gray-800 mb-2 leading-tight group-hover:text-[var(--primary)] transition-colors">
                {product.name}
            </h3>
            {/* Quantity Selector - Only if in stock */}
            {product.stock > 0 && (
                <div className="flex items-center gap-3 mb-4 bg-gray-50 p-2 rounded-2xl w-fit">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">CANT.</span>
                    <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number.parseInt(e.target.value) || 1)))}
                        className="w-12 bg-transparent text-center font-bold text-gray-800 focus:outline-none"
                    />
                </div>
            )}
            <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">
                {product.description}
            </p>
            
            <div className="flex flex-col gap-0.5 pt-4 border-t border-gray-100 mt-auto">
                {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through font-medium">
                        {new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency, maximumSignificantDigits: 3 }).format(product.originalPrice)}
                    </span>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[var(--primary)]">
                        {product.price ? new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency, maximumSignificantDigits: 3 }).format(product.price) : '0'}
                    </span>
                    
                    {product.stock > 0 && (
                        <AddToCartButton
                            item={{
                                id: product.id,
                                name: product.name,
                                price: product.price || 0,
                                type: 'product',
                                description: product.description,
                                image_url: product.image
                            }}
                            quantity={quantity}
                            iconOnly
                            label={labels.add}
                            addedLabel={labels.added}
                        />
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
