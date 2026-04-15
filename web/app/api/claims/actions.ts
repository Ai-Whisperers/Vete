import { NextRequest } from 'next/server';
import { ClaimService } from '@/lib/domain/claims/service';

export async function GET(request: NextRequest) {
  const claimService = new ClaimService(request.supabase);
  const claimId = request.nextUrl.searchParams.get('id');
  const tenantId = request.nextUrl.searchParams.get('tenantId');

  if (!claimId || !tenantId) {
    return new Response('Invalid request', { status: 400 });
  }

  const claim = await claimService.getClaim(claimId, tenantId);

  if (!claim) {
    return new Response('Claim not found', { status: 404 });
  }

  return new Response(JSON.stringify(claim), { status: 200 });
}

export async function POST(request: NextRequest) {
  const claimService = new ClaimService(request.supabase);
  const data = await request.json();

  try {
    const claim = await claimService.createClaim(data, request.userId, request.tenantId);
    return new Response(JSON.stringify(claim), { status: 201 });
  } catch (error) {
    return new Response('Error creating claim', { status: 500 });
  }
}

#### Database Schema

The database schema for the claims table is as follows:

CREATE TABLE claims (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  policy_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  claim_number VARCHAR(255) NOT NULL,
  claim_type VARCHAR(255) NOT NULL,
  date_of_service DATE NOT NULL,
  diagnosis VARCHAR(255) NOT NULL,
  diagnosis_code VARCHAR(255) NOT NULL,
  treatment_description VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

Note: The above implementation is a basic example and may need to be modified to fit the specific requirements of your application. Additionally, you may need to add additional error handling and validation to ensure the robustness of your application.