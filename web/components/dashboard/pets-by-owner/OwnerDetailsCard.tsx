import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  FileText,
} from "lucide-react";
import type { Owner } from "./types";
import { formatDate, isClientActive } from "./utils";

interface OwnerDetailsCardProps {
  owner: Owner;
  clinic: string;
}

export function OwnerDetailsCard({ owner, clinic }: OwnerDetailsCardProps): React.ReactElement {
  const isActive = isClientActive(owner.last_visit);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--primary)] bg-opacity-10 flex items-center justify-center">
            <span className="text-2xl font-bold text-[var(--primary)]">
              {owner.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {owner.full_name}
              </h2>
              {isActive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  <AlertCircle className="w-3 h-3" />
                  Inactivo
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Cliente desde {formatDate(owner.created_at)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${clinic}/dashboard/appointments/new?client=${owner.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nueva Cita
          </Link>
          <Link
            href={`/${clinic}/dashboard/clients/${owner.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--border-color)] transition-colors text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            Ver Ficha
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Email</p>
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {owner.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Phone className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Teléfono</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {owner.phone || "No registrado"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <MapPin className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Dirección</p>
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {owner.address || "No registrada"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Última Visita</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {formatDate(owner.last_visit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
