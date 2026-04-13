-- FIX DB-10: Add service_role RLS policy for store_carts
-- Backend/admin operations using service_role key need access to carts

CREATE POLICY "Service role full access on store_carts" ON public.store_carts
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);
