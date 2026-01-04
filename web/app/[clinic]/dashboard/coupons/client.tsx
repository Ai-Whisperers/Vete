"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  X,
  Calendar,
  Percent,
  DollarSign,
  Truck,
  Users,
  ShoppingBag,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  discount_type: "percentage" | "fixed_amount" | "free_shipping";
  discount_value: number;
  min_purchase_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  usage_limit_per_user: number | null;
  valid_from: string;
  valid_until: string | null;
  applicable_products: string[] | null;
  applicable_categories: string[] | null;
  is_active: boolean;
  created_at: string;
  creator_name: string | null;
  status: "active" | "inactive" | "expired" | "exhausted" | "scheduled";
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CouponsClientProps {
  clinic: string;
}

type CouponStatus = "all" | "active" | "expired" | "exhausted" | "inactive";

const statusOptions: { value: CouponStatus; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
  { value: "expired", label: "Expirados" },
  { value: "exhausted", label: "Agotados" },
];

const discountTypeOptions = [
  { value: "percentage", label: "Porcentaje", icon: Percent },
  { value: "fixed_amount", label: "Monto Fijo", icon: DollarSign },
  { value: "free_shipping", label: "Envío Gratis", icon: Truck },
];

function getStatusBadge(status: string): React.ReactElement {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    active: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: <CheckCircle className="w-3 h-3" />,
      label: "Activo",
    },
    inactive: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      icon: <XCircle className="w-3 h-3" />,
      label: "Inactivo",
    },
    expired: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: <Clock className="w-3 h-3" />,
      label: "Expirado",
    },
    exhausted: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      icon: <AlertCircle className="w-3 h-3" />,
      label: "Agotado",
    },
    scheduled: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: <Calendar className="w-3 h-3" />,
      label: "Programado",
    },
  };

  const c = config[status] || config.inactive;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

function formatDiscountValue(type: string, value: number): string {
  if (type === "percentage") return `${value}%`;
  if (type === "fixed_amount") return `₲ ${value.toLocaleString("es-PY")}`;
  if (type === "free_shipping") return "Envío Gratis";
  return String(value);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Sin límite";
  return new Date(dateStr).toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CouponsClient({ clinic }: CouponsClientProps): React.ReactElement {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CouponStatus>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed_amount" | "free_shipping",
    discount_value: 10,
    min_purchase_amount: 0,
    max_discount_amount: 0,
    usage_limit: 0,
    usage_limit_per_user: 1,
    valid_from: new Date().toISOString().split("T")[0],
    valid_until: "",
    is_active: true,
  });

  const fetchCoupons = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        clinic,
        page: String(pagination.page),
        limit: String(pagination.limit),
        status: statusFilter,
      });

      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/dashboard/coupons?${params}`);

      if (!response.ok) {
        throw new Error("Error al cargar cupones");
      }

      const data = await response.json();
      setCoupons(data.coupons || []);
      setPagination(data.pagination);
    } catch (err) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching coupons:", err);
      }
      setError("Error al cargar los cupones");
    } finally {
      setLoading(false);
    }
  }, [clinic, pagination.page, pagination.limit, statusFilter, search]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const openCreateModal = (): void => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: 10,
      min_purchase_amount: 0,
      max_discount_amount: 0,
      usage_limit: 0,
      usage_limit_per_user: 1,
      valid_from: new Date().toISOString().split("T")[0],
      valid_until: "",
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (coupon: Coupon): void => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name || "",
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_purchase_amount: coupon.min_purchase_amount || 0,
      max_discount_amount: coupon.max_discount_amount || 0,
      usage_limit: coupon.usage_limit || 0,
      usage_limit_per_user: coupon.usage_limit_per_user || 1,
      valid_from: coupon.valid_from.split("T")[0],
      valid_until: coupon.valid_until ? coupon.valid_until.split("T")[0] : "",
      is_active: coupon.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        min_purchase_amount: formData.min_purchase_amount || null,
        max_discount_amount: formData.max_discount_amount || null,
        usage_limit: formData.usage_limit || null,
        valid_until: formData.valid_until || null,
      };

      const url = editingCoupon
        ? `/api/dashboard/coupons/${editingCoupon.id}`
        : "/api/dashboard/coupons";

      const response = await fetch(url, {
        method: editingCoupon ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.details?.message || "Error al guardar cupón");
      }

      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/dashboard/coupons/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar cupón");
      }

      setShowDeleteConfirm(null);
      fetchCoupons();
    } catch (err) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting coupon:", err);
      }
      setError("Error al eliminar el cupón");
    }
  };

  const copyCode = (code: string): void => {
    navigator.clipboard.writeText(code);
  };

  const generateRandomCode = (): void => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Ticket className="w-7 h-7 text-[var(--primary)]" />
            Cupones de Descuento
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Gestiona los cupones promocionales de tu tienda
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all text-sm font-semibold shadow-md"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cupón
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código o nombre..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-colors"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as CouponStatus);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-white"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto" />
            <p className="mt-4 text-[var(--text-secondary)]">Cargando cupones...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              No hay cupones
            </h3>
            <p className="text-[var(--text-secondary)] mt-1">
              {search || statusFilter !== "all"
                ? "No se encontraron cupones con los filtros aplicados"
                : "Crea tu primer cupón de descuento"}
            </p>
            {!search && statusFilter === "all" && (
              <button
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Crear Cupón
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Descuento
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Uso
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Vigencia
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                            <Tag className="w-5 h-5 text-[var(--primary)]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[var(--text-primary)]">
                                {coupon.code}
                              </span>
                              <button
                                onClick={() => copyCode(coupon.code)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title="Copiar código"
                              >
                                <Copy className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                            </div>
                            {coupon.name && (
                              <p className="text-sm text-[var(--text-secondary)]">
                                {coupon.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {coupon.discount_type === "percentage" && (
                            <Percent className="w-4 h-4 text-green-600" />
                          )}
                          {coupon.discount_type === "fixed_amount" && (
                            <DollarSign className="w-4 h-4 text-blue-600" />
                          )}
                          {coupon.discount_type === "free_shipping" && (
                            <Truck className="w-4 h-4 text-purple-600" />
                          )}
                          <span className="font-semibold text-[var(--text-primary)]">
                            {formatDiscountValue(coupon.discount_type, coupon.discount_value)}
                          </span>
                        </div>
                        {coupon.min_purchase_amount && coupon.min_purchase_amount > 0 && (
                          <p className="text-xs text-[var(--text-secondary)] mt-1">
                            Mín: ₲ {coupon.min_purchase_amount.toLocaleString("es-PY")}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-[var(--text-primary)]">
                            {coupon.usage_count}
                          </span>
                          {coupon.usage_limit && (
                            <span className="text-[var(--text-secondary)]">
                              / {coupon.usage_limit}
                            </span>
                          )}
                        </div>
                        {coupon.usage_limit_per_user && (
                          <p className="text-xs text-[var(--text-secondary)] mt-1">
                            {coupon.usage_limit_per_user} por usuario
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-[var(--text-primary)]">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(coupon.valid_from)}
                          </div>
                          <div className="text-[var(--text-secondary)] mt-0.5">
                            → {formatDate(coupon.valid_until)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(coupon.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(coupon.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-[var(--text-secondary)]">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                  {pagination.total} cupones
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={!pagination.hasPrev}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-[var(--text-primary)]">
                    {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={!pagination.hasNext}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {editingCoupon ? "Editar Cupón" : "Nuevo Cupón"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Código del Cupón *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                    }
                    placeholder="Ej: VERANO20"
                    required
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Generar
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Nombre (opcional)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Descuento de Verano"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Tipo de Descuento *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {discountTypeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          discount_type: opt.value as typeof formData.discount_type,
                        }))
                      }
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        formData.discount_type === opt.value
                          ? "border-[var(--primary)] bg-[var(--primary)]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <opt.icon
                        className={`w-5 h-5 ${
                          formData.discount_type === opt.value
                            ? "text-[var(--primary)]"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Value */}
              {formData.discount_type !== "free_shipping" && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Valor del Descuento *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {formData.discount_type === "percentage" ? "%" : "₲"}
                    </span>
                    <input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          discount_value: parseFloat(e.target.value) || 0,
                        }))
                      }
                      min={formData.discount_type === "percentage" ? 1 : 1}
                      max={formData.discount_type === "percentage" ? 100 : undefined}
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
              )}

              {/* Min/Max Purchase */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Compra Mínima
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      ₲
                    </span>
                    <input
                      type="number"
                      value={formData.min_purchase_amount || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          min_purchase_amount: parseFloat(e.target.value) || 0,
                        }))
                      }
                      min={0}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Descuento Máximo
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      ₲
                    </span>
                    <input
                      type="number"
                      value={formData.max_discount_amount || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          max_discount_amount: parseFloat(e.target.value) || 0,
                        }))
                      }
                      min={0}
                      placeholder="Sin límite"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Límite de Usos Total
                  </label>
                  <input
                    type="number"
                    value={formData.usage_limit || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        usage_limit: parseInt(e.target.value) || 0,
                      }))
                    }
                    min={0}
                    placeholder="Sin límite"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Usos por Usuario
                  </label>
                  <input
                    type="number"
                    value={formData.usage_limit_per_user}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        usage_limit_per_user: parseInt(e.target.value) || 1,
                      }))
                    }
                    min={1}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Validity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Válido Desde *
                  </label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, valid_from: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Válido Hasta
                  </label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, valid_until: e.target.value }))
                    }
                    min={formData.valid_from}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Cupón Activo</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Los clientes podrán usar este cupón
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, is_active: !prev.is_active }))
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.is_active ? "bg-[var(--primary)]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      formData.is_active ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-[var(--text-primary)] rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all font-medium disabled:opacity-50"
                >
                  {saving ? "Guardando..." : editingCoupon ? "Guardar Cambios" : "Crear Cupón"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                Eliminar Cupón
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                ¿Estás seguro de que deseas eliminar este cupón? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-[var(--text-primary)] rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
