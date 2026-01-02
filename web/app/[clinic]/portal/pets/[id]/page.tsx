import { notFound, redirect } from 'next/navigation';
import { getClinicData } from '@/lib/clinics';
import { PetProfileHeader } from '@/components/pets/pet-profile-header';
import { VaccineReactionAlert } from '@/components/pets/vaccine-reaction-alert';
import { PetDetailContent } from '@/components/pets/pet-detail-content';
import { getPetProfile } from '@/app/actions/pets';
import { AuthService } from '@/lib/auth/core';
import { createClient } from '@/lib/supabase/server';
import type { MedicalRecord, Vaccine, Prescription } from '@/lib/types/database';

interface VaccineReaction {
  id: string;
  reaction_detail: string;
  occurred_at: string;
}

interface TimelineItem {
  id: string;
  created_at: string;
  type: 'record' | 'prescription';
  record_type?: string;
  title: string;
  diagnosis?: string | null;
  notes?: string | null;
  vitals?: {
    weight?: number;
    temp?: number;
    hr?: number;
    rr?: number;
  } | null;
  medications?: Array<{
    name: string;
    dose: string;
    frequency: string;
    duration: string;
  }>;
  attachments?: string[];
  vet_name?: string;
}

interface WeightRecord {
  date: string;
  weight_kg: number;
  age_weeks?: number;
}

export default async function PetProfilePage({ params }: { params: Promise<{ clinic: string; id: string }> }) {
  const { clinic, id } = await params;

  // Use Server Action for unified data fetching and auth
  const result = await getPetProfile(clinic, id);

  if (!result.success) {
    if (result.error === 'Authentication required') {
      redirect(`/${clinic}/portal/login`);
    }
    if (result.error === 'Mascota no encontrada') {
      notFound();
    }
    // Generic error
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl">
        <p className="font-bold">Error al cargar perfil</p>
        <p className="text-sm">{result.error}</p>
      </div>
    );
  }

  const pet = result.data;
  const clinicData = await getClinicData(clinic);

  // Check if current user is staff
  const authContext = await AuthService.getContext();
  const isStaff = authContext.isAuthenticated && ['vet', 'admin'].includes(authContext.profile.role);

  // Process medical records and prescriptions for timeline
  const records = (pet.medical_records as MedicalRecord[])?.sort((a: MedicalRecord, b: MedicalRecord) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];

  const prescriptions = (pet.prescriptions as Prescription[])?.sort((a: Prescription, b: Prescription) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];

  // Build timeline items
  const timelineItems: TimelineItem[] = [
    ...records.map((r: MedicalRecord): TimelineItem => ({
      id: r.id,
      created_at: r.created_at,
      type: 'record',
      record_type: r.type,
      title: r.title || 'Consulta',
      diagnosis: r.diagnosis || null,
      vitals: r.vital_signs as TimelineItem['vitals'],
      notes: r.notes || null,
      attachments: r.attachments || undefined,
      vet_name: undefined, // Would need to join with profiles
    })),
    ...prescriptions.map((p: Prescription): TimelineItem => ({
      id: p.id,
      created_at: p.created_at,
      type: 'prescription',
      title: 'Receta Médica',
      medications: [], // Would need to parse from medications JSONB
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Extract weight history from medical records
  const weightHistory: WeightRecord[] = records
    .filter((r): r is MedicalRecord & { vital_signs: { weight: number } } =>
      r.vital_signs !== null &&
      typeof r.vital_signs === 'object' &&
      'weight' in r.vital_signs
    )
    .map((r): WeightRecord => {
      const recordDate = new Date(r.created_at);
      const birthDate = pet.birth_date ? new Date(pet.birth_date) : null;
      let age_weeks = undefined;
      if (birthDate) {
        age_weeks = Math.floor((recordDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      }
      return {
        date: r.created_at,
        weight_kg: Number(r.vital_signs.weight),
        age_weeks
      };
    });

  // Fetch appointments for this pet
  const supabase = await createClient();
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      notes,
      cancellation_reason,
      services (id, name, category),
      profiles:vet_id (id, full_name)
    `)
    .eq('pet_id', id)
    .eq('tenant_id', clinic)
    .order('start_time', { ascending: false })
    .limit(50);

  // Transform appointments to match expected format
  const formattedAppointments = (appointments || []).map(apt => ({
    id: apt.id,
    start_time: apt.start_time,
    end_time: apt.end_time,
    status: apt.status as any,
    notes: apt.notes,
    cancellation_reason: apt.cancellation_reason,
    service: apt.services ? {
      id: (apt.services as any).id,
      name: (apt.services as any).name,
      category: (apt.services as any).category,
    } : null,
    vet: apt.profiles ? {
      id: (apt.profiles as any).id,
      full_name: (apt.profiles as any).full_name,
    } : null,
  }));

  // For now, documents are empty (would need a pet_documents table)
  const documents: any[] = [];

  // Fetch invoices related to this pet (via appointments or directly)
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, total, status, due_date, created_at')
    .eq('tenant_id', clinic)
    .eq('client_id', pet.owner_id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Fetch payments
  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, payment_date, payment_method')
    .eq('tenant_id', clinic)
    .order('payment_date', { ascending: false })
    .limit(20);

  const formattedPayments = (payments || []).map(p => ({
    id: p.id,
    amount: p.amount,
    payment_date: p.payment_date,
    method: p.payment_method || 'Efectivo',
  }));

  // Fetch loyalty points
  const { data: loyaltyData } = await supabase
    .from('loyalty_points')
    .select('balance, lifetime_earned')
    .eq('client_id', pet.owner_id)
    .single();

  const { data: loyaltyTransactions } = await supabase
    .from('loyalty_transactions')
    .select('id, points, description, type, created_at')
    .eq('client_id', pet.owner_id)
    .order('created_at', { ascending: false })
    .limit(10);

  const loyalty = loyaltyData ? {
    balance: loyaltyData.balance || 0,
    lifetime_earned: loyaltyData.lifetime_earned || 0,
    recent_transactions: (loyaltyTransactions || []).map(t => ({
      id: t.id,
      points: t.points,
      description: t.description || 'Transacción',
      type: t.type as 'earn' | 'redeem',
      created_at: t.created_at,
    })),
  } : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4">
      {/* Vaccine Reaction Alert */}
      <VaccineReactionAlert reactions={pet.vaccine_reactions as VaccineReaction[]} />

      {/* Pet Profile Header */}
      <PetProfileHeader pet={pet} clinic={clinic} isStaff={isStaff} />

      {/* Tab-based Content */}
      <PetDetailContent
        pet={pet}
        clinic={clinic}
        clinicName={clinicData?.config?.name}
        isStaff={isStaff}
        weightHistory={weightHistory}
        timelineItems={timelineItems}
        appointments={formattedAppointments}
        documents={documents}
        invoices={(invoices || []) as any}
        payments={formattedPayments}
        loyalty={loyalty}
      />
    </div>
  );
}
