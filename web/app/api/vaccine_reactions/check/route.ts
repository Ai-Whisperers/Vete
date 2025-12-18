
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { pet_id, brand } = await request.json();

        if (!pet_id || !brand) {
            return NextResponse.json({ error: 'Missing pet_id or brand' }, { status: 400 });
        }

        const supabase = await createClient();

        // Check for existing reactions to this brand
        // Case-insensitive check is better for safety
        const { data, error } = await supabase
            .from('vaccine_reactions')
            .select('*')
            .eq('pet_id', pet_id)
            .ilike('vaccine_brand', brand) // e.g. "Rabies X" matches "rabies x"
            .maybeSingle();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (data) {
            // Reaction found!
            return NextResponse.json({ 
                hasReaction: true, 
                record: data 
            });
        }

        return NextResponse.json({ hasReaction: false });

    } catch (e) {
        // TICKET-TYPE-004: Proper error handling without any
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Error desconocido' }, { status: 500 });
    }
}
