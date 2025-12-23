import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User not provided' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('loyalty_points')
    .select('points')
    .eq('profile_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching loyalty points:', error);
    return NextResponse.json({ error: 'Failed to fetch loyalty points' }, { status: 500 });
  }

  return NextResponse.json({ points: data?.points || 0 }, { status: 200 });
}
