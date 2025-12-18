"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { PetSelector } from "./pet-selector";
import { useCart } from "@/context/cart-context";
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
  const [selectedPet, setSelectedPet] = useState<PetForService | null>(null);
  const [addingVariant, setAddingVariant] = useState<string | null>(null);
  const [justAddedVariant, setJustAddedVariant] = useState<string | null>(null);
  const [showPetPrompt, setShowPetPrompt] = useState(false);

  // Check if any variant has size-based pricing
  const hasSizeDependentVariants = service.variants?.some((v) => hasSizeBasedPricing(v.size_pricing));

  // Calculate prices for all variants based on selected pet
  const calculatedPrices = useMemo(() => {
    if (!service.variants) return {};

    return service.variants.reduce((acc, variant) => {
      const variantHasSizePricing = hasSizeBasedPricing(variant.size_pricing);

      let calculatedPrice = variant.price_value;
      if (selectedPet && variantHasSizePricing) {
        const sizePrice = getServicePriceForSize(variant.size_pricing, selectedPet.size_category);
        calculatedPrice = sizePrice ?? variant.price_value;
      }

      acc[variant.name] = {
        price: calculatedPrice,
        difference: calculatedPrice - variant.price_value,
        isSizeDependent: variantHasSizePricing
      };
      return acc;
    }, {} as Record<string, { price: number; difference: number; isSizeDependent: boolean }>);
  }, [service.variants, selectedPet]);

  // Handle add to cart - always requires pet selection
  const handleAddToCart = async (variant: ServiceVariant) => {
    // Always require pet selection
    if (!selectedPet) {
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
    const calculatedPrice = variantHasSizePricing
      ? (calculatedPrices[variant.name]?.price ?? variant.price_value)
      : variant.price_value;

    // Always add with pet info
    addItem({
      id: `${service.id}-${selectedPet.id}-${variant.name}`,
      name: `${service.title} - ${variant.name}`,
      price: calculatedPrice,
      type: "service",
      image_url: service.image,
      description: variant.description || service.summary,
      pet_id: selectedPet.id,
      pet_name: selectedPet.name,
      pet_size: selectedPet.size_category,
      service_id: service.id,
      variant_name: variant.name,
      base_price: variant.price_value
    });

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
              {selectedPet && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)]/10 rounded-full">
                  <Icons.PawPrint className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-sm font-bold text-[var(--primary)]">
                    {selectedPet.name}
                  </span>
                  {hasSizeDependentVariants && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${getSizeBadgeColor(
                        selectedPet.size_category
                      )}`}
                    >
                      {SIZE_SHORT_LABELS[selectedPet.size_category]}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Pet selection prompt - shows when user tries to add without pet */}
            {showPetPrompt && !selectedPet && (
              <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
                <Icons.AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 font-medium">
                  Primero selecciona una mascota para agregar este servicio
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

                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[var(--text-primary)] text-lg">
                            {variant.name}
                          </div>
                          {variant.description && (
                            <div className="text-sm text-[var(--text-muted)] mt-1">
                              {variant.description}
                            </div>
                          )}
                          {variantHasSizePricing && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                              <Icons.Calculator className="w-3.5 h-3.5" />
                              <span>Precio según tamaño de mascota</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            {/* Show calculated price if pet selected and size-dependent */}
                            {selectedPet && priceInfo?.isSizeDependent ? (
                              <>
                                <span className="inline-block bg-[var(--primary)] px-3 py-1 rounded-full text-white font-black">
                                  {formatPriceGs(priceInfo.price)}
                                </span>
                                {priceInfo.difference !== 0 && (
                                  <span
                                    className={`text-xs ${
                                      priceInfo.difference > 0
                                        ? "text-amber-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {priceInfo.difference > 0 ? "+" : ""}
                                    {formatPriceGs(priceInfo.difference)} vs base
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
                            <div className="flex justify-center">
                              {variant.price_value > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleAddToCart(variant)}
                                  disabled={isAdding || justAdded}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                    justAdded
                                      ? "bg-green-500 text-white"
                                      : "bg-[var(--primary)] text-white hover:brightness-110"
                                  } disabled:opacity-70`}
                                  title="Agregar al carrito"
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
                                        Agregar
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
                showPetPrompt && !selectedPet
                  ? 'border-amber-400 ring-2 ring-amber-200'
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Icons.PawPrint className="w-5 h-5 text-[var(--primary)]" />
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-heading">
                  Selecciona tu Mascota
                </h3>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                {hasSizeDependentVariants
                  ? "Selecciona tu mascota para ver precios personalizados y agregar servicios."
                  : "Selecciona la mascota para la cual deseas este servicio."
                }
              </p>
              <PetSelector
                onSelect={(pet) => {
                  setSelectedPet(pet);
                  setShowPetPrompt(false);
                }}
                selectedPetId={selectedPet?.id}
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
