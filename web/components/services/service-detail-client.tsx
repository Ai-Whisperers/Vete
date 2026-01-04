"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { DynamicIcon } from "@/lib/icons";
import { MultiPetSelector } from "./multi-pet-selector";
import { useCart } from "@/context/cart-context";
import { useServiceCartStatus } from "@/hooks/use-cart-variant-status";
import {
  getServicePriceForSize,
  hasSizeBasedPricing,
  formatPriceGs,
  SIZE_SHORT_LABELS,
  getSizeBadgeColor
} from "@/lib/utils/pet-size";
import type { Service, ServiceVariant, PetForService } from "@/lib/types/services";

interface ServiceDetailConfig {
  name: string;
  contact: {
    whatsapp_number?: string;
  };
  ui_labels?: {
    services?: {
      description_label?: string;
      includes_label?: string;
      table_variant?: string;
      table_price?: string;
    };
  };
}

interface ServiceDetailClientProps {
  service: Service;
  config: ServiceDetailConfig;
  clinic: string;
  isLoggedIn: boolean;
}

export function ServiceDetailClient({
  service,
  config,
  clinic,
  isLoggedIn
}: ServiceDetailClientProps) {
  const { addItem } = useCart();
  const [selectedPets, setSelectedPets] = useState<PetForService[]>([]);
  const [addingVariant, setAddingVariant] = useState<string | null>(null);
  const [justAddedVariant, setJustAddedVariant] = useState<string | null>(null);
  const [showPetPrompt, setShowPetPrompt] = useState(false);

  // Track which pets have each variant in cart
  const variantCartStatus = useServiceCartStatus(service.id);

  // Check if any variant has size-based pricing
  const hasSizeDependentVariants = service.variants?.some((v) => hasSizeBasedPricing(v.size_pricing));

  // Get selected pet IDs for the selector
  const selectedPetIds = useMemo(() => selectedPets.map((p) => p.id), [selectedPets]);

  // Calculate prices for all variants based on selected pets
  // For multi-pet, we show price breakdown per pet
  const calculatedPrices = useMemo(() => {
    if (!service.variants) return {};

    return service.variants.reduce((acc, variant) => {
      const variantHasSizePricing = hasSizeBasedPricing(variant.size_pricing);

      // Calculate per-pet prices
      const petPrices = selectedPets.map((pet) => {
        const price = variantHasSizePricing
          ? (getServicePriceForSize(variant.size_pricing, pet.size_category) ?? variant.price_value)
          : variant.price_value;
        return { petId: pet.id, petName: pet.name, petSize: pet.size_category, price };
      });

      // Total for all selected pets
      const totalPrice = petPrices.reduce((sum, p) => sum + p.price, 0);

      acc[variant.name] = {
        basePrice: variant.price_value,
        petPrices,
        totalPrice,
        isSizeDependent: variantHasSizePricing
      };
      return acc;
    }, {} as Record<string, {
      basePrice: number;
      petPrices: Array<{ petId: string; petName: string; petSize: string; price: number }>;
      totalPrice: number;
      isSizeDependent: boolean;
    }>);
  }, [service.variants, selectedPets]);

  // Handle add to cart - adds service for all selected pets
  const handleAddToCart = async (variant: ServiceVariant) => {
    // Require at least one pet selected
    if (selectedPets.length === 0) {
      setShowPetPrompt(true);
      // Scroll to pet selector on mobile
      const petSelector = document.getElementById('pet-selector-card');
      if (petSelector) {
        petSelector.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setAddingVariant(variant.name);
    setShowPetPrompt(false);

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    const variantHasSizePricing = hasSizeBasedPricing(variant.size_pricing);
    const priceInfo = calculatedPrices[variant.name];

    // Add cart item for each selected pet
    for (const pet of selectedPets) {
      // Get price for this specific pet
      const petPrice = priceInfo?.petPrices.find((p) => p.petId === pet.id);
      const calculatedPrice = petPrice?.price ?? variant.price_value;

      addItem({
        id: `${service.id}-${pet.id}-${variant.name}`,
        name: `${service.title} - ${variant.name}`,
        price: calculatedPrice,
        type: "service",
        image_url: variant.image || service.image,
        description: variant.description || service.summary,
        pet_id: pet.id,
        pet_name: pet.name,
        pet_size: pet.size_category,
        service_id: service.id,
        service_icon: service.icon,
        variant_name: variant.name,
        base_price: variant.price_value
      });
    }

    setAddingVariant(null);
    setJustAddedVariant(variant.name);

    setTimeout(() => {
      setJustAddedVariant(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-default)] pb-20">
      {/* HERO HEADER */}
      <div className="relative py-20 lg:py-28 overflow-hidden">
        {/* Background - Image or Gradient */}
        {service.image ? (
          <>
            <div
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${service.image}')` }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0 z-0"
              style={{ background: "var(--gradient-primary)" }}
            />
            <div
              className="absolute inset-0 z-0 opacity-10 mix-blend-overlay"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "32px 32px"
              }}
            />
          </>
        )}

        <div className="container relative z-10 px-4 md:px-6">
          <Link
            href={`/${clinic}/services`}
            className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <Icons.ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Servicios
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
              <DynamicIcon name={service.icon} className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black font-heading text-white mb-4 drop-shadow-md text-balance">
                {service.title}
              </h1>
              <p className="text-xl text-white/90 font-medium max-w-2xl leading-relaxed">
                {service.summary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container px-4 md:px-6 -mt-8 relative z-20 mx-auto grid lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description Card */}
          <div className="bg-white rounded-[var(--radius)] shadow-[var(--shadow-sm)] p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 font-heading">
              {config.ui_labels?.services?.description_label ||
                "Descripción del Servicio"}
            </h2>
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
              {service.details?.description}
            </p>

            {service.details?.includes && service.details.includes.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                  {config.ui_labels?.services?.includes_label || "¿Qué incluye?"}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {service.details.includes.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-subtle)]"
                    >
                      <Icons.CheckCircle2 className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
                      <span className="text-[var(--text-secondary)] font-medium">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Pricing Table */}
          <div className="bg-white rounded-[var(--radius)] shadow-[var(--shadow-sm)] border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)] font-heading">
                Precios y Variantes
              </h2>
              {selectedPets.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Icons.PawPrint className="w-4 h-4 text-[var(--primary)]" />
                  {selectedPets.map((pet) => (
                    <div
                      key={pet.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)]/10 rounded-full"
                    >
                      <span className="text-sm font-bold text-[var(--primary)]">
                        {pet.name}
                      </span>
                      {hasSizeDependentVariants && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${getSizeBadgeColor(
                            pet.size_category
                          )}`}
                        >
                          {SIZE_SHORT_LABELS[pet.size_category]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pet selection prompt - shows when user tries to add without pet */}
            {showPetPrompt && selectedPets.length === 0 && (
              <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
                <Icons.AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 font-medium">
                  Primero selecciona al menos una mascota para agregar este servicio
                </p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[var(--bg-subtle)] text-[var(--text-muted)] font-bold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">
                      {config.ui_labels?.services?.table_variant || "Variante"}
                    </th>
                    <th className="px-6 py-4 text-right">
                      {config.ui_labels?.services?.table_price || "Precio"}
                    </th>
                    {isLoggedIn && (
                      <th className="px-6 py-4 text-center w-32">Acción</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {service.variants?.map((variant, idx) => {
                    const priceInfo = calculatedPrices[variant.name];
                    const isAdding = addingVariant === variant.name;
                    const justAdded = justAddedVariant === variant.name;
                    const variantHasSizePricing = hasSizeBasedPricing(variant.size_pricing);

                    // Get cart status for this variant
                    const cartStatus = variantCartStatus.get(variant.name);
                    const petsAlreadyInCart = cartStatus?.petNames || [];

                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                             {variant.image && (
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                                     <img src={variant.image} alt={variant.name} className="w-full h-full object-cover p-1" />
                                </div>
                             )}
                             <div>
                                <div className="font-bold text-[var(--text-primary)] text-lg leading-tight">
                                    {variant.name}
                                </div>
                                {variant.description && (
                                    <div className="text-sm text-[var(--text-muted)] mt-1">
                                    {variant.description}
                                    </div>
                                )}
                             </div>
                          </div>
                          {variantHasSizePricing && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                              <Icons.Calculator className="w-3.5 h-3.5" />
                              <span>Precio según tamaño de mascota</span>
                            </div>
                          )}
                          {/* Show pets already in cart for this variant */}
                          {petsAlreadyInCart.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600">
                              <Icons.CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Ya en carrito: {petsAlreadyInCart.join(", ")}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            {/* Show per-pet prices when multiple pets selected */}
                            {selectedPets.length > 0 && priceInfo ? (
                              <>
                                {/* Show individual pet prices for size-dependent variants */}
                                {priceInfo.isSizeDependent && priceInfo.petPrices.length > 1 ? (
                                  <div className="space-y-1">
                                    {priceInfo.petPrices.map((petPrice) => (
                                      <div key={petPrice.petId} className="flex items-center gap-2 justify-end">
                                        <span className="text-xs text-[var(--text-muted)]">{petPrice.petName}:</span>
                                        <span className="text-sm font-bold text-[var(--primary)]">
                                          {formatPriceGs(petPrice.price)}
                                        </span>
                                      </div>
                                    ))}
                                    <div className="pt-1 border-t border-gray-200 mt-1">
                                      <span className="inline-block bg-[var(--primary)] px-3 py-1 rounded-full text-white font-black text-sm">
                                        Total: {formatPriceGs(priceInfo.totalPrice)}
                                      </span>
                                    </div>
                                  </div>
                                ) : priceInfo.petPrices.length === 1 ? (
                                  /* Single pet selected */
                                  <span className="inline-block bg-[var(--primary)] px-3 py-1 rounded-full text-white font-black">
                                    {formatPriceGs(priceInfo.petPrices[0].price)}
                                  </span>
                                ) : (
                                  /* Multiple pets, flat pricing */
                                  <span className="inline-block bg-[var(--primary)] px-3 py-1 rounded-full text-white font-black">
                                    {formatPriceGs(priceInfo.totalPrice)}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="inline-block bg-[var(--bg-subtle)] px-3 py-1 rounded-full text-[var(--primary)] font-black">
                                {variant.price_display}
                              </span>
                            )}
                          </div>
                        </td>
                        {isLoggedIn && (
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center gap-2">
                              {variant.price_value > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleAddToCart(variant)}
                                  disabled={isAdding || justAdded || selectedPets.length === 0}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                    justAdded
                                      ? "bg-green-500 text-white"
                                      : selectedPets.length === 0
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-[var(--primary)] text-white hover:brightness-110"
                                  } disabled:opacity-70`}
                                  title={selectedPets.length === 0 ? "Selecciona una mascota primero" : "Agregar al carrito"}
                                >
                                  {isAdding ? (
                                    <>
                                      <Icons.Loader2 className="w-4 h-4 animate-spin" />
                                      <span className="hidden sm:inline">
                                        Agregando...
                                      </span>
                                    </>
                                  ) : justAdded ? (
                                    <>
                                      <Icons.Check className="w-4 h-4" />
                                      <span className="hidden sm:inline">
                                        Agregado
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Icons.ShoppingBag className="w-4 h-4" />
                                      <span className="hidden sm:inline">
                                        {selectedPets.length > 1
                                          ? `Agregar (${selectedPets.length})`
                                          : "Agregar"
                                        }
                                      </span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="text-sm text-[var(--text-muted)]">
                                  Consultar
                                </span>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pet Selector Card - Always show for logged in users */}
          {isLoggedIn && (
            <div
              id="pet-selector-card"
              className={`bg-white p-6 rounded-[var(--radius)] shadow-[var(--shadow-sm)] border transition-all ${
                showPetPrompt && selectedPets.length === 0
                  ? 'border-amber-400 ring-2 ring-amber-200'
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Icons.PawPrint className="w-5 h-5 text-[var(--primary)]" />
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-heading">
                  Selecciona tus Mascotas
                </h3>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                {hasSizeDependentVariants
                  ? "Selecciona tus mascotas para ver precios personalizados y agregar servicios para todas a la vez."
                  : "Selecciona las mascotas para las cuales deseas este servicio."
                }
              </p>
              <MultiPetSelector
                onSelectionChange={(pets) => {
                  setSelectedPets(pets);
                  setShowPetPrompt(false);
                }}
                selectedPetIds={selectedPetIds}
              />
            </div>
          )}

          {/* Booking Card */}
          <div className="bg-white p-6 rounded-[var(--radius)] shadow-[var(--shadow-md)] border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-heading">
              Agendar Cita
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Reserva tu turno para{" "}
              <span className="font-bold">{service.title}</span>.
            </p>

            {service.booking?.online_enabled && (
              <Link
                href={`/${clinic}/book?service=${service.id}`}
                className="flex w-full items-center justify-center gap-2 bg-[var(--primary)] hover:brightness-110 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-transform hover:-translate-y-1 mb-4"
              >
                <Icons.Calendar className="w-5 h-5" />
                Reservar Online
              </Link>
            )}

            {config.contact.whatsapp_number && (
              <a
                href={`https://wa.me/${config.contact.whatsapp_number}?text=${encodeURIComponent(
                  `Hola, quisiera agendar un turno para: ${service.title}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex w-full items-center justify-center gap-2 font-bold py-4 px-6 rounded-xl transition-transform hover:-translate-y-1 mb-4 ${
                  service.booking?.online_enabled
                    ? "bg-white border-2 border-[#25D366] text-[#25D366] hover:bg-green-50"
                    : "bg-[#25D366] text-white hover:brightness-110 shadow-lg"
                }`}
              >
                <Icons.MessageCircle className="w-5 h-5" />
                Consultar por WhatsApp
              </a>
            )}

            {/* Cart Link if logged in */}
            {isLoggedIn && (
              <Link
                href={`/${clinic}/cart`}
                className="flex w-full items-center justify-center gap-2 bg-[var(--bg-subtle)] text-[var(--text-primary)] font-bold py-3 px-6 rounded-xl hover:bg-[var(--bg-default)] transition-colors border border-gray-200"
              >
                <Icons.ShoppingCart className="w-5 h-5" />
                Ver Carrito
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
