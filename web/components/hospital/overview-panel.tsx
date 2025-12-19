'use client';

import type { JSX } from 'react';

interface OverviewPanelProps {
  hospitalization: {
    admission_diagnosis: string;
    treatment_plan?: string;
    diet_instructions?: string;
    admission_date: string;
    estimated_discharge_date?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    admitted_by?: {
      full_name: string;
    };
  };
}

export function OverviewPanel({ hospitalization }: OverviewPanelProps): JSX.Element {
  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-[var(--text-primary)] mb-2">
          Diagnóstico de Admisión
        </h3>
        <p className="text-[var(--text-secondary)]">{hospitalization.admission_diagnosis}</p>
      </div>

      {hospitalization.treatment_plan && (
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">
            Plan de Tratamiento
          </h3>
          <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
            {hospitalization.treatment_plan}
          </p>
        </div>
      )}

      {hospitalization.diet_instructions && (
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">
            Instrucciones de Dieta
          </h3>
          <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
            {hospitalization.diet_instructions}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">Fecha de Admisión</p>
          <p className="text-[var(--text-primary)] font-medium">
            {formatDate(hospitalization.admission_date)}
          </p>
          {hospitalization.admitted_by && (
            <p className="text-sm text-[var(--text-secondary)]">
              por {hospitalization.admitted_by.full_name}
            </p>
          )}
        </div>

        {hospitalization.estimated_discharge_date && (
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Alta Estimada</p>
            <p className="text-[var(--text-primary)] font-medium">
              {formatDate(hospitalization.estimated_discharge_date)}
            </p>
          </div>
        )}

        {hospitalization.emergency_contact_name && (
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Contacto de Emergencia</p>
            <p className="text-[var(--text-primary)] font-medium">
              {hospitalization.emergency_contact_name}
            </p>
            {hospitalization.emergency_contact_phone && (
              <p className="text-sm text-[var(--text-secondary)]">
                {hospitalization.emergency_contact_phone}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
