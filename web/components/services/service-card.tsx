"use client";

import { DynamicIcon } from "@/lib/icons";
import Link from "next/link";
import { Check, ArrowRight, Calendar } from "lucide-react";
import type { Service } from "@/lib/types/services";
import { hasSizeBasedPricing } from "@/lib/utils/pet-size";

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

export const ServiceCard = ({ service, config }: ServiceCardProps) => {
  const isBookable = service.booking?.online_enabled;

  // Get first variant for display
  const firstVariant = service.variants?.[0];
  const hasSizePricing = service.variants?.some((v) => hasSizeBasedPricing(v.size_pricing));

  if (!service.visible) return null;

  return (
    <Link
      href={`./services/${service.id}`}
      className="bg-[var(--bg-paper)] rounded-[var(--radius)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-1 border border-[var(--border-light,#f3f4f6)] overflow-hidden flex flex-col h-full group"
    >
      {/* Card Image */}
      {service.image && (
        <div className="h-36 sm:h-40 relative overflow-hidden">
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
          {isBookable && (
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
            {isBookable && (
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
      <div className="p-6 pt-4 mt-auto border-t border-[var(--border-light,#f9fafb)] bg-[var(--bg-subtle)]/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)] font-medium">
              {hasSizePricing ? "Desde" : "Precio"}
            </span>
            <span className="text-xl font-black text-[var(--primary)]">
              {firstVariant?.price_display || "Consultar"}
            </span>
          </div>

          <div className="flex items-center gap-2 py-2.5 px-4 bg-[var(--primary)] text-white font-bold rounded-xl group-hover:opacity-90 transition-all text-sm">
            {isBookable ? (
              <>
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">{config.ui_labels?.services?.book_btn || "Ver Opciones"}</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span className="hidden sm:inline">Ver Detalles</span>
              </>
            )}
            <ArrowRight className="w-4 h-4 sm:hidden" />
          </div>
        </div>
      </div>
    </Link>
  );
};
