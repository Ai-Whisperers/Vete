
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json([]);
    }

    const supabase = await createClient();

    // Use websearch text search if available, or ILIKE
    const { data, error } = await supabase
        .from('diagnosis_codes')
        .select('*')
        .ilike('term', `%${query}%`)
        .limit(10);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
