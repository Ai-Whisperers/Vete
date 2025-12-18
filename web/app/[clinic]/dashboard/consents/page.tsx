"use client";

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FileText, Search, Filter, Plus, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface ConsentDocument {
  id: string;
  status: string;
  signed_at: string;
  expires_at: string | null;
  pet: {
    id: string;
    name: string;
  };
  owner: {
    id: string;
    full_name: string;
  };
  template: {
    id: string;
    name: string;
    category: string;
  };
}

export default function ConsentsPage(): JSX.Element {
  const [consents, setConsents] = useState<ConsentDocument[]>([]);
  const [filteredConsents, setFilteredConsents] = useState<ConsentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchConsents();
  }, []);

  useEffect(() => {
    filterConsents();
  }, [consents, searchTerm, statusFilter, categoryFilter]);

  const fetchConsents = async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/');
        return;
      }

      const response = await fetch('/api/consents');
      if (!response.ok) {
        throw new Error('Error al cargar consentimientos');
      }

      const data = await response.json();
      setConsents(data);
    } catch (error) {
      console.error('Error fetching consents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterConsents = (): void => {
    let filtered = [...consents];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (consent) =>
          consent.pet.name.toLowerCase().includes(search) ||
          consent.owner.full_name.toLowerCase().includes(search) ||
          consent.template.name.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((consent) => consent.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((consent) => consent.template.category === categoryFilter);
    }

    setFilteredConsents(filtered);
  };

  const getStatusBadge = (status: string): JSX.Element => {
    const statusConfig: Record<string, { color: string; icon: JSX.Element; label: string }> = {
      active: {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Activo'
      },
      expired: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="w-4 h-4" />,
        label: 'Expirado'
      },
      revoked: {
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Revocado'
      }
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getCategoryBadge = (category: string): JSX.Element => {
    const categoryLabels: Record<string, string> = {
      surgery: 'Cirugía',
      anesthesia: 'Anestesia',
      euthanasia: 'Eutanasia',
      boarding: 'Hospedaje',
      treatment: 'Tratamiento',
      vaccination: 'Vacunación',
      diagnostic: 'Diagnóstico',
      other: 'Otro'
    };

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)]">
        {categoryLabels[category] || category}
      </span>
    );
  };

  const groupByStatus = (): Record<string, ConsentDocument[]> => {
    const grouped: Record<string, ConsentDocument[]> = {
      active: [],
      expired: [],
      revoked: []
    };

    filteredConsents.forEach((consent) => {
      if (grouped[consent.status]) {
        grouped[consent.status].push(consent);
      }
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
            <p className="mt-4 text-[var(--text-secondary)]">Cargando consentimientos...</p>
          </div>
        </div>
      </div>
    );
  }

  const groupedConsents = groupByStatus();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
              Gestión de Consentimientos
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Administra consentimientos informados de tus pacientes
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="./consents/templates"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-paper)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--primary)]/10 transition-colors border border-[var(--primary)]/20"
            >
              <FileText className="w-4 h-4" />
              Plantillas
            </Link>
            <button
              onClick={() => router.push('./consents/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Nuevo Consentimiento
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Buscar por mascota, dueño o plantilla..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)] appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="expired">Expirados</option>
              <option value="revoked">Revocados</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)] appearance-none"
            >
              <option value="all">Todas las categorías</option>
              <option value="surgery">Cirugía</option>
              <option value="anesthesia">Anestesia</option>
              <option value="euthanasia">Eutanasia</option>
              <option value="boarding">Hospedaje</option>
              <option value="treatment">Tratamiento</option>
              <option value="vaccination">Vacunación</option>
              <option value="diagnostic">Diagnóstico</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{groupedConsents.active.length}</p>
              <p className="text-sm text-[var(--text-secondary)]">Activos</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{groupedConsents.expired.length}</p>
              <p className="text-sm text-[var(--text-secondary)]">Expirados</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{groupedConsents.revoked.length}</p>
              <p className="text-sm text-[var(--text-secondary)]">Revocados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Consents List */}
      {filteredConsents.length === 0 ? (
        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'No se encontraron consentimientos con los filtros aplicados'
              : 'No hay consentimientos registrados'}
          </p>
        </div>
      ) : (
        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--primary)]/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Mascota / Dueño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Plantilla
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Fecha Firma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--primary)]/10">
                {filteredConsents.map((consent) => (
                  <tr key={consent.id} className="hover:bg-[var(--primary)]/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-[var(--text-primary)]">{consent.pet.name}</div>
                        <div className="text-sm text-[var(--text-secondary)]">{consent.owner.full_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[var(--text-primary)]">{consent.template.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCategoryBadge(consent.template.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-primary)]">
                        {new Date(consent.signed_at).toLocaleDateString('es-PY')}
                      </div>
                      {consent.expires_at && (
                        <div className="text-xs text-[var(--text-secondary)]">
                          Expira: {new Date(consent.expires_at).toLocaleDateString('es-PY')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(consent.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`./consents/${consent.id}`}
                        className="text-[var(--primary)] hover:underline"
                      >
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
