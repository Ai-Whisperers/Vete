
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const species = searchParams.get('species');

    const supabase = await createClient();

    let query = supabase.from('drug_dosages').select('*').order('name');

    if (species) {
        query = query.or(`species.eq.${species},species.eq.all`);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
