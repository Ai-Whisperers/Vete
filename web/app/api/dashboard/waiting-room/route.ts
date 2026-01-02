import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');

  if (!clinic) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
      details: { field: 'clinic' }
    });
  }

  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      reason,
      pets (
        id,
        name,
        species,
        photo_url,
        owner:profiles!pets_owner_id_fkey (
          id,
          full_name,
          phone
        )
      ),
      vet:profiles!appointments_vet_id_fkey (
        id,
        full_name
      )
    `)
    .eq('tenant_id', clinic)
    .gte('start_time', `${today}T00:00:00`)
    .lt('start_time', `${today}T23:59:59`)
    .order('start_time', { ascending: true });

  if (error) {
    console.error("Error fetching waiting room appointments:", error);
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: error.message }
    });
  }

  const enrichedData = (data || []).map((apt: { id: string; start_time: string; end_time: string; status: string; reason: string | null; pets: unknown; vet: unknown }) => {
    const pet = Array.isArray(apt.pets) ? apt.pets[0] : apt.pets;
    const vet = Array.isArray(apt.vet) ? apt.vet[0] : apt.vet;
    const owner = pet?.owner ? (Array.isArray(pet.owner) ? pet.owner[0] : pet.owner) : undefined;
    return {
      ...apt,
      pet: pet ? { ...pet, owner } : null,
      vet,
    };
  });

  return NextResponse.json(enrichedData, { status: 200 });
}