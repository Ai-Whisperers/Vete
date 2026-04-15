import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/client';
import { SurgeryService } from '@/lib/domain/core/surgeries/service';
import type { CreateSurgeryData, UpdateSurgeryData } from '@/lib/domain/core/surgeries/types';

const supabase = createClient();

const surgeryService = new SurgeryService();

export async function getSurgeries(req: NextApiRequest, res: NextApiResponse) {
  const tenantId = req.query.tenantId as string;
  const surgeries = await surgeryService.getSurgeries({}, tenantId);
  return res.json(surgeries);
}

export async function createSurgery(req: NextApiRequest, res: NextApiResponse) {
  const { type, surgeonId, roomId, equipmentNeeds, scheduledStartTime, scheduledEndTime } = req.body as CreateSurgeryData;
  const userId = req.user?.id as string;
  const tenantId = req.query.tenantId as string;
  const surgery = await surgeryService.createSurgery({ type, surgeonId, roomId, equipmentNeeds, scheduledStartTime, scheduledEndTime }, userId, tenantId);
  return res.json(surgery);
}

export async function updateSurgery(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  const { type, surgeonId, roomId, equipmentNeeds, scheduledStartTime, scheduledEndTime } = req.body as UpdateSurgeryData;
  const userId = req.user?.id as string;
  const tenantId = req.query.tenantId as string;
  const surgery = await surgeryService.updateSurgery(id, { type, surgeonId, roomId, equipmentNeeds, scheduledStartTime, scheduledEndTime }, userId, tenantId);
  return res.json(surgery);
}