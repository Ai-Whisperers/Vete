'use client';

import Link from 'next/link';
import * as Icons from 'lucide-react';
import { QRGenerator } from '@/components/safety/qr-generator';

interface PetProfileHeaderProps {
  pet: {
    id: string;
    name: string;
    photo_url?: string;
    species: string;
    breed?: string;
    sex?: string;
    is_neutered?: boolean;
    color?: string;
    weight_kg: number;
    microchip_id?: string;
    profiles?: {
      full_name: string;
      phone?: string;
    };
  };
  clinic: string;
  isStaff: boolean;
}

export function PetProfileHeader({ pet, clinic, isStaff }: PetProfileHeaderProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="h-32 bg-[var(--primary)]/10 w-full absolute top-0 left-0 z-0"></div>
      <div className="relative z-10 px-8 pt-12 pb-8 flex flex-col md:flex-row items-start md:items-end gap-6">

        {/* Avatar */}
        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center shrink-0">
          {pet.photo_url ? (
            <img src={pet.photo_url} alt={pet.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <Icons.PawPrint className="w-16 h-16 text-gray-300" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-black text-[var(--text-primary)] mb-1">{pet.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-[var(--text-secondary)] font-medium mb-4">
            <span className="flex items-center gap-1 uppercase text-sm tracking-wider bg-gray-100 px-3 py-1 rounded-full">
              {pet.species === 'dog' ? <Icons.Dog className="w-4 h-4"/> : <Icons.Cat className="w-4 h-4"/>}
              {pet.breed || 'Mestizo'}
            </span>
            <span className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-full capitalize">
              {pet.sex === 'male' ? 'Macho' : pet.sex === 'female' ? 'Hembra' : 'Sexo desc.'}
              {pet.is_neutered && ' (Castrado)'}
            </span>
            {pet.color && (
              <span className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-full">
                <Icons.Palette className="w-4 h-4"/> {pet.color}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-full">
              <Icons.Weight className="w-4 h-4"/> {pet.weight_kg} kg
            </span>
            {pet.microchip_id && (
              <span className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                <Icons.QrCode className="w-4 h-4"/> {pet.microchip_id}
              </span>
            )}
          </div>

          {/* Owner Info (Staff Only) */}
          {isStaff && pet.profiles && (
            <div className="flex items-center gap-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 inline-flex">
              <div className="flex items-center gap-2">
                <Icons.User className="w-4 h-4"/> <span className="font-bold">{pet.profiles.full_name}</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Icons.Phone className="w-4 h-4"/> <span>{pet.profiles.phone || 'Sin télefono'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Link href={`/${clinic}/portal/pets/${pet.id}/edit`} className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-gray-50 flex items-center gap-2">
            <Icons.Edit2 className="w-4 h-4"/> Editar
          </Link>
          <QRGenerator petId={pet.id} petName={pet.name} />
        </div>
      </div>
    </div>
  );
}
