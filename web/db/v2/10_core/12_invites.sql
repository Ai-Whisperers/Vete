-- =============================================================================
-- 12_INVITES.SQL
-- =============================================================================
-- Clinic invitations for staff and pet owners.
-- When a user signs up with a matching email, they get the invited role.
--
-- Dependencies: 10_tenants.sql, 11_profiles.sql
-- =============================================================================

-- =============================================================================
-- A. TABLE DEFINITION
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.clinic_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tenant association
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Invite details
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'owner'
        CHECK (role IN ('owner', 'vet', 'admin')),

    -- Personalization
    invitee_name TEXT,
    message TEXT,

    -- Tracking
    invited_by UUID REFERENCES public.profiles(id),
    token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

    -- Status
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT clinic_invites_email_format CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT clinic_invites_unique_pending UNIQUE (tenant_id, email, status)
);

-- =============================================================================
-- B. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.clinic_invites ENABLE ROW LEVEL SECURITY;

-- Staff can view and manage invites for their tenant
CREATE POLICY "Staff manage invites" ON public.clinic_invites
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- Users can view their own pending invites (for acceptance flow)
CREATE POLICY "Users view own invites" ON public.clinic_invites
    FOR SELECT TO authenticated
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND status = 'pending'
    );

-- Service role has full access
CREATE POLICY "Service role full access" ON public.clinic_invites
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- C. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_invites_tenant ON public.clinic_invites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invites_email ON public.clinic_invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_token ON public.clinic_invites(token)
    WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_invites_pending ON public.clinic_invites(tenant_id, status)
    WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_invites_expires ON public.clinic_invites(expires_at)
    WHERE status = 'pending';

-- =============================================================================
-- D. TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.clinic_invites;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.clinic_invites
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- E. FUNCTIONS
-- =============================================================================

-- Expire old invites
CREATE OR REPLACE FUNCTION public.expire_old_invites()
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE public.clinic_invites
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending'
    AND expires_at < NOW();

    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- Create invite (with validation)
CREATE OR REPLACE FUNCTION public.create_clinic_invite(
    p_tenant_id TEXT,
    p_email TEXT,
    p_role TEXT DEFAULT 'owner',
    p_invitee_name TEXT DEFAULT NULL,
    p_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_invite_id UUID;
    v_existing UUID;
BEGIN
    -- Check for existing pending invite
    SELECT id INTO v_existing
    FROM public.clinic_invites
    WHERE tenant_id = p_tenant_id
    AND email = p_email
    AND status = 'pending';

    IF v_existing IS NOT NULL THEN
        RAISE EXCEPTION 'Pending invite already exists for this email';
    END IF;

    -- Check if user already exists in this tenant
    IF EXISTS (
        SELECT 1 FROM public.profiles
        WHERE email = p_email
        AND tenant_id = p_tenant_id
        AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'User already belongs to this clinic';
    END IF;

    -- Create invite
    INSERT INTO public.clinic_invites (
        tenant_id, email, role, invitee_name, message, invited_by
    ) VALUES (
        p_tenant_id, p_email, p_role, p_invitee_name, p_message, auth.uid()
    )
    RETURNING id INTO v_invite_id;

    RETURN v_invite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
