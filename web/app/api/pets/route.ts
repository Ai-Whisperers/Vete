import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const query = searchParams.get('query');

  if (!userId) {
    return NextResponse.json({ error: 'User not provided' }, { status: 400 });
  }

  const supabase = await createClient();

  let petsQuery = supabase
    .from('pets')
    .select(`
      id,
      name,
      species,
      breed,
      date_of_birth,
      photo_url,
      vaccines (id, status)
    `)
    .eq('owner_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (query) {
    petsQuery = petsQuery.ilike('name', `%${query}%`);
  }

  const { data, error } = await petsQuery;

  if (error) {
    console.error('Error fetching pets:', error);
    return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}