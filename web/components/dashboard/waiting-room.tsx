"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  XCircle,
  User,
  PawPrint,
  Phone,
  ChevronRight,
  RefreshCw,
  Stethoscope,
  LogIn,
  Timer,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface WaitingPatient {
  id: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "checked_in" | "in_progress" | "completed" | "cancelled" | "no_show";
  reason: string;
  pet: {
    id: string;
    name: string;
    species: string;
    photo_url: string | null;
  } | null;
  owner: {
    id: string;
    full_name: string;
    phone: string | null;
  } | null;
  vet: {
    id: string;
    full_name: string;
  } | null;
}

interface WaitingRoomProps {
  clinic: string;
  initialAppointments?: WaitingPatient[];
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pendiente",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-200",
    icon: <Clock className="w-4 h-4" />,
  },
  confirmed: {
    label: "Confirmado",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  checked_in: {
    label: "En Espera",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
    icon: <LogIn className="w-4 h-4" />,
  },
  in_progress: {
    label: "En Consulta",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    icon: <Stethoscope className="w-4 h-4" />,
  },
  completed: {
    label: "Completado",
    color: "text-gray-700",
    bgColor: "bg-gray-50 border-gray-200",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  cancelled: {
    label: "Cancelado",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: <XCircle className="w-4 h-4" />,
  },
  no_show: {
    label: "No Asistió",
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
    icon: <AlertCircle className="w-4 h-4" />,
  },
};

export function WaitingRoom({ clinic, initialAppointments = [] }: WaitingRoomProps): React.ReactElement {
  const router = useRouter();
  const [appointments, setAppointments] = useState<WaitingPatient[]>(initialAppointments);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];

      const { data } = await supabase
        .from("appointments")
        .select(`
          id,
          start_time,
          end_time,
          status,
          reason,
          pets (
            id,
            name,
            species,
            photo_url
          ),
          profiles!appointments_vet_id_fkey (
            id,
            full_name
          )
        `)
        .eq("tenant_id", clinic)
        .gte("start_time", `${today}T00:00:00`)
        .lt("start_time", `${today}T23:59:59`)
        .order("start_time", { ascending: true });

      if (data) {
        // Fetch owner data for each pet
        const enrichedData = await Promise.all(
          data.map(async (apt) => {
            const pet = Array.isArray(apt.pets) ? apt.pets[0] : apt.pets;
            const vet = Array.isArray(apt.profiles) ? apt.profiles[0] : apt.profiles;

            let owner = null;
            if (pet) {
              const { data: petWithOwner } = await supabase
                .from("pets")
                .select("owner:profiles!pets_owner_id_fkey(id, full_name, phone)")
                .eq("id", pet.id)
                .single();

              if (petWithOwner?.owner) {
                owner = Array.isArray(petWithOwner.owner)
                  ? petWithOwner.owner[0]
                  : petWithOwner.owner;
              }
            }

            return {
              id: apt.id,
              start_time: apt.start_time,
              end_time: apt.end_time,
              status: apt.status,
              reason: apt.reason || "",
              pet: pet ? {
                id: pet.id,
                name: pet.name,
                species: pet.species,
                photo_url: pet.photo_url,
              } : null,
              owner,
              vet: vet ? {
                id: vet.id,
                full_name: vet.full_name,
              } : null,
            };
          })
        );

        setAppointments(enrichedData as WaitingPatient[]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [clinic]);

  useEffect(() => {
    if (initialAppointments.length === 0) {
      fetchAppointments();
    }

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, [fetchAppointments, initialAppointments.length]);

  const updateStatus = async (appointmentId: string, newStatus: string): Promise<void> => {
    setIsUpdating(appointmentId);
    try {
      const supabase = createClient();
      await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus as WaitingPatient["status"] } : apt
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const formatTime = (timeString: string): string => {
    return new Date(timeString).toLocaleTimeString("es-PY", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWaitTime = (startTime: string): string => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();

    if (diffMs < 0) {
      const minsUntil = Math.abs(Math.floor(diffMs / 60000));
      if (minsUntil < 60) return `En ${minsUntil} min`;
      return `En ${Math.floor(minsUntil / 60)}h ${minsUntil % 60}m`;
    }

    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins} min esperando`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m esperando`;
  };

  // Group appointments by status
  const grouped = {
    waiting: appointments.filter((a) => ["checked_in"].includes(a.status)),
    inProgress: appointments.filter((a) => a.status === "in_progress"),
    upcoming: appointments.filter((a) => ["pending", "confirmed"].includes(a.status)),
    completed: appointments.filter((a) => ["completed", "cancelled", "no_show"].includes(a.status)),
  };

  const getNextStatuses = (currentStatus: string): { label: string; status: string; color: string }[] => {
    switch (currentStatus) {
      case "pending":
        return [
          { label: "Confirmar", status: "confirmed", color: "bg-blue-500" },
          { label: "Cancelar", status: "cancelled", color: "bg-red-500" },
        ];
      case "confirmed":
        return [
          { label: "Check-in", status: "checked_in", color: "bg-purple-500" },
          { label: "No Asistió", status: "no_show", color: "bg-orange-500" },
        ];
      case "checked_in":
        return [
          { label: "Iniciar Consulta", status: "in_progress", color: "bg-green-500" },
        ];
      case "in_progress":
        return [
          { label: "Completar", status: "completed", color: "bg-gray-700" },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--primary)] bg-opacity-10 rounded-lg">
            <Timer className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Sala de Espera</h2>
            <p className="text-xs text-gray-500">
              {appointments.filter((a) => !["completed", "cancelled", "no_show"].includes(a.status)).length} pacientes activos
            </p>
          </div>
        </div>
        <button
          onClick={fetchAppointments}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Waiting (Checked In) */}
      {grouped.waiting.length > 0 && (
        <div className="border-b border-gray-100">
          <div className="px-6 py-2 bg-purple-50">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              En Sala de Espera ({grouped.waiting.length})
            </span>
          </div>
          {grouped.waiting.map((apt) => (
            <AppointmentRow
              key={apt.id}
              appointment={apt}
              clinic={clinic}
              isUpdating={isUpdating === apt.id}
              onStatusChange={updateStatus}
              getNextStatuses={getNextStatuses}
              formatTime={formatTime}
              getWaitTime={getWaitTime}
            />
          ))}
        </div>
      )}

      {/* In Progress */}
      {grouped.inProgress.length > 0 && (
        <div className="border-b border-gray-100">
          <div className="px-6 py-2 bg-green-50">
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
              En Consulta ({grouped.inProgress.length})
            </span>
          </div>
          {grouped.inProgress.map((apt) => (
            <AppointmentRow
              key={apt.id}
              appointment={apt}
              clinic={clinic}
              isUpdating={isUpdating === apt.id}
              onStatusChange={updateStatus}
              getNextStatuses={getNextStatuses}
              formatTime={formatTime}
              getWaitTime={getWaitTime}
            />
          ))}
        </div>
      )}

      {/* Upcoming */}
      {grouped.upcoming.length > 0 && (
        <div className="border-b border-gray-100">
          <div className="px-6 py-2 bg-gray-50">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Próximas Citas ({grouped.upcoming.length})
            </span>
          </div>
          {grouped.upcoming.slice(0, 5).map((apt) => (
            <AppointmentRow
              key={apt.id}
              appointment={apt}
              clinic={clinic}
              isUpdating={isUpdating === apt.id}
              onStatusChange={updateStatus}
              getNextStatuses={getNextStatuses}
              formatTime={formatTime}
              getWaitTime={getWaitTime}
            />
          ))}
          {grouped.upcoming.length > 5 && (
            <div className="px-6 py-3 text-center">
              <button
                onClick={() => router.push(`/${clinic}/dashboard/appointments`)}
                className="text-sm text-[var(--primary)] hover:underline"
              >
                Ver {grouped.upcoming.length - 5} más
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {appointments.length === 0 && !isLoading && (
        <div className="px-6 py-12 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No hay citas programadas para hoy</p>
        </div>
      )}

      {/* Completed Section (Collapsed) */}
      {grouped.completed.length > 0 && (
        <details className="border-t border-gray-100">
          <summary className="px-6 py-3 bg-gray-50 cursor-pointer text-sm text-gray-500 hover:bg-gray-100">
            Finalizadas hoy ({grouped.completed.length})
          </summary>
          {grouped.completed.map((apt) => (
            <AppointmentRow
              key={apt.id}
              appointment={apt}
              clinic={clinic}
              isUpdating={isUpdating === apt.id}
              onStatusChange={updateStatus}
              getNextStatuses={getNextStatuses}
              formatTime={formatTime}
              getWaitTime={getWaitTime}
              compact
            />
          ))}
        </details>
      )}
    </div>
  );
}

// Extracted row component for cleaner code
interface AppointmentRowProps {
  appointment: WaitingPatient;
  clinic: string;
  isUpdating: boolean;
  onStatusChange: (id: string, status: string) => void;
  getNextStatuses: (status: string) => { label: string; status: string; color: string }[];
  formatTime: (time: string) => string;
  getWaitTime: (time: string) => string;
  compact?: boolean;
}

function AppointmentRow({
  appointment,
  clinic,
  isUpdating,
  onStatusChange,
  getNextStatuses,
  formatTime,
  getWaitTime,
  compact = false,
}: AppointmentRowProps): React.ReactElement {
  const router = useRouter();
  const status = statusConfig[appointment.status];
  const nextStatuses = getNextStatuses(appointment.status);

  return (
    <div
      className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
        compact ? "py-3" : ""
      }`}
    >
      {/* Pet Photo */}
      <div className="flex-shrink-0">
        {appointment.pet?.photo_url ? (
          <img
            src={appointment.pet.photo_url}
            alt={appointment.pet.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[var(--primary)] bg-opacity-10 flex items-center justify-center">
            <PawPrint className="w-6 h-6 text-[var(--primary)]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">
            {appointment.pet?.name || "Sin paciente"}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color} border`}>
            {status.icon}
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(appointment.start_time)}
          </span>
          {appointment.owner && (
            <span className="flex items-center gap-1 truncate">
              <User className="w-3 h-3" />
              {appointment.owner.full_name}
            </span>
          )}
          {appointment.owner?.phone && (
            <a
              href={`tel:${appointment.owner.phone}`}
              className="flex items-center gap-1 text-[var(--primary)] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-3 h-3" />
            </a>
          )}
        </div>
        {!compact && appointment.reason && (
          <p className="text-xs text-gray-400 mt-1 truncate">{appointment.reason}</p>
        )}
      </div>

      {/* Wait Time */}
      {["checked_in", "in_progress"].includes(appointment.status) && (
        <div className="text-right text-xs text-gray-500">
          {getWaitTime(appointment.start_time)}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {nextStatuses.map((next) => (
          <button
            key={next.status}
            onClick={() => onStatusChange(appointment.id, next.status)}
            disabled={isUpdating}
            className={`px-3 py-1.5 text-xs font-medium text-white rounded-lg ${next.color} hover:opacity-90 transition-opacity disabled:opacity-50`}
          >
            {next.label}
          </button>
        ))}
        <button
          onClick={() => router.push(`/${clinic}/portal/pets/${appointment.pet?.id}`)}
          className="p-2 text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--primary)] hover:bg-opacity-10 rounded-lg transition-colors"
          title="Ver ficha"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
