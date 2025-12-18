"use client";

import type { JSX } from 'react';
import { AlertCircle } from 'lucide-react';
import type { Kennel, AdmissionFormData } from './types';

interface KennelSelectionStepProps {
  kennels: Kennel[];
  selectedKennel: Kennel | null;
  onKennelSelect: (kennel: Kennel | null) => void;
  formData: AdmissionFormData;
  onFormDataChange: (data: Partial<AdmissionFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function KennelSelectionStep({
  kennels,
  selectedKennel,
  onKennelSelect,
  formData,
  onFormDataChange,
  onNext,
  onBack
}: KennelSelectionStepProps): JSX.Element {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
        Asignar Jaula y Detalles
      </h3>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Tipo de Hospitalización *
        </label>
        <select
          required
          value={formData.hospitalization_type}
          onChange={(e) => onFormDataChange({ hospitalization_type: e.target.value })}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
        >
          <option value="medical">Médica</option>
          <option value="surgical">Quirúrgica</option>
          <option value="icu">Cuidados Intensivos</option>
          <option value="isolation">Aislamiento</option>
          <option value="boarding">Pensión</option>
          <option value="observation">Observación</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Nivel de Acuidad
        </label>
        <select
          value={formData.acuity_level}
          onChange={(e) => onFormDataChange({ acuity_level: e.target.value })}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
        >
          <option value="routine">Rutina</option>
          <option value="urgent">Urgente</option>
          <option value="critical">Crítico</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Seleccionar Jaula *
        </label>
        {selectedKennel ? (
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border-2 border-[var(--primary)]">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-[var(--text-primary)]">
                  Jaula {selectedKennel.kennel_number}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {selectedKennel.kennel_type} - {selectedKennel.size}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {selectedKennel.location}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onKennelSelect(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cambiar
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {kennels.length === 0 ? (
              <div className="col-span-full p-4 text-center text-[var(--text-secondary)]">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                No hay jaulas disponibles
              </div>
            ) : (
              kennels.map((kennel) => (
                <button
                  key={kennel.id}
                  type="button"
                  onClick={() => onKennelSelect(kennel)}
                  className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] hover:border-[var(--primary)] text-left transition-colors"
                >
                  <div className="font-semibold text-[var(--text-primary)]">
                    {kennel.kennel_number}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {kennel.kennel_type}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {kennel.size}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {kennel.location}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Diagnóstico de Admisión *
        </label>
        <textarea
          required
          rows={3}
          value={formData.admission_diagnosis}
          onChange={(e) => onFormDataChange({ admission_diagnosis: e.target.value })}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
          placeholder="Ingrese el diagnóstico o razón de admisión..."
        />
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
          onClick={onNext}
          disabled={!selectedKennel || !formData.admission_diagnosis}
          className="flex-1 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
