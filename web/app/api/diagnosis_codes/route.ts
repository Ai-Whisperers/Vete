import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    // TICKET-SEC-002: Add authentication check - only staff can access diagnosis codes
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verify user is staff (vet/admin)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !['vet', 'admin'].includes(profile.role)) {
        return NextResponse.json({ error: 'Solo el personal veterinario puede acceder a códigos de diagnóstico' }, { status: 403 });
    }

    // Apply rate limiting for search endpoints (30 requests per minute)
    const rateLimitResult = await rateLimit(request, 'search', user.id);
    if (!rateLimitResult.success) {
        return rateLimitResult.response;
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json([]);
    }

    // Use websearch text search if available, or ILIKE
    const { data, error } = await supabase
        .from('diagnosis_codes')
        .select('id, code, term, category, species, description, created_at')
        .ilike('term', `%${query}%`)
        .limit(10);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, {
        headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
    });
}
