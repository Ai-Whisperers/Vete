"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as Icons from 'lucide-react';

interface LabOrder {
  id: string;
  order_number: string;
  ordered_at: string;
  status: string;
  priority: string;
  has_critical_values: boolean;
  pets: {
    id: string;
    name: string;
    species: string;
  };
}

interface LabOrdersListProps {
  orders: LabOrder[];
  clinic: string;
  currentStatus: string;
  currentSearch: string;
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  ordered: {
    label: 'Ordenado',
    className: 'bg-blue-100 text-blue-800',
    icon: Icons.FileText
  },
  specimen_collected: {
    label: 'Muestra Recolectada',
    className: 'bg-purple-100 text-purple-800',
    icon: Icons.Droplet
  },
  in_progress: {
    label: 'En Proceso',
    className: 'bg-yellow-100 text-yellow-800',
    icon: Icons.Clock
  },
  completed: {
    label: 'Completado',
    className: 'bg-green-100 text-green-800',
    icon: Icons.CheckCircle
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-800',
    icon: Icons.XCircle
  }
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  stat: {
    label: 'STAT',
    className: 'bg-red-500 text-white'
  },
  urgent: {
    label: 'Urgente',
    className: 'bg-orange-500 text-white'
  },
  routine: {
    label: 'Rutina',
    className: 'bg-gray-500 text-white'
  }
};

export function LabOrdersList({
  orders,
  clinic,
  currentStatus,
  currentSearch,
}: LabOrdersListProps): React.ReactElement {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (currentStatus !== 'all') params.set('status', currentStatus);
    const queryString = params.toString();
    router.push(`/${clinic}/dashboard/lab${queryString ? `?${queryString}` : ''}`);
  };

  const clearFilters = (): void => {
    setSearchTerm('');
    router.push(`/${clinic}/dashboard/lab`);
  };

  return (
    <div>
      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar por mascota o número de orden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Buscar
        </button>
        {(currentSearch || currentStatus !== 'all') && (
          <button
            type="button"
            onClick={clearFilters}
            className="px-6 py-3 bg-gray-100 text-[var(--text-primary)] rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Limpiar
          </button>
        )}
      </form>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Icons.FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-[var(--text-secondary)] text-lg">
            {currentSearch || currentStatus !== 'all'
              ? 'No se encontraron órdenes con los filtros aplicados'
              : 'No hay órdenes de laboratorio'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.ordered;
            const priority = priorityConfig[order.priority] || priorityConfig.routine;
            const StatusIcon = status.icon;

            return (
              <Link
                key={order.id}
                href={`/${clinic}/dashboard/lab/${order.id}`}
                className="block bg-white rounded-xl border-2 border-gray-100 hover:border-[var(--primary)] transition-all p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${status.className}`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">
                          {order.pets?.name || 'Sin mascota'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${priority.className}`}>
                          {priority.label}
                        </span>
                        {order.has_critical_values && (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            <Icons.AlertTriangle className="w-3 h-3" />
                            Crítico
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <Icons.Hash className="w-4 h-4" />
                          {order.order_number}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Calendar className="w-4 h-4" />
                          {new Date(order.ordered_at).toLocaleDateString('es-PY')}
                        </span>
                        <span className="flex items-center gap-1">
                          {order.pets?.species === 'dog' ? (
                            <Icons.Dog className="w-4 h-4" />
                          ) : order.pets?.species === 'cat' ? (
                            <Icons.Cat className="w-4 h-4" />
                          ) : (
                            <Icons.PawPrint className="w-4 h-4" />
                          )}
                          {order.pets?.species || 'Mascota'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${status.className}`}>
                      {status.label}
                    </span>
                    <Icons.ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
