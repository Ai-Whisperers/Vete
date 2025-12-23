"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
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
import { updateAppointmentStatus } from "@/app/actions/update-appointment-status";

const queryClient = new QueryClient();

export function WaitingRoomWrapper({ clinic }: { clinic: string }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WaitingRoom clinic={clinic} />
    </QueryClientProvider>
  );
}

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

export function WaitingRoom({ clinic }: { clinic: string }): React.ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: appointments = [],
    isLoading,
    isFetching,
  } = useQuery<WaitingPatient[]>({
    queryKey: ["waitingRoom", clinic],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/waiting-room?clinic=${clinic}`);
      if (!res.ok) {
        throw new Error("Failed to fetch waiting room appointments");
      }
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({
      appointmentId,
      newStatus,
    }: {
      appointmentId: string;
      newStatus: string;
    }) => updateAppointmentStatus(appointmentId, newStatus, clinic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitingRoom", clinic] });
    },
  });


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
          onClick={() => queryClient.invalidateQueries({ queryKey: ["waitingRoom", clinic] })}
          disabled={isFetching}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
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
              isUpdating={isUpdatingStatus && isUpdatingStatus.appointmentId === apt.id}
              onStatusChange={(appointmentId, newStatus) => updateStatus({ appointmentId, newStatus })}
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
              isUpdating={isUpdatingStatus && isUpdatingStatus.appointmentId === apt.id}
              onStatusChange={(appointmentId, newStatus) => updateStatus({ appointmentId, newStatus })}
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
              isUpdating={isUpdatingStatus && isUpdatingStatus.appointmentId === apt.id}
              onStatusChange={(appointmentId, newStatus) => updateStatus({ appointmentId, newStatus })}
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
              isUpdating={isUpdatingStatus && isUpdatingStatus.appointmentId === apt.id}
              onStatusChange={(appointmentId, newStatus) => updateStatus({ appointmentId, newStatus })}
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
