"use client";

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { DollarSign, TrendingUp } from 'lucide-react';

interface RevenueData {
  period_month: string;
  total_revenue: number;
  transaction_count: number;
  avg_transaction: number;
  by_payment_method?: Record<string, number>;
}

interface RevenueChartProps {
  clinic: string;
}

export function RevenueChart({ clinic }: RevenueChartProps) {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard/revenue?clinic=${clinic}&months=6`);
        if (res.ok) {
          const result = await res.json();
          setData(result.reverse()); // Oldest first for chart
        }
      } catch (e) {
        console.error('Error fetching revenue data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clinic]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-PY', { month: 'short' });
  };

  const chartData = data.map(d => ({
    ...d,
    month: formatMonth(d.period_month),
    revenue: d.total_revenue
  }));

  const totalRevenue = data.reduce((sum, d) => sum + d.total_revenue, 0);
  const avgMonthly = data.length > 0 ? totalRevenue / data.length : 0;

  // Calculate growth
  let growth = 0;
  if (data.length >= 2) {
    const current = data[data.length - 1]?.total_revenue || 0;
    const previous = data[data.length - 2]?.total_revenue || 1;
    growth = ((current - previous) / previous) * 100;
  }

  const colors = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#F5F3FF'];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Ingresos</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            Gs. {avgMonthly.toLocaleString('es-PY', { maximumFractionDigits: 0 })}
          </p>
          <div className={`flex items-center justify-end text-sm ${
            growth >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {growth.toFixed(1)}% vs mes anterior
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No hay datos de ingresos para mostrar
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              formatter={(value?: number) => [
                `Gs. ${(value ?? 0).toLocaleString('es-PY')}`,
                'Ingresos'
              ]}
              labelFormatter={(label) => `Mes: ${label}`}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
        <div className="text-center">
          <p className="text-sm text-gray-500">Total período</p>
          <p className="font-semibold text-gray-900">
            Gs. {totalRevenue.toLocaleString('es-PY', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Transacciones</p>
          <p className="font-semibold text-gray-900">
            {data.reduce((sum, d) => sum + d.transaction_count, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Ticket promedio</p>
          <p className="font-semibold text-gray-900">
            Gs. {(
              data.reduce((sum, d) => sum + parseFloat(String(d.avg_transaction)), 0) /
              (data.length || 1)
            ).toLocaleString('es-PY', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
}
