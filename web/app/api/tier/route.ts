import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/client'
import { TierService } from '@/lib/domain/tier/service'

const supabase = createClient()

const tierService = new TierService(supabase)

export async function getTiers(req: NextApiRequest, res: NextApiResponse) {
  const tiers = await tierService.getTiers({}, req.query.tenantId as string)
  return res.json(tiers)
}

export async function getTier(req: NextApiRequest, res: NextApiResponse) {
  const tier = await tierService.getTier(req.query.id as string, req.query.tenantId as string)
  return res.json(tier)
}

export async function createTier(req: NextApiRequest, res: NextApiResponse) {
  const tier = await tierService.createTier(req.body, req.query.userId as string, req.query.tenantId as string)
  return res.json(tier)
}

export async function updateTier(req: NextApiRequest, res: NextApiResponse) {
  const tier = await tierService.updateTier(req.query.id as string, req.body, req.query.userId as string, req.query.tenantId as string)
  return res.json(tier)
}