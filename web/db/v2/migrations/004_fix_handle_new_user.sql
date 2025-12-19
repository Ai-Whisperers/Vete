-- =============================================================================
-- 004_FIX_HANDLE_NEW_USER.SQL - Removes hardcoded demo emails
-- =============================================================================
BEGIN;

CREATE TABLE IF NOT EXISTS public.demo_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'vet', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.demo_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manage demo accounts" ON public.demo_accounts FOR ALL TO service_role USING (true);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    invite_record RECORD; demo_record RECORD; v_tenant_id TEXT; v_role TEXT;
BEGIN
    SELECT tenant_id, role INTO invite_record FROM public.clinic_invites
    WHERE email = NEW.email AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC LIMIT 1;

    IF invite_record.tenant_id IS NOT NULL THEN
        v_tenant_id := invite_record.tenant_id;
        v_role := COALESCE(invite_record.role, 'owner');
        DELETE FROM public.clinic_invites WHERE email = NEW.email;
    ELSE
        SELECT tenant_id, role INTO demo_record FROM public.demo_accounts
        WHERE email = NEW.email AND is_active = true;
        IF demo_record.tenant_id IS NOT NULL THEN
            v_tenant_id := demo_record.tenant_id;
            v_role := demo_record.role;
        ELSE
            v_tenant_id := NULL;
            v_role := 'owner';
        END IF;
    END IF;

    INSERT INTO public.profiles (id, full_name, email, avatar_url, tenant_id, role) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        v_tenant_id,
        v_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed demo accounts (for development only - DELETE IN PRODUCTION)
INSERT INTO public.demo_accounts (email, tenant_id, role) VALUES
    ('admin@demo.com', 'adris', 'admin'),
    ('vet@demo.com', 'adris', 'vet'),
    ('owner@demo.com', 'adris', 'owner'),
    ('admin@petlife.com', 'petlife', 'admin')
ON CONFLICT (email) DO NOTHING;

COMMIT;
