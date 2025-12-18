"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

type BannerVariant = "info" | "warning" | "error" | "success" | "urgent";

interface NotificationBannerProps {
  variant?: BannerVariant;
  title: string;
  message?: string;
  icon?: keyof typeof Icons;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  animate?: boolean;
  className?: string;
}

const variantStyles: Record<BannerVariant, {
  bg: string;
  border: string;
  text: string;
  icon: string;
  defaultIcon: keyof typeof Icons;
}> = {
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: "text-blue-500",
    defaultIcon: "Info",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    icon: "text-yellow-500",
    defaultIcon: "AlertTriangle",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: "text-red-500",
    defaultIcon: "AlertCircle",
  },
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    icon: "text-green-500",
    defaultIcon: "CheckCircle",
  },
  urgent: {
    bg: "bg-red-600",
    border: "border-red-700",
    text: "text-white",
    icon: "text-white",
    defaultIcon: "AlertTriangle",
  },
};

export function NotificationBanner({
  variant = "info",
  title,
  message,
  icon,
  action,
  dismissible = true,
  onDismiss,
  animate = false,
  className,
}: NotificationBannerProps): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const styles = variantStyles[variant];
  const IconComponent = Icons[icon || styles.defaultIcon] as React.ComponentType<{ className?: string }>;

  const handleDismiss = (): void => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border",
        styles.bg,
        styles.border,
        animate && variant === "urgent" && "animate-pulse",
        isExiting && "animate-out fade-out-0 slide-out-to-top-2 duration-200",
        !isExiting && "animate-in fade-in-0 slide-in-from-top-2 duration-300",
        className
      )}
    >
      <div className={cn("shrink-0 mt-0.5", styles.icon)}>
        <IconComponent className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn("font-bold text-sm", styles.text)}>{title}</p>
        {message && (
          <p className={cn("text-sm mt-0.5 opacity-90", styles.text)}>{message}</p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action.href ? (
            <Link
              href={action.href}
              className={cn(
                "text-sm font-bold px-3 py-1.5 rounded-lg transition-colors min-h-[32px] inline-flex items-center",
                variant === "urgent"
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
              )}
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className={cn(
                "text-sm font-bold px-3 py-1.5 rounded-lg transition-colors min-h-[32px]",
                variant === "urgent"
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
              )}
            >
              {action.label}
            </button>
          )}
        </div>
      )}

      {dismissible && (
        <button
          onClick={handleDismiss}
          className={cn(
            "shrink-0 p-1 rounded-lg transition-colors",
            variant === "urgent"
              ? "text-white/70 hover:text-white hover:bg-white/10"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          )}
          aria-label="Cerrar notificación"
        >
          <Icons.X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================
// Pre-configured Notification Banners
// ============================================

interface OverdueVaccinesBannerProps {
  count: number;
  petName?: string;
  clinic: string;
  petId?: string;
  onDismiss?: () => void;
}

export function OverdueVaccinesBanner({
  count,
  petName,
  clinic,
  petId,
  onDismiss,
}: OverdueVaccinesBannerProps): React.ReactElement {
  return (
    <NotificationBanner
      variant="warning"
      icon="Syringe"
      title={petName ? `${petName} tiene ${count} vacuna${count > 1 ? "s" : ""} vencida${count > 1 ? "s" : ""}` : `Tienes ${count} vacuna${count > 1 ? "s" : ""} pendiente${count > 1 ? "s" : ""}`}
      message="Es importante mantener el calendario de vacunación al día."
      action={{
        label: "Ver Vacunas",
        href: petId ? `/${clinic}/portal/pets/${petId}#vaccines` : `/${clinic}/portal/dashboard`,
      }}
      onDismiss={onDismiss}
    />
  );
}

interface PendingAppointmentBannerProps {
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
  clinic: string;
  onDismiss?: () => void;
}

export function PendingAppointmentBanner({
  appointmentDate,
  appointmentTime,
  serviceName,
  clinic,
  onDismiss,
}: PendingAppointmentBannerProps): React.ReactElement {
  return (
    <NotificationBanner
      variant="info"
      icon="Calendar"
      title={`Próxima cita: ${serviceName}`}
      message={`${appointmentDate} a las ${appointmentTime}`}
      action={{
        label: "Ver Cita",
        href: `/${clinic}/portal/appointments`,
      }}
      onDismiss={onDismiss}
    />
  );
}

interface UnpaidInvoiceBannerProps {
  amount: string;
  dueDate?: string;
  invoiceId: string;
  clinic: string;
  onDismiss?: () => void;
}

export function UnpaidInvoiceBanner({
  amount,
  dueDate,
  invoiceId,
  clinic,
  onDismiss,
}: UnpaidInvoiceBannerProps): React.ReactElement {
  return (
    <NotificationBanner
      variant="error"
      icon="Receipt"
      title={`Factura pendiente: ${amount}`}
      message={dueDate ? `Vencimiento: ${dueDate}` : "Pago pendiente"}
      action={{
        label: "Pagar Ahora",
        href: `/${clinic}/portal/invoices/${invoiceId}`,
      }}
      onDismiss={onDismiss}
    />
  );
}

interface AllergyAlertBannerProps {
  petName: string;
  allergyDetails: string;
  onDismiss?: () => void;
}

export function AllergyAlertBanner({
  petName,
  allergyDetails,
  onDismiss,
}: AllergyAlertBannerProps): React.ReactElement {
  return (
    <NotificationBanner
      variant="urgent"
      icon="AlertTriangle"
      title={`¡Alerta Alérgica: ${petName}!`}
      message={allergyDetails}
      dismissible={false}
      animate
    />
  );
}

interface WelcomeBannerProps {
  userName: string;
  clinic: string;
  onDismiss?: () => void;
}

export function WelcomeBanner({
  userName,
  clinic,
  onDismiss,
}: WelcomeBannerProps): React.ReactElement {
  return (
    <NotificationBanner
      variant="success"
      icon="PartyPopper"
      title={`¡Bienvenido${userName ? `, ${userName}` : ""}!`}
      message="Tu cuenta ha sido creada exitosamente. Agrega tu primera mascota para comenzar."
      action={{
        label: "Agregar Mascota",
        href: `/${clinic}/portal/pets/new`,
      }}
      onDismiss={onDismiss}
    />
  );
}

// ============================================
// Notification Stack Component
// ============================================

interface Notification {
  id: string;
  variant: BannerVariant;
  title: string;
  message?: string;
  icon?: keyof typeof Icons;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  dismissible?: boolean;
  autoDismiss?: number; // milliseconds
}

interface NotificationStackProps {
  notifications: Notification[];
  onDismiss?: (id: string) => void;
  maxVisible?: number;
  className?: string;
}

export function NotificationStack({
  notifications,
  onDismiss,
  maxVisible = 3,
  className,
}: NotificationStackProps): React.ReactElement {
  const visibleNotifications = notifications.slice(0, maxVisible);
  const hiddenCount = Math.max(0, notifications.length - maxVisible);

  return (
    <div className={cn("space-y-3", className)}>
      {visibleNotifications.map((notification) => (
        <NotificationBanner
          key={notification.id}
          variant={notification.variant}
          title={notification.title}
          message={notification.message}
          icon={notification.icon}
          action={notification.action}
          dismissible={notification.dismissible ?? true}
          onDismiss={() => onDismiss?.(notification.id)}
        />
      ))}
      {hiddenCount > 0 && (
        <p className="text-sm text-gray-500 text-center font-medium">
          +{hiddenCount} notificación{hiddenCount > 1 ? "es" : ""} más
        </p>
      )}
    </div>
  );
}

// ============================================
// Auto-dismiss Hook
// ============================================

export function useAutoDismiss(
  notifications: Notification[],
  onDismiss: (id: string) => void
): void {
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    notifications.forEach((notification) => {
      if (notification.autoDismiss) {
        const timer = setTimeout(() => {
          onDismiss(notification.id);
        }, notification.autoDismiss);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications, onDismiss]);
}
