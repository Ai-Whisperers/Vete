"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { X, ShoppingBag, ShoppingCart, ArrowRight, Stethoscope, Package, PawPrint, User } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { CartItem } from "./cart-item";
import { PetServiceGroup } from "./pet-service-group";
import { formatPriceGs } from "@/lib/utils/pet-size";
import { organizeCart } from "@/lib/utils/cart-utils";

interface CartDrawerProps {
  /** Controlled open state */
  isOpen: boolean;
  /** Callback when drawer should close */
  onClose: () => void;
}

/**
 * Cart Drawer Component
 *
 * Slide-out sidebar displaying cart contents with quick actions.
 */
export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { clinic } = useParams<{ clinic: string }>();
  const { items, totalItems, subtotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Organize cart by owner products and pet services
  const organizedCart = useMemo(() => organizeCart(items), [items]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-[var(--primary)]" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Tu Carrito
            </h2>
            {totalItems > 0 && (
              <span className="bg-[var(--primary)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto">
          {items.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full px-6 py-12">
              <div className="w-20 h-20 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-[var(--text-muted)] text-center mb-6">
                Agrega productos o servicios para comenzar
              </p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Link
                  href={`/${clinic}/services`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-[var(--primary)] text-white font-bold rounded-xl hover:brightness-110 transition"
                >
                  <Stethoscope className="w-5 h-5" />
                  Ver Servicios
                </Link>
                <Link
                  href={`/${clinic}/store`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-[var(--bg-subtle)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-gray-200 transition"
                >
                  <Package className="w-5 h-5" />
                  Ver Tienda
                </Link>
              </div>
            </div>
          ) : (
            /* Cart Items - Organized by Owner & Pets */
            <div className="px-4 py-4 space-y-5">
              {/* Products Section (For the Owner) */}
              {organizedCart.products.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="w-7 h-7 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
                      <User className="w-4 h-4 text-[var(--text-secondary)]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        Productos
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">Para ti</p>
                    </div>
                    <span className="ml-auto text-sm font-bold text-[var(--primary)]">
                      {formatPriceGs(organizedCart.productsSubtotal)}
                    </span>
                  </div>
                  <div className="space-y-1 bg-[var(--bg-subtle)]/50 rounded-xl p-3">
                    {organizedCart.products.map((item) => (
                      <CartItem key={item.id} item={item} compact />
                    ))}
                  </div>
                </div>
              )}

              {/* Services by Pet */}
              {organizedCart.petGroups.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="w-7 h-7 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                      <PawPrint className="w-4 h-4 text-[var(--primary)]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        Servicios por Mascota
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        {organizedCart.petGroups.length} mascota{organizedCart.petGroups.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="ml-auto text-sm font-bold text-[var(--primary)]">
                      {formatPriceGs(organizedCart.servicesSubtotal)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {organizedCart.petGroups.map((group) => (
                      <PetServiceGroup
                        key={group.pet_id}
                        petId={group.pet_id}
                        petName={group.pet_name}
                        petSize={group.pet_size}
                        services={group.services}
                        subtotal={group.subtotal}
                        compact
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Ungrouped Services (no pet assigned) */}
              {organizedCart.ungroupedServices.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Stethoscope className="w-4 h-4 text-[var(--text-secondary)]" />
                    <h3 className="text-sm font-bold text-[var(--text-secondary)]">
                      Otros Servicios
                    </h3>
                  </div>
                  <div className="space-y-1 bg-[var(--bg-subtle)]/50 rounded-xl p-3">
                    {organizedCart.ungroupedServices.map((item) => (
                      <CartItem key={item.id} item={item} compact />
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Cart Button */}
              <button
                type="button"
                onClick={clearCart}
                className="w-full py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Vaciar carrito
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 bg-[var(--bg-subtle)]/30">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[var(--text-secondary)] font-medium">
                Subtotal
              </span>
              <span className="text-2xl font-black text-[var(--primary)]">
                {formatPriceGs(subtotal)}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href={`/${clinic}/cart/checkout`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-[var(--primary)] text-white font-bold rounded-xl hover:brightness-110 transition shadow-lg"
              >
                Ir a Pagar
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href={`/${clinic}/cart`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-[var(--text-primary)] font-bold rounded-xl hover:bg-gray-50 transition border border-gray-200"
              >
                Ver Carrito Completo
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Floating Cart Button
 *
 * Shows cart icon with badge, opens drawer on click.
 */
interface FloatingCartButtonProps {
  onClick: () => void;
}

export function FloatingCartButton({ onClick }: FloatingCartButtonProps) {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-lg hover:brightness-110 hover:scale-105 transition-all flex items-center justify-center"
      aria-label={`Abrir carrito (${totalItems} items)`}
    >
      <ShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-200">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}
