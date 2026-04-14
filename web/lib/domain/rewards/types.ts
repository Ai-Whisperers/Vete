import { z } from 'zod';

export type RewardType = 'discount' | 'free_service' | 'product';
export type RewardStatus = 'available' | 'redeemed' | 'expired';

export const Reward = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(RewardType),
  points_required: z.number(),
  status: z.enum(RewardStatus),
  expires_at: z.date().optional(),
});

export const CreateRewardData = z.object({
  name: z.string(),
  description: z.string(),
  type: z.enum(RewardType),
  points_required: z.number(),
  expires_at: z.date().optional(),
});

export const UpdateRewardData = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  points_required: z.number().optional(),
  expires_at: z.date().optional(),
});

export const RewardFilters = z.object({
  type: z.enum(RewardType).optional(),
  status: z.enum(RewardStatus).optional(),
});

export const Redemption = z.object({
  id: z.string(),
  reward_id: z.string(),
  user_id: z.string(),
  redeemed_at: z.date(),
});

export const CreateRedemptionData = z.object({
  reward_id: z.string(),
  user_id: z.string(),
});

#### Repository