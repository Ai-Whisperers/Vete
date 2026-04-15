import { z } from 'zod';

export const SupplierStatus = z.enum(['active', 'inactive', 'pending']);
export type SupplierStatus = z.infer<typeof SupplierStatus>;

export const Supplier = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  status: SupplierStatus,
  created_at: z.date(),
  updated_at: z.date(),
});
export type Supplier = z.infer<typeof Supplier>;

export const CreateSupplierData = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
});
export type CreateSupplierData = z.infer<typeof CreateSupplierData>;

export const UpdateSupplierData = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});
export type UpdateSupplierData = z.infer<typeof UpdateSupplierData>;

export const SupplierFilters = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: SupplierStatus.optional(),
});
export type SupplierFilters = z.infer<typeof SupplierFilters>;