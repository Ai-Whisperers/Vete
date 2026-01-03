"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  X,
  Calendar,
  Percent,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  CalendarDays,
  Zap,
  Gift,
  Sparkles,
  Sun,
  Tag,
  Package,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  campaign_type: "sale" | "bogo" | "bundle" | "flash" | "seasonal";
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  product_count: number;
  status: "active" | "inactive" | "scheduled" | "ended";
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CampaignsClientProps {
  clinic: string;
}

type CampaignStatus = "all" | "active" | "scheduled" | "ended" | "inactive";
type ViewMode = "grid" | "calendar";

const statusOptions: { value: CampaignStatus; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "scheduled", label: "Programadas" },
  { value: "ended", label: "Finalizadas" },
  { value: "inactive", label: "Inactivas" },
];

const campaignTypeOptions = [
  { value: "sale", label: "Oferta", icon: Tag, color: "green" },
  { value: "bogo", label: "2x1", icon: Gift, color: "purple" },
  { value: "bundle", label: "Bundle", icon: Package, color: "blue" },
  { value: "flash", label: "Flash", icon: Zap, color: "orange" },
  { value: "seasonal", label: "Temporada", icon: Sun, color: "yellow" },
];

const discountTypeOptions = [
  { value: "percentage", label: "Porcentaje", icon: Percent },
  { value: "fixed_amount", label: "Monto Fijo", icon: DollarSign },
];

function getStatusBadge(status: string): React.ReactElement {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    active: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: <CheckCircle className="w-3 h-3" />,
      label: "Activa",
    },
    inactive: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      icon: <XCircle className="w-3 h-3" />,
      label: "Inactiva",
    },
    ended: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: <Clock className="w-3 h-3" />,
      label: "Finalizada",
    },
    scheduled: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: <Calendar className="w-3 h-3" />,
      label: "Programada",
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

function getCampaignTypeInfo(type: string): { icon: React.ElementType; color: string; label: string } {
  const typeOpt = campaignTypeOptions.find((t) => t.value === type);
  return typeOpt || { icon: Tag, color: "gray", label: type };
}

function formatDiscountValue(type: string, value: number): string {
  if (type === "percentage") return `${value}%`;
  return `₲ ${value.toLocaleString("es-PY")}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "short",
  });
}

export default function CampaignsClient({ clinic }: CampaignsClientProps): React.ReactElement {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    campaign_type: "sale" as Campaign["campaign_type"],
    discount_type: "percentage" as Campaign["discount_type"],
    discount_value: 10,
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    is_active: true,
  });

  const fetchCampaigns = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        clinic,
        page: String(pagination.page),
        limit: String(pagination.limit),
        status: statusFilter,
      });

      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      if (viewMode === "calendar") {
        const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
        params.append("month", monthStr);
      }

      const response = await fetch(`/api/dashboard/campaigns?${params}`);

      if (!response.ok) {
        throw new Error("Error al cargar campañas");
      }

      const data = await response.json();
      setCampaigns(data.campaigns || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("Error al cargar las campañas");
    } finally {
      setLoading(false);
    }
  }, [clinic, pagination.page, pagination.limit, statusFilter, typeFilter, viewMode, currentMonth]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const openCreateModal = (): void => {
    setEditingCampaign(null);
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setFormData({
      name: "",
      description: "",
      campaign_type: "sale",
      discount_type: "percentage",
      discount_value: 10,
      start_date: today,
      end_date: nextWeek,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (campaign: Campaign): void => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || "",
      campaign_type: campaign.campaign_type,
      discount_type: campaign.discount_type,
      discount_value: campaign.discount_value,
      start_date: campaign.start_date.split("T")[0],
      end_date: campaign.end_date.split("T")[0],
      is_active: campaign.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = editingCampaign
        ? `/api/dashboard/campaigns/${editingCampaign.id}`
        : "/api/dashboard/campaigns";

      const response = await fetch(url, {
        method: editingCampaign ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.details?.message || "Error al guardar campaña");
      }

      setShowModal(false);
      fetchCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/dashboard/campaigns/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar campaña");
      }

      setShowDeleteConfirm(null);
      fetchCampaigns();
    } catch (err) {
      console.error("Error deleting campaign:", err);
      setError("Error al eliminar la campaña");
    }
  };

  const navigateMonth = (direction: "prev" | "next"): void => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarView = (): React.ReactElement => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const getCampaignsForDay = (day: number): Campaign[] => {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const date = new Date(dateStr);
      return campaigns.filter((c) => {
        const start = new Date(c.start_date);
        const end = new Date(c.end_date);
        return date >= start && date <= end;
      });
    };

    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            {currentMonth.toLocaleDateString("es-PY", { month: "long", year: "numeric" })}
          </h3>
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayCampaigns = getCampaignsForDay(day);
              const today = new Date();
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

              return (
                <div
                  key={day}
                  className={`aspect-square p-1 rounded-lg border transition-colors ${
                    isToday
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`text-xs font-medium mb-1 ${isToday ? "text-[var(--primary)]" : "text-gray-700"}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayCampaigns.slice(0, 2).map((campaign) => {
                      const typeInfo = getCampaignTypeInfo(campaign.campaign_type);
                      return (
                        <div
                          key={campaign.id}
                          className={`text-[10px] truncate rounded px-1 py-0.5 cursor-pointer hover:opacity-80 ${
                            campaign.status === "active"
                              ? "bg-green-100 text-green-700"
                              : campaign.status === "scheduled"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                          onClick={() => openEditModal(campaign)}
                          title={campaign.name}
                        >
                          {campaign.name}
                        </div>
                      );
                    })}
                    {dayCampaigns.length > 2 && (
                      <div className="text-[10px] text-gray-500 px-1">
                        +{dayCampaigns.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderGridView = (): React.ReactElement => {
    if (campaigns.length === 0) {
      return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            No hay campañas
          </h3>
          <p className="text-[var(--text-secondary)] mt-1">
            {statusFilter !== "all" || typeFilter !== "all"
              ? "No se encontraron campañas con los filtros aplicados"
              : "Crea tu primera campaña promocional"}
          </p>
          {statusFilter === "all" && typeFilter === "all" && (
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Crear Campaña
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => {
          const typeInfo = getCampaignTypeInfo(campaign.campaign_type);
          const TypeIcon = typeInfo.icon;

          return (
            <div
              key={campaign.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header with type indicator */}
              <div
                className={`px-4 py-3 flex items-center justify-between bg-gradient-to-r ${
                  typeInfo.color === "green"
                    ? "from-green-50 to-green-100/50"
                    : typeInfo.color === "purple"
                    ? "from-purple-50 to-purple-100/50"
                    : typeInfo.color === "blue"
                    ? "from-blue-50 to-blue-100/50"
                    : typeInfo.color === "orange"
                    ? "from-orange-50 to-orange-100/50"
                    : typeInfo.color === "yellow"
                    ? "from-yellow-50 to-yellow-100/50"
                    : "from-gray-50 to-gray-100/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <TypeIcon
                    className={`w-5 h-5 ${
                      typeInfo.color === "green"
                        ? "text-green-600"
                        : typeInfo.color === "purple"
                        ? "text-purple-600"
                        : typeInfo.color === "blue"
                        ? "text-blue-600"
                        : typeInfo.color === "orange"
                        ? "text-orange-600"
                        : typeInfo.color === "yellow"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-700">{typeInfo.label}</span>
                </div>
                {getStatusBadge(campaign.status)}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] line-clamp-1">
                    {campaign.name}
                  </h3>
                  {campaign.description && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                      {campaign.description}
                    </p>
                  )}
                </div>

                {/* Discount */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  {campaign.discount_type === "percentage" ? (
                    <Percent className="w-5 h-5 text-green-600" />
                  ) : (
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="text-lg font-bold text-[var(--text-primary)]">
                    {formatDiscountValue(campaign.discount_type, campaign.discount_value)}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)]">descuento</span>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Calendar className="w-4 h-4" />
                  {formatDateShort(campaign.start_date)} - {formatDateShort(campaign.end_date)}
                </div>

                {/* Products count */}
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Package className="w-4 h-4" />
                  {campaign.product_count} producto{campaign.product_count !== 1 ? "s" : ""}
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(campaign)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(campaign.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-[var(--primary)]" />
            Campañas Promocionales
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Gestiona ofertas, descuentos y promociones de tu tienda
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all text-sm font-semibold shadow-md"
        >
          <Plus className="w-4 h-4" />
          Nueva Campaña
        </button>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filters */}
          <div className="flex-1 flex flex-wrap gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as CampaignStatus);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-white text-sm"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-white text-sm"
            >
              <option value="all">Todos los tipos</option>
              {campaignTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white shadow text-[var(--primary)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Vista de cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "calendar"
                  ? "bg-white shadow text-[var(--primary)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Vista de calendario"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
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

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto" />
          <p className="mt-4 text-[var(--text-secondary)]">Cargando campañas...</p>
        </div>
      ) : viewMode === "calendar" ? (
        renderCalendarView()
      ) : (
        renderGridView()
      )}

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
                {editingCampaign ? "Editar Campaña" : "Nueva Campaña"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Nombre de la Campaña *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Ofertas de Verano"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción de la campaña..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] resize-none"
                />
              </div>

              {/* Campaign Type */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Tipo de Campaña *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {campaignTypeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          campaign_type: opt.value as Campaign["campaign_type"],
                        }))
                      }
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        formData.campaign_type === opt.value
                          ? "border-[var(--primary)] bg-[var(--primary)]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <opt.icon
                        className={`w-5 h-5 ${
                          formData.campaign_type === opt.value
                            ? "text-[var(--primary)]"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Tipo de Descuento *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {discountTypeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          discount_type: opt.value as Campaign["discount_type"],
                        }))
                      }
                      className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
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
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Value */}
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

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                    }
                    min={formData.start_date}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Campaña Activa</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    La campaña se mostrará en la tienda
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
                  {saving ? "Guardando..." : editingCampaign ? "Guardar Cambios" : "Crear Campaña"}
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
                Eliminar Campaña
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                ¿Estás seguro de que deseas eliminar esta campaña? Esta acción no se puede deshacer.
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
