import { useServer } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { QrPaymentService } from '@/lib/domain/core/qr-payments/service';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const service = new QrPaymentService(supabase);

  const tenantId = 'your-tenant-id'; // Replace with actual tenant ID
  const filters: QrPaymentFilters = {}; // Replace with actual filters

  const qrPayments = await service.getQrPayments(tenantId, filters);

  return new Response(JSON.stringify(qrPayments), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const service = new QrPaymentService(supabase);

  const tenantId = 'your-tenant-id'; // Replace with actual tenant ID
  const input: CreateQrPaymentInput = await request.json();

  const qrPayment = await service.createQrPayment(tenantId, input);

  return new Response(JSON.stringify(qrPayment), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
Note: You should replace `'your-tenant-id'` with the actual tenant ID and implement the necessary authentication and authorization mechanisms to secure the API endpoints.