"use client";

import { useState } from "react";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import Link from "next/link";
import { Check, ArrowRight, Calendar, MessageCircle, ShoppingBag, PawPrint } from "lucide-react";
import { AddToCartButton } from "../cart/add-to-cart-button";
import { AddServiceModal } from "./add-service-modal";
import type { Service, ServiceVariant } from "@/lib/types/services";
import type { PetSizeCategory } from "@/lib/utils/pet-size";

interface ServiceCardConfig {
  id?: string;
  ui_labels?: {
    services?: {
      includes_label?: string;
      book_btn?: string;
    };
  };
  contact?: {
    whatsapp_number?: string;
  };
}

interface ServiceCardProps {
  readonly service: Service;
  readonly config: ServiceCardConfig;
  readonly clinic: string;
}

export const ServiceCard = ({ service, config, clinic }: ServiceCardProps) => {
  const whatsappNumber = config.contact?.whatsapp_number;
  const isBookable = service.booking?.online_enabled;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get first variant for display
  const firstVariant = service.variants?.[0];
  const hasVariants = service.variants && service.variants.length > 0;
  const hasSizeDependent = service.variants?.some((v) => v.size_dependent);

  if (!service.visible) return null;

  // Handle add to cart click
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If any variant is size-dependent, open the modal
    if (hasSizeDependent && firstVariant) {
      setIsModalOpen(true);
    }
    // Otherwise the AddToCartButton handles it directly
  };

  return (
    <>
      <div className="bg-[var(--bg-paper)] rounded-[var(--radius)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-1 border border-[var(--border-light,#f3f4f6)] overflow-hidden flex flex-col h-full group relative">
        <Link
          href={`./services/${service.id}`}
          className="absolute inset-0 z-10"
          aria-label={`Ver detalles de ${service.title}`}
        />

        {/* Card Image */}
        {service.image && (
          <div className="h-40 relative overflow-hidden">
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {/* Icon overlay on image */}
            <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm text-[var(--primary)] grid place-items-center shadow-lg">
              <DynamicIcon name={service.icon} className="w-5 h-5" />
            </div>
            {service.booking?.online_enabled && (
              <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-[var(--status-success,#15803d)] shadow-lg">
                Online
              </span>
            )}
          </div>
        )}

        {/* Card Header */}
        <div className="p-6 pb-2">
          {/* Only show icon row if no image */}
          {!service.image && (
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-subtle)] text-[var(--primary)] grid place-items-center group-hover:bg-[var(--primary)] group-hover:text-white transition-colors duration-300">
                <DynamicIcon name={service.icon} className="w-6 h-6" />
              </div>
              {service.booking?.online_enabled && (
                <span className="inline-flex items-center rounded-full bg-[var(--status-success-bg,#dcfce7)] px-2.5 py-1 text-xs font-bold text-[var(--status-success,#15803d)] ring-1 ring-inset ring-[var(--status-success,#22c55e)]/20">
                  Online
                </span>
              )}
            </div>
          )}
          <h3 className="text-2xl font-bold text-[var(--text-primary)] font-heading mb-2 leading-tight group-hover:text-[var(--primary)] transition-colors">
            {service.title}
          </h3>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-3">
            {service.summary}
          </p>
        </div>

        {/* Card Body - Content */}
        <div className="px-6 py-2 flex-grow">
          {/* Includes List - Compact */}
          <div className="my-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] mb-2 block">
              {config.ui_labels?.services?.includes_label || "Incluye"}
            </span>
            <ul className="space-y-1.5">
              {service.details?.includes?.slice(0, 3).map((item: string) => (
                <li
                  key={item}
                  className="text-sm text-[var(--text-muted)] flex items-start gap-2"
                >
                  <Check className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{item}</span>
                </li>
              ))}
              {(service.details?.includes?.length || 0) > 3 && (
                <li className="text-xs text-[var(--primary)] font-medium pl-6">
                  + {(service.details?.includes?.length || 0) - 3} más...
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Card Footer - Price & Action */}
        <div className="p-6 pt-4 mt-auto border-t border-[var(--border-light,#f9fafb)] bg-[var(--bg-subtle)]/30 relative z-20">
          <div className="flex items-end justify-between gap-2 mb-3">
            <div className="flex flex-col">
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {hasSizeDependent ? "Desde" : "Precio"}
              </span>
              <span className="text-xl font-black text-[var(--primary)]">
                {firstVariant?.price_display || "Consultar"}
              </span>
            </div>

            <div className="flex gap-2">
              {/* Add to Cart Button - uses modal if size-dependent */}
              {hasSizeDependent ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="z-30 relative rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] p-3 hover:bg-[var(--primary)] hover:text-white transition-colors shadow-sm flex items-center gap-1"
                  title="Seleccionar mascota para agregar"
                >
                  <PawPrint className="w-4 h-4" />
                  <ShoppingBag className="w-4 h-4" />
                </button>
              ) : (
                <AddToCartButton
                  item={{
                    id: service.id,
                    name: service.title,
                    price: firstVariant?.price_value || 0,
                    type: "service",
                    description: service.summary,
                    service_id: service.id,
                    variant_name: firstVariant?.name
                  }}
                  iconOnly
                  className="z-30 relative rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] p-3 hover:bg-[var(--primary)] hover:text-white transition-colors shadow-sm"
                />
              )}

              <div className="rounded-xl bg-[var(--bg-subtle)] text-[var(--primary)] p-3 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors shadow-sm">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Booking Buttons */}
          <div className="flex gap-2">
            {isBookable ? (
              <Link
                href={`/${clinic}/book?service=${service.id}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all z-30 relative text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Calendar className="w-4 h-4" />
                {config.ui_labels?.services?.book_btn || "Reservar Online"}
              </Link>
            ) : whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  `Hola, me interesa el servicio: ${service.title}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all z-30 relative text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageCircle className="w-4 h-4" />
                Consultar
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Service Modal */}
      {hasSizeDependent && firstVariant && (
        <AddServiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          service={service}
          variant={firstVariant}
        />
      )}
    </>
  );
};
