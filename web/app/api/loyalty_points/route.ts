import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';

export const GET = withAuth(async ({ request, user, profile, supabase }) => {
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
    const isStaff = ['vet', 'admin'].includes(profile.role) && pet.tenant_id === profile.tenant_id;

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
});

export const POST = withAuth(async ({ request, user, profile, supabase }) => {
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

    if (pet.tenant_id !== profile.tenant_id) {
        return NextResponse.json({ error: 'No tienes acceso a esta mascota' }, { status: 403 });
    }

    // TICKET-BIZ-007: Check balance before allowing negative points
    if (points < 0) {
        const { data: transactions } = await supabase
            .from('loyalty_transactions')
            .select('points')
            .eq('pet_id', petId);

        const currentBalance = transactions?.reduce((sum, t) => sum + t.points, 0) || 0;

        if (currentBalance + points < 0) {
            return NextResponse.json({
                error: `Saldo insuficiente. Balance actual: ${currentBalance} puntos`
            }, { status: 400 });
        }
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
}, { roles: ['vet', 'admin'] });
