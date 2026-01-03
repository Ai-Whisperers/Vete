"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DASHBOARD_ICONS } from '@/lib/icons';

interface DashboardStats {
  total_pets: number;
  appointments_today: number;
  pending_vaccines: number;
  pending_invoices: number;
  pending_amount: number;
  pets_change?: number;
  appointments_change?: number;
  completed_today?: number;
}

interface StatsCardsProps {
  clinic: string;
}

interface StatCardConfig {
  title: string;
  value: number;
  icon: typeof DASHBOARD_ICONS.users;
  href: string;
  gradient: string;
  iconBg: string;
  change?: number;
  changeLabel?: string;
  subvalue?: string;
  alert?: boolean;
  alertMessage?: string;
  progress?: number;
}

function TrendIndicator({ change, label }: { change?: number; label?: string }) {
  if (change === undefined) return null;

  const isPositive = change > 0;
  const isNeutral = change === 0;

  const Icon = isNeutral
    ? DASHBOARD_ICONS.minus
    : isPositive
      ? DASHBOARD_ICONS.trendingUp
      : DASHBOARD_ICONS.trendingDown;

  const colorClass = isNeutral
    ? 'text-gray-500 bg-gray-100'
    : isPositive
      ? 'text-emerald-600 bg-emerald-50'
      : 'text-red-600 bg-red-50';

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      <Icon className="w-3 h-3" />
      <span>{isNeutral ? '0%' : `${isPositive ? '+' : ''}${change}%`}</span>
      {label && <span className="text-gray-500 ml-1">{label}</span>}
    </div>
  );
}

function ProgressBar({ value, max = 100, colorClass }: { value: number; max?: number; colorClass: string }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function StatCard({ card, clinic }: { card: StatCardConfig; clinic: string }) {
  const Icon = card.icon;

  return (
    <Link
      href={card.href}
      className={`group relative overflow-hidden rounded-2xl p-5 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${card.gradient}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <Icon className="w-full h-full" />
      </div>

      {/* Alert badge */}
      {card.alert && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          <DASHBOARD_ICONS.alertTriangle className="w-3 h-3" />
          <span>{card.alertMessage || 'Atenci\u00f3n'}</span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${card.iconBg} shadow-sm`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <DASHBOARD_ICONS.arrowUpRight className="w-5 h-5 text-white/70" />
          </div>
        </div>

        {/* Value */}
        <div className="mb-1">
          <p className="text-3xl font-bold text-white tracking-tight">
            {card.value.toLocaleString()}
          </p>
          {card.subvalue && (
            <p className="text-sm text-white/80 font-medium mt-0.5">{card.subvalue}</p>
          )}
        </div>

        {/* Title & Trend */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-white/90">{card.title}</h3>
          {card.change !== undefined && (
            <TrendIndicator change={card.change} label={card.changeLabel} />
          )}
        </div>

        {/* Progress bar for certain cards */}
        {card.progress !== undefined && (
          <div className="mt-3">
            <ProgressBar value={card.progress} colorClass="bg-white/80" />
          </div>
        )}
      </div>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl p-5 bg-gradient-to-br from-gray-100 to-gray-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-gray-300 rounded-xl" />
          </div>
          <div className="h-9 bg-gray-300 rounded w-20 mb-2" />
          <div className="h-4 bg-gray-300 rounded w-28" />
        </div>
      ))}
    </div>
  );
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
      } catch {
        // Error fetching stats - silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 2 minutes for more real-time feel
    const interval = setInterval(fetchStats, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clinic]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  const cards: StatCardConfig[] = [
    {
      title: 'Mascotas Registradas',
      value: stats?.total_pets || 0,
      icon: DASHBOARD_ICONS.pawPrint,
      href: `/${clinic}/dashboard/patients`,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-blue-600/50',
      change: stats?.pets_change,
      changeLabel: 'vs mes ant.',
    },
    {
      title: 'Citas Hoy',
      value: stats?.appointments_today || 0,
      icon: DASHBOARD_ICONS.calendarCheck,
      href: `/${clinic}/dashboard/calendar`,
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-600/50',
      change: stats?.appointments_change,
      changeLabel: 'vs ayer',
      progress: stats?.completed_today !== undefined
        ? (stats.completed_today / Math.max(stats.appointments_today, 1)) * 100
        : undefined,
    },
    {
      title: 'Vacunas Pendientes',
      value: stats?.pending_vaccines || 0,
      icon: DASHBOARD_ICONS.syringe,
      href: `/${clinic}/dashboard/vaccines`,
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
      iconBg: 'bg-amber-600/50',
      alert: (stats?.pending_vaccines || 0) > 10,
      alertMessage: 'Revisar',
    },
    {
      title: 'Facturas Pendientes',
      value: stats?.pending_invoices || 0,
      icon: DASHBOARD_ICONS.receipt,
      href: `/${clinic}/dashboard/billing`,
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
      iconBg: 'bg-violet-600/50',
      subvalue: stats?.pending_amount
        ? `Gs. ${stats.pending_amount.toLocaleString()}`
        : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <StatCard key={i} card={card} clinic={clinic} />
      ))}
    </div>
  );
}
