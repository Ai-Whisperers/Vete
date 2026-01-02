'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PetDetailTabs, TabId } from './pet-detail-tabs';
import {
  PetSummaryTab,
  PetVaccinesTab,
  PetHistoryTab,
  PetAppointmentsTab,
  PetDocumentsTab,
  PetFinancesTab,
} from './tabs';

interface Vaccine {
  id: string;
  name: string;
  administered_date?: string | null;
  next_due_date?: string | null;
  status: string;
  lot_number?: string | null;
  manufacturer?: string | null;
  notes?: string | null;
}

interface VaccineReaction {
  id: string;
  vaccine_id: string;
  reaction_type: string;
  severity: string;
  onset_hours?: number;
  notes?: string;
}

interface WeightRecord {
  date: string;
  weight_kg: number;
  age_weeks?: number;
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

interface Appointment {
  id: string;
  start_time: string;
  end_time?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  service?: {
    id: string;
    name: string;
    category?: string;
  } | null;
  vet?: {
    id: string;
    full_name: string;
  } | null;
  notes?: string | null;
  cancellation_reason?: string | null;
}

interface Document {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  category: 'medical' | 'lab' | 'xray' | 'vaccine' | 'prescription' | 'other';
  description?: string;
  uploaded_by?: string;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  method: string;
  invoice_id?: string;
}

interface LoyaltyInfo {
  balance: number;
  lifetime_earned: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  recent_transactions?: Array<{
    id: string;
    points: number;
    description: string;
    type: 'earn' | 'redeem';
    created_at: string;
  }>;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
  sex?: string | null;
  birth_date?: string | null;
  weight_kg?: number | null;
  temperament?: string | null;
  allergies?: string[] | string | null;
  chronic_conditions?: string[] | null;
  existing_conditions?: string | null;
  diet_category?: string | null;
  diet_notes?: string | null;
  vaccines?: Vaccine[];
  vaccine_reactions?: VaccineReaction[];
  primary_vet_name?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
}

interface PetDetailContentProps {
  pet: Pet;
  clinic: string;
  clinicName?: string;
  isStaff: boolean;
  weightHistory: WeightRecord[];
  timelineItems: TimelineItem[];
  appointments: Appointment[];
  documents: Document[];
  invoices: Invoice[];
  payments: Payment[];
  loyalty?: LoyaltyInfo | null;
}

export function PetDetailContent({
  pet,
  clinic,
  clinicName,
  isStaff,
  weightHistory,
  timelineItems,
  appointments,
  documents,
  invoices,
  payments,
  loyalty,
}: PetDetailContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get initial tab from URL or default to summary
  const initialTab = (searchParams.get('tab') as TabId) || 'summary';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  // Update URL when tab changes
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === 'summary') {
      params.delete('tab');
    } else {
      params.set('tab', tabId);
    }
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/${clinic}/portal/pets/${pet.id}${newUrl}`, { scroll: false });
  };

  // Sync with URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as TabId;
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Handle document upload (placeholder - would be implemented with server action)
  const handleDocumentUpload = async (files: File[], category: string) => {
    // TODO: Implement with server action
    console.log('Uploading files:', files, 'Category:', category);
    // This would call a server action to upload files to Supabase Storage
    throw new Error('Upload not implemented yet');
  };

  // Handle document delete (placeholder - would be implemented with server action)
  const handleDocumentDelete = async (documentId: string) => {
    // TODO: Implement with server action
    console.log('Deleting document:', documentId);
    throw new Error('Delete not implemented yet');
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <PetDetailTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'summary' && (
          <PetSummaryTab
            pet={pet}
            weightHistory={weightHistory}
            clinic={clinic}
            clinicName={clinicName}
          />
        )}

        {activeTab === 'history' && (
          <PetHistoryTab
            petId={pet.id}
            petName={pet.name}
            timelineItems={timelineItems}
            clinic={clinic}
            isStaff={isStaff}
          />
        )}

        {activeTab === 'vaccines' && (
          <PetVaccinesTab
            petId={pet.id}
            petName={pet.name}
            vaccines={pet.vaccines || []}
            reactions={pet.vaccine_reactions || []}
            clinic={clinic}
            isStaff={isStaff}
          />
        )}

        {activeTab === 'documents' && (
          <PetDocumentsTab
            petId={pet.id}
            petName={pet.name}
            documents={documents}
            clinic={clinic}
            onUpload={handleDocumentUpload}
            onDelete={handleDocumentDelete}
          />
        )}

        {activeTab === 'appointments' && (
          <PetAppointmentsTab
            petId={pet.id}
            petName={pet.name}
            appointments={appointments}
            clinic={clinic}
          />
        )}

        {activeTab === 'finances' && (
          <PetFinancesTab
            petId={pet.id}
            petName={pet.name}
            invoices={invoices}
            payments={payments}
            loyalty={loyalty}
            clinic={clinic}
          />
        )}
      </div>
    </div>
  );
}
