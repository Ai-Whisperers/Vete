import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: { clinic: string } }) {
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic not provided' }, { status: 400 });
  }

  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select(
      `
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
      )
    `
    )
    .eq('tenant_id', clinic)
    .gte('start_time', `${today}T00:00:00`)
    .lt('start_time', `${today}T23:59:59`)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching today\'s appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch today\'s appointments' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}