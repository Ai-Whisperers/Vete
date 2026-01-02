'use client';

import Link from 'next/link';
import {
  Info,
  Bone,
  Syringe,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Weight,
  Heart,
  Phone,
  User,
} from 'lucide-react';
import { GrowthChart } from '@/components/clinical/growth-chart';
import { LoyaltyCard } from '@/components/loyalty/loyalty-card';

interface Vaccine {
  id: string;
  name: string;
  administered_date?: string | null;
  next_due_date?: string | null;
  status: string;
}

interface WeightRecord {
  date: string;
  weight_kg: number;
  age_weeks?: number;
}

interface PetSummaryTabProps {
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    sex?: string | null;
    birth_date?: string | null;
    weight_kg?: number | null;
    temperament?: string | null;
    allergies?: string[] | string | null;
    chronic_conditions?: string[] | null;
    existing_conditions?: string | null;
    diet_category?: string | null;
    diet_notes?: string | null;
    vaccines?: Vaccine[];
    primary_vet_name?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
  };
  weightHistory: WeightRecord[];
  clinic: string;
  clinicName?: string;
}

export function PetSummaryTab({ pet, weightHistory, clinic, clinicName }: PetSummaryTabProps) {
  // Calculate age
  const calculateAge = (): string => {
    if (!pet.birth_date) return 'Edad desconocida';
    const birth = new Date(pet.birth_date);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years > 0) {
      return months > 0 ? `${years} años, ${months} meses` : `${years} años`;
    }
    return months > 0 ? `${months} meses` : 'Menos de 1 mes';
  };

  // Get allergies as array
  const getAllergies = (): string[] => {
    if (!pet.allergies) return [];
    if (Array.isArray(pet.allergies)) return pet.allergies;
    return [pet.allergies];
  };

  // Get conditions
  const getConditions = (): string[] => {
    if (pet.chronic_conditions && pet.chronic_conditions.length > 0) {
      return pet.chronic_conditions;
    }
    if (pet.existing_conditions) {
      return [pet.existing_conditions];
    }
    return [];
  };

  // Get upcoming vaccines
  const getUpcomingVaccines = (): Vaccine[] => {
    if (!pet.vaccines) return [];
    const today = new Date();
    return pet.vaccines
      .filter(v => v.next_due_date && new Date(v.next_due_date) >= today)
      .sort((a, b) => new Date(a.next_due_date!).getTime() - new Date(b.next_due_date!).getTime())
      .slice(0, 3);
  };

  // Get overdue vaccines
  const getOverdueVaccines = (): Vaccine[] => {
    if (!pet.vaccines) return [];
    const today = new Date();
    return pet.vaccines.filter(v => v.next_due_date && new Date(v.next_due_date) < today);
  };

  const allergies = getAllergies();
  const conditions = getConditions();
  const upcomingVaccines = getUpcomingVaccines();
  const overdueVaccines = getOverdueVaccines();

  const temperamentLabels: Record<string, string> = {
    friendly: 'Amigable',
    shy: 'Tímido',
    aggressive: 'Agresivo',
    calm: 'Tranquilo',
    unknown: 'Desconocido',
  };

  const dietLabels: Record<string, string> = {
    balanced: 'Balanceado Seco',
    wet: 'Alimento Húmedo',
    raw: 'Dieta BARF/Natural',
    mixed: 'Mixta',
    prescription: 'Prescripción Médica',
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Content - Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Edad</span>
            </div>
            <p className="font-bold text-[var(--text-primary)]">{calculateAge()}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Weight className="w-4 h-4" />
              <span className="text-xs font-medium">Peso</span>
            </div>
            <p className="font-bold text-[var(--text-primary)]">
              {pet.weight_kg ? `${pet.weight_kg} kg` : 'Sin registrar'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-medium">Temperamento</span>
            </div>
            <p className="font-bold text-[var(--text-primary)]">
              {pet.temperament ? temperamentLabels[pet.temperament] || pet.temperament : 'Sin definir'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Syringe className="w-4 h-4" />
              <span className="text-xs font-medium">Vacunas</span>
            </div>
            <p className={`font-bold ${overdueVaccines.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {overdueVaccines.length > 0
                ? `${overdueVaccines.length} vencida${overdueVaccines.length > 1 ? 's' : ''}`
                : 'Al día'}
            </p>
          </div>
        </div>

        {/* Health Alerts */}
        {(allergies.length > 0 || conditions.length > 0 || overdueVaccines.length > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold mb-3">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Salud
            </div>
            <div className="space-y-2">
              {allergies.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">Alergias</span>
                  <span className="text-sm text-amber-800">{allergies.join(', ')}</span>
                </div>
              )}
              {conditions.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">Condiciones</span>
                  <span className="text-sm text-amber-800">{conditions.join(', ')}</span>
                </div>
              )}
              {overdueVaccines.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">Vacunas Vencidas</span>
                  <span className="text-sm text-amber-800">{overdueVaccines.map(v => v.name).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Growth Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-[var(--text-primary)] mb-4">Curva de Crecimiento</h3>
          <GrowthChart
            breed={pet.breed || 'Mestizo'}
            gender={pet.sex as any}
            patientRecords={weightHistory}
          />
        </div>
      </div>

      {/* Sidebar - Right Column */}
      <div className="space-y-6">
        {/* Upcoming Vaccines */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Syringe className="w-4 h-4 text-purple-500" />
              Próximas Vacunas
            </h3>
            <Link
              href={`/${clinic}/portal/pets/${pet.id}?tab=vaccines`}
              className="text-xs text-[var(--primary)] font-medium hover:underline"
            >
              Ver todas
            </Link>
          </div>
          {upcomingVaccines.length > 0 ? (
            <div className="space-y-2">
              {upcomingVaccines.map(vaccine => (
                <div key={vaccine.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{vaccine.name}</span>
                  <span className="text-xs text-gray-500">
                    {vaccine.next_due_date && new Date(vaccine.next_due_date).toLocaleDateString('es-PY', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No hay vacunas programadas</p>
          )}
        </div>

        {/* Diet Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
            <Bone className="w-4 h-4 text-orange-500" />
            Alimentación
          </h3>
          {pet.diet_category ? (
            <div>
              <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase mb-2">
                {dietLabels[pet.diet_category] || pet.diet_category}
              </span>
              {pet.diet_notes && (
                <p className="text-sm text-gray-600">{pet.diet_notes}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No especificada</p>
          )}
        </div>

        {/* Emergency Contact */}
        {(pet.emergency_contact_name || pet.primary_vet_name) && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
              <Phone className="w-4 h-4 text-blue-500" />
              Contactos
            </h3>
            <div className="space-y-3">
              {pet.primary_vet_name && (
                <div>
                  <span className="text-xs text-gray-500">Veterinario de cabecera</span>
                  <p className="font-medium text-sm">{pet.primary_vet_name}</p>
                </div>
              )}
              {pet.emergency_contact_name && (
                <div>
                  <span className="text-xs text-gray-500">Contacto de emergencia</span>
                  <p className="font-medium text-sm">{pet.emergency_contact_name}</p>
                  {pet.emergency_contact_phone && (
                    <p className="text-sm text-gray-600">{pet.emergency_contact_phone}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loyalty Card */}
        {clinicName && (
          <LoyaltyCard
            petId={pet.id}
            petName={pet.name}
            clinicConfig={{ config: { name: clinicName } }}
          />
        )}
      </div>
    </div>
  );
}
