"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import KennelGrid from '@/components/hospital/kennel-grid';
import { SlideOver } from '@/components/ui/slide-over';
import AdmissionForm from '@/components/hospital/admission-form';
import {
  Activity,
  BedDouble,
  Clock,
  Plus,
  AlertCircle,
  Users,
  Calendar,
} from 'lucide-react';

interface Hospitalization {
  id: string;
  hospitalization_number: string;
  hospitalization_type: string;
  acuity_level: string;
  admission_date: string;
  pet: {
    name: string;
    species: string;
  };
  kennel: {
    kennel_number: string;
    location: string;
  } | null;
}

interface Treatment {
  id: string;
  hospitalization_id: string;
  treatment_type: string;
  medication_name?: string;
  scheduled_time: string;
  status: string;
  hospitalization: {
    pet: {
      name: string;
    };
    kennel: {
      kennel_number: string;
    };
  };
}

interface Stats {
  total_active: number;
  by_acuity: {
    critical: number;
    urgent: number;
    routine: number;
  };
  available_kennels: number;
}

interface HospitalDashboardProps {
  clinic: string;
  initialHospitalizations: Hospitalization[];
  initialStats: Stats;
}

export function HospitalDashboard({
  clinic,
  initialHospitalizations,
  initialStats,
}: HospitalDashboardProps): React.ReactElement {
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>(initialHospitalizations);
  const [upcomingTreatments, setUpcomingTreatments] = useState<Treatment[]>([]);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchUpcomingTreatments();
  }, []);

  const fetchUpcomingTreatments = async (): Promise<void> => {
    const now = new Date();
    const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    const { data } = await supabase
      .from('hospitalization_treatments')
      .select(`
        *,
        hospitalization:hospitalizations!inner(
          pet:pets!inner(name, tenant_id),
          kennel:kennels(kennel_number)
        )
      `)
      .eq('status', 'scheduled')
      .gte('scheduled_time', now.toISOString())
      .lte('scheduled_time', fourHoursLater.toISOString())
      .eq('hospitalization.pet.tenant_id', clinic)
      .order('scheduled_time', { ascending: true });

    if (data) {
      setUpcomingTreatments(data as unknown as Treatment[]);
    }
  };

  const refreshData = async (): Promise<void> => {
    // Refresh hospitalizations
    const response = await fetch(`/api/hospitalizations?status=active`);
    if (response.ok) {
      const data = await response.json();
      setHospitalizations(data);

      // Recalculate stats
      const criticalCount = data.filter((h: Hospitalization) => h.acuity_level === 'critical').length;
      const urgentCount = data.filter((h: Hospitalization) => h.acuity_level === 'urgent').length;
      const routineCount = data.filter((h: Hospitalization) => h.acuity_level === 'routine').length;

      // Get available kennels
      const kennelsResponse = await fetch('/api/kennels?status=available');
      const kennels = kennelsResponse.ok ? await kennelsResponse.json() : [];

      setStats({
        total_active: data.length,
        by_acuity: { critical: criticalCount, urgent: urgentCount, routine: routineCount },
        available_kennels: kennels.length,
      });
    }

    fetchUpcomingTreatments();
  };

  const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString('es-PY', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAcuityColor = (level: string): string => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'urgent':
        return 'text-orange-600 bg-orange-100';
      case 'routine':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAcuityLabel = (level: string): string => {
    switch (level) {
      case 'critical':
        return 'Crítico';
      case 'urgent':
        return 'Urgente';
      case 'routine':
        return 'Rutina';
      default:
        return level;
    }
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      medical: 'Médica',
      surgical: 'Quirúrgica',
      icu: 'UCI',
      isolation: 'Aislamiento',
      boarding: 'Pensión',
      observation: 'Observación',
    };
    return labels[type] || type;
  };

  return (
    <>
      {/* Admission Form SlideOver */}
      <SlideOver
        isOpen={showAdmissionForm}
        onClose={() => setShowAdmissionForm(false)}
        title="Nueva Admisión"
        description="Registrar un nuevo paciente hospitalizado"
        size="lg"
      >
        <AdmissionForm
          onSuccess={() => {
            setShowAdmissionForm(false);
            refreshData();
          }}
          onCancel={() => setShowAdmissionForm(false)}
        />
      </SlideOver>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Hospitalización
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Gestión de pacientes hospitalizados
            </p>
          </div>
          <button
            onClick={() => setShowAdmissionForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 shadow-md"
          >
            <Plus className="h-5 w-5" />
            Nueva Admisión
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Hospitalizados</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {stats.total_active}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <BedDouble className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Jaulas Disponibles</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {stats.available_kennels}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Casos Críticos</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {stats.by_acuity.critical}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Tratamientos Próximos</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {upcomingTreatments.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Treatments */}
        {upcomingTreatments.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Tratamientos en las Próximas 4 Horas
              </h2>
            </div>
            <div className="space-y-2">
              {upcomingTreatments.map((treatment) => (
                <Link
                  key={treatment.id}
                  href={`/${clinic}/dashboard/hospital/${treatment.hospitalization_id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[var(--primary)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-[var(--primary)]">
                      {formatTime(treatment.scheduled_time)}
                    </div>
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">
                        {treatment.medication_name || treatment.treatment_type}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        {treatment.hospitalization?.pet?.name} - Jaula{' '}
                        {treatment.hospitalization?.kennel?.kennel_number}
                      </div>
                    </div>
                  </div>
                  <Activity className="h-4 w-4 text-[var(--text-secondary)]" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-white text-[var(--text-primary)] border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-white text-[var(--text-primary)] border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Mapa de Jaulas
          </button>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          <KennelGrid
            onKennelClick={(kennel) => {
              if (kennel.kennel_status === 'occupied' && kennel.current_occupant?.[0]) {
                router.push(`/${clinic}/dashboard/hospital/${kennel.current_occupant[0].id}`);
              }
            }}
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Pacientes Hospitalizados
              </h2>

              {hospitalizations.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-[var(--text-secondary)]">
                    No hay pacientes hospitalizados actualmente
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hospitalizations.map((hosp) => (
                    <Link
                      key={hosp.id}
                      href={`/${clinic}/dashboard/hospital/${hosp.id}`}
                      className="block p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-[var(--primary)] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-[var(--text-primary)]">
                              {hosp.pet.name}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${getAcuityColor(
                                hosp.acuity_level
                              )}`}
                            >
                              {getAcuityLabel(hosp.acuity_level)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-[var(--text-secondary)]">
                            <div>
                              <span className="font-medium">Nº:</span>{' '}
                              {hosp.hospitalization_number}
                            </div>
                            <div>
                              <span className="font-medium">Tipo:</span>{' '}
                              {getTypeLabel(hosp.hospitalization_type)}
                            </div>
                            <div>
                              <span className="font-medium">Jaula:</span>{' '}
                              {hosp.kennel ? `${hosp.kennel.kennel_number} (${hosp.kennel.location})` : 'Sin asignar'}
                            </div>
                            <div>
                              <span className="font-medium">Admisión:</span>{' '}
                              {new Date(hosp.admission_date).toLocaleDateString('es-PY')}
                            </div>
                          </div>
                        </div>
                        <Calendar className="h-5 w-5 text-[var(--text-secondary)]" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
