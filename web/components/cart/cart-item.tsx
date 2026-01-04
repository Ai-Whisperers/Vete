"use client";

import { Minus, Plus, Trash2, PawPrint, Package, AlertTriangle, Calendar } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart, type CartItem as CartItemType } from "@/context/cart-context";
import { DynamicIcon } from "@/lib/icons";
import { useToast } from "@/components/ui/Toast";
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
  const { updateQuantity, removeItem, getStockStatus } = useCart();
  const { showToast } = useToast();
  const { clinic } = useParams() as { clinic: string };

  const isService = item.type === "service";
  const hasPetInfo = isService && item.pet_id && item.pet_name && item.pet_size;
  const stockStatus = getStockStatus(item.id);

  const handleIncrement = () => {
    const result = updateQuantity(item.id, 1);
    if (result.limitedByStock) {
      showToast(result.message || `Solo hay ${result.availableStock} unidades disponibles`);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, -1);
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
                <DynamicIcon name={item.service_icon} className="w-6 h-6 text-[var(--primary)]" />
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

          {/* Schedule Button for Services - Compact */}
          {isService && item.service_id && clinic && (
            <Link
              href={`/${clinic}/book?service=${item.service_id}${item.pet_id ? `&pet=${item.pet_id}` : ''}`}
              className="flex items-center gap-1 mt-1.5 px-2 py-1 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] font-bold text-[10px] rounded-md transition-colors w-fit"
            >
              <Calendar className="w-3 h-3" />
              Agendar
            </Link>
          )}

          {/* Stock Warning Badge - Compact */}
          {stockStatus?.atLimit && (
            <div className="flex items-center gap-1 mt-1 text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-[10px] font-medium">Limite de stock</span>
            </div>
          )}
          {stockStatus?.nearLimit && !stockStatus.atLimit && (
            <div className="flex items-center gap-1 mt-1 text-amber-500">
              <span className="text-[10px]">Quedan {stockStatus.available}</span>
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
                aria-label="Disminuir cantidad"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className={`w-6 text-center text-sm font-bold ${stockStatus?.atLimit ? "text-amber-600" : ""}`}>
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={stockStatus?.atLimit}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Aumentar cantidad"
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
              <DynamicIcon name={item.service_icon} className="w-8 h-8 text-[var(--primary)]" />
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

        {/* Schedule Button for Services */}
        {isService && item.service_id && clinic && (
          <Link
            href={`/${clinic}/book?service=${item.service_id}${item.pet_id ? `&pet=${item.pet_id}` : ''}`}
            className="flex items-center justify-center gap-2 mt-3 px-4 py-2.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] font-bold text-sm rounded-xl transition-colors border border-[var(--primary)]/20"
          >
            <Calendar className="w-4 h-4" />
            Agendar Cita
          </Link>
        )}

        {/* Stock Warning - Full Size */}
        {stockStatus?.atLimit && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700 font-medium">
              Has alcanzado el limite de stock disponible
            </span>
          </div>
        )}
        {stockStatus?.nearLimit && !stockStatus.atLimit && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-amber-50/50 border border-amber-100 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-600">
              Quedan solo {stockStatus.available} unidades disponibles
            </span>
          </div>
        )}

        {/* Price & Quantity Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDecrement}
              className="w-8 h-8 rounded-lg border border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 flex items-center justify-center transition-colors"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className={`w-10 text-center text-lg font-bold ${stockStatus?.atLimit ? "text-amber-600" : ""}`}>
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={stockStatus?.atLimit}
              className="w-8 h-8 rounded-lg border border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-4 h-4" />
            </button>
            {item.stock !== undefined && (
              <span className={`text-xs ml-2 ${stockStatus?.atLimit ? "text-amber-600 font-medium" : "text-[var(--text-muted)]"}`}>
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
