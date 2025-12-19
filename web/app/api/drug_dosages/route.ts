
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    // TICKET-SEC-002: Add authentication check - only staff can access drug dosages
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
        return NextResponse.json({ error: 'Solo el personal veterinario puede acceder a dosificaciones' }, { status: 403 });
    }

    // Apply rate limiting for search endpoints (30 requests per minute)
    const rateLimitResult = await rateLimit(request, 'search', user.id);
    if (!rateLimitResult.success) {
        return rateLimitResult.response;
    }

    const { searchParams } = new URL(request.url);
    const species = searchParams.get('species');
    const search = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200); // TICKET-PERF-001: Cap at 200
    const offset = (page - 1) * limit;

    let query = supabase.from('drug_dosages').select('id, name, species, dose_mg_per_kg, route, frequency, contraindications, notes, created_at, updated_at', { count: 'exact' }).order('name');

    if (species) {
        query = query.or(`species.eq.${species},species.eq.all`);
    }

    if (search) {
        query = query.ilike('name', `%${search}%`);
    }

    // TICKET-PERF-001: Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        data,
        total: count || 0,
        page,
        limit
    });
}
