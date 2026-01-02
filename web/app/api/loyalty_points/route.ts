import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

export const GET = withAuth(async ({ request, user, profile, supabase }) => {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');

    if (!petId) {
        return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { field: 'petId' } });
    }

    // Verify access to pet
    const { data: pet } = await supabase
        .from('pets')
        .select('id, owner_id, tenant_id')
        .eq('id', petId)
        .single();

    if (!pet) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND);
    }

    const isOwner = pet.owner_id === user.id;
    const isStaff = ['vet', 'admin'].includes(profile.role) && pet.tenant_id === profile.tenant_id;

    if (!isOwner && !isStaff) {
        return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN);
    }

    // Loyalty points are tracked per client (user), not per pet
    // Query by client_id (pet owner) instead of pet_id
    const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('points')
        .eq('client_id', pet.owner_id)
        .eq('tenant_id', pet.tenant_id);

    if (error) {
        // Handle gracefully if column doesn't exist
        if (error.message.includes('does not exist')) {
            return NextResponse.json({ balance: 0 });
        }
        return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const balance = (data || []).reduce((sum, txn) => sum + (txn.points || 0), 0);

    return NextResponse.json({ balance });
});

export const POST = withAuth(async ({ request, user, profile, supabase }) => {
    let body;
    try {
        body = await request.json();
    } catch {
        return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST);
    }

    const { petId, clientId, points, description } = body;

    // Support both petId (for backwards compat) and clientId
    if ((!petId && !clientId) || points === undefined) {
        return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { required: ['petId or clientId', 'points'] } });
    }

    let targetClientId = clientId;
    let targetTenantId = profile.tenant_id;

    // If petId provided, get the owner
    if (petId) {
        const { data: pet } = await supabase
            .from('pets')
            .select('id, owner_id, tenant_id')
            .eq('id', petId)
            .single();

        if (!pet) {
            return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND);
        }

        if (pet.tenant_id !== profile.tenant_id) {
            return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN);
        }

        targetClientId = pet.owner_id;
        targetTenantId = pet.tenant_id;
    }

    // TICKET-BIZ-007: Check balance before allowing negative points
    if (points < 0) {
        const { data: transactions } = await supabase
            .from('loyalty_transactions')
            .select('points')
            .eq('client_id', targetClientId)
            .eq('tenant_id', targetTenantId);

        const currentBalance = transactions?.reduce((sum, t) => sum + t.points, 0) || 0;

        if (currentBalance + points < 0) {
            return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, { details: { reason: `Saldo insuficiente. Balance actual: ${currentBalance} puntos` } });
        }
    }

    const { data, error } = await supabase
        .from('loyalty_transactions')
        .insert({
            tenant_id: targetTenantId,
            client_id: targetClientId,
            type: points > 0 ? 'earn' : 'redeem',
            points,
            description
        })
        .select()
        .single();

    if (error) {
        return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return NextResponse.json(data, { status: 201 });
}, { roles: ['vet', 'admin'] });
