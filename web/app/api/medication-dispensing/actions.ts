import { useServer } from 'next/server';
import { DispenseService } from '@/lib/domain/medication-dispensing/service';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const service = new DispenseService(supabase);

  const dispenses = await service.getDispenses('tenant-123');

  return new Response(JSON.stringify(dispenses), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST({ request }) {
  const supabase = createClient();
  const service = new DispenseService(supabase);

  const data = await request.json();

  const dispense = await service.createDispense(data, 'user-123', 'tenant-123');

  return new Response(JSON.stringify(dispense), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 201,
  });
}

#### Database Schema

The database schema for the `dispenses` table is as follows:

CREATE TABLE dispenses (
  id UUID PRIMARY KEY,
  prescription_id UUID NOT NULL,
  medication_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  dispensed_at TIMESTAMP,
  dispensed_by UUID,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

Note that this implementation assumes a basic understanding of the Next.js framework, Supabase, and the domain layer architecture. You may need to modify the code to fit your specific use case.