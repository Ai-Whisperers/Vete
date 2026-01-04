'use client';

import type { JSX } from 'react';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, FileText, Heart, Activity, Utensils, Clock } from 'lucide-react';
import { PatientHeader } from '@/components/hospital/patient-header';
import { PatientInfoCard } from '@/components/hospital/patient-info-card';
import { OverviewPanel } from '@/components/hospital/overview-panel';
import { VitalsPanel } from '@/components/hospital/vitals-panel';
import { FeedingsPanel } from '@/components/hospital/feedings-panel';
import { TimelinePanel } from '@/components/hospital/timeline-panel';
import TreatmentSheet from '@/components/hospital/treatment-sheet';

interface HospitalizationDetail {
  id: string;
  hospitalization_number: string;
  hospitalization_type: string;
  admission_date: string;
  discharge_date?: string;
  admission_diagnosis: string;
  treatment_plan?: string;
  diet_instructions?: string;
  acuity_level: string;
  status: string;
  estimated_discharge_date?: string;
  discharge_notes?: string;
  discharge_instructions?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string;
    date_of_birth: string;
    weight: number;
    owner: {
      full_name: string;
      email: string;
      phone: string;
    };
  };
  kennel: {
    id: string;
    kennel_number: string;
    kennel_type: string;
    size: string;
    location: string;
  };
  admitted_by?: {
    full_name: string;
  };
  discharged_by?: {
    full_name: string;
  };
  vitals: Array<{
    id: string;
    recorded_at: string;
    temperature?: number;
    heart_rate?: number;
    respiratory_rate?: number;
    weight?: number;
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    mucous_membrane_color?: string;
    capillary_refill_time?: string;
    pain_score?: number;
    notes?: string;
    recorded_by?: {
      full_name: string;
    };
  }>;
  treatments: Array<{
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
  }>;
  feedings: Array<{
    id: string;
    feeding_time: string;
    food_type: string;
    amount_offered: number;
    amount_consumed: number;
    appetite_level: string;
    notes?: string;
    fed_by?: {
      full_name: string;
    };
  }>;
  transfers: Array<{
    id: string;
    from_kennel: {
      kennel_number: string;
      location: string;
    };
    to_kennel: {
      kennel_number: string;
      location: string;
    };
    transfer_date: string;
    reason: string;
    transferred_by?: {
      full_name: string;
    };
  }>;
  visits: Array<{
    id: string;
    visitor_name: string;
    visit_start: string;
    visit_end?: string;
    notes?: string;
    authorized_by?: {
      full_name: string;
    };
  }>;
}

export default function HospitalizationDetailPage({
  params,
}: {
  params: Promise<{ clinic: string; id: string }>;
}): JSX.Element {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [hospitalization, setHospitalization] = useState<HospitalizationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'treatments' | 'feedings' | 'timeline'>('overview');
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchHospitalization();
  }, [id]);

  const fetchHospitalization = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hospitalizations/${id}`);
      if (!response.ok) throw new Error('Error al cargar hospitalización');

      const data = await response.json();
      setHospitalization(data);
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching hospitalization:', error);
      }
      alert('Error al cargar los datos de hospitalización');
    } finally {
      setLoading(false);
    }
  };

  const handleDischarge = async (): Promise<void> => {
    if (!confirm('¿Está seguro que desea dar de alta a este paciente? Esta acción generará la factura final automáticamente.')) return;

    const dischargeNotes = prompt('Notas de alta (opcional):');
    // const dischargeInstructions = prompt('Instrucciones de alta (opcional):');

    setSaving(true);
    try {
      // Use the new atomic Discharge & Bill endpoint
      const response = await fetch(`/api/hospitalizations/${id}/discharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discharge_notes: dischargeNotes || undefined,
          // discharge_instructions: dischargeInstructions || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al dar de alta');
      }

      alert(`Paciente dado de alta exitosamente. Factura ${data.invoice?.invoice_number || ''} generada.`);
      
      // Redirect to invoice or dash?
      // User likely wants to clear the bed, so back to dash is fine.
      // But maybe ask to see invoice
      if (data.invoice?.id && confirm('¿Desea ver la factura generada ahora?')) {
        router.push(`/dashboard/invoices/${data.invoice.id}`);
      } else {
        router.push('/dashboard/hospital');
      }
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error discharging patient:', error);
      }
      alert(error instanceof Error ? error.message : 'Error al dar de alta al paciente');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateInvoice = async (): Promise<void> => {
    if (!confirm('¿Generar factura para esta hospitalización?')) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/hospitalizations/${id}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.invoice_id) {
          if (confirm(`${data.error}. ¿Desea ver la factura existente?`)) {
            router.push(`/dashboard/invoices/${data.invoice_id}`);
          }
        } else {
          throw new Error(data.error || 'Error al generar factura');
        }
        return;
      }

      alert(`Factura ${data.invoice.invoice_number} generada exitosamente.\nTotal: ${new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(data.invoice.total)}`);

      if (confirm('¿Desea ir a la factura?')) {
        router.push(`/dashboard/invoices/${data.invoice.id}`);
      }
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error generating invoice:', error);
      }
      alert(error instanceof Error ? error.message : 'Error al generar factura');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[var(--text-secondary)]">Cargando...</p>
      </div>
    );
  }

  if (!hospitalization) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Hospitalización no encontrada</p>
          <button
            onClick={() => router.push('/dashboard/hospital')}
            className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PatientHeader
        hospitalization={hospitalization}
        saving={saving}
        onBack={() => router.push('/dashboard/hospital')}
        onGenerateInvoice={handleGenerateInvoice}
        onDischarge={handleDischarge}
      />

      <PatientInfoCard hospitalization={hospitalization} />

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <div className="flex gap-4">
          {[
            { id: 'overview', label: 'Resumen', icon: FileText },
            { id: 'vitals', label: 'Signos Vitales', icon: Heart },
            { id: 'treatments', label: 'Tratamientos', icon: Activity },
            { id: 'feedings', label: 'Alimentación', icon: Utensils },
            { id: 'timeline', label: 'Línea de Tiempo', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-6">
        {activeTab === 'overview' && <OverviewPanel hospitalization={hospitalization} />}

        {activeTab === 'vitals' && (
          <VitalsPanel
            hospitalizationId={id}
            vitals={hospitalization.vitals}
            onVitalsSaved={fetchHospitalization}
          />
        )}

        {activeTab === 'treatments' && (
          <TreatmentSheet
            hospitalizationId={id}
            treatments={hospitalization.treatments || []}
            onTreatmentUpdate={fetchHospitalization}
          />
        )}

        {activeTab === 'feedings' && (
          <FeedingsPanel
            hospitalizationId={id}
            feedings={hospitalization.feedings}
            onFeedingSaved={fetchHospitalization}
          />
        )}

        {activeTab === 'timeline' && <TimelinePanel hospitalization={hospitalization} />}
      </div>
    </div>
  );
}
