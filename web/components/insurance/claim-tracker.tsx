"use client";

import { CheckCircle2, Circle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface ClaimTrackerProps {
  status: string;
  submittedAt?: string | null;
  acknowledgedAt?: string | null;
  processedAt?: string | null;
  paidAt?: string | null;
  closedAt?: string | null;
}

interface StatusStep {
  key: string;
  label: string;
  icon: typeof Circle;
  color: string;
}

export default function ClaimTracker({
  status,
  submittedAt,
  acknowledgedAt,
  processedAt,
  paidAt,
  closedAt
}: ClaimTrackerProps) {
  const steps: StatusStep[] = [
    { key: 'draft', label: 'Borrador', icon: Circle, color: 'text-gray-400' },
    { key: 'submitted', label: 'Enviado', icon: Clock, color: 'text-blue-500' },
    { key: 'under_review', label: 'En Revisión', icon: Clock, color: 'text-yellow-500' },
    { key: 'approved', label: 'Aprobado', icon: CheckCircle2, color: 'text-green-500' },
    { key: 'paid', label: 'Pagado', icon: CheckCircle2, color: 'text-green-600' }
  ];

  // Handle denied status
  if (status === 'denied') {
    steps[3] = { key: 'denied', label: 'Denegado', icon: XCircle, color: 'text-red-500' };
    steps.pop(); // Remove paid step
  }

  // Handle pending documents status
  if (status === 'pending_documents') {
    steps.splice(2, 0, {
      key: 'pending_documents',
      label: 'Documentos Pendientes',
      icon: AlertCircle,
      color: 'text-orange-500'
    });
  }

  const getCurrentStepIndex = () => {
    const statusMap: { [key: string]: number } = {
      draft: 0,
      pending_documents: 1,
      submitted: status === 'pending_documents' ? 2 : 1,
      under_review: status === 'pending_documents' ? 3 : 2,
      approved: status === 'pending_documents' ? 4 : 3,
      partially_approved: status === 'pending_documents' ? 4 : 3,
      denied: status === 'pending_documents' ? 4 : 3,
      paid: status === 'pending_documents' ? 5 : 4,
      appealed: status === 'pending_documents' ? 3 : 2,
      closed: status === 'pending_documents' ? 5 : 4
    };
    return statusMap[status] ?? 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  const getDaysSince = (date: string | null | undefined) => {
    if (!date) return null;
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysSinceSubmission = getDaysSince(submittedAt);

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative">
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-1/2 top-4 w-full h-0.5 ${
                      isCompleted
                        ? 'bg-[var(--primary)]'
                        : 'bg-gray-300'
                    }`}
                    style={{ transform: 'translateX(0%)' }}
                  />
                )}

                {/* Icon */}
                <div
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted
                      ? 'bg-[var(--primary)] border-[var(--primary)]'
                      : isCurrent
                      ? 'bg-white border-[var(--primary)]'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isCompleted
                        ? 'text-white'
                        : isCurrent
                        ? step.color
                        : 'text-gray-400'
                    }`}
                  />
                </div>

                {/* Label */}
                <p
                  className={`mt-2 text-xs text-center ${
                    isCurrent
                      ? 'font-semibold text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        {submittedAt && (
          <div className="text-center">
            <p className="text-xs text-[var(--text-secondary)]">Enviado</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {new Date(submittedAt).toLocaleDateString('es-PY')}
            </p>
          </div>
        )}

        {acknowledgedAt && (
          <div className="text-center">
            <p className="text-xs text-[var(--text-secondary)]">Confirmado</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {new Date(acknowledgedAt).toLocaleDateString('es-PY')}
            </p>
          </div>
        )}

        {processedAt && (
          <div className="text-center">
            <p className="text-xs text-[var(--text-secondary)]">Procesado</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {new Date(processedAt).toLocaleDateString('es-PY')}
            </p>
          </div>
        )}

        {daysSinceSubmission !== null && status !== 'draft' && status !== 'paid' && (
          <div className="text-center">
            <p className="text-xs text-[var(--text-secondary)]">Días Transcurridos</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {daysSinceSubmission} días
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
