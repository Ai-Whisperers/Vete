"use client";

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Calendar } from 'lucide-react';
import { useAsyncData } from '@/hooks/use-async-data';
import { ErrorBoundary, LoadingSpinner } from '@/components/shared';

interface AppointmentData {
  period_start: string;
  total_appointments: number;
  completed: number;
  cancelled: number;
  no_shows: number;
  completion_rate: number;
}

interface AppointmentsChartProps {
  clinic: string;
}

export function AppointmentsChart({ clinic }: AppointmentsChartProps) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  const { data, isLoading, error, refetch } = useAsyncData<AppointmentData[]>(
    async () => {
      const res = await fetch(`/api/dashboard/appointments?clinic=${clinic}&period=${period}`);
      if (!res.ok) {
        throw new Error('Failed to fetch appointment data');
      }
      return res.json();
    },
    [clinic, period],
    {
      enabled: true,
      retryCount: 2
    }
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === 'day') {
      return date.toLocaleDateString('es-PY', { weekday: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('es-PY', { month: 'short', day: 'numeric' });
  };

  if (error) {
    return (
      <div className="bg-[var(--bg-paper)] rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-center h-64 text-[var(--text-secondary)]">
          <div className="text-center">
            <p>Error al cargar datos de citas</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-[var(--primary)] hover:underline"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartData = (data || []).map(d => ({
    ...d,
    date: formatDate(d.period_start)
  }));

  return (
    <ErrorBoundary>
      <div className="bg-[var(--bg-paper)] rounded-xl p-6 shadow-sm">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner text="Cargando datos..." />
          </div>
        )}

        {!isLoading && (
          <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--text-secondary)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">Citas</h3>
        </div>
        <div className="flex gap-1 bg-[var(--bg-subtle)] rounded-lg p-1">
          {(['day', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                period === p
                  ? 'bg-[var(--bg-paper)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {p === 'day' ? 'Día' : p === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
          </div>
        )}

        {(data || []).length === 0 ? (
        <div className="h-64 flex items-center justify-center text-[var(--text-secondary)]">
          No hay datos de citas para mostrar
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              formatter={(value?: number, name?: string) => {
                const labels: Record<string, string> = {
                  completed: 'Completadas',
                  cancelled: 'Canceladas',
                  no_shows: 'No asistieron'
                };
                return [value ?? 0, labels[name || ''] || name || ''];
              }}
            />
            <Legend
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  completed: 'Completadas',
                  cancelled: 'Canceladas',
                  no_shows: 'No asistieron'
                };
                return labels[value] || value;
              }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#10B981"
              fill="url(#colorCompleted)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="cancelled"
              stroke="#EF4444"
              fill="url(#colorCancelled)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="no_shows"
              stroke="#F59E0B"
              fill="transparent"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </ErrorBoundary>
  );
}
