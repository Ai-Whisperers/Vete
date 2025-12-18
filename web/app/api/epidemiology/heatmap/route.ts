import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const species = searchParams.get('species');
    const weeks = parseInt(searchParams.get('weeks') || '4');
    
    const supabase = await createClient();

    try {
        let query = supabase
            .from('public_health_heatmap')
            .select('*');

        if (species) {
            query = query.eq('species', species);
        }

        // Filter by date range (calculated in JS for simplicity or DB level)
        // The view already filters for last 90 days.
        // We can further refine here if needed, but the view is weekly aggregated.
        
        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
