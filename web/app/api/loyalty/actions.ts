import { useServer } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LoyaltyService } from '@/lib/domain/loyalty/service';

export async function getLoyaltyPoints(request: Request) {
  const supabase = createClient();
  const loyaltyService = new LoyaltyService(supabase);

  const clientId = await getClientIdFromRequest(request);
  const tenantId = await getTenantIdFromRequest(request);

  const loyaltyPoints = await loyaltyService.getLoyaltyPoints(clientId, tenantId);

  return new Response(JSON.stringify(loyaltyPoints), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function createLoyaltyPoints(request: Request) {
  const supabase = createClient();
  const loyaltyService = new LoyaltyService(supabase);

  const clientId = await getClientIdFromRequest(request);
  const tenantId = await getTenantIdFromRequest(request);

  const data = await request.json();

  const loyaltyPoints = await loyaltyService.createLoyaltyPoints({
    ...data,
    client_id: clientId,
    tenant_id: tenantId,
  });

  return new Response(JSON.stringify(loyaltyPoints), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function updateLoyaltyPoints(request: Request) {
  const supabase = createClient();
  const loyaltyService = new LoyaltyService(supabase);

  const clientId = await getClientIdFromRequest(request);
  const tenantId = await getTenantIdFromRequest(request);

  const data = await request.json();

  const loyaltyPoints = await loyaltyService.updateLoyaltyPoints(data.id, {
    ...data,
    client_id: clientId,
    tenant_id: tenantId,
  });

  return new Response(JSON.stringify(loyaltyPoints), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function getLoyaltyTransactions(request: Request) {
  const supabase = createClient();
  const loyaltyService = new LoyaltyService(supabase);

  const clientId = await getClientIdFromRequest(request);
  const tenantId = await getTenantIdFromRequest(request);

  const loyaltyTransactions = await loyaltyService.getLoyaltyTransactions(clientId, tenantId);

  return new Response(JSON.stringify(loyaltyTransactions), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function createLoyaltyTransaction(request: Request) {
  const supabase = createClient();
  const loyaltyService = new LoyaltyService(supabase);

  const clientId = await getClientIdFromRequest(request);
  const tenantId = await getTenantIdFromRequest(request);

  const data = await request.json();

  const loyaltyTransaction = await loyaltyService.createLoyaltyTransaction({
    ...data,
    client_id: clientId,
    tenant_id: tenantId,
  });

  return new Response(JSON.stringify(loyaltyTransaction), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

#### API Routes

We will create API routes to handle loyalty points engine requests.