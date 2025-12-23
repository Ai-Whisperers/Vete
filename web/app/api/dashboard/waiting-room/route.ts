import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic not provided' }, { status: 400 });
  }

  const supabase = createClient();
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
    return NextResponse.json({ error: 'Failed to fetch waiting room appointments' }, { status: 500 });
  }

  const enrichedData = (data || []).map((apt) => {
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