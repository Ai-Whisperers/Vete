"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  CreditCard,
  Receipt,
  Clock,
} from 'lucide-react';

interface RevenueData {
  today: number;
  week: number;
  month: number;
  todayChange?: number;
  weekChange?: number;
  monthChange?: number;
  pendingAmount?: number;
  pendingCount?: number;
  recentPayments?: Array<{
    id: string;
    amount: number;
    method: string;
    timestamp: string;
    clientName?: string;
  }>;
}

interface RevenueWidgetProps {
  clinic: string;
}

function formatCurrency(amount: number): string {
  return `Gs. ${amount.toLocaleString('es-PY')}`;
}

function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `Gs. ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `Gs. ${(amount / 1000).toFixed(0)}K`;
  }
  return `Gs. ${amount.toLocaleString()}`;
}

function TrendBadge({ change }: { change?: number }) {
  if (change === undefined) return null;

  const isPositive = change > 0;
  const isNeutral = change === 0;

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const colorClass = isNeutral
    ? 'text-gray-500 bg-gray-100'
    : isPositive
      ? 'text-emerald-600 bg-emerald-50'
      : 'text-red-600 bg-red-50';

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      <Icon className="w-3 h-3" />
      {Math.abs(change)}%
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto mb-2" />
            <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-1" />
            <div className="h-3 bg-gray-200 rounded w-10 mx-auto" />
          </div>
        ))}
      </div>
      <div className="h-20 bg-gray-100 rounded-xl" />
    </div>
  );
}

export function RevenueWidget({ clinic }: RevenueWidgetProps) {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch(`/api/dashboard/revenue?clinic=${clinic}`);
        if (res.ok) {
          const revenueData = await res.json();
          setData(revenueData);
        }
      } catch (error) {
        console.error('Error fetching revenue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRevenue, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clinic]);

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-sm overflow-hidden text-white">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">Ingresos</h3>
            <p className="text-xs text-white/70">Resumen financiero</p>
          </div>
        </div>
        <Link
          href={`/${clinic}/dashboard/billing`}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Ver detalles"
        >
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-5">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Revenue Grid */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-white/70 mb-1">Hoy</p>
                <p className="text-lg font-bold">{formatCompactCurrency(data?.today || 0)}</p>
                <TrendBadge change={data?.todayChange} />
              </div>
              <div className="text-center border-l border-r border-white/20">
                <p className="text-xs text-white/70 mb-1">Esta Semana</p>
                <p className="text-lg font-bold">{formatCompactCurrency(data?.week || 0)}</p>
                <TrendBadge change={data?.weekChange} />
              </div>
              <div className="text-center">
                <p className="text-xs text-white/70 mb-1">Este Mes</p>
                <p className="text-lg font-bold">{formatCompactCurrency(data?.month || 0)}</p>
                <TrendBadge change={data?.monthChange} />
              </div>
            </div>

            {/* Pending Amount */}
            {(data?.pendingAmount || 0) > 0 && (
              <Link
                href={`/${clinic}/dashboard/billing?status=pending`}
                className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors mb-4"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/70" />
                  <span className="text-sm">Pagos pendientes</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCompactCurrency(data?.pendingAmount || 0)}</p>
                  <p className="text-xs text-white/70">{data?.pendingCount || 0} facturas</p>
                </div>
              </Link>
            )}

            {/* Recent Payments */}
            {data?.recentPayments && data.recentPayments.length > 0 && (
              <div>
                <p className="text-xs text-white/70 mb-2 font-medium">Pagos recientes</p>
                <div className="space-y-2">
                  {data.recentPayments.slice(0, 3).map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/10 rounded">
                          <CreditCard className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{payment.clientName || 'Cliente'}</p>
                          <p className="text-xs text-white/60">{payment.method}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold">+{formatCompactCurrency(payment.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
