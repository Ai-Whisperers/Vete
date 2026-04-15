import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PolicyService } from '@/lib/domain/core/policies/service';

export async function GET(request: Request) {
  const tenantId = request.nextUrl.searchParams.get('tenantId');
  const policyService = new PolicyService(await createClient());

  const policies = await policyService.getPolicies(tenantId);

  return NextResponse.json(policies);
}

export async function POST(request: Request) {
  const tenantId = request.nextUrl.searchParams.get('tenantId');
  const policyService = new PolicyService(await createClient());
  const data = await request.json();

  const policy = await policyService.createPolicy(data, 'system', tenantId);

  return NextResponse.json(policy);
}

export async function PATCH(request: Request) {
  const tenantId = request.nextUrl.searchParams.get('tenantId');
  const policyId = request.nextUrl.searchParams.get('policyId');
  const policyService = new PolicyService(await createClient());
  const data = await request.json();

  const policy = await policyService.updatePolicy(policyId, data, 'system', tenantId);

  return NextResponse.json(policy);
}

Note: The above implementation is based on the provided patterns and may require adjustments according to your specific requirements. Additionally, error handling and validation have been kept minimal for brevity. You should consider adding more robust error handling and validation mechanisms in a production-ready implementation.