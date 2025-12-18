
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const breed = searchParams.get('breed');
    const gender = searchParams.get('gender');

    if (!breed || !gender) {
        return NextResponse.json({ error: 'Missing breed or gender' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('growth_standards')
        .select('*')
        .eq('breed', breed)
        .eq('gender', gender)
        .order('age_weeks', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
