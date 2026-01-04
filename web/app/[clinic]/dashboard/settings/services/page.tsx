"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  Eye,
  EyeOff,
  GripVertical,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface ServiceVariant {
  name: string;
  price_display: string;
  price_value: number;
  size_pricing?: Record<string, number>;
}

interface Service {
  id: string;
  visible: boolean;
  category: string;
  title: string;
  icon: string;
  summary: string;
  details: {
    description: string;
    duration_minutes: number;
    includes: string[];
  };
  variants: ServiceVariant[];
  booking: {
    online_enabled: boolean;
    emergency_available: boolean;
  };
}

const categoryLabels: Record<string, string> = {
  medical: "Médico",
  preventative: "Preventivo",
  surgery: "Cirugía",
  diagnostics: "Diagnóstico",
  wellness: "Bienestar",
  luxury: "Premium",
  administrative: "Administrativo",
};

const formatPrice = (value: number): string => {
  if (value === 0) return "Consultar";
  return new Intl.NumberFormat("es-PY", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value) + " Gs";
};

export default function ServicesSettingsPage(): React.ReactElement {
  const { clinic } = useParams() as { clinic: string };
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/settings/services?clinic=${clinic}`);
        if (res.ok) {
          const data = await res.json();
          setServices(data.services || []);
        }
      } catch (error) {
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          console.error("Error fetching services:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [clinic]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(services.map((s) => s.category));
    return Array.from(cats);
  }, [services]);

  const toggleVisibility = (serviceId: string): void => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId ? { ...s, visible: !s.visible } : s
      )
    );
  };

  const updateVariantPrice = (serviceId: string, variantIndex: number, newPrice: number): void => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        const newVariants = [...s.variants];
        newVariants[variantIndex] = {
          ...newVariants[variantIndex],
          price_value: newPrice,
          price_display: formatPrice(newPrice),
        };
        return { ...s, variants: newVariants };
      })
    );
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const res = await fetch("/api/settings/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic, services }),
      });

      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Error saving services:", error);
      }
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const applyBulkPriceChange = (percentage: number): void => {
    setServices((prev) =>
      prev.map((service) => ({
        ...service,
        variants: service.variants.map((variant) => {
          if (variant.price_value === 0) return variant;
          const newPrice = Math.round(variant.price_value * (1 + percentage / 100));
          return {
            ...variant,
            price_value: newPrice,
            price_display: formatPrice(newPrice),
          };
        }),
      }))
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar servicios..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {categoryLabels[cat] || cat}
              </option>
            ))}
          </select>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Ajuste masivo:</span>
            <button
              onClick={() => applyBulkPriceChange(5)}
              className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              +5%
            </button>
            <button
              onClick={() => applyBulkPriceChange(10)}
              className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              +10%
            </button>
            <button
              onClick={() => applyBulkPriceChange(-5)}
              className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              -5%
            </button>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-semibold text-gray-900">
              Catálogo de Servicios ({filteredServices.length})
            </h2>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {filteredServices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron servicios</p>
            </div>
          ) : (
            filteredServices.map((service) => {
              const isExpanded = expandedService === service.id;
              return (
                <div key={service.id} className="hover:bg-gray-50 transition-colors">
                  {/* Service Header */}
                  <div className="px-6 py-4 flex items-center gap-4">
                    <button className="text-gray-300 hover:text-gray-400 cursor-grab">
                      <GripVertical className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleVisibility(service.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        service.visible
                          ? "text-green-600 bg-green-50 hover:bg-green-100"
                          : "text-gray-400 bg-gray-100 hover:bg-gray-200"
                      }`}
                      title={service.visible ? "Visible en sitio" : "Oculto"}
                    >
                      {service.visible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{service.title}</h3>
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          {categoryLabels[service.category] || service.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{service.summary}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {service.variants.length} variante{service.variants.length !== 1 ? "s" : ""}
                      </p>
                      <p className="font-medium text-gray-900">
                        {service.variants[0]?.price_display || "Consultar"}
                      </p>
                    </div>

                    <button
                      onClick={() => setExpandedService(isExpanded ? null : service.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Variants */}
                  {isExpanded && (
                    <div className="px-6 pb-4 ml-12 bg-gray-50 rounded-lg mx-4 mb-4">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Variante
                            </th>
                            <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">
                              Precio
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {service.variants.map((variant, idx) => (
                            <tr key={idx}>
                              <td className="py-3 text-sm text-gray-900">
                                {variant.name}
                              </td>
                              <td className="py-3 text-right">
                                <input
                                  type="number"
                                  value={variant.price_value}
                                  onChange={(e) =>
                                    updateVariantPrice(service.id, idx, parseInt(e.target.value) || 0)
                                  }
                                  className="w-32 px-3 py-1.5 text-right border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--primary)]"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Service Options */}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={service.booking.online_enabled}
                            onChange={(e) => {
                              setServices((prev) =>
                                prev.map((s) =>
                                  s.id === service.id
                                    ? {
                                        ...s,
                                        booking: { ...s.booking, online_enabled: e.target.checked },
                                      }
                                    : s
                                )
                              );
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                          />
                          <span className="text-sm text-gray-700">Reservable online</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={service.booking.emergency_available}
                            onChange={(e) => {
                              setServices((prev) =>
                                prev.map((s) =>
                                  s.id === service.id
                                    ? {
                                        ...s,
                                        booking: { ...s.booking, emergency_available: e.target.checked },
                                      }
                                    : s
                                )
                              );
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                          />
                          <span className="text-sm text-gray-700">Disponible en emergencias</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4 sticky bottom-4">
        <div className="flex items-center gap-2">
          {saveStatus === "success" && (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Precios actualizados</span>
            </>
          )}
          {saveStatus === "error" && (
            <>
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-600 font-medium">Error al guardar</span>
            </>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Guardar Precios
        </button>
      </div>
    </div>
  );
}
