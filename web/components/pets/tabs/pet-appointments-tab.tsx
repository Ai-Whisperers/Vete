'use client';

import Link from 'next/link';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  User,
  Plus,
  ChevronRight,
  CalendarDays,
  RefreshCw,
} from 'lucide-react';

interface Appointment {
  id: string;
  start_time: string;
  end_time?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  service?: {
    id: string;
    name: string;
    category?: string;
  } | null;
  vet?: {
    id: string;
    full_name: string;
  } | null;
  notes?: string | null;
  cancellation_reason?: string | null;
}

interface PetAppointmentsTabProps {
  petId: string;
  petName: string;
  appointments: Appointment[];
  clinic: string;
}

export function PetAppointmentsTab({
  petId,
  petName,
  appointments,
  clinic,
}: PetAppointmentsTabProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Separate appointments
  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.start_time) >= today && !['cancelled', 'no_show', 'completed'].includes(apt.status))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const pastAppointments = appointments
    .filter(apt => new Date(apt.start_time) < today || ['completed', 'cancelled', 'no_show'].includes(apt.status))
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleTimeString('es-PY', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return { label: 'Agendada', color: 'bg-blue-100 text-blue-700', icon: Clock };
      case 'confirmed':
        return { label: 'Confirmada', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
      case 'in_progress':
        return { label: 'En curso', color: 'bg-amber-100 text-amber-700', icon: RefreshCw };
      case 'completed':
        return { label: 'Completada', color: 'bg-gray-100 text-gray-700', icon: CheckCircle2 };
      case 'cancelled':
        return { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: XCircle };
      case 'no_show':
        return { label: 'No asistió', color: 'bg-orange-100 text-orange-700', icon: AlertCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
    }
  };

  const getDaysUntil = (dateStr: string): string => {
    const aptDate = new Date(dateStr);
    aptDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((aptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays < 7) return `En ${diffDays} días`;
    if (diffDays < 30) return `En ${Math.floor(diffDays / 7)} semana${diffDays >= 14 ? 's' : ''}`;
    return `En ${Math.floor(diffDays / 30)} mes${diffDays >= 60 ? 'es' : ''}`;
  };

  const AppointmentCard = ({ appointment, isPast = false }: { appointment: Appointment; isPast?: boolean }) => {
    const statusConfig = getStatusConfig(appointment.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className={`p-4 rounded-xl border transition-all ${isPast ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 hover:shadow-md'}`}>
        <div className="flex items-start gap-4">
          {/* Date block */}
          <div className={`flex-shrink-0 w-16 text-center p-2 rounded-xl ${isPast ? 'bg-gray-100' : 'bg-[var(--primary)]/10'}`}>
            <div className={`text-2xl font-black ${isPast ? 'text-gray-500' : 'text-[var(--primary)]'}`}>
              {new Date(appointment.start_time).getDate()}
            </div>
            <div className={`text-xs font-medium uppercase ${isPast ? 'text-gray-400' : 'text-[var(--primary)]'}`}>
              {new Date(appointment.start_time).toLocaleDateString('es-PY', { month: 'short' })}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              {!isPast && (
                <span className="text-xs text-[var(--primary)] font-medium">
                  {getDaysUntil(appointment.start_time)}
                </span>
              )}
            </div>

            <h4 className="font-bold text-[var(--text-primary)] mb-1">
              {appointment.service?.name || 'Consulta General'}
            </h4>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(appointment.start_time)}
              </span>
              {appointment.vet && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Dr. {appointment.vet.full_name}
                </span>
              )}
            </div>

            {appointment.notes && (
              <p className="mt-2 text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                {appointment.notes}
              </p>
            )}

            {appointment.cancellation_reason && (
              <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                Motivo: {appointment.cancellation_reason}
              </p>
            )}
          </div>

          {/* Actions */}
          {!isPast && appointment.status !== 'cancelled' && (
            <div className="flex-shrink-0">
              <Link
                href={`/${clinic}/portal/appointments/${appointment.id}`}
                className="p-2 text-gray-400 hover:text-[var(--primary)] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Citas de {petName}
          </h2>
          <p className="text-sm text-gray-500">
            {upcomingAppointments.length} próxima{upcomingAppointments.length !== 1 ? 's' : ''} • {pastAppointments.length} anterior{pastAppointments.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <Link
          href={`/${clinic}/book?pet=${petId}`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity shadow-md"
        >
          <Plus className="w-4 h-4" />
          Nueva Cita
        </Link>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div>
          <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[var(--primary)]" />
            Próximas Citas
          </h3>
          <div className="space-y-3">
            {upcomingAppointments.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        </div>
      )}

      {/* No upcoming - CTA */}
      {upcomingAppointments.length === 0 && (
        <div className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--primary)]/10 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Calendar className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h3 className="font-bold text-[var(--text-primary)] mb-2">
            Sin citas próximas
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
            {petName} no tiene citas agendadas. ¿Quieres reservar una?
          </p>
          <Link
            href={`/${clinic}/book?pet=${petId}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-md"
          >
            <Calendar className="w-4 h-4" />
            Agendar Cita
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-500 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Historial de Citas
          </h3>
          <div className="space-y-3">
            {pastAppointments.slice(0, 10).map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} isPast />
            ))}
            {pastAppointments.length > 10 && (
              <button className="w-full py-3 text-center text-sm text-gray-500 hover:text-[var(--primary)] font-medium transition-colors">
                Ver {pastAppointments.length - 10} citas más antiguas
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {appointments.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Sin historial de citas</h3>
          <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
            No hay citas registradas para {petName}
          </p>
          <Link
            href={`/${clinic}/book?pet=${petId}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            <Calendar className="w-4 h-4" />
            Agendar Primera Cita
          </Link>
        </div>
      )}
    </div>
  );
}
