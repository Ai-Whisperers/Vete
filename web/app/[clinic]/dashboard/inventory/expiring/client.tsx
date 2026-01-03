"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  AlertCircle,
  AlertTriangle,
  Package,
  ArrowLeft,
  Loader2,
  Calendar,
  XCircle,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface ExpiringProduct {
  id: string;
  tenant_id: string;
  name: string;
  sku: string | null;
  image_url: string | null;
  stock_quantity: number;
  expiry_date: string;
  batch_number: string | null;
  category_name: string | null;
  days_until_expiry: number;
  urgency_level: string;
}

interface ExpiryTotals {
  expired: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

interface ExpiringProductsClientProps {
  clinic: string;
}

type UrgencyFilter = "all" | "expired" | "critical" | "high" | "medium" | "low";

const urgencyConfig = {
  expired: {
    label: "Vencidos",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    badgeColor: "bg-red-100 text-red-700",
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    description: "Productos que ya vencieron",
  },
  critical: {
    label: "Críticos (< 7 días)",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
    badgeColor: "bg-orange-100 text-orange-700",
    icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
    description: "Vencen en menos de 7 días",
  },
  high: {
    label: "Altos (7-14 días)",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    badgeColor: "bg-amber-100 text-amber-700",
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    description: "Vencen en 7-14 días",
  },
  medium: {
    label: "Medios (14-30 días)",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
    badgeColor: "bg-yellow-100 text-yellow-700",
    icon: <Clock className="w-5 h-5 text-yellow-500" />,
    description: "Vencen en 14-30 días",
  },
  low: {
    label: "Bajos (30-60 días)",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    badgeColor: "bg-green-100 text-green-700",
    icon: <Calendar className="w-5 h-5 text-green-500" />,
    description: "Vencen en 30-60 días",
  },
};

export default function ExpiringProductsClient({ clinic }: ExpiringProductsClientProps): React.ReactElement {
  const [products, setProducts] = useState<ExpiringProduct[]>([]);
  const [totals, setTotals] = useState<ExpiryTotals>({
    expired: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<UrgencyFilter>("all");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["expired", "critical", "high"]));

  const fetchProducts = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dashboard/expiring-products?days=90");

      if (!response.ok) {
        throw new Error("Error al cargar productos");
      }

      const data = await response.json();
      setProducts(data.products || []);
      setTotals(data.totals || {});
    } catch (err) {
      console.error("Error fetching expiring products:", err);
      setError("Error al cargar los productos por vencer");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleSection = (section: string): void => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.urgency_level === filter);

  const groupedProducts: Record<string, ExpiringProduct[]> = {
    expired: filteredProducts.filter((p) => p.urgency_level === "expired"),
    critical: filteredProducts.filter((p) => p.urgency_level === "critical"),
    high: filteredProducts.filter((p) => p.urgency_level === "high"),
    medium: filteredProducts.filter((p) => p.urgency_level === "medium"),
    low: filteredProducts.filter((p) => p.urgency_level === "low"),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href={`/${clinic}/dashboard/inventory`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-7 h-7 text-[var(--primary)]" />
              Control de Vencimientos
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] ml-12">
            Gestiona productos próximos a vencer y toma acciones preventivas
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`p-4 rounded-xl border transition-all ${
            filter === "all"
              ? "border-[var(--primary)] bg-[var(--primary)]/5"
              : "border-gray-100 bg-white hover:border-gray-200"
          }`}
        >
          <div className="text-2xl font-bold text-[var(--text-primary)]">{totals.total}</div>
          <div className="text-xs text-[var(--text-secondary)]">Total</div>
        </button>

        {(Object.keys(urgencyConfig) as Array<keyof typeof urgencyConfig>).map((key) => {
          const config = urgencyConfig[key];
          const count = totals[key] || 0;

          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`p-4 rounded-xl border transition-all ${
                filter === key
                  ? `${config.borderColor} ${config.bgColor}`
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {config.icon}
              </div>
              <div className={`text-2xl font-bold ${config.textColor}`}>{count}</div>
              <div className="text-xs text-[var(--text-secondary)] truncate">{config.label.split(" ")[0]}</div>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* No Products */}
      {filteredProducts.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            No hay productos por vencer
          </h3>
          <p className="text-[var(--text-secondary)] mt-1">
            {filter === "all"
              ? "No tienes productos próximos a vencer en los próximos 90 días"
              : `No hay productos en la categoría "${urgencyConfig[filter as keyof typeof urgencyConfig]?.label || filter}"`}
          </p>
        </div>
      )}

      {/* Product Groups */}
      {(Object.keys(groupedProducts) as Array<keyof typeof groupedProducts>).map((key) => {
        const products = groupedProducts[key];
        if (products.length === 0) return null;

        const config = urgencyConfig[key as keyof typeof urgencyConfig];
        if (!config) return null;

        const isExpanded = expandedSections.has(key);

        return (
          <div
            key={key}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${config.borderColor}`}
          >
            <button
              onClick={() => toggleSection(key)}
              className={`w-full p-4 flex items-center justify-between ${config.bgColor}`}
            >
              <div className="flex items-center gap-3">
                {config.icon}
                <div className="text-left">
                  <h2 className={`text-lg font-bold ${config.textColor}`}>
                    {config.label}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {products.length} producto{products.length !== 1 ? "s" : ""} - {config.description}
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {isExpanded && (
              <div className="divide-y divide-gray-100">
                {products.map((product) => (
                  <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">{product.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {product.sku && (
                                <span className="text-xs text-[var(--text-secondary)] font-mono">
                                  SKU: {product.sku}
                                </span>
                              )}
                              {product.batch_number && (
                                <span className="text-xs text-[var(--text-secondary)]">
                                  Lote: {product.batch_number}
                                </span>
                              )}
                              {product.category_name && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  {product.category_name}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Expiry Info */}
                          <div className="text-right flex-shrink-0">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${config.badgeColor}`}>
                              {key === "expired" ? (
                                <>Venció hace {Math.abs(product.days_until_expiry)} día{Math.abs(product.days_until_expiry) !== 1 ? "s" : ""}</>
                              ) : (
                                <>{product.days_until_expiry} día{product.days_until_expiry !== 1 ? "s" : ""}</>
                              )}
                            </span>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                              {formatDate(product.expiry_date)}
                            </p>
                          </div>
                        </div>

                        {/* Stock & Actions */}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm text-[var(--text-secondary)]">
                            <strong>{product.stock_quantity}</strong> unidades en stock
                          </span>
                          <div className="flex gap-2">
                            {key === "expired" && (
                              <button className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                Marcar como Desechado
                              </button>
                            )}
                            {(key === "critical" || key === "high") && (
                              <button className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                                Crear Promoción
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          Leyenda de Urgencia
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {(Object.keys(urgencyConfig) as Array<keyof typeof urgencyConfig>).map((key) => {
            const config = urgencyConfig[key];
            return (
              <div key={key} className="flex items-start gap-3">
                {config.icon}
                <div>
                  <p className={`font-medium ${config.textColor}`}>{config.label}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{config.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
