-- FIX DB-8: Remove 'OR true' from tenants RLS policy
-- This was allowing any authenticated user to see ALL tenants

DROP POLICY IF EXISTS "Authenticated users view own tenant" ON public.tenants;

CREATE POLICY "Authenticated users view own tenant" ON public.tenants
    FOR SELECT TO authenticated
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.tenant_id = tenants.id
        )
    );
