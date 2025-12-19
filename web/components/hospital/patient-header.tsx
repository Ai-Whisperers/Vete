'use client';

import type { JSX } from 'react';
import { ArrowLeft, CheckCircle, Receipt } from 'lucide-react';

interface PatientHeaderProps {
  hospitalization: {
    hospitalization_number: string;
    acuity_level: string;
    status: string;
    pet: {
      name: string;
    };
  };
  saving: boolean;
  onBack: () => void;
  onGenerateInvoice: () => void;
  onDischarge: () => void;
}

export function PatientHeader({
  hospitalization,
  saving,
  onBack,
  onGenerateInvoice,
  onDischarge,
}: PatientHeaderProps): JSX.Element {
  const getAcuityColor = (level: string): string => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-300';
      case 'urgent':
        return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'routine':
        return 'text-green-600 bg-green-100 border-green-300';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            {hospitalization.pet.name}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {hospitalization.hospitalization_number}
          </p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full border ${getAcuityColor(hospitalization.acuity_level)}`}>
          {hospitalization.acuity_level === 'critical' && 'Crítico'}
          {hospitalization.acuity_level === 'urgent' && 'Urgente'}
          {hospitalization.acuity_level === 'routine' && 'Rutina'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onGenerateInvoice}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          <Receipt className="h-5 w-5" />
          Generar Factura
        </button>

        {hospitalization.status === 'active' && (
          <button
            onClick={onDischarge}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <CheckCircle className="h-5 w-5" />
            Dar de Alta
          </button>
        )}
      </div>
    </div>
  );
}
