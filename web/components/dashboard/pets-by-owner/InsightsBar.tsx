"use client";

import { Dog, Cat, Syringe, FileCheck, AlertTriangle, UserPlus, Rabbit } from "lucide-react";
import type { InsightsData, FilterOptions } from "./types";

interface InsightsBarProps {
  insights: InsightsData;
  onFilterClick: (key: keyof FilterOptions, value: string) => void;
  onPendingFilesClick: () => void;
}

export function InsightsBar({ insights, onFilterClick, onPendingFilesClick }: InsightsBarProps): React.ReactElement {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Dogs */}
      <button
        type="button"
        onClick={() => onFilterClick("species", "dog")}
        className="bg-white rounded-xl p-4 border border-[var(--border-color)] hover:border-[var(--primary)] transition-colors text-left"
      >
        <div className="flex items-center gap-2 mb-1 text-blue-600">
          <Dog className="w-4 h-4" />
          <span className="text-xs font-medium">Perros</span>
        </div>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{insights.dogs}</p>
      </button>

      {/* Cats */}
      <button
        type="button"
        onClick={() => onFilterClick("species", "cat")}
        className="bg-white rounded-xl p-4 border border-[var(--border-color)] hover:border-[var(--primary)] transition-colors text-left"
      >
        <div className="flex items-center gap-2 mb-1 text-purple-600">
          <Cat className="w-4 h-4" />
          <span className="text-xs font-medium">Gatos</span>
        </div>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{insights.cats}</p>
      </button>

      {/* Vaccines Pending - ALERT STYLE */}
      <button
        type="button"
        onClick={() => onFilterClick("vaccine", "overdue")}
        className={`bg-white rounded-xl p-4 border transition-colors text-left ${
          insights.vaccinesOverdue > 0
            ? "border-red-300 bg-red-50 hover:border-red-400"
            : "border-[var(--border-color)] hover:border-[var(--primary)]"
        }`}
      >
        <div className="flex items-center gap-2 mb-1 text-red-600">
          <Syringe className="w-4 h-4" />
          <span className="text-xs font-medium">Vacunas Pendientes</span>
          {insights.vaccinesOverdue > 0 && (
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{insights.vaccinesPending}</p>
        {insights.vaccinesOverdue > 0 && (
          <p className="text-xs text-red-600">{insights.vaccinesOverdue} vencidas</p>
        )}
      </button>

      {/* Pending Files - ALERT STYLE */}
      <button
        type="button"
        onClick={onPendingFilesClick}
        className={`bg-white rounded-xl p-4 border transition-colors text-left ${
          insights.pendingFiles > 0
            ? "border-orange-300 bg-orange-50 hover:border-orange-400"
            : "border-[var(--border-color)] hover:border-[var(--primary)]"
        }`}
      >
        <div className="flex items-center gap-2 mb-1 text-orange-600">
          <FileCheck className="w-4 h-4" />
          <span className="text-xs font-medium">Archivos por Validar</span>
          {insights.pendingFiles > 0 && (
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          )}
        </div>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{insights.pendingFiles}</p>
        {insights.pendingFiles > 0 && (
          <p className="text-xs text-orange-600">recetas pendientes</p>
        )}
      </button>

      {/* Needs Follow-up */}
      <button
        type="button"
        onClick={() => onFilterClick("lastVisit", "6+")}
        className={`bg-white rounded-xl p-4 border transition-colors text-left ${
          insights.needsFollowUp > 0
            ? "border-amber-300 bg-amber-50 hover:border-amber-400"
            : "border-[var(--border-color)] hover:border-[var(--primary)]"
        }`}
      >
        <div className="flex items-center gap-2 mb-1 text-amber-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-medium">Necesitan Seguimiento</span>
        </div>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{insights.needsFollowUp}</p>
        <p className="text-xs text-amber-600">&gt;90 dias sin visita</p>
      </button>

      {/* New This Month */}
      <button
        type="button"
        onClick={() => onFilterClick("lastVisit", "recent")}
        className="bg-white rounded-xl p-4 border border-[var(--border-color)] hover:border-[var(--primary)] transition-colors text-left"
      >
        <div className="flex items-center gap-2 mb-1 text-green-600">
          <UserPlus className="w-4 h-4" />
          <span className="text-xs font-medium">Nuevos este Mes</span>
        </div>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{insights.newThisMonth}</p>
      </button>
    </div>
  );
}
