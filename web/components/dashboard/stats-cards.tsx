"use client";

import { useEffect, useState } from 'react';
import { Users, Calendar, Syringe, Receipt, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardStats {
  total_pets: number;
  appointments_today: number;
  pending_vaccines: number;
  pending_invoices: number;
  pending_amount: number;
  pets_change?: number;
  appointments_change?: number;
}

interface StatsCardsProps {
  clinic: string;
}

export function StatsCards({ clinic }: StatsCardsProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/dashboard/stats?clinic=${clinic}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error('Error fetching stats:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clinic]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-[var(--bg-paper)] rounded-xl p-6 shadow-sm">
            <div className="h-4 bg-[var(--bg-subtle)] rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-[var(--bg-subtle)] rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Mascotas Registradas',
      value: stats?.total_pets || 0,
      icon: Users,
      color: 'bg-[var(--status-info,#3b82f6)]',
      change: stats?.pets_change
    },
    {
      title: 'Citas Hoy',
      value: stats?.appointments_today || 0,
      icon: Calendar,
      color: 'bg-[var(--status-success,#22c55e)]',
      change: stats?.appointments_change
    },
    {
      title: 'Vacunas Pendientes',
      value: stats?.pending_vaccines || 0,
      icon: Syringe,
      color: 'bg-[var(--status-warning,#eab308)]',
      alert: (stats?.pending_vaccines || 0) > 10
    },
    {
      title: 'Facturas Pendientes',
      value: stats?.pending_invoices || 0,
      subvalue: stats?.pending_amount
        ? `Gs. ${stats.pending_amount.toLocaleString()}`
        : undefined,
      icon: Receipt,
      color: 'bg-[var(--primary)]'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`bg-[var(--bg-paper)] rounded-xl p-6 shadow-sm border-l-4 ${
              card.alert ? 'border-[var(--status-error,#ef4444)]' : 'border-transparent'
            } hover:shadow-md transition-shadow`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[var(--text-muted)] text-sm font-medium">{card.title}</span>
              <div className={`${card.color} p-2 rounded-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-[var(--text-primary)]">{card.value}</p>
                {card.subvalue && (
                  <p className="text-sm text-[var(--text-muted)] mt-1">{card.subvalue}</p>
                )}
              </div>
              {card.change !== undefined && (
                <div
                  className={`flex items-center text-sm ${
                    card.change >= 0 ? 'text-[var(--status-success,#16a34a)]' : 'text-[var(--status-error,#dc2626)]'
                  }`}
                >
                  {card.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(card.change)}%
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
