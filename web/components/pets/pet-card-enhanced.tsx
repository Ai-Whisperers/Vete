'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Dog,
  Cat,
  PawPrint,
  Calendar,
  Syringe,
  AlertTriangle,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface Vaccine {
  id: string;
  name: string;
  next_due_date?: string | null;
  status: string;
}

interface Appointment {
  id: string;
  start_time: string;
  status: string;
  services?: { name: string } | null;
}

interface PetCardProps {
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    birth_date?: string | null;
    photo_url?: string | null;
    weight_kg?: number | null;
    allergies?: string[] | null;
    chronic_conditions?: string[] | null;
    vaccines?: Vaccine[];
    last_visit_date?: string | null;
    next_appointment?: Appointment | null;
  };
  clinic: string;
}

export function PetCardEnhanced({ pet, clinic }: PetCardProps) {
  // Calculate age
  const calculateAge = (birthDate: string | null | undefined): string => {
    if (!birthDate) return 'Edad desconocida';

    const birth = new Date(birthDate);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years > 0) {
      if (months > 0) {
        return `${years} ${years === 1 ? 'año' : 'años'}, ${months} ${months === 1 ? 'mes' : 'meses'}`;
      }
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    } else if (months > 0) {
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
    return 'Cachorro/Gatito';
  };

  // Get vaccine status
  const getVaccineStatus = (): { status: 'ok' | 'warning' | 'danger'; count: number; message: string } => {
    if (!pet.vaccines || pet.vaccines.length === 0) {
      return { status: 'warning', count: 0, message: 'Sin vacunas registradas' };
    }

    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    let overdueCount = 0;
    let upcomingCount = 0;

    pet.vaccines.forEach(vaccine => {
      if (vaccine.next_due_date) {
        const dueDate = new Date(vaccine.next_due_date);
        if (dueDate < today) {
          overdueCount++;
        } else if (dueDate <= thirtyDaysFromNow) {
          upcomingCount++;
        }
      }
    });

    if (overdueCount > 0) {
      return {
        status: 'danger',
        count: overdueCount,
        message: `${overdueCount} vacuna${overdueCount > 1 ? 's' : ''} vencida${overdueCount > 1 ? 's' : ''}`
      };
    }
    if (upcomingCount > 0) {
      return {
        status: 'warning',
        count: upcomingCount,
        message: `${upcomingCount} vacuna${upcomingCount > 1 ? 's' : ''} próxima${upcomingCount > 1 ? 's' : ''}`
      };
    }
    return { status: 'ok', count: 0, message: 'Vacunas al día' };
  };

  // Format date
  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PY', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Check for health alerts
  const hasHealthAlerts = (): boolean => {
    return !!(pet.allergies && pet.allergies.length > 0) ||
           !!(pet.chronic_conditions && pet.chronic_conditions.length > 0);
  };

  const vaccineStatus = getVaccineStatus();

  return (
    <Link
      href={`/${clinic}/portal/pets/${pet.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[var(--primary)]/20 transition-all duration-300"
    >
      <div className="p-5">
        <div className="flex gap-4">
          {/* Photo */}
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
            {pet.photo_url ? (
              <Image
                src={pet.photo_url}
                alt={pet.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <PawPrint className="w-10 h-10" />
              </div>
            )}
            {/* Species badge */}
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-white/90 shadow flex items-center justify-center">
              {pet.species === 'dog' ? (
                <Dog className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Cat className="w-3.5 h-3.5 text-purple-600" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-lg font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
                {pet.name}
              </h3>
              {/* Vaccine status badge */}
              <div className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                vaccineStatus.status === 'danger'
                  ? 'bg-red-100 text-red-700'
                  : vaccineStatus.status === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-green-100 text-green-700'
              }`}>
                {vaccineStatus.status === 'danger' ? (
                  <AlertCircle className="w-3 h-3" />
                ) : vaccineStatus.status === 'warning' ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">{vaccineStatus.message}</span>
                {vaccineStatus.status !== 'ok' && (
                  <span className="sm:hidden">{vaccineStatus.count}</span>
                )}
              </div>
            </div>

            {/* Breed and age */}
            <p className="text-sm text-gray-500 mb-3">
              <span className="font-medium">{pet.breed || 'Mestizo'}</span>
              <span className="mx-1.5">•</span>
              <span>{calculateAge(pet.birth_date)}</span>
              {pet.weight_kg && (
                <>
                  <span className="mx-1.5">•</span>
                  <span>{pet.weight_kg} kg</span>
                </>
              )}
            </p>

            {/* Info rows */}
            <div className="space-y-1.5 text-xs">
              {/* Last visit */}
              {pet.last_visit_date && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Última visita: {formatDate(pet.last_visit_date)}</span>
                </div>
              )}

              {/* Next appointment */}
              {pet.next_appointment && (
                <div className="flex items-center gap-2 text-[var(--primary)]">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium">
                    Próxima cita: {formatDate(pet.next_appointment.start_time)}
                    {pet.next_appointment.services?.name && (
                      <span className="text-gray-400 font-normal"> - {pet.next_appointment.services.name}</span>
                    )}
                  </span>
                </div>
              )}

              {/* Health alerts */}
              {hasHealthAlerts() && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>
                    {pet.allergies && pet.allergies.length > 0 && `Alergias: ${pet.allergies.slice(0, 2).join(', ')}`}
                    {pet.allergies && pet.allergies.length > 0 && pet.chronic_conditions && pet.chronic_conditions.length > 0 && ' • '}
                    {pet.chronic_conditions && pet.chronic_conditions.length > 0 && 'Condiciones crónicas'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 self-center">
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}
