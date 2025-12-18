"use client";

import type { JSX } from 'react';
import type { AdmissionFormData } from './types';

interface TreatmentPlanStepProps {
  formData: AdmissionFormData;
  onFormDataChange: (data: Partial<AdmissionFormData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

export default function TreatmentPlanStep({
  formData,
  onFormDataChange,
  onSubmit,
  onBack,
  loading
}: TreatmentPlanStepProps): JSX.Element {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
        Plan de Tratamiento y Contacto
      </h3>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Plan de Tratamiento
        </label>
        <textarea
          rows={4}
          value={formData.treatment_plan}
          onChange={(e) => onFormDataChange({ treatment_plan: e.target.value })}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
          placeholder="Describa el plan de tratamiento..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Instrucciones de Dieta
        </label>
        <textarea
          rows={3}
          value={formData.diet_instructions}
          onChange={(e) => onFormDataChange({ diet_instructions: e.target.value })}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
          placeholder="Instrucciones de alimentación..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Fecha Estimada de Alta
        </label>
        <input
          type="date"
          value={formData.estimated_discharge_date}
          onChange={(e) => onFormDataChange({ estimated_discharge_date: e.target.value })}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
        />
      </div>

      <div className="border-t border-[var(--border)] pt-4 mt-4">
        <h4 className="font-medium text-[var(--text-primary)] mb-3">
          Contacto de Emergencia
        </h4>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.emergency_contact_name}
              onChange={(e) => onFormDataChange({ emergency_contact_name: e.target.value })}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={(e) => onFormDataChange({ emergency_contact_phone: e.target.value })}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 border border-[var(--border)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)]"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Completar Admisión'}
        </button>
      </div>
    </div>
  );
}
