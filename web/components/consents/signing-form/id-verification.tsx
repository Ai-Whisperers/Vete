"use client";

import type { JSX } from 'react';

interface IDVerificationProps {
  idVerificationType: string;
  idVerificationNumber: string;
  onTypeChange: (type: string) => void;
  onNumberChange: (number: string) => void;
}

export default function IDVerification({
  idVerificationType,
  idVerificationNumber,
  onTypeChange,
  onNumberChange,
}: IDVerificationProps): JSX.Element {
  return (
    <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-4">
        Verificación de identidad
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Tipo de documento <span className="text-red-600">*</span>
          </label>
          <select
            value={idVerificationType}
            onChange={(e) => onTypeChange(e.target.value)}
            required
            className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
          >
            <option value="">Seleccionar...</option>
            <option value="ci">Cédula de Identidad</option>
            <option value="passport">Pasaporte</option>
            <option value="ruc">RUC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Número de documento <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={idVerificationNumber}
            onChange={(e) => onNumberChange(e.target.value)}
            required
            className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
          />
        </div>
      </div>
    </div>
  );
}
