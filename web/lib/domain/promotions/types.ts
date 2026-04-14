import { z } from 'zod';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum PromoCodeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

export const PromoCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number(),
  usageLimit: z.number().optional(),
  expirationDate: z.date().optional(),
  status: z.nativeEnum(PromoCodeStatus),
});

export type PromoCode = z.infer<typeof PromoCodeSchema>;

export const CreatePromoCodeSchema = z.object({
  code: z.string(),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number(),
  usageLimit: z.number().optional(),
  expirationDate: z.date().optional(),
});

export type CreatePromoCodeData = z.infer<typeof CreatePromoCodeSchema>;

export const UpdatePromoCodeSchema = z.object({
  id: z.string(),
  code: z.string().optional(),
  discountType: z.nativeEnum(DiscountType).optional(),
  discountValue: z.number().optional(),
  usageLimit: z.number().optional(),
  expirationDate: z.date().optional(),
  status: z.nativeEnum(PromoCodeStatus).optional(),
});

export type UpdatePromoCodeData = z.infer<typeof UpdatePromoCodeSchema>;