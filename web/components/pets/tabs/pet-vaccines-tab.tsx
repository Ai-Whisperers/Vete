'use client';

import Link from 'next/link';
import {
  Syringe,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { MissingVaccinesCard } from '../missing-vaccines-card';

interface Vaccine {
  id: string;
  name: string;
  vaccine_code?: string | null;
  administered_date?: string | null;
  next_due_date?: string | null;
  status: string;
  lot_number?: string | null;
  manufacturer?: string | null;
  notes?: string | null;
}

interface VaccineReaction {
  id: string;
  vaccine_id: string;
  reaction_type: string;
  severity: string;
  onset_hours?: number;
  notes?: string;
}

interface PetVaccinesTabProps {
  petId: string;
  petName: string;
  petSpecies: string;
  petBirthDate?: string | null;
  vaccines: Vaccine[];
  reactions?: VaccineReaction[];
  clinic: string;
  isStaff?: boolean;
}

export function PetVaccinesTab({
  petId,
  petName,
  petSpecies,
  petBirthDate,
  vaccines,
  reactions = [],
  clinic,
  isStaff = false,
}: PetVaccinesTabProps) {
  // Extract vaccine codes and names from existing vaccines for the recommendation API
  const existingVaccineCodes = vaccines
    .map(v => v.vaccine_code)
    .filter((code): code is string => !!code);

  const existingVaccineNames = vaccines
    .map(v => v.name)
    .filter((name): name is string => !!name);
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Categorize vaccines
  const overdueVaccines = vaccines.filter(
    v => v.next_due_date && new Date(v.next_due_date) < today
  );
  const upcomingVaccines = vaccines.filter(
    v => v.next_due_date && new Date(v.next_due_date) >= today && new Date(v.next_due_date) <= thirtyDaysFromNow
  );
  const upToDateVaccines = vaccines.filter(
    v => !v.next_due_date || new Date(v.next_due_date) > thirtyDaysFromNow
  );

  // Get reactions for a vaccine
  const getReactions = (vaccineId: string): VaccineReaction[] => {
    return reactions.filter(r => r.vaccine_id === vaccineId);
  };

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleDateString('es-PY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysUntil = (dateStr: string): number => {
    const date = new Date(dateStr);
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const VaccineCard = ({ vaccine, status }: { vaccine: Vaccine; status: 'overdue' | 'upcoming' | 'ok' }) => {
    const vaccineReactions = getReactions(vaccine.id);
    const hasReactions = vaccineReactions.length > 0;

    return (
      <div
        className={`p-4 rounded-xl border transition-all ${
          status === 'overdue'
            ? 'bg-red-50 border-red-200'
            : status === 'upcoming'
              ? 'bg-amber-50 border-amber-200'
              : 'bg-white border-gray-100'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-[var(--text-primary)]">{vaccine.name}</h4>
              {hasReactions && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Reacción
                </span>
              )}
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Aplicada: {formatDate(vaccine.administered_date)}
              </p>
              {vaccine.next_due_date && (
                <p className={`flex items-center gap-2 ${
                  status === 'overdue' ? 'text-red-600 font-medium' :
                  status === 'upcoming' ? 'text-amber-600 font-medium' : ''
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  {status === 'overdue' ? (
                    <>Vencida hace {Math.abs(getDaysUntil(vaccine.next_due_date))} días</>
                  ) : status === 'upcoming' ? (
                    <>Próxima en {getDaysUntil(vaccine.next_due_date)} días</>
                  ) : (
                    <>Próxima: {formatDate(vaccine.next_due_date)}</>
                  )}
                </p>
              )}
              {vaccine.manufacturer && (
                <p className="text-xs text-gray-400">
                  {vaccine.manufacturer} {vaccine.lot_number && `• Lote: ${vaccine.lot_number}`}
                </p>
              )}
            </div>

            {vaccine.notes && (
              <p className="mt-2 text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                {vaccine.notes}
              </p>
            )}

            {hasReactions && (
              <div className="mt-2 text-xs">
                {vaccineReactions.map(reaction => (
                  <div key={reaction.id} className="bg-orange-100/50 text-orange-800 p-2 rounded mt-1">
                    <span className="font-medium">{reaction.reaction_type}</span>
                    {reaction.severity && ` (${reaction.severity})`}
                    {reaction.onset_hours && ` - ${reaction.onset_hours}h después`}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            {status === 'overdue' ? (
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            ) : status === 'upcoming' ? (
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Vacunas de {petName}
          </h2>
          <p className="text-sm text-gray-500">
            {vaccines.length} vacuna{vaccines.length !== 1 ? 's' : ''} registrada{vaccines.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${clinic}/portal/pets/${petId}/vaccines/certificate`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Certificado
          </Link>
          {isStaff && (
            <Link
              href={`/${clinic}/portal/pets/${petId}/vaccines/new`}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Nueva Vacuna
            </Link>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`p-4 rounded-xl text-center ${overdueVaccines.length > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
          <div className={`text-2xl font-black ${overdueVaccines.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {overdueVaccines.length}
          </div>
          <div className="text-xs text-gray-500 font-medium">Vencidas</div>
        </div>
        <div className={`p-4 rounded-xl text-center ${upcomingVaccines.length > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
          <div className={`text-2xl font-black ${upcomingVaccines.length > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
            {upcomingVaccines.length}
          </div>
          <div className="text-xs text-gray-500 font-medium">Próximas</div>
        </div>
        <div className="p-4 rounded-xl text-center bg-green-50">
          <div className="text-2xl font-black text-green-600">{upToDateVaccines.length}</div>
          <div className="text-xs text-gray-500 font-medium">Al día</div>
        </div>
      </div>

      {/* Overdue Vaccines Alert */}
      {overdueVaccines.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-700 font-bold mb-3">
            <AlertCircle className="w-5 h-5" />
            Vacunas Vencidas - Requieren Atención
          </div>
          <div className="space-y-3">
            {overdueVaccines.map(vaccine => (
              <VaccineCard key={vaccine.id} vaccine={vaccine} status="overdue" />
            ))}
          </div>
          <Link
            href={`/${clinic}/book?pet=${petId}&service=vacunacion`}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Agendar Vacunación
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Upcoming Vaccines */}
      {upcomingVaccines.length > 0 && (
        <div>
          <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Próximas (30 días)
          </h3>
          <div className="space-y-3">
            {upcomingVaccines.map(vaccine => (
              <VaccineCard key={vaccine.id} vaccine={vaccine} status="upcoming" />
            ))}
          </div>
        </div>
      )}

      {/* Up to Date Vaccines */}
      {upToDateVaccines.length > 0 && (
        <div>
          <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Al Día
          </h3>
          <div className="space-y-3">
            {upToDateVaccines.map(vaccine => (
              <VaccineCard key={vaccine.id} vaccine={vaccine} status="ok" />
            ))}
          </div>
        </div>
      )}

      {/* Missing Vaccines Card - Shows when pet has no vaccines or is missing core vaccines */}
      {vaccines.length === 0 && (
        <div className="space-y-6">
          {/* Show missing vaccines recommendations */}
          <MissingVaccinesCard
            petId={petId}
            petName={petName}
            species={petSpecies}
            birthDate={petBirthDate}
            existingVaccineCodes={existingVaccineCodes}
            existingVaccineNames={existingVaccineNames}
            clinic={clinic}
          />

          {/* Empty state message */}
          <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Syringe className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Sin vacunas registradas</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              No hay registros de vacunación para {petName}
            </p>
          </div>
        </div>
      )}

      {/* Show missing vaccines card even when pet has some vaccines (to show missing core vaccines) */}
      {vaccines.length > 0 && (
        <MissingVaccinesCard
          petId={petId}
          petName={petName}
          species={petSpecies}
          birthDate={petBirthDate}
          existingVaccineCodes={existingVaccineCodes}
          existingVaccineNames={existingVaccineNames}
          clinic={clinic}
        />
      )}
    </div>
  );
}
