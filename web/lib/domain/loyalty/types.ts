import { z } from 'zod';

export enum LoyaltyTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export const LoyaltyPointsSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  tenantId: z.string(),
  balance: z.number(),
  lifetimeEarned: z.number(),
  lifetimeRedeemed: z.number(),
  tier: z.nativeEnum(LoyaltyTier),
});

export type LoyaltyPoints = z.infer<typeof LoyaltyPointsSchema>;

export const LoyaltyTransactionSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  clientId: z.string(),
  points: z.number(),
  type: z.string(),
  description: z.string(),
  invoiceId: z.string().nullable(),
  orderId: z.string().nullable(),
  balanceAfter: z.number(),
  expiresAt: z.string().nullable(),
});

export type LoyaltyTransaction = z.infer<typeof LoyaltyTransactionSchema>;

export const LoyaltyRewardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  pointsRequired: z.number(),
  expiresAt: z.string().nullable(),
});

export type LoyaltyReward = z.infer<typeof LoyaltyRewardSchema>;