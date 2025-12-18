import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();

    // Authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get user profile - only staff can view expenses
    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id:tenant_id, role')
        .eq('id', user.id)
        .single();

    if (!profile || !['vet', 'admin'].includes(profile.role)) {
        return NextResponse.json({ error: 'Solo el personal puede ver gastos' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const clinic = searchParams.get('clinic') || profile.clinic_id;

    // Verify user belongs to the requested clinic
    if (clinic !== profile.clinic_id) {
        return NextResponse.json({ error: 'No tienes acceso a esta clínica' }, { status: 403 });
    }

    const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('clinic_id', clinic)
        .order('date', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(expenses);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const body = await request.json();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
        .from('expenses')
        .insert({
            ...body,
            created_by: user.id
        })
        .select()
        .single();
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    // Audit Log
    const { logAudit } = await import('@/lib/audit');
    await logAudit('CREATE_EXPENSE', `expenses/${data.id}`, { amount: body.amount, category: body.category });

    return NextResponse.json(data);
}
