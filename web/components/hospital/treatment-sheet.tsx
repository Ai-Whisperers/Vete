"use client";

import { useState } from 'react';
import { Check, X, Clock, Pill, Syringe, Droplet, Activity, Plus } from 'lucide-react';

interface Treatment {
  id: string;
  treatment_type: string;
  medication_name?: string;
  dosage?: string;
  route?: string;
  frequency?: string;
  scheduled_time: string;
  administered_at?: string;
  status: string;
  notes?: string;
  administered_by?: {
    full_name: string;
  };
}

interface TreatmentSheetProps {
  hospitalizationId: string;
  treatments: Treatment[];
  onTreatmentUpdate: () => void;
}

export default function TreatmentSheet({
  hospitalizationId,
  treatments,
  onTreatmentUpdate,
}: TreatmentSheetProps): JSX.Element {
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const getTreatmentIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Pill className="h-5 w-5" />;
      case 'injection':
        return <Syringe className="h-5 w-5" />;
      case 'fluid_therapy':
        return <Droplet className="h-5 w-5" />;
      case 'procedure':
        return <Activity className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'administered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'skipped':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'delayed':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'scheduled':
        return 'Programado';
      case 'administered':
        return 'Administrado';
      case 'skipped':
        return 'Omitido';
      case 'delayed':
        return 'Retrasado';
      default:
        return status;
    }
  };

  const handleUpdateStatus = async (treatmentId: string, newStatus: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hospitalizations/${hospitalizationId}/treatments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatment_id: treatmentId,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar tratamiento');

      onTreatmentUpdate();
      setSelectedTreatment(null);
    } catch (error) {
      console.error('Error updating treatment:', error);
      alert('Error al actualizar el tratamiento');
    } finally {
      setLoading(false);
    }
  };

  const groupedTreatments = treatments.reduce((acc, treatment) => {
    if (!acc[treatment.treatment_type]) {
      acc[treatment.treatment_type] = [];
    }
    acc[treatment.treatment_type].push(treatment);
    return acc;
  }, {} as Record<string, Treatment[]>);

  const treatmentTypeLabels: Record<string, string> = {
    medication: 'Medicación',
    injection: 'Inyecciones',
    fluid_therapy: 'Fluidoterapia',
    procedure: 'Procedimientos',
    monitoring: 'Monitoreo',
  };

  const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString('es-PY', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: 'short',
    });
  };

  const isDue = (scheduledTime: string): boolean => {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const hoursDiff = (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 4 && hoursDiff >= 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Plan de Tratamiento
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Agregar Tratamiento
        </button>
      </div>

      {/* Treatment Groups */}
      {Object.entries(groupedTreatments).map(([type, typeTreatments]) => (
        <div key={type} className="space-y-3">
          <div className="flex items-center gap-2">
            {getTreatmentIcon(type)}
            <h4 className="font-medium text-[var(--text-primary)]">
              {treatmentTypeLabels[type] || type}
            </h4>
            <span className="text-sm text-[var(--text-secondary)]">
              ({typeTreatments.length})
            </span>
          </div>

          <div className="space-y-2">
            {typeTreatments
              .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
              .map((treatment) => (
                <div
                  key={treatment.id}
                  className={`
                    p-4 rounded-lg border-2 bg-[var(--bg-secondary)]
                    ${isDue(treatment.scheduled_time) && treatment.status === 'scheduled'
                      ? 'border-[var(--primary)] shadow-md'
                      : 'border-[var(--border)]'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-medium text-[var(--text-primary)]">
                          {treatment.medication_name || treatmentTypeLabels[treatment.treatment_type]}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(treatment.status)}`}>
                          {getStatusLabel(treatment.status)}
                        </span>
                        {isDue(treatment.scheduled_time) && treatment.status === 'scheduled' && (
                          <span className="text-xs px-2 py-1 rounded-full bg-[var(--primary)] text-white">
                            Vence pronto
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-[var(--text-secondary)]">
                        {treatment.dosage && (
                          <div>
                            <span className="font-medium">Dosis:</span> {treatment.dosage}
                          </div>
                        )}
                        {treatment.route && (
                          <div>
                            <span className="font-medium">Vía:</span> {treatment.route}
                          </div>
                        )}
                        {treatment.frequency && (
                          <div>
                            <span className="font-medium">Frecuencia:</span> {treatment.frequency}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Programado:</span>{' '}
                          {formatDate(treatment.scheduled_time)} {formatTime(treatment.scheduled_time)}
                        </div>
                      </div>

                      {treatment.administered_at && (
                        <div className="mt-2 text-sm text-[var(--text-secondary)]">
                          <span className="font-medium">Administrado:</span>{' '}
                          {formatDate(treatment.administered_at)} {formatTime(treatment.administered_at)}
                          {treatment.administered_by && ` por ${treatment.administered_by.full_name}`}
                        </div>
                      )}

                      {treatment.notes && (
                        <div className="mt-2 text-sm text-[var(--text-secondary)] italic">
                          {treatment.notes}
                        </div>
                      )}
                    </div>

                    {treatment.status === 'scheduled' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleUpdateStatus(treatment.id, 'administered')}
                          disabled={loading}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
                          title="Marcar como administrado"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(treatment.id, 'skipped')}
                          disabled={loading}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                          title="Marcar como omitido"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      {treatments.length === 0 && (
        <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)]">
          <Activity className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">
            No hay tratamientos programados
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 text-[var(--primary)] hover:underline"
          >
            Agregar primer tratamiento
          </button>
        </div>
      )}
    </div>
  );
}
