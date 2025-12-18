import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const supabase = await createClient();
  const { id } = await params;

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  // Only staff can view hospitalizations
  if (!['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo el personal puede ver hospitalizaciones' }, { status: 403 });
  }

  // Get hospitalization with all related data
  const { data: hospitalization, error } = await supabase
    .from('hospitalizations')
    .select(`
      *,
      pet:pets!inner(
        id, name, species, breed, date_of_birth, weight, microchip_number,
        owner:profiles!pets_owner_id_fkey(id, full_name, email, phone)
      ),
      kennel:kennels(id, kennel_number, kennel_type, size, location, features),
      admitted_by:profiles!hospitalizations_admitted_by_fkey(id, full_name),
      discharged_by:profiles!hospitalizations_discharged_by_fkey(id, full_name),
      vitals:hospitalization_vitals(
        id, recorded_at, temperature, heart_rate, respiratory_rate,
        weight, blood_pressure_systolic, blood_pressure_diastolic,
        mucous_membrane_color, capillary_refill_time, pain_score, notes,
        recorded_by:profiles!hospitalization_vitals_recorded_by_fkey(full_name)
      ),
      treatments:hospitalization_treatments(
        id, treatment_type, medication_name, dosage, route, frequency,
        scheduled_time, administered_at, administered_by_id, status, notes,
        administered_by:profiles!hospitalization_treatments_administered_by_id_fkey(full_name)
      ),
      feedings:hospitalization_feedings(
        id, feeding_time, food_type, amount_offered, amount_consumed,
        appetite_level, notes,
        fed_by:profiles!hospitalization_feedings_fed_by_fkey(full_name)
      ),
      transfers:kennel_transfers(
        id, from_kennel:kennels!kennel_transfers_from_kennel_id_fkey(kennel_number, location),
        to_kennel:kennels!kennel_transfers_to_kennel_id_fkey(kennel_number, location),
        transfer_date, reason,
        transferred_by:profiles!kennel_transfers_transferred_by_fkey(full_name)
      ),
      visits:hospitalization_visits(
        id, visitor_name, visit_start, visit_end, notes,
        authorized_by:profiles!hospitalization_visits_authorized_by_fkey(full_name)
      )
    `)
    .eq('id', id)
    .eq('pet.tenant_id', profile.clinic_id)
    .single();

  if (error) {
    console.error('[API] hospitalization GET by ID error:', error);
    return NextResponse.json({ error: 'Hospitalización no encontrada' }, { status: 404 });
  }

  return NextResponse.json(hospitalization);
}
