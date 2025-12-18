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

    // TICKET-SEC-005: Auth check first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get user profile with tenant
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

    if (!profile || !['vet', 'admin'].includes(profile.role)) {
        return NextResponse.json({ error: 'Solo el personal puede registrar gastos' }, { status: 403 });
    }

    const body = await request.json();

    // TICKET-SEC-005: Explicitly destructure allowed fields - don't spread body
    const { amount, category, description, date, vendor, notes, receipt_url } = body;

    // Validate required fields
    if (!amount || !category || !date) {
        return NextResponse.json({ error: 'Monto, categoría y fecha son requeridos' }, { status: 400 });
    }

    // Validate amount is positive number
    if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ error: 'El monto debe ser un número positivo' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('expenses')
        .insert({
            clinic_id: profile.tenant_id, // Server-controlled tenant_id
            amount,
            category,
            description: description || null,
            date,
            vendor: vendor || null,
            notes: notes || null,
            receipt_url: receipt_url || null,
            created_by: user.id
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Audit Log
    const { logAudit } = await import('@/lib/audit');
    await logAudit('CREATE_EXPENSE', `expenses/${data.id}`, { amount, category });

    return NextResponse.json(data);
}
