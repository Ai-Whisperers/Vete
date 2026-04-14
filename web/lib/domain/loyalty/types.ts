import { z } from 'zod';

export const LoyaltyPointsData = z.object({
  id: z.string(),
  client_id: z.string(),
  tenant_id: z.string(),
  balance: z.number(),
  lifetime_earned: z.number(),
  lifetime_redeemed: z.number(),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']),
});

export const LoyaltyTransactionData = z.object({
  id: z.string(),
  tenant_id: z.string(),
  client_id: z.string(),
  points: z.number(),
  type: z.enum(['earn', 'redeem', 'expire', 'adjust', 'bonus']),
  description: z.string(),
  invoice_id: z.string().nullable(),
  order_id: z.string().nullable(),
  balance_after: z.number(),
  expires_at: z.string().nullable(),
});

export type LoyaltyPoints = z.infer<typeof LoyaltyPointsData>;
export type LoyaltyTransaction = z.infer<typeof LoyaltyTransactionData>;