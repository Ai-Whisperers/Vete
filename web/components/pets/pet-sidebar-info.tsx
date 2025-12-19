'use client';

import Link from 'next/link';
import * as Icons from 'lucide-react';
import type { Vaccine } from '@/lib/types/database';

interface PetSidebarInfoProps {
  pet: {
    id: string;
    temperament?: string;
    allergies?: string;
    existing_conditions?: string;
    diet_category?: string;
    diet_notes?: string;
  };
  vaccines: Vaccine[];
  clinic: string;
}

export function PetSidebarInfo({ pet, vaccines, clinic }: PetSidebarInfoProps) {
  return (
    <div className="space-y-6">
      {/* Bio & Health Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Icons.Info className="w-5 h-5 text-blue-500" /> Bio & Salud
        </h3>
        <div className="space-y-4">
          {pet.temperament && (
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Temperamento</span>
              <p className="font-medium capitalize text-gray-700">{pet.temperament}</p>
            </div>
          )}

          {pet.allergies && (
            <div>
              <span className="text-xs font-bold text-red-400 uppercase">Alergias</span>
              <p className="font-medium text-red-600 bg-red-50 px-2 py-1 rounded-lg inline-block">{pet.allergies}</p>
            </div>
          )}

          {pet.existing_conditions && (
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Condiciones</span>
              <p className="text-sm text-gray-600 italic">{pet.existing_conditions}</p>
            </div>
          )}

          {!pet.temperament && !pet.allergies && !pet.existing_conditions && (
            <p className="text-sm text-gray-400">Sin datos adicionales.</p>
          )}
        </div>
      </div>

      {/* Vaccines Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
            <Icons.Syringe className="w-5 h-5 text-purple-500" /> Vacunas
          </h3>
          <Link href={`/${clinic}/portal/pets/${pet.id}/vaccines/new`} className="text-sm text-[var(--primary)] font-bold hover:underline">
            + Agregar
          </Link>
        </div>

        <div className="space-y-3">
          {vaccines.map((v: Vaccine) => (
            <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <p className="font-bold text-sm text-[var(--text-primary)]">{v.name}</p>
                <p className="text-xs text-gray-500">{v.administered_date ? new Date(v.administered_date).toLocaleDateString() : 'Sin fecha'}</p>
              </div>
              {v.status === 'verified' ? (
                <Icons.CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Icons.Clock className="w-4 h-4 text-yellow-500" />
              )}
            </div>
          ))}
          {vaccines.length === 0 && <p className="text-sm text-gray-400">Sin vacunas.</p>}
        </div>
      </div>

      {/* Diet Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Icons.Bone className="w-5 h-5 text-orange-500" /> Alimentación
        </h3>
        {pet.diet_category ? (
          <div>
            <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase mb-2">
              {pet.diet_category}
            </span>
            <p className="text-sm text-gray-600">{pet.diet_notes || 'Sin detalles'}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No especificada.</p>
        )}
      </div>
    </div>
  );
}
