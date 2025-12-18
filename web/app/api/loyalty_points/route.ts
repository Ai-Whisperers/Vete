import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();

    // Authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id:tenant_id, role')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');

    if (!petId) {
        return NextResponse.json({ error: 'Falta petId' }, { status: 400 });
    }

    // Verify access to pet
    const { data: pet } = await supabase
        .from('pets')
        .select('id, owner_id, tenant_id')
        .eq('id', petId)
        .single();

    if (!pet) {
        return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
    }

    const isOwner = pet.owner_id === user.id;
    const isStaff = ['vet', 'admin'].includes(profile.role) && pet.tenant_id === profile.clinic_id;

    if (!isOwner && !isStaff) {
        return NextResponse.json({ error: 'No tienes acceso a esta mascota' }, { status: 403 });
    }

    // Sum points for the pet
    const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('points')
        .eq('pet_id', petId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const balance = data.reduce((sum, txn) => sum + txn.points, 0);

    return NextResponse.json({ balance });
}

export async function POST(request: Request) {
    const supabase = await createClient();

    // Authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get user profile - only staff can add loyalty points
    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id:tenant_id, role')
        .eq('id', user.id)
        .single();

    if (!profile || !['vet', 'admin'].includes(profile.role)) {
        return NextResponse.json({ error: 'Solo el personal puede agregar puntos' }, { status: 403 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    const { petId, points, description } = body;

    if (!petId || points === undefined) {
        return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    // Verify pet belongs to staff's clinic
    const { data: pet } = await supabase
        .from('pets')
        .select('id, tenant_id')
        .eq('id', petId)
        .single();

    if (!pet) {
        return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
    }

    if (pet.tenant_id !== profile.clinic_id) {
        return NextResponse.json({ error: 'No tienes acceso a esta mascota' }, { status: 403 });
    }

    const { data, error } = await supabase
        .from('loyalty_transactions')
        .insert({
            pet_id: petId,
            points,
            description,
            created_by: user.id
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
