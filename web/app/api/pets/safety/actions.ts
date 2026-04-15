import { useServer } from 'next/server';
import { SafetyService } from '../../../lib/domain/verticals/clinic/safety/service';
import { createClient } from '../../../lib/supabase/server';

export async function POST({ request, tenantId }: { request: Request; tenantId: string }) {
  const supabase = createClient();
  const safetyService = new SafetyService(supabase);

  const data = await request.json();
  const lostPet = await safetyService.reportLostPet(data, tenantId);

  return new Response(JSON.stringify(lostPet), { status: 201, headers: { 'Content-Type': 'application/json' } });
}

export async function PATCH({ params, request, tenantId }: { params: { id: string }; request: Request; tenantId: string }) {
  const supabase = createClient();
  const safetyService = new SafetyService(supabase);

  const data = await request.json();
  const lostPet = await safetyService.updateLostPet(params.id, data, tenantId);

  return new Response(JSON.stringify(lostPet), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

### Client-Side Components