"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Plus, Shield, CheckCircle2, XCircle, Calendar, DollarSign } from 'lucide-react';

interface Policy {
  id: string;
  policy_number: string;
  plan_name: string;
  plan_type: string;
  status: string;
  effective_date: string;
  expiration_date: string | null;
  annual_limit: number | null;
  deductible_amount: number | null;
  coinsurance_percentage: number | null;
  policyholder_name: string;
  pets: {
    id: string;
    name: string;
    species: string;
  };
  insurance_providers: {
    id: string;
    name: string;
    logo_url: string | null;
  };
}

export default function InsurancePoliciesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  useEffect(() => {
    checkAuth();
    loadPolicies();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/');
    }
  };

  const loadPolicies = async () => {
    setLoading(true);
    const response = await fetch('/api/insurance/policies');
    if (response.ok) {
      const result = await response.json();
      setPolicies(result.data || []);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const configs: { [key: string]: { label: string; color: string; icon: any } } = {
      active: { label: 'Activa', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
      expired: { label: 'Expirada', color: 'bg-gray-100 text-gray-700', icon: XCircle },
      cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: XCircle },
      suspended: { label: 'Suspendida', color: 'bg-yellow-100 text-yellow-700', icon: XCircle },
      pending: { label: 'Pendiente', color: 'bg-blue-100 text-blue-700', icon: Calendar }
    };

    const config = configs[status] || configs.active;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getPlanTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      accident_only: 'Solo Accidentes',
      accident_illness: 'Accidente y Enfermedad',
      comprehensive: 'Completo',
      wellness: 'Bienestar',
      custom: 'Personalizado'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[var(--text-secondary)]">Cargando pólizas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Pólizas de Seguro</h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Gestión de pólizas de seguros de mascotas
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:opacity-90"
          >
            <Plus className="w-5 h-5" />
            Nueva Póliza
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Pólizas</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {policies.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Activas</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {policies.filter(p => p.status === 'active').length}
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
                <p className="text-sm text-[var(--text-secondary)]">Expiradas</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {policies.filter(p => p.status === 'expired').length}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-full">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Aseguradoras</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {new Set(policies.map(p => p.insurance_providers.id)).size}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Policies Grid */}
        {policies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[var(--text-secondary)] mb-4">No hay pólizas registradas</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:opacity-90"
            >
              <Plus className="w-5 h-5" />
              Agregar Primera Póliza
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPolicy(policy)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {policy.insurance_providers.logo_url ? (
                      <img
                        src={policy.insurance_providers.logo_url}
                        alt={policy.insurance_providers.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {policy.insurance_providers.name}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {policy.policy_number}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(policy.status)}
                </div>

                {/* Pet Info */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-[var(--text-secondary)]">Mascota</p>
                  <p className="font-medium text-[var(--text-primary)]">
                    {policy.pets.name}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">{policy.pets.species}</p>
                </div>

                {/* Plan Details */}
                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Plan</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {policy.plan_name || getPlanTypeLabel(policy.plan_type)}
                    </p>
                  </div>

                  {policy.annual_limit && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Límite Anual</span>
                      <span className="font-medium text-[var(--text-primary)]">
                        Gs. {policy.annual_limit.toLocaleString('es-PY')}
                      </span>
                    </div>
                  )}

                  {policy.deductible_amount !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Deducible</span>
                      <span className="font-medium text-[var(--text-primary)]">
                        Gs. {policy.deductible_amount.toLocaleString('es-PY')}
                      </span>
                    </div>
                  )}

                  {policy.coinsurance_percentage !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Cobertura</span>
                      <span className="font-medium text-[var(--text-primary)]">
                        {policy.coinsurance_percentage}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <div>
                    <p>Vigencia desde</p>
                    <p className="font-medium text-[var(--text-primary)]">
                      {new Date(policy.effective_date).toLocaleDateString('es-PY')}
                    </p>
                  </div>
                  {policy.expiration_date && (
                    <div className="text-right">
                      <p>Vence</p>
                      <p className="font-medium text-[var(--text-primary)]">
                        {new Date(policy.expiration_date).toLocaleDateString('es-PY')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Policy Detail Modal (Placeholder) */}
        {selectedPolicy && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPolicy(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                Detalles de Póliza
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Aseguradora</p>
                    <p className="font-medium text-[var(--text-primary)]">
                      {selectedPolicy.insurance_providers.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Número de Póliza</p>
                    <p className="font-medium text-[var(--text-primary)]">
                      {selectedPolicy.policy_number}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Titular de la Póliza</p>
                  <p className="font-medium text-[var(--text-primary)]">
                    {selectedPolicy.policyholder_name}
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setSelectedPolicy(null)}
                    className="w-full px-4 py-2 bg-gray-200 text-[var(--text-primary)] rounded-md hover:bg-gray-300"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Policy Modal (Placeholder) */}
        {showAddModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                Nueva Póliza de Seguro
              </h2>
              <p className="text-[var(--text-secondary)] mb-4">
                Formulario de creación de póliza (implementar componente separado)
              </p>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-[var(--text-primary)] rounded-md hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
