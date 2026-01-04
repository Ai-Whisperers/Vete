"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Package,
  Syringe,
  Calendar,
  ChevronRight,
  Bell,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';

type AlertType = 'inventory' | 'vaccine' | 'appointment' | 'system';
type AlertSeverity = 'critical' | 'warning' | 'info';

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  count?: number;
  href?: string;
  dismissable?: boolean;
  timestamp?: string;
}

interface AlertsPanelProps {
  clinic: string;
}

interface Vaccine {
  id: string;
  pet_id: string;
  vaccine_name: string;
  is_overdue: boolean;
  due_date?: string;
}

const severityConfig = {
  critical: {
    bg: 'bg-[var(--status-error-bg)]',
    border: 'border-[var(--status-error)]/30',
    icon: 'text-[var(--status-error)]',
    badge: 'bg-[var(--status-error-bg)] text-[var(--status-error)]',
    dot: 'bg-[var(--status-error)]',
  },
  warning: {
    bg: 'bg-[var(--status-warning-bg)]',
    border: 'border-[var(--status-warning)]/30',
    icon: 'text-[var(--status-warning)]',
    badge: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]',
    dot: 'bg-[var(--status-warning)]',
  },
  info: {
    bg: 'bg-[var(--status-info-bg)]',
    border: 'border-[var(--status-info)]/30',
    icon: 'text-[var(--status-info)]',
    badge: 'bg-[var(--status-info-bg)] text-[var(--status-info)]',
    dot: 'bg-[var(--status-info)]',
  },
};

const typeIcons = {
  inventory: Package,
  vaccine: Syringe,
  appointment: Calendar,
  system: Bell,
};

function AlertCard({
  alert,
  onDismiss,
}: {
  alert: Alert;
  onDismiss?: (id: string) => void;
}) {
  const config = severityConfig[alert.severity];
  const Icon = typeIcons[alert.type];

  const content = (
    <div
      className={`relative flex items-start gap-3 p-4 rounded-xl border ${config.bg} ${config.border} group transition-all hover:shadow-sm`}
    >
      {/* Severity dot */}
      <div className={`absolute top-4 left-0 w-1 h-8 rounded-r-full ${config.dot}`} />

      {/* Icon */}
      <div className={`p-2 rounded-lg bg-[var(--bg-paper)] shadow-sm ${config.icon} flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {alert.title}
          </h4>
          {alert.count !== undefined && alert.count > 0 && (
            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${config.badge}`}>
              {alert.count}
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{alert.description}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {alert.href && (
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all" />
        )}
        {alert.dismissable && onDismiss && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDismiss(alert.id);
            }}
            className="p-1 hover:bg-[var(--bg-paper)]/50 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)]" />
          </button>
        )}
      </div>
    </div>
  );

  if (alert.href) {
    return <Link href={alert.href}>{content}</Link>;
  }
  return content;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-light)]"
        >
          <div className="w-8 h-8 bg-[var(--border-light)] rounded-lg flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-[var(--border-light)] rounded w-32 mb-2" />
            <div className="h-3 bg-[var(--border-light)] rounded w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--status-success-bg)] flex items-center justify-center mb-3">
        <CheckCircle2 className="w-6 h-6 text-[var(--status-success)]" />
      </div>
      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
        Sin alertas
      </h4>
      <p className="text-xs text-[var(--text-muted)]">
        Todo está funcionando correctamente
      </p>
    </div>
  );
}

export function AlertsPanel({ clinic }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Fetch alerts from multiple sources in parallel
        const [inventoryRes, vaccinesRes] = await Promise.all([
          fetch(`/api/dashboard/inventory-alerts?clinic=${clinic}`),
          fetch(`/api/dashboard/vaccines?clinic=${clinic}&days=7`),
        ]);

        const alertItems: Alert[] = [];

        // Process inventory alerts
        // API returns { low_stock: [], expiring_soon: [], out_of_stock: [] }
        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json();
          const lowStockCount = (inventoryData.low_stock || []).length;
          const outOfStockCount = (inventoryData.out_of_stock || []).length;
          const expiringCount = (inventoryData.expiring_soon || []).length;
          const criticalCount = lowStockCount + outOfStockCount;

          if (criticalCount > 0) {
            alertItems.push({
              id: 'inventory-low',
              type: 'inventory',
              severity: 'critical',
              title: 'Stock bajo',
              description: `${criticalCount} productos necesitan reposición urgente`,
              count: criticalCount,
              href: `/${clinic}/dashboard/inventory?filter=low_stock`,
            });
          }

          if (expiringCount > 0) {
            alertItems.push({
              id: 'inventory-expiring',
              type: 'inventory',
              severity: 'warning',
              title: 'Productos por vencer',
              description: `${expiringCount} productos vencen pronto`,
              count: expiringCount,
              href: `/${clinic}/dashboard/inventory?filter=expiring`,
            });
          }
        }

        // Process vaccine alerts
        // API returns array with is_overdue flag
        if (vaccinesRes.ok) {
          const vaccinesData = await vaccinesRes.json();
          const vaccines = Array.isArray(vaccinesData) ? vaccinesData : [];
          const overdueCount = vaccines.filter((v: Vaccine) => v.is_overdue).length;
          const upcomingCount = vaccines.filter((v: Vaccine) => !v.is_overdue).length;

          if (overdueCount > 0) {
            alertItems.push({
              id: 'vaccines-overdue',
              type: 'vaccine',
              severity: 'critical',
              title: 'Vacunas vencidas',
              description: `${overdueCount} mascotas con vacunas vencidas`,
              count: overdueCount,
              href: `/${clinic}/dashboard/vaccines?filter=overdue`,
            });
          }

          if (upcomingCount > 0) {
            alertItems.push({
              id: 'vaccines-upcoming',
              type: 'vaccine',
              severity: 'warning',
              title: 'Vacunas próximas',
              description: `${upcomingCount} vacunaciones programadas esta semana`,
              count: upcomingCount,
              href: `/${clinic}/dashboard/vaccines`,
            });
          }
        }

        // Sort by severity
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        alertItems.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        setAlerts(alertItems);
      } catch (error) {
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching alerts:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clinic]);

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const visibleAlerts = alerts.filter((alert) => !dismissed.has(alert.id));
  const criticalCount = visibleAlerts.filter((a) => a.severity === 'critical').length;

  return (
    <div className="bg-[var(--bg-paper)] rounded-2xl shadow-sm border border-[var(--border-light)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-light)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg ${
              criticalCount > 0 ? 'bg-[var(--status-error-bg)]' : 'bg-[var(--primary)]/10'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${
                criticalCount > 0 ? 'text-[var(--status-error)]' : 'text-[var(--primary)]'
              }`}
            />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">Alertas</h3>
            <p className="text-xs text-[var(--text-muted)]">
              {visibleAlerts.length} activa{visibleAlerts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {criticalCount > 0 && (
          <span className="px-2.5 py-1 bg-[var(--status-error-bg)] text-[var(--status-error)] text-xs font-bold rounded-full animate-pulse">
            {criticalCount} crítica{criticalCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <LoadingSkeleton />
        ) : visibleAlerts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {visibleAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={alert.dismissable ? handleDismiss : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {visibleAlerts.length > 0 && (
        <div className="px-5 py-3 border-t border-[var(--border-light)] bg-[var(--bg-subtle)]/50 flex items-center justify-between">
          <Link
            href={`/${clinic}/dashboard/alerts`}
            className="text-sm text-[var(--primary)] hover:underline font-medium flex items-center gap-1"
          >
            Ver todas las alertas
            <ExternalLink className="w-3 h-3" />
          </Link>
          {dismissed.size > 0 && (
            <button
              onClick={() => setDismissed(new Set())}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              Mostrar descartadas ({dismissed.size})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
