-- =============================================================================
-- 001_ADD_TENANT_ID_TO_CHILD_TABLES.SQL
-- =============================================================================
-- Adds tenant_id to child tables for better RLS performance.
-- =============================================================================

BEGIN;

-- Helper function for hospitalization children
CREATE OR REPLACE FUNCTION public.get_hospitalization_tenant(p_hosp_id UUID)
RETURNS TEXT AS $$
    SELECT tenant_id FROM public.hospitalizations WHERE id = p_hosp_id;
$$ LANGUAGE sql STABLE;

-- =============================================================================
-- VACCINES
-- =============================================================================
ALTER TABLE public.vaccines ADD COLUMN IF NOT EXISTS tenant_id TEXT;

UPDATE public.vaccines v SET tenant_id = p.tenant_id
FROM public.pets p WHERE v.pet_id = p.id AND v.tenant_id IS NULL;

DO $$ BEGIN
    ALTER TABLE public.vaccines ALTER COLUMN tenant_id SET NOT NULL;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.vaccines ADD CONSTRAINT vaccines_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_vaccines_tenant ON public.vaccines(tenant_id);

CREATE OR REPLACE FUNCTION public.vaccines_set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        SELECT tenant_id INTO NEW.tenant_id FROM public.pets WHERE id = NEW.pet_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vaccines_auto_tenant ON public.vaccines;
CREATE TRIGGER vaccines_auto_tenant BEFORE INSERT ON public.vaccines
    FOR EACH ROW EXECUTE FUNCTION public.vaccines_set_tenant_id();

-- =============================================================================
-- VACCINE_REACTIONS
-- =============================================================================
ALTER TABLE public.vaccine_reactions ADD COLUMN IF NOT EXISTS tenant_id TEXT;

UPDATE public.vaccine_reactions vr SET tenant_id = p.tenant_id
FROM public.pets p WHERE vr.pet_id = p.id AND vr.tenant_id IS NULL;

DO $$ BEGIN
    ALTER TABLE public.vaccine_reactions ADD CONSTRAINT vaccine_reactions_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_vaccine_reactions_tenant ON public.vaccine_reactions(tenant_id);

-- =============================================================================
-- HOSPITALIZATION CHILD TABLES
-- =============================================================================
DO $$
DECLARE
    tables TEXT[] := ARRAY[
        'hospitalization_vitals',
        'hospitalization_medications',
        'hospitalization_treatments',
        'hospitalization_feedings',
        'hospitalization_notes'
    ];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id TEXT', tbl);

        EXECUTE format(
            'UPDATE public.%I ht SET tenant_id = h.tenant_id
             FROM public.hospitalizations h
             WHERE ht.hospitalization_id = h.id AND ht.tenant_id IS NULL', tbl
        );

        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS idx_%I_tenant ON public.%I(tenant_id)', tbl, tbl
        );
    END LOOP;
END $$;

-- =============================================================================
-- INVOICE_ITEMS
-- =============================================================================
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS tenant_id TEXT;

UPDATE public.invoice_items ii SET tenant_id = i.tenant_id
FROM public.invoices i WHERE ii.invoice_id = i.id AND ii.tenant_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_items_tenant ON public.invoice_items(tenant_id);

-- =============================================================================
-- STORE_CAMPAIGN_ITEMS
-- =============================================================================
ALTER TABLE public.store_campaign_items ADD COLUMN IF NOT EXISTS tenant_id TEXT;

UPDATE public.store_campaign_items sci SET tenant_id = sc.tenant_id
FROM public.store_campaigns sc WHERE sci.campaign_id = sc.id AND sci.tenant_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_store_campaign_items_tenant ON public.store_campaign_items(tenant_id);

-- =============================================================================
-- QR_TAG_SCANS
-- =============================================================================
ALTER TABLE public.qr_tag_scans ADD COLUMN IF NOT EXISTS tenant_id TEXT;

UPDATE public.qr_tag_scans qts SET tenant_id = qt.tenant_id
FROM public.qr_tags qt WHERE qts.tag_id = qt.id AND qts.tenant_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_qr_tag_scans_tenant ON public.qr_tag_scans(tenant_id);

COMMIT;
