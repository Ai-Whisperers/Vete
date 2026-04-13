-- FIX: Add voided_at and voided_by columns to invoices
-- Required by the invoice voiding feature (void.ts)

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS voided_by UUID REFERENCES public.profiles(id);
