"use client";

import { Minus, Plus, Trash2, PawPrint, Package, Stethoscope } from "lucide-react";
import { useCart, type CartItem as CartItemType } from "@/context/cart-context";
import {
  formatPriceGs,
  SIZE_SHORT_LABELS,
  getSizeBadgeColor,
  type PetSizeCategory
} from "@/lib/utils/pet-size";

interface CartItemProps {
  item: CartItemType;
  /** Compact mode for drawer/sidebar display */
  compact?: boolean;
}

/**
 * Cart Item Component
 *
 * Displays a single cart item with appropriate details for products or services.
 * Shows pet info for services that were added with pet selection.
 */
export function CartItem({ item, compact = false }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const isService = item.type === "service";
  const hasPetInfo = isService && item.pet_id && item.pet_name && item.pet_size;

  const handleIncrement = () => {
    if (!item.stock || item.quantity < item.stock) {
      updateQuantity(item.id, item.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeItem(item.id);
    }
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  if (compact) {
    return (
      <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
        {/* Image or Icon */}
        <div className="shrink-0">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-14 h-14 rounded-lg object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center">
              {isService ? (
                <Stethoscope className="w-6 h-6 text-[var(--primary)]" />
              ) : (
                <Package className="w-6 h-6 text-gray-400" />
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-grow min-w-0">
          <p className="font-bold text-[var(--text-primary)] text-sm truncate">
            {item.name}
          </p>

          {/* Pet Badge for Services */}
          {hasPetInfo && (
            <div className="flex items-center gap-1.5 mt-1">
              <PawPrint className="w-3 h-3 text-[var(--primary)]" />
              <span className="text-xs text-[var(--text-secondary)]">
                {item.pet_name}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getSizeBadgeColor(
                  item.pet_size as PetSizeCategory
                )}`}
              >
                {SIZE_SHORT_LABELS[item.pet_size as PetSizeCategory]}
              </span>
            </div>
          )}

          {/* Price & Quantity */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-bold text-[var(--primary)]">
              {formatPriceGs(item.price * item.quantity)}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-sm font-bold">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={!!item.stock && item.quantity >= item.stock}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={handleRemove}
          className="shrink-0 self-start p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Full size display (for checkout page, etc.)
  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Image or Icon */}
      <div className="shrink-0">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-20 h-20 rounded-xl object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center">
            {isService ? (
              <Stethoscope className="w-8 h-8 text-[var(--primary)]" />
            ) : (
              <Package className="w-8 h-8 text-gray-400" />
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-bold text-[var(--text-primary)] text-lg">
              {item.name}
            </h4>
            {item.description && (
              <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Eliminar"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Pet Info for Services */}
        {hasPetInfo && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-[var(--primary)]/5 rounded-lg">
            <PawPrint className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm text-[var(--text-secondary)] font-medium">
              Para: <span className="font-bold">{item.pet_name}</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${getSizeBadgeColor(
                item.pet_size as PetSizeCategory
              )}`}
            >
              {SIZE_SHORT_LABELS[item.pet_size as PetSizeCategory]}
            </span>
            {item.base_price && item.base_price !== item.price && (
              <span className="text-xs text-[var(--text-muted)] ml-auto">
                Base: {formatPriceGs(item.base_price)}
              </span>
            )}
          </div>
        )}

        {/* Service variant name */}
        {isService && item.variant_name && !hasPetInfo && (
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Variante: {item.variant_name}
          </p>
        )}

        {/* Price & Quantity Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDecrement}
              className="w-8 h-8 rounded-lg border border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-lg font-bold">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={!!item.stock && item.quantity >= item.stock}
              className="w-8 h-8 rounded-lg border border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
            {item.stock && (
              <span className="text-xs text-[var(--text-muted)] ml-2">
                ({item.stock} disponibles)
              </span>
            )}
          </div>

          <div className="text-right">
            {item.quantity > 1 && (
              <p className="text-xs text-[var(--text-muted)]">
                {formatPriceGs(item.price)} c/u
              </p>
            )}
            <p className="text-xl font-black text-[var(--primary)]">
              {formatPriceGs(item.price * item.quantity)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
