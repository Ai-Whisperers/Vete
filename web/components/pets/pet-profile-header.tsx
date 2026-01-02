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
    birth_date?: string | null;
    is_neutered?: boolean;
    color?: string;
    weight_kg?: number | null;
    microchip_number?: string | null;
    profiles?: {
      full_name: string;
      phone?: string;
    };
  };
  clinic: string;
  isStaff: boolean;
}

export function PetProfileHeader({ pet, clinic, isStaff }: PetProfileHeaderProps) {
  // Calculate age
  const calculateAge = (): string => {
    if (!pet.birth_date) return '';
    const birth = new Date(pet.birth_date);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years > 0) {
      return months > 0 ? `${years} años, ${months} meses` : `${years} años`;
    }
    return months > 0 ? `${months} meses` : 'Menos de 1 mes';
  };

  const age = calculateAge();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="h-32 bg-[var(--primary)]/10 w-full absolute top-0 left-0 z-0"></div>
      <div className="relative z-10 px-4 sm:px-8 pt-12 pb-6 sm:pb-8">
        {/* Top row: Avatar + Info + Desktop Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center shrink-0">
            {pet.photo_url ? (
              <img src={pet.photo_url} alt={pet.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <Icons.PawPrint className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] mb-1">{pet.name}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[var(--text-secondary)] font-medium mb-3 sm:mb-4">
              <span className="flex items-center gap-1 uppercase text-xs sm:text-sm tracking-wider bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                {pet.species === 'dog' ? <Icons.Dog className="w-3 sm:w-4 h-3 sm:h-4"/> : <Icons.Cat className="w-3 sm:w-4 h-3 sm:h-4"/>}
                {pet.breed || 'Mestizo'}
              </span>
              {age && (
                <span className="flex items-center gap-1 text-xs sm:text-sm bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                  <Icons.Calendar className="w-3 sm:w-4 h-3 sm:h-4"/> {age}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs sm:text-sm bg-gray-100 px-2 sm:px-3 py-1 rounded-full capitalize">
                {pet.sex === 'male' ? 'Macho' : pet.sex === 'female' ? 'Hembra' : 'Sexo desc.'}
                {pet.is_neutered && ' (Castrado)'}
              </span>
              {pet.color && (
                <span className="hidden sm:flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-full">
                  <Icons.Palette className="w-4 h-4"/> {pet.color}
                </span>
              )}
              {pet.weight_kg && (
                <span className="flex items-center gap-1 text-xs sm:text-sm bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                  <Icons.Weight className="w-3 sm:w-4 h-3 sm:h-4"/> {pet.weight_kg} kg
                </span>
              )}
              {pet.microchip_number && (
                <span className="hidden sm:flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                  <Icons.QrCode className="w-4 h-4"/> {pet.microchip_number}
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
                  <Icons.Phone className="w-4 h-4"/> <span>{pet.profiles.phone || 'Sin teléfono'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-2 flex-wrap">
            <Link
              href={`/${clinic}/book?pet=${pet.id}`}
              className="bg-[var(--primary)] text-white px-4 py-2 rounded-xl font-bold shadow-md hover:shadow-lg hover:opacity-90 flex items-center gap-2 transition-all"
            >
              <Icons.CalendarPlus className="w-4 h-4"/> Agendar Cita
            </Link>
            <Link href={`/${clinic}/portal/pets/${pet.id}/edit`} className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-gray-50 flex items-center gap-2">
              <Icons.Edit2 className="w-4 h-4"/> Editar
            </Link>
            <QRGenerator petId={pet.id} petName={pet.name} />
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Link
            href={`/${clinic}/book?pet=${pet.id}`}
            className="flex-1 bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Icons.CalendarPlus className="w-4 h-4"/> Agendar
          </Link>
          <Link
            href={`/${clinic}/portal/pets/${pet.id}/edit`}
            className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            <Icons.Edit2 className="w-4 h-4"/> Editar
          </Link>
          <QRGenerator petId={pet.id} petName={pet.name} />
        </div>
      </div>
    </div>
  );
}
