-- =============================================================================
-- 007_OPTIMIZE_RLS_POLICIES.SQL - Use direct tenant_id checks
-- =============================================================================
BEGIN;

-- Staff lookup index
CREATE INDEX IF NOT EXISTS idx_profiles_staff_lookup ON public.profiles(id, tenant_id, role)
    WHERE role IN ('vet', 'admin') AND deleted_at IS NULL;

-- Pet ownership index
CREATE INDEX IF NOT EXISTS idx_pets_owner_lookup ON public.pets(id, owner_id) WHERE deleted_at IS NULL;

-- Vaccines
DROP POLICY IF EXISTS "Staff manage vaccines" ON public.vaccines;
CREATE POLICY "Staff manage vaccines" ON public.vaccines FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

-- Vaccine reactions
DROP POLICY IF EXISTS "Staff manage reactions" ON public.vaccine_reactions;
CREATE POLICY "Staff manage reactions" ON public.vaccine_reactions FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- Hospitalization children
DROP POLICY IF EXISTS "Staff manage vitals" ON public.hospitalization_vitals;
CREATE POLICY "Staff manage vitals" ON public.hospitalization_vitals FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff manage medications" ON public.hospitalization_medications;
CREATE POLICY "Staff manage medications" ON public.hospitalization_medications FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff manage treatments" ON public.hospitalization_treatments;
CREATE POLICY "Staff manage treatments" ON public.hospitalization_treatments FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff manage feedings" ON public.hospitalization_feedings;
CREATE POLICY "Staff manage feedings" ON public.hospitalization_feedings FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff manage notes" ON public.hospitalization_notes;
CREATE POLICY "Staff manage notes" ON public.hospitalization_notes FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- Invoice items
DROP POLICY IF EXISTS "Staff manage invoice items" ON public.invoice_items;
CREATE POLICY "Staff manage invoice items" ON public.invoice_items FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- Campaign items
DROP POLICY IF EXISTS "Staff manage campaign items" ON public.store_campaign_items;
CREATE POLICY "Staff manage campaign items" ON public.store_campaign_items FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- QR tag scans
DROP POLICY IF EXISTS "Staff view scans" ON public.qr_tag_scans;
CREATE POLICY "Staff view scans" ON public.qr_tag_scans FOR SELECT TO authenticated
    USING (tenant_id IS NOT NULL AND public.is_staff_of(tenant_id));

-- Add service role policies
DO $$
DECLARE
    tables TEXT[] := ARRAY['vaccines','vaccine_reactions','hospitalization_vitals',
        'hospitalization_medications','hospitalization_treatments','hospitalization_feedings',
        'hospitalization_notes','invoice_items','store_campaign_items','qr_tag_scans'];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Service role full access" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Service role full access" ON public.%I FOR ALL TO service_role USING (true)', tbl);
    END LOOP;
END $$;

COMMIT;
