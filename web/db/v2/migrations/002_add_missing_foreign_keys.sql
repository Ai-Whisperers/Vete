-- =============================================================================
-- 002_ADD_MISSING_FOREIGN_KEYS.SQL
-- =============================================================================
BEGIN;

DO $$ BEGIN
    ALTER TABLE public.invoice_items ADD CONSTRAINT invoice_items_product_fk
    FOREIGN KEY (product_id) REFERENCES public.store_products(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.hospitalizations ADD CONSTRAINT hospitalizations_invoice_fk
    FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_table THEN NULL; END $$;

COMMIT;
