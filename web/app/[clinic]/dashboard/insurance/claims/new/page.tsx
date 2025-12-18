"use client";

import { useRouter } from 'next/navigation';
import ClaimForm from '@/components/insurance/claim-form';
import { ArrowLeft } from 'lucide-react';

export default function NewClaimPage() {
  const router = useRouter();

  const handleSuccess = (claimId: string) => {
    router.push(`../claims/${claimId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-default)] p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Nuevo Reclamo de Seguro
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Complete la información del reclamo para enviar a la aseguradora
            </p>
          </div>

          <ClaimForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
