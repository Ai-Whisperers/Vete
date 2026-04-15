import { useServer } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { SupplierService } from '@/lib/domain/suppliers/service';
import type { Supplier, CreateSupplierData, UpdateSupplierData } from '@/lib/domain/suppliers/types';

export async function GET() {
  const supabase = createClient();
  const service = new SupplierService(supabase);

  const suppliers = await service.getSuppliers();

  return new Response(JSON.stringify(suppliers), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST({ request }: { request: Request }) {
  const supabase = createClient();
  const service = new SupplierService(supabase);

  const data: CreateSupplierData = await request.json();

  const supplier = await service.createSupplier(data);

  return new Response(JSON.stringify(supplier), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 201,
  });
}

export async function PATCH({ request, params }: { request: Request; params: { id: string } }) {
  const supabase = createClient();
  const service = new SupplierService(supabase);

  const data: UpdateSupplierData = await request.json();

  const supplier = await service.updateSupplier(params.id, data);

  return new Response(JSON.stringify(supplier), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function DELETE({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const service = new SupplierService(supabase);

  await service.deleteSupplier(params.id);

  return new Response(null, {
    status: 204,
  });
}