import { useServer } from 'next/server';
import { VaccinationService } from '../../../lib/domain/pets/vaccinations/service';
import { createClient } from '../../../lib/supabase/server';

export async function GET({ params, tenantId }: { params: { petId: string }, tenantId: string }) {
  const supabase = createClient();
  const vaccinationService = new VaccinationService(supabase);

  const vaccinations = await vaccinationService.getVaccinations({ pet_id: params.petId }, tenantId);

  return new Response(JSON.stringify(vaccinations), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST({ params, tenantId, request }: { params: { petId: string }, tenantId: string, request: Request }) {
  const supabase = createClient();
  const vaccinationService = new VaccinationService(supabase);

  const data = await request.json();
  const vaccination = await vaccinationService.createVaccination({ ...data, pet_id: params.petId }, tenantId);

  return new Response(JSON.stringify(vaccination), { status: 201, headers: { 'Content-Type': 'application/json' } });
}

export async function PATCH({ params, tenantId, request }: { params: { vaccinationId: string }, tenantId: string, request: Request }) {
  const supabase = createClient();
  const vaccinationService = new VaccinationService(supabase);

  const data = await request.json();
  const vaccination = await vaccinationService.updateVaccination(params.vaccinationId, data, tenantId);

  return new Response(JSON.stringify(vaccination), { status: 200, headers: { 'Content-Type': 'application/json' } });
}