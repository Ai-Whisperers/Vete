-- =============================================================================
-- 03_INVITES.SQL
-- =============================================================================
-- Clinic invite system for onboarding new users to specific tenants.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.clinic_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Invite details
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'vet', 'admin')),

    -- Invite metadata
    invited_by UUID REFERENCES public.profiles(id),
    message TEXT,

    -- Status
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    used_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT clinic_invites_email_format CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.clinic_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage invites" ON public.clinic_invites;
CREATE POLICY "Staff manage invites" ON public.clinic_invites
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Service role full access" ON public.clinic_invites;
CREATE POLICY "Service role full access" ON public.clinic_invites
    FOR ALL TO service_role USING (true);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_clinic_invites_tenant ON public.clinic_invites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clinic_invites_email ON public.clinic_invites(email);
CREATE INDEX IF NOT EXISTS idx_clinic_invites_pending ON public.clinic_invites(email, expires_at)
    WHERE used_at IS NULL;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Create invite function
CREATE OR REPLACE FUNCTION public.create_clinic_invite(
    p_tenant_id TEXT,
    p_email TEXT,
    p_role TEXT DEFAULT 'owner',
    p_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_invite_id UUID;
BEGIN
    -- Check if user already exists in this tenant
    IF EXISTS (
        SELECT 1 FROM public.profiles
        WHERE email = p_email
        AND tenant_id = p_tenant_id
        AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'User already belongs to this clinic';
    END IF;

    -- Delete any existing pending invites for this email/tenant
    DELETE FROM public.clinic_invites
    WHERE email = p_email AND tenant_id = p_tenant_id AND used_at IS NULL;

    -- Create new invite
    INSERT INTO public.clinic_invites (tenant_id, email, role, invited_by, message)
    VALUES (p_tenant_id, p_email, p_role, auth.uid(), p_message)
    RETURNING id INTO v_invite_id;

    RETURN v_invite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check invite validity
CREATE OR REPLACE FUNCTION public.check_invite(p_email TEXT)
RETURNS TABLE (
    tenant_id TEXT,
    tenant_name TEXT,
    role TEXT,
    expires_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT ci.tenant_id, t.name, ci.role, ci.expires_at
    FROM public.clinic_invites ci
    JOIN public.tenants t ON t.id = ci.tenant_id
    WHERE ci.email = p_email
    AND ci.used_at IS NULL
    AND (ci.expires_at IS NULL OR ci.expires_at > NOW())
    ORDER BY ci.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
