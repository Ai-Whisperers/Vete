"use client";

import { Minus, Plus, Trash2, PawPrint, Calendar } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { DynamicIcon } from "@/lib/icons";
import { useToast } from "@/components/ui/Toast";
import {
  formatPriceGs,
  SIZE_SHORT_LABELS,
  getSizeBadgeColor,
  type PetSizeCategory
} from "@/lib/utils/pet-size";
import type { ServiceCartGroup, ServiceCartPet } from "@/lib/utils/cart-utils";

interface ServiceGroupProps extends ServiceCartGroup {
  /** Compact mode for drawer/sidebar display */
  compact?: boolean;
}

/**
 * Service Group Component
 *
 * Displays a service variant with all pets that have it in cart.
 * Groups items by service+variant for a service-centric view.
 */
export function ServiceGroup({
  service_id,
  service_name,
  service_icon,
  variant_name,
  image_url,
  pets,
  subtotal,
  compact = false
}: ServiceGroupProps) {
  const { updateQuantity, removeItem } = useCart();
  const { showToast } = useToast();
  const { clinic } = useParams() as { clinic: string };

  const handleIncrement = (pet: ServiceCartPet) => {
    const result = updateQuantity(pet.cart_item_id, 1);
    if (result.limitedByStock) {
      showToast(result.message || "Stock limitado");
    }
  };

  const handleDecrement = (pet: ServiceCartPet) => {
    if (pet.quantity > 1) {
      updateQuantity(pet.cart_item_id, -1);
    } else {
      removeItem(pet.cart_item_id);
    }
  };

  const handleRemovePet = (pet: ServiceCartPet) => {
    removeItem(pet.cart_item_id);
  };

  const handleRemoveAll = () => {
    for (const pet of pets) {
      removeItem(pet.cart_item_id);
    }
  };

  if (compact) {
    return (
      <div className="py-3 border-b border-gray-100 last:border-0">
        {/* Service Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center">
            {image_url ? (
              <img
                src={image_url}
                alt={service_name}
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <DynamicIcon name={service_icon} className="w-5 h-5 text-[var(--primary)]" />
            )}
          </div>
          <div className="flex-grow min-w-0">
            <p className="font-bold text-[var(--text-primary)] text-sm truncate">
              {service_name}
            </p>
            {variant_name && variant_name !== "default" && (
              <p className="text-xs text-[var(--text-muted)]">{variant_name}</p>
            )}
          </div>
          <span className="text-sm font-bold text-[var(--primary)]">
            {formatPriceGs(subtotal)}
          </span>
        </div>

        {/* Pet List - Compact */}
        <div className="pl-13 space-y-1.5">
          {pets.map((pet) => (
            <div key={pet.cart_item_id} className="flex items-center gap-2 text-xs">
              <PawPrint className="w-3 h-3 text-[var(--primary)]" />
              <span className="text-[var(--text-secondary)]">{pet.pet_name}</span>
              <span
                className={`px-1 py-0.5 rounded text-[10px] font-bold ${getSizeBadgeColor(
                  pet.pet_size as PetSizeCategory
                )}`}
              >
                {SIZE_SHORT_LABELS[pet.pet_size as PetSizeCategory]}
              </span>
              <span className="text-[var(--text-muted)] ml-auto">
                {formatPriceGs(pet.price)}
              </span>
              <button
                type="button"
                onClick={() => handleRemovePet(pet)}
                className="p-1 text-gray-400 hover:text-red-500"
                aria-label={`Eliminar ${pet.pet_name}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full size display
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Service Header */}
      <div className="flex items-center gap-4 p-4 bg-[var(--bg-subtle)] border-b border-gray-100">
        <div className="shrink-0">
          {image_url ? (
            <img
              src={image_url}
              alt={service_name}
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <DynamicIcon name={service_icon} className="w-7 h-7 text-[var(--primary)]" />
            </div>
          )}
        </div>

        <div className="flex-grow min-w-0">
          <h4 className="font-bold text-[var(--text-primary)] text-lg">
            {service_name}
          </h4>
          {variant_name && variant_name !== "default" && (
            <p className="text-sm text-[var(--text-muted)]">{variant_name}</p>
          )}
        </div>

        <div className="text-right">
          <p className="text-xl font-black text-[var(--primary)]">
            {formatPriceGs(subtotal)}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {pets.length} {pets.length === 1 ? "mascota" : "mascotas"}
          </p>
        </div>
      </div>

      {/* Pets List */}
      <div className="divide-y divide-gray-100">
        {pets.map((pet) => (
          <div key={pet.cart_item_id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
            {/* Pet Info */}
            <div className="flex items-center gap-2 flex-grow min-w-0">
              <PawPrint className="w-4 h-4 text-[var(--primary)] shrink-0" />
              <span className="font-medium text-[var(--text-primary)]">
                {pet.pet_name}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${getSizeBadgeColor(
                  pet.pet_size as PetSizeCategory
                )}`}
              >
                {SIZE_SHORT_LABELS[pet.pet_size as PetSizeCategory]}
              </span>
            </div>

            {/* Price */}
            <span className="font-bold text-[var(--text-primary)] shrink-0">
              {formatPriceGs(pet.price)}
            </span>

            {/* Quantity Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleDecrement(pet)}
                className="w-7 h-7 rounded-lg border border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 flex items-center justify-center transition-colors"
                aria-label="Disminuir"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center text-sm font-bold">
                {pet.quantity}
              </span>
              <button
                type="button"
                onClick={() => handleIncrement(pet)}
                className="w-7 h-7 rounded-lg border border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 flex items-center justify-center transition-colors"
                aria-label="Aumentar"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemovePet(pet)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              aria-label={`Eliminar ${pet.pet_name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-100">
        <Link
          href={`/${clinic}/book?service=${service_id}`}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] font-bold text-sm rounded-xl transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Agendar Cita
        </Link>

        {pets.length > 1 && (
          <button
            type="button"
            onClick={handleRemoveAll}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar todos
          </button>
        )}
      </div>
    </div>
  );
}
