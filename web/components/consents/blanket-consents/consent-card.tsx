"use client";

import type { JSX } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import type { BlanketConsent } from './types';

interface ConsentCardProps {
  consent: BlanketConsent;
  onRevoke: (consentId: string) => void;
  getTypeLabel: (type: string) => string;
}

export default function ConsentCard({ consent, onRevoke, getTypeLabel }: ConsentCardProps): JSX.Element {
  return (
    <div
      className={`bg-[var(--bg-paper)] rounded-lg border p-4 ${
        consent.is_active
          ? 'border-[var(--primary)]/20'
          : 'border-red-300 bg-red-50/50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-[var(--text-primary)]">
              {getTypeLabel(consent.consent_type)}
            </h4>
            {consent.is_active ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
          </div>

          <p className="text-sm text-[var(--text-secondary)] mb-2">{consent.scope}</p>

          {consent.conditions && (
            <p className="text-xs text-[var(--text-secondary)] mb-2">
              <strong>Condiciones:</strong> {consent.conditions}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <span>Firmado: {new Date(consent.granted_at).toLocaleDateString('es-PY')}</span>
            {consent.expires_at && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Expira: {new Date(consent.expires_at).toLocaleDateString('es-PY')}
              </span>
            )}
          </div>

          {!consent.is_active && consent.revocation_reason && (
            <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
              <strong>Revocado:</strong> {consent.revocation_reason}
            </div>
          )}
        </div>

        {consent.is_active && (
          <button
            onClick={() => onRevoke(consent.id)}
            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Revocar"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
