"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import ClaimStatusBadge from '@/components/insurance/claim-status-badge';

interface Claim {
  id: string;
  claim_number: string;
  status: string;
  date_of_service: string;
  diagnosis: string;
  claimed_amount: number;
  approved_amount: number | null;
  paid_amount: number | null;
  created_at: string;
  pets: {
    name: string;
    species: string;
  };
  pet_insurance_policies: {
    policy_number: string;
    insurance_providers: {
      name: string;
      logo_url: string | null;
    };
  };
}

interface DashboardStats {
  pending_count: number;
  pending_value: number;
  awaiting_docs_count: number;
  recently_paid_count: number;
  recently_paid_value: number;
}

export default function InsuranceDashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pending_count: 0,
    pending_value: 0,
    awaiting_docs_count: 0,
    recently_paid_count: 0,
    recently_paid_value: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    checkAuth();
    loadData();
  }, [statusFilter]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/');
    }
  };

  const loadData = async () => {
    setLoading(true);

    // Load claims
    const url = new URL('/api/insurance/claims', window.location.origin);
    if (statusFilter) {
      url.searchParams.set('status', statusFilter);
    }
    if (searchQuery) {
      url.searchParams.set('search', searchQuery);
    }

    const response = await fetch(url.toString());
    if (response.ok) {
      const result = await response.json();
      setClaims(result.data || []);
    }

    // Calculate stats from claims
    const allClaimsResponse = await fetch('/api/insurance/claims?limit=1000');
    if (allClaimsResponse.ok) {
      const allClaimsResult = await allClaimsResponse.json();
      const allClaims = allClaimsResult.data || [];

      const pendingClaims = allClaims.filter((c: Claim) =>
        ['submitted', 'under_review'].includes(c.status)
      );
      const awaitingDocsClaims = allClaims.filter((c: Claim) => c.status === 'pending_documents');
      const recentlyPaidClaims = allClaims.filter((c: Claim) => {
        if (c.status !== 'paid') return false;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(c.created_at) >= thirtyDaysAgo;
      });

      setStats({
        pending_count: pendingClaims.length,
        pending_value: pendingClaims.reduce((sum: number, c: Claim) => sum + (c.claimed_amount || 0), 0),
        awaiting_docs_count: awaitingDocsClaims.length,
        recently_paid_count: recentlyPaidClaims.length,
        recently_paid_value: recentlyPaidClaims.reduce((sum: number, c: Claim) => sum + (c.paid_amount || 0), 0)
      });
    }

    setLoading(false);
  };

  const handleSearch = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[var(--text-secondary)]">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Seguros</h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Gestión de reclamos y pólizas de seguro
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="./insurance/policies"
              className="px-4 py-2 border border-[var(--primary)] text-[var(--primary)] rounded-md hover:bg-[var(--primary)] hover:text-white transition-colors"
            >
              Ver Pólizas
            </Link>
            <Link
              href="./insurance/claims/new"
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:opacity-90"
            >
              <Plus className="w-5 h-5" />
              Nuevo Reclamo
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Pendientes</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {stats.pending_count}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Gs. {stats.pending_value.toLocaleString('es-PY')}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Docs. Pendientes</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {stats.awaiting_docs_count}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Pagados (30d)</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {stats.recently_paid_count}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Gs. {stats.recently_paid_value.toLocaleString('es-PY')}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Reclamos</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {claims.length}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar por número de reclamo, diagnóstico..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="pending_documents">Docs. Pendientes</option>
                <option value="submitted">Enviado</option>
                <option value="under_review">En Revisión</option>
                <option value="approved">Aprobado</option>
                <option value="denied">Denegado</option>
                <option value="paid">Pagado</option>
              </select>

              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:opacity-90"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Claims List */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Reclamos</h2>
          </div>

          {claims.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-[var(--text-secondary)]">No se encontraron reclamos</p>
              <Link
                href="./insurance/claims/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:opacity-90"
              >
                <Plus className="w-5 h-5" />
                Crear Primer Reclamo
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {claims.map((claim) => (
                  <Link
                    key={claim.id}
                    href={`./insurance/claims/${claim.id}`}
                    className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-[var(--primary)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-medium text-[var(--primary)]">{claim.claim_number}</p>
                        <p className="text-sm text-[var(--text-primary)]">{claim.pets.name}</p>
                      </div>
                      <ClaimStatusBadge status={claim.status} />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Aseguradora</span>
                        <span className="text-[var(--text-primary)]">
                          {claim.pet_insurance_policies.insurance_providers.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Fecha</span>
                        <span className="text-[var(--text-primary)]">
                          {new Date(claim.date_of_service).toLocaleDateString('es-PY')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Reclamado</span>
                        <span className="font-medium text-[var(--text-primary)]">
                          Gs. {claim.claimed_amount.toLocaleString('es-PY')}
                        </span>
                      </div>
                      {claim.approved_amount && (
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Aprobado</span>
                          <span className="font-medium text-green-600">
                            Gs. {claim.approved_amount.toLocaleString('es-PY')}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-3 truncate">
                      {claim.diagnosis}
                    </p>
                  </Link>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                          Numero
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                          Mascota
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                          Aseguradora
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                          Diagnostico
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                          Fecha Servicio
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase">
                          Reclamado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {claims.map((claim) => (
                        <tr key={claim.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link
                              href={`./insurance/claims/${claim.id}`}
                              className="font-medium text-[var(--primary)] hover:underline"
                            >
                              {claim.claim_number}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-[var(--text-primary)]">{claim.pets.name}</p>
                              <p className="text-xs text-[var(--text-secondary)]">{claim.pets.species}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-[var(--text-primary)]">
                              {claim.pet_insurance_policies.insurance_providers.name}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {claim.pet_insurance_policies.policy_number}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-[var(--text-primary)] max-w-xs truncate">
                              {claim.diagnosis}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-[var(--text-primary)]">
                              {new Date(claim.date_of_service).toLocaleDateString('es-PY')}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                              Gs. {claim.claimed_amount.toLocaleString('es-PY')}
                            </p>
                            {claim.approved_amount && (
                              <p className="text-xs text-green-600">
                                Aprobado: Gs. {claim.approved_amount.toLocaleString('es-PY')}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <ClaimStatusBadge status={claim.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`./insurance/claims/${claim.id}`}
                              className="text-sm text-[var(--primary)] hover:underline"
                            >
                              Ver Detalles
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
