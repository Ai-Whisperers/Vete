import { notFound, redirect } from 'next/navigation';
import { LoyaltyCard } from '@/components/loyalty/loyalty-card';
import { getClinicData } from '@/lib/clinics';
import { GrowthChart } from '@/components/clinical/growth-chart';
import { PetProfileHeader } from '@/components/pets/pet-profile-header';
import { VaccineReactionAlert } from '@/components/pets/vaccine-reaction-alert';
import { MedicalTimeline } from '@/components/pets/medical-timeline';
import { PetSidebarInfo } from '@/components/pets/pet-sidebar-info';
import { getPetProfile } from '@/app/actions/pets';
import { AuthService } from '@/lib/auth/core';
import type { MedicalRecord, Vaccine, Prescription } from '@/lib/types/database';

interface VaccineReaction {
  id: string;
  reaction_detail: string;
  occurred_at: string;
}

interface TimelineItem {
  id: string;
  created_at: string;
  timelineType: 'record' | 'prescription';
  title: string;
  type?: string;
  diagnosis?: string;
  vitals?: {
    weight?: number;
    temp?: number;
    hr?: number;
    rr?: number;
  };
  drugs?: Array<{
    name: string;
    dose: string;
    instructions: string;
  }>;
  notes?: string;
  attachments?: string[];
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

  // We still need to know if current user is staff for UI components
  // result of getPetProfile doesn't return context, but we can check profile again
  // OR just assume if success, they have access. 
  // Let's get context for isStaff check
  const authContext = await AuthService.getContext();
  const isStaff = authContext.isAuthenticated && ['vet', 'admin'].includes(authContext.profile.role);

  const records = (pet.medical_records as MedicalRecord[])?.sort((a: MedicalRecord, b: MedicalRecord) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];

  const vaccines = (pet.vaccines as Vaccine[])?.sort((a: Vaccine, b: Vaccine) =>
    new Date(b.administered_date || 0).getTime() - new Date(a.administered_date || 0).getTime()
  ) || [];

  const prescriptions = (pet.prescriptions as Prescription[])?.sort((a: Prescription, b: Prescription) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];

  const timelineItems: TimelineItem[] = [
    ...records.map((r: MedicalRecord): TimelineItem => ({
      id: r.id,
      created_at: r.created_at,
      timelineType: 'record',
      title: r.title || 'Consulta',
      type: r.type,
      diagnosis: r.diagnosis || undefined,
      vitals: r.vital_signs as TimelineItem['vitals'],
      notes: r.notes || undefined,
      attachments: r.attachments || undefined
    })),
    ...prescriptions.map((p: Prescription): TimelineItem => ({
      id: p.id,
      created_at: p.created_at,
      timelineType: 'prescription',
      title: 'Receta Médica',
      drugs: []
    }))
  ].sort((a: TimelineItem, b: TimelineItem) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4">
      <VaccineReactionAlert reactions={pet.vaccine_reactions as VaccineReaction[]} />

      <PetProfileHeader pet={pet} clinic={clinic} isStaff={isStaff} />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <MedicalTimeline
                timelineItems={timelineItems}
                clinic={clinic}
                petId={id}
                isStaff={isStaff}
            />
        </div>

        <div className="space-y-6">
          <GrowthChart
            breed={pet.breed || 'Mestizo'}
            gender={pet.sex as any}
            patientRecords={weightHistory}
          />

          {clinicData && (
            <LoyaltyCard
              petId={id}
              petName={pet.name}
              clinicConfig={{ config: { name: clinicData.config.name } }}
            />
          )}

          <PetSidebarInfo
            pet={pet}
            vaccines={vaccines}
            clinic={clinic}
          />
        </div>
      </div>
    </div>
  );
}
