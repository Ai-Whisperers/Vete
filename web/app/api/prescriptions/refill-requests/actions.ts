import { NextRequest } from 'next/server';
import { PrescriptionService } from '../../../lib/domain/core/prescriptions/service';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  const tenantId = searchParams.get('tenantId');

  if (!id || !tenantId) {
    return new Response('Invalid request', { status: 400 });
  }

  const service = new PrescriptionService(request.context.supabase);
  const refillRequest = await service.getRefillRequest(id, tenantId);

  if (!refillRequest) {
    return new Response('Refill request not found', { status: 404 });
  }

  return new Response(JSON.stringify(refillRequest), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request: NextRequest) {
  const { json } = await request.next();
  const { prescriptionId, petId, quantity, notes } = json;

  if (!prescriptionId || !petId || !quantity) {
    return new Response('Invalid request', { status: 400 });
  }

  const service = new PrescriptionService(request.context.supabase);
  const refillRequest = await service.createRefillRequest({ prescriptionId, petId, quantity, notes }, request.context.tenantId);

  return new Response(JSON.stringify(refillRequest), { status: 201, headers: { 'Content-Type': 'application/json' } });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  const tenantId = searchParams.get('tenantId');

  if (!id || !tenantId) {
    return new Response('Invalid request', { status: 400 });
  }

  const { json } = await request.next();
  const { status, notes } = json;

  if (!status) {
    return new Response('Invalid request', { status: 400 });
  }

  const service = new PrescriptionService(request.context.supabase);
  const refillRequest = await service.updateRefillRequest(id, { status, notes }, tenantId);

  return new Response(JSON.stringify(refillRequest), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

#### Database Schema

You need to add the following tables to your database schema:

CREATE TABLE refill_requests (
  id UUID PRIMARY KEY,
  prescription_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  notes TEXT,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refill_requests_prescription_id ON refill_requests (prescription_id);
CREATE INDEX idx_refill_requests_pet_id ON refill_requests (pet_id);
CREATE INDEX idx_refill_requests_tenant_id ON refill_requests (tenant_id);