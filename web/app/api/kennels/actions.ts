import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { KennelService } from '@/lib/domain/core/kennels/service';
import type { CreateKennelData, UpdateKennelData, KennelFilters } from '@/lib/domain/core/kennels/types';

export async function getKennels(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerClient();
  const service = new KennelService(supabase);
  const filters: KennelFilters = req.query;
  const tenantId = req.headers['x-tenant-id'] as string;

  try {
    const kennels = await service.getKennels(filters, tenantId);
    res.status(200).json(kennels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching kennels' });
  }
}

export async function createKennel(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerClient();
  const service = new KennelService(supabase);
  const data: CreateKennelData = req.body;
  const userId = req.headers['x-user-id'] as string;
  const tenantId = req.headers['x-tenant-id'] as string;

  try {
    const kennel = await service.createKennel(data, userId, tenantId);
    res.status(201).json(kennel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating kennel' });
  }
}

export async function updateKennel(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerClient();
  const service = new KennelService(supabase);
  const id = req.query.id as string;
  const data: UpdateKennelData = req.body;
  const userId = req.headers['x-user-id'] as string;
  const tenantId = req.headers['x-tenant-id'] as string;

  try {
    const kennel = await service.updateKennel(id, data, userId, tenantId);
    res.status(200).json(kennel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating kennel' });
  }
}

### API Routes