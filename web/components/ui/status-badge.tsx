"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Ban,
  CircleDot,
  type LucideIcon,
} from "lucide-react";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide rounded-full transition-colors",
  {
    variants: {
      variant: {
        // Success states
        success: "bg-green-100 text-green-700 border border-green-200",
        confirmed: "bg-green-100 text-green-700 border border-green-200",
        paid: "bg-green-100 text-green-700 border border-green-200",
        verified: "bg-green-100 text-green-700 border border-green-200",
        completed: "bg-green-100 text-green-700 border border-green-200",
        active: "bg-green-100 text-green-700 border border-green-200",

        // Warning states
        warning: "bg-amber-100 text-amber-700 border border-amber-200",
        pending: "bg-amber-100 text-amber-700 border border-amber-200",
        review: "bg-amber-100 text-amber-700 border border-amber-200",
        upcoming: "bg-amber-100 text-amber-700 border border-amber-200",
        expiring: "bg-amber-100 text-amber-700 border border-amber-200",

        // Error states
        error: "bg-red-100 text-red-700 border border-red-200",
        rejected: "bg-red-100 text-red-700 border border-red-200",
        overdue: "bg-red-100 text-red-700 border border-red-200",
        cancelled: "bg-red-100 text-red-700 border border-red-200",
        critical: "bg-red-100 text-red-700 border border-red-200",
        expired: "bg-red-100 text-red-700 border border-red-200",

        // Info states
        info: "bg-blue-100 text-blue-700 border border-blue-200",
        scheduled: "bg-blue-100 text-blue-700 border border-blue-200",
        sent: "bg-blue-100 text-blue-700 border border-blue-200",
        "in-progress": "bg-blue-100 text-blue-700 border border-blue-200",
        processing: "bg-blue-100 text-blue-700 border border-blue-200",

        // Purple states (special/in consultation)
        purple: "bg-purple-100 text-purple-700 border border-purple-200",
        "in-consultation": "bg-purple-100 text-purple-700 border border-purple-200",
        hospitalized: "bg-purple-100 text-purple-700 border border-purple-200",

        // Orange states
        orange: "bg-orange-100 text-orange-700 border border-orange-200",
        "no-show": "bg-orange-100 text-orange-700 border border-orange-200",
        urgent: "bg-orange-100 text-orange-700 border border-orange-200",

        // Neutral states
        neutral: "bg-gray-100 text-gray-600 border border-gray-200",
        draft: "bg-gray-100 text-gray-600 border border-gray-200",
        inactive: "bg-gray-100 text-gray-600 border border-gray-200",
        unknown: "bg-gray-100 text-gray-600 border border-gray-200",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

// Icon mapping for each variant
const variantIcons: Record<string, LucideIcon> = {
  success: CheckCircle,
  confirmed: CheckCircle,
  paid: CheckCircle,
  verified: CheckCircle,
  completed: CheckCircle,
  active: CheckCircle,

  warning: AlertTriangle,
  pending: Clock,
  review: Clock,
  upcoming: Clock,
  expiring: AlertTriangle,

  error: XCircle,
  rejected: XCircle,
  overdue: AlertCircle,
  cancelled: Ban,
  critical: AlertCircle,
  expired: XCircle,

  info: CircleDot,
  scheduled: Clock,
  sent: CheckCircle,
  "in-progress": Loader2,
  processing: Loader2,

  purple: CircleDot,
  "in-consultation": CircleDot,
  hospitalized: CircleDot,

  orange: AlertTriangle,
  "no-show": Ban,
  urgent: AlertTriangle,

  neutral: CircleDot,
  draft: CircleDot,
  inactive: CircleDot,
  unknown: CircleDot,
};

// Spanish labels for each variant
const variantLabels: Record<string, string> = {
  success: "Éxito",
  confirmed: "Confirmada",
  paid: "Pagada",
  verified: "Verificada",
  completed: "Completada",
  active: "Activa",

  warning: "Advertencia",
  pending: "Pendiente",
  review: "En revisión",
  upcoming: "Próximamente",
  expiring: "Por vencer",

  error: "Error",
  rejected: "Rechazada",
  overdue: "Vencida",
  cancelled: "Cancelada",
  critical: "Crítico",
  expired: "Expirada",

  info: "Info",
  scheduled: "Agendada",
  sent: "Enviada",
  "in-progress": "En proceso",
  processing: "Procesando",

  purple: "Especial",
  "in-consultation": "En consulta",
  hospitalized: "Internado",

  orange: "Atención",
  "no-show": "No asistió",
  urgent: "Urgente",

  neutral: "Neutral",
  draft: "Borrador",
  inactive: "Inactiva",
  unknown: "Desconocido",
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  showIcon?: boolean;
  label?: string;
  pulse?: boolean;
}

export function StatusBadge({
  className,
  variant = "neutral",
  size,
  showIcon = true,
  label,
  pulse = false,
  ...props
}: StatusBadgeProps): React.ReactElement {
  const Icon = variant ? variantIcons[variant] || CircleDot : CircleDot;
  const defaultLabel = variant ? variantLabels[variant] || variant : "";
  const displayLabel = label || defaultLabel;
  const isAnimated = variant === "in-progress" || variant === "processing";

  return (
    <span
      className={cn(
        statusBadgeVariants({ variant, size }),
        pulse && "animate-pulse",
        className
      )}
      aria-label={`Estado: ${displayLabel}`}
      {...props}
    >
      {showIcon && (
        <Icon
          className={cn(
            size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5",
            isAnimated && "animate-spin"
          )}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </span>
  );
}

// Appointment-specific status mapper
export function getAppointmentStatus(status: string): StatusBadgeProps["variant"] {
  const map: Record<string, StatusBadgeProps["variant"]> = {
    pending: "pending",
    confirmed: "confirmed",
    checked_in: "info",
    in_progress: "in-consultation",
    completed: "completed",
    cancelled: "cancelled",
    no_show: "no-show",
  };
  return map[status] || "neutral";
}

// Invoice-specific status mapper
export function getInvoiceStatus(status: string): StatusBadgeProps["variant"] {
  const map: Record<string, StatusBadgeProps["variant"]> = {
    draft: "draft",
    sent: "sent",
    pending: "pending",
    paid: "paid",
    partial: "warning",
    overdue: "overdue",
    cancelled: "cancelled",
    refunded: "neutral",
  };
  return map[status] || "neutral";
}

// Vaccine-specific status mapper
export function getVaccineStatus(status: string): StatusBadgeProps["variant"] {
  const map: Record<string, StatusBadgeProps["variant"]> = {
    verified: "verified",
    pending: "review",
    rejected: "rejected",
    upcoming: "upcoming",
    expired: "expired",
  };
  return map[status] || "neutral";
}

// Lab order-specific status mapper
export function getLabOrderStatus(status: string): StatusBadgeProps["variant"] {
  const map: Record<string, StatusBadgeProps["variant"]> = {
    pending: "pending",
    in_progress: "in-progress",
    completed: "completed",
    cancelled: "cancelled",
    critical: "critical",
  };
  return map[status] || "neutral";
}

// Hospitalization-specific status mapper
export function getHospitalizationStatus(status: string): StatusBadgeProps["variant"] {
  const map: Record<string, StatusBadgeProps["variant"]> = {
    admitted: "hospitalized",
    in_treatment: "in-progress",
    stable: "success",
    critical: "critical",
    discharged: "completed",
  };
  return map[status] || "neutral";
}

export { statusBadgeVariants };
