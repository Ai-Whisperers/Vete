import { z } from 'zod';

export const QrPaymentStatus = z.enum(['pending', 'paid', 'failed']);
export type QrPaymentStatus = z.infer<typeof QrPaymentStatus>;

export const QrPayment = z.object({
  id: z.string(),
  tenantId: z.string(),
  invoiceId: z.string(),
  amount: z.number(),
  status: QrPaymentStatus,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type QrPayment = z.infer<typeof QrPayment>;

export const CreateQrPaymentInput = z.object({
  invoiceId: z.string(),
  amount: z.number(),
});
export type CreateQrPaymentInput = z.infer<typeof CreateQrPaymentInput>;

export const QrPaymentFilters = z.object({
  invoiceId: z.string().optional(),
  status: QrPaymentStatus.optional(),
});
export type QrPaymentFilters = z.infer<typeof QrPaymentFilters>;