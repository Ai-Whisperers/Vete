"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, Package, Clock, XCircle } from 'lucide-react';

interface InventoryAlert {
  product_id: string;
  product_name: string;
  sku: string;
  alert_type: 'low_stock' | 'expiring' | 'out_of_stock';
  current_stock?: number;
  min_stock?: number;
  expiry_date?: string;
}

interface AlertsData {
  low_stock: InventoryAlert[];
  expiring_soon: InventoryAlert[];
  out_of_stock?: InventoryAlert[];
}

interface InventoryAlertsProps {
  clinic: string;
}

export function InventoryAlerts({ clinic }: InventoryAlertsProps) {
  const [alerts, setAlerts] = useState<AlertsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'low_stock' | 'expiring'>('all');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`/api/dashboard/inventory-alerts?clinic=${clinic}`);
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch {
        // Error fetching inventory alerts - silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    // Refresh every 10 minutes
    const interval = setInterval(fetchAlerts, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clinic]);

  if (loading) {
    return (
      <div className="bg-[var(--bg-paper)] rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-[var(--bg-subtle)] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-[var(--border-light,#f3f4f6)] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalAlerts =
    (alerts?.low_stock?.length || 0) +
    (alerts?.expiring_soon?.length || 0) +
    (alerts?.out_of_stock?.length || 0);

  const getFilteredAlerts = () => {
    if (!alerts) return [];
    switch (activeTab) {
      case 'low_stock':
        return [...(alerts.low_stock || []), ...(alerts.out_of_stock || [])];
      case 'expiring':
        return alerts.expiring_soon || [];
      default:
        return [
          ...(alerts.out_of_stock || []),
          ...(alerts.low_stock || []),
          ...(alerts.expiring_soon || [])
        ];
    }
  };

  const formatExpiry = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Vencido';
    if (days === 0) return 'Vence hoy';
    if (days === 1) return 'Vence mañana';
    return `Vence en ${days} días`;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock':
        return <XCircle className="w-5 h-5 text-[var(--status-error,#ef4444)]" />;
      case 'low_stock':
        return <Package className="w-5 h-5 text-[var(--status-warning,#eab308)]" />;
      case 'expiring':
        return <Clock className="w-5 h-5 text-[var(--status-warning,#f59e0b)]" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-[var(--text-secondary)]" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'out_of_stock':
        return 'bg-[var(--status-error-bg,#fee2e2)] border-[var(--status-error,#ef4444)]/20';
      case 'low_stock':
        return 'bg-[var(--status-warning-bg,#fef3c7)] border-[var(--status-warning,#eab308)]/20';
      case 'expiring':
        return 'bg-[var(--status-warning-bg,#fef3c7)] border-[var(--status-warning,#f59e0b)]/20';
      default:
        return 'bg-[var(--bg-subtle)] border-[var(--border,#e5e7eb)]';
    }
  };

  return (
    <div className="bg-[var(--bg-paper)] rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[var(--text-secondary)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">Alertas de Inventario</h3>
          {totalAlerts > 0 && (
            <span className="bg-[var(--status-error-bg,#fee2e2)] text-[var(--status-error,#dc2626)] text-xs font-medium px-2 py-0.5 rounded-full">
              {totalAlerts}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-[var(--border-light,#f3f4f6)] pb-2">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'low_stock', label: 'Stock bajo', count: (alerts?.low_stock?.length || 0) + (alerts?.out_of_stock?.length || 0) },
          { key: 'expiring', label: 'Por vencer', count: alerts?.expiring_soon?.length || 0 }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-[var(--bg-inverse,#1f2937)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-xs ${
                activeTab === tab.key ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)]'
              }`}>
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {getFilteredAlerts().length === 0 ? (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <Package className="w-12 h-12 mx-auto mb-2 text-[var(--border,#e5e7eb)]" />
            <p>No hay alertas de inventario</p>
          </div>
        ) : (
          getFilteredAlerts().map((alert, i) => (
            <div
              key={`${alert.product_id}-${i}`}
              className={`flex items-center justify-between p-3 rounded-lg border ${getAlertBg(alert.alert_type)}`}
            >
              <div className="flex items-center gap-3">
                {getAlertIcon(alert.alert_type)}
                <div>
                  <p className="font-medium text-[var(--text-primary)] text-sm">{alert.product_name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{alert.sku}</p>
                </div>
              </div>
              <div className="text-right text-sm">
                {alert.alert_type === 'expiring' && alert.expiry_date ? (
                  <span className="text-[var(--status-warning-dark,#a16207)] font-medium">
                    {formatExpiry(alert.expiry_date)}
                  </span>
                ) : (
                  <span className={
                    alert.alert_type === 'out_of_stock'
                      ? 'text-[var(--status-error,#dc2626)] font-medium'
                      : 'text-[var(--status-warning-dark,#a16207)]'
                  }>
                    {alert.current_stock === 0
                      ? 'Sin stock'
                      : `${alert.current_stock} / ${alert.min_stock}`}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
