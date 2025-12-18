"use client";

import { Dog, Cat, PawPrint, Minus, Plus, Trash2 } from "lucide-react";
import { useCart, type CartItem } from "@/context/cart-context";
import {
  formatPriceGs,
  SIZE_SHORT_LABELS,
  getSizeBadgeColor,
  SIZE_LABELS,
  type PetSizeCategory
} from "@/lib/utils/pet-size";

interface PetServiceGroupProps {
  /** Pet ID */
  petId: string;
  /** Pet name */
  petName: string;
  /** Pet size category */
  petSize: PetSizeCategory;
  /** Pet photo URL (optional) */
  petPhoto?: string;
  /** Pet species for icon fallback */
  petSpecies?: "dog" | "cat" | string;
  /** Services for this pet */
  services: CartItem[];
  /** Subtotal for this pet's services */
  subtotal: number;
  /** Compact mode for drawer */
  compact?: boolean;
}

/**
 * Pet Service Group Component
 *
 * Displays a pet card with all their associated services.
 * Used in cart drawer and checkout to organize services by pet.
 */
export function PetServiceGroup({
  petId,
  petName,
  petSize,
  petPhoto,
  petSpecies,
  services,
  subtotal,
  compact = false
}: PetServiceGroupProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleIncrement = (item: CartItem) => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = (item: CartItem) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeItem(item.id);
    }
  };

  const PetIcon = petSpecies === "dog" ? Dog : petSpecies === "cat" ? Cat : PawPrint;

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Pet Header */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[var(--primary)]/5 to-transparent border-b border-gray-100">
          {petPhoto ? (
            <img
              src={petPhoto}
              alt={petName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center border-2 border-white shadow-sm">
              <PetIcon className="w-5 h-5 text-[var(--primary)]" />
            </div>
          )}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text-primary)] truncate">
                {petName}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getSizeBadgeColor(
                  petSize
                )}`}
              >
                {SIZE_SHORT_LABELS[petSize]}
              </span>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              {services.length} servicio{services.length !== 1 ? "s" : ""}
            </span>
          </div>
          <span className="text-sm font-black text-[var(--primary)]">
            {formatPriceGs(subtotal)}
          </span>
        </div>

        {/* Services List */}
        <div className="divide-y divide-gray-50">
          {services.map((service) => (
            <div key={service.id} className="flex items-center gap-2 p-2.5 pl-4">
              <div className="w-1 h-8 bg-[var(--primary)]/20 rounded-full" />
              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {service.name.replace(`${petName} - `, "").replace(` - ${service.variant_name}`, "")}
                </p>
                {service.variant_name && (
                  <p className="text-xs text-[var(--text-muted)]">
                    {service.variant_name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleDecrement(service)}
                  className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center text-xs font-bold">
                  {service.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleIncrement(service)}
                  className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <span className="text-xs font-bold text-[var(--primary)] w-20 text-right">
                {formatPriceGs(service.price * service.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full size display (checkout page)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Pet Header */}
      <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-[var(--primary)]/10 via-[var(--primary)]/5 to-transparent border-b border-gray-100">
        {petPhoto ? (
          <img
            src={petPhoto}
            alt={petName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border-2 border-white shadow-md">
            <PetIcon className="w-8 h-8 text-[var(--primary)]" />
          </div>
        )}
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-black text-[var(--text-primary)]">
              {petName}
            </h3>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${getSizeBadgeColor(
                petSize
              )}`}
            >
              {SIZE_SHORT_LABELS[petSize]}
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            {SIZE_LABELS[petSize]} • {services.length} servicio
            {services.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--text-muted)] mb-1">Subtotal</p>
          <p className="text-2xl font-black text-[var(--primary)]">
            {formatPriceGs(subtotal)}
          </p>
        </div>
      </div>

      {/* Services List */}
      <div className="divide-y divide-gray-100">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
          >
            {/* Service indicator */}
            <div className="w-1.5 h-12 bg-[var(--primary)]/30 rounded-full" />

            {/* Service image */}
            {service.image_url && (
              <img
                src={service.image_url}
                alt={service.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}

            {/* Service info */}
            <div className="flex-grow min-w-0">
              <p className="font-bold text-[var(--text-primary)]">
                {service.name
                  .replace(`${petName} - `, "")
                  .replace(` - ${service.variant_name}`, "")
                  .split(" - ")[0]}
              </p>
              {service.variant_name && (
                <p className="text-sm text-[var(--text-muted)]">
                  {service.variant_name}
                </p>
              )}
              {service.base_price && service.base_price !== service.price && (
                <p className="text-xs text-amber-600 mt-1">
                  Base: {formatPriceGs(service.base_price)} → Ajustado por tamaño
                </p>
              )}
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDecrement(service)}
                className="w-8 h-8 rounded-lg border border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold">{service.quantity}</span>
              <button
                type="button"
                onClick={() => handleIncrement(service)}
                className="w-8 h-8 rounded-lg border border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Price */}
            <div className="text-right w-28">
              {service.quantity > 1 && (
                <p className="text-xs text-[var(--text-muted)]">
                  {formatPriceGs(service.price)} c/u
                </p>
              )}
              <p className="text-lg font-black text-[var(--primary)]">
                {formatPriceGs(service.price * service.quantity)}
              </p>
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeItem(service.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Eliminar servicio"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
