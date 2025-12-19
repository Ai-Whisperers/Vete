-- =============================================================================
-- 86_AUDIT.SQL
-- =============================================================================
-- System audit, notifications, QR tags, and lost pets.
--
-- Dependencies: 10_core/*, 20_pets/*
-- =============================================================================

-- =============================================================================
-- A. AUDIT LOGS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Action info
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id UUID,

    -- Details
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}',

    -- Context
    ip_address INET,
    user_agent TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- B. NOTIFICATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    tenant_id TEXT REFERENCES public.tenants(id),

    -- Notification info
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,

    -- Reference
    reference_type TEXT,
    reference_id UUID,
    action_url TEXT,

    -- Status
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- C. QR TAGS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.qr_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES public.tenants(id),

    -- Tag code
    code TEXT NOT NULL UNIQUE,

    -- Assignment
    pet_id UUID REFERENCES public.pets(id),
    assigned_at TIMESTAMPTZ,
    assigned_by UUID REFERENCES public.profiles(id),

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_registered BOOLEAN DEFAULT false,

    -- Scan tracking
    last_scanned_at TIMESTAMPTZ,
    scan_count INTEGER DEFAULT 0,

    -- Creation
    batch_id TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- D. QR TAG SCANS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.qr_tag_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID NOT NULL REFERENCES public.qr_tags(id),

    -- Scan info
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,

    -- Location (if available)
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    location_accuracy NUMERIC,

    -- Contact attempt
    contact_attempted BOOLEAN DEFAULT false,
    contact_method TEXT,
    contact_details TEXT
);

-- =============================================================================
-- E. LOST PETS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.lost_pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Report info
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reported_by UUID REFERENCES public.profiles(id),

    -- Last seen
    last_seen_at TIMESTAMPTZ,
    last_seen_location TEXT,
    last_seen_latitude NUMERIC(10,7),
    last_seen_longitude NUMERIC(10,7),

    -- Description
    description TEXT,
    distinctive_features TEXT,
    wearing TEXT,  -- Collar, clothes, etc.

    -- Contact
    contact_phone TEXT,
    contact_email TEXT,
    reward_offered BOOLEAN DEFAULT false,
    reward_amount NUMERIC(12,2),

    -- Status
    status TEXT NOT NULL DEFAULT 'lost'
        CHECK (status IN ('lost', 'found', 'reunited', 'cancelled')),
    found_at TIMESTAMPTZ,
    found_by TEXT,
    found_location TEXT,

    -- Public visibility
    is_public BOOLEAN DEFAULT true,
    share_url TEXT,

    -- Photos
    photos TEXT[] DEFAULT '{}',

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- F. DISEASE REPORTS (Epidemiology)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.disease_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Report info
    diagnosis_code TEXT,
    diagnosis_name TEXT NOT NULL,
    species TEXT NOT NULL,

    -- Location
    location_zone TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),

    -- Case info
    case_date DATE NOT NULL DEFAULT CURRENT_DATE,
    case_count INTEGER DEFAULT 1,
    outcome TEXT CHECK (outcome IN ('recovered', 'deceased', 'ongoing', 'unknown')),

    -- Severity
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),

    -- Anonymous pet reference
    pet_age_months INTEGER,
    pet_breed TEXT,

    -- Reported by
    reported_by UUID REFERENCES public.profiles(id),

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- G. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_tag_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_reports ENABLE ROW LEVEL SECURITY;

-- Audit logs: Admin only
CREATE POLICY "Admin view audit logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.tenant_id = audit_logs.tenant_id
            AND p.role = 'admin'
        )
    );

CREATE POLICY "Service role manage audit logs" ON public.audit_logs
    FOR ALL TO service_role USING (true);

-- Notifications: Users view own
CREATE POLICY "Users view own notifications" ON public.notifications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON public.notifications
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Service role manage notifications" ON public.notifications
    FOR ALL TO service_role USING (true);

-- QR tags: Staff manage, public view assigned
CREATE POLICY "Staff manage QR tags" ON public.qr_tags
    FOR ALL TO authenticated
    USING (tenant_id IS NOT NULL AND public.is_staff_of(tenant_id));

CREATE POLICY "Public view active tags" ON public.qr_tags
    FOR SELECT USING (is_active = true AND is_registered = true);

-- QR scans: Public insert, staff view
CREATE POLICY "Public log scans" ON public.qr_tag_scans
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff view scans" ON public.qr_tag_scans
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.qr_tags t
            WHERE t.id = qr_tag_scans.tag_id
            AND t.tenant_id IS NOT NULL
            AND public.is_staff_of(t.tenant_id)
        )
    );

-- Lost pets: Public view public reports, staff manage
CREATE POLICY "Public view public lost pets" ON public.lost_pets
    FOR SELECT USING (is_public = true AND status = 'lost');

CREATE POLICY "Staff manage lost pets" ON public.lost_pets
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

CREATE POLICY "Owners manage own reports" ON public.lost_pets
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pets p
            WHERE p.id = lost_pets.pet_id
            AND p.owner_id = auth.uid()
        )
    );

-- Disease reports: Staff view tenant, public view aggregate
CREATE POLICY "Staff view disease reports" ON public.disease_reports
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- =============================================================================
-- H. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, read_at)
    WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qr_tags_code ON public.qr_tags(code);
CREATE INDEX IF NOT EXISTS idx_qr_tags_pet ON public.qr_tags(pet_id);
CREATE INDEX IF NOT EXISTS idx_qr_tags_tenant ON public.qr_tags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qr_tags_active ON public.qr_tags(is_active)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_qr_tag_scans_tag ON public.qr_tag_scans(tag_id);
CREATE INDEX IF NOT EXISTS idx_qr_tag_scans_date ON public.qr_tag_scans(scanned_at DESC);

CREATE INDEX IF NOT EXISTS idx_lost_pets_pet ON public.lost_pets(pet_id);
CREATE INDEX IF NOT EXISTS idx_lost_pets_tenant ON public.lost_pets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lost_pets_status ON public.lost_pets(status);
CREATE INDEX IF NOT EXISTS idx_lost_pets_public ON public.lost_pets(is_public)
    WHERE is_public = true AND status = 'lost';

CREATE INDEX IF NOT EXISTS idx_disease_reports_tenant ON public.disease_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_disease_reports_date ON public.disease_reports(case_date DESC);
CREATE INDEX IF NOT EXISTS idx_disease_reports_diagnosis ON public.disease_reports(diagnosis_code);
CREATE INDEX IF NOT EXISTS idx_disease_reports_species ON public.disease_reports(species);

-- =============================================================================
-- I. TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.qr_tags;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.qr_tags
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.lost_pets;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.lost_pets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- J. FUNCTIONS
-- =============================================================================

-- Log audit event
CREATE OR REPLACE FUNCTION public.log_audit(
    p_tenant_id TEXT,
    p_action TEXT,
    p_resource TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (tenant_id, user_id, action, resource, resource_id, old_values, new_values)
    VALUES (p_tenant_id, auth.uid(), p_action, p_resource, p_resource_id, p_old_values, p_new_values)
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_reference_type TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
    v_tenant_id TEXT;
BEGIN
    SELECT tenant_id INTO v_tenant_id
    FROM public.profiles
    WHERE id = p_user_id;

    INSERT INTO public.notifications (user_id, tenant_id, type, title, message, reference_type, reference_id, action_url)
    VALUES (p_user_id, v_tenant_id, p_type, p_title, p_message, p_reference_type, p_reference_id, p_action_url)
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update QR tag on scan
CREATE OR REPLACE FUNCTION public.update_qr_tag_on_scan()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.qr_tags
    SET last_scanned_at = NEW.scanned_at,
        scan_count = scan_count + 1
    WHERE id = NEW.tag_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS qr_scan_update_tag ON public.qr_tag_scans;
CREATE TRIGGER qr_scan_update_tag
    AFTER INSERT ON public.qr_tag_scans
    FOR EACH ROW EXECUTE FUNCTION public.update_qr_tag_on_scan();

-- Generate QR code
CREATE OR REPLACE FUNCTION public.generate_qr_code(p_tenant_id TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        v_code := UPPER(SUBSTRING(encode(gen_random_bytes(6), 'hex') FROM 1 FOR 8));

        SELECT EXISTS (SELECT 1 FROM public.qr_tags WHERE code = v_code) INTO v_exists;

        IF NOT v_exists THEN
            EXIT;
        END IF;
    END LOOP;

    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.notifications
        WHERE user_id = p_user_id
          AND read_at IS NULL
          AND dismissed_at IS NULL
    );
END;
$$ LANGUAGE plpgsql;

