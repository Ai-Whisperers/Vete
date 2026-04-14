import { NextRequest } from 'next/server';
import { InventoryService } from '@/lib/domain/inventory/service';

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenantId');
  const filters = request.nextUrl.searchParams.get('filters');

  const service = new InventoryService(request.supabase);
  const inventory = await service.list(tenantId, filters);

  return new Response(JSON.stringify(inventory), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get('tenantId');
  const data = await request.json();

  const service = new InventoryService(request.supabase);
  const inventory = await service.create(data);

  return new Response(JSON.stringify(inventory), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

#### Components

We will create components to display inventory data and handle user interactions.