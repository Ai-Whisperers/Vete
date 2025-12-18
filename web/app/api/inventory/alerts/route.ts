import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile) return new NextResponse('Forbidden', { status: 403 });

    try {
        // Get low stock products
        const { data: lowStock } = await supabase
            .from('low_stock_products')
            .select('*')
            .eq('tenant_id', profile.tenant_id);

        // Get expiring products
        const { data: expiring } = await supabase
            .from('expiring_products')
            .select('*')
            .eq('tenant_id', profile.tenant_id);

        return NextResponse.json({
            lowStock: lowStock || [],
            expiring: expiring || [],
            hasAlerts: (lowStock?.length || 0) > 0 || (expiring?.length || 0) > 0
        });

    } catch (e) {
        // TICKET-TYPE-004: Proper error handling without any
        return new NextResponse(e instanceof Error ? e.message : 'Error desconocido', { status: 500 });
    }
}
