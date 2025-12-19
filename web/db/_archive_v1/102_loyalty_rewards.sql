-- =============================================================================
-- 102_LOYALTY_REWARDS.SQL
-- =============================================================================
-- Loyalty rewards catalog and redemption tracking
-- =============================================================================

-- =============================================================================
-- A. LOYALTY REWARDS CATALOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Reward info
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'discount' CHECK (category IN (
        'discount', 'service', 'product', 'gift', 'experience'
    )),

    -- Cost
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),

    -- Value (optional, for display)
    value_display TEXT, -- e.g., "20% descuento", "Baño gratis"

    -- Limits
    stock INTEGER, -- NULL = unlimited
    max_per_user INTEGER, -- NULL = unlimited
    valid_from DATE,
    valid_to DATE,

    -- Related entities
    service_id UUID REFERENCES services(id) ON DELETE SET NULL, -- If redeeming a service
    product_id UUID REFERENCES store_products(id) ON DELETE SET NULL, -- If redeeming a product
    discount_percentage INTEGER CHECK (discount_percentage >= 1 AND discount_percentage <= 100),
    discount_amount INTEGER, -- Fixed amount discount in PYG

    -- Display
    image_url TEXT,
    display_order INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- B. LOYALTY REDEMPTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS loyalty_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES loyalty_rewards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,

    -- Transaction
    points_spent INTEGER NOT NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'used', 'expired', 'cancelled'
    )),

    -- Code for claiming
    redemption_code TEXT UNIQUE,

    -- Usage
    used_at TIMESTAMPTZ,
    used_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ,

    -- Related
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- C. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_tenant ON loyalty_rewards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_active ON loyalty_rewards(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_category ON loyalty_rewards(category);

CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_tenant ON loyalty_redemptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_user ON loyalty_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_status ON loyalty_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_code ON loyalty_redemptions(redemption_code);

-- =============================================================================
-- D. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_loyalty_rewards_updated_at
    BEFORE UPDATE ON loyalty_rewards
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_loyalty_redemptions_updated_at
    BEFORE UPDATE ON loyalty_redemptions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- E. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- Rewards: Everyone can view active, staff can manage
CREATE POLICY loyalty_rewards_select ON loyalty_rewards FOR SELECT TO authenticated
    USING (is_active = TRUE OR is_staff_of(tenant_id));

CREATE POLICY loyalty_rewards_insert ON loyalty_rewards FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY loyalty_rewards_update ON loyalty_rewards FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Redemptions: Users see own, staff see all
CREATE POLICY loyalty_redemptions_select ON loyalty_redemptions FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR is_staff_of(tenant_id));

CREATE POLICY loyalty_redemptions_insert ON loyalty_redemptions FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid() OR is_staff_of(tenant_id));

CREATE POLICY loyalty_redemptions_update ON loyalty_redemptions FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- =============================================================================
-- F. SEED SAMPLE REWARDS
-- =============================================================================

-- Note: These are examples, each clinic should create their own rewards
-- INSERT INTO loyalty_rewards (tenant_id, name, description, category, points_cost, value_display, is_active)
-- VALUES
--     ('adris', 'Baño Gratis', 'Un baño completo para tu mascota', 'service', 500, 'Valor: 50.000 Gs', TRUE),
--     ('adris', '10% Descuento', 'En cualquier servicio veterinario', 'discount', 300, '10% off', TRUE),
--     ('adris', 'Juguete Premium', 'Un juguete de nuestra tienda', 'product', 400, 'Hasta 30.000 Gs', TRUE);

-- =============================================================================
-- LOYALTY REWARDS SCHEMA COMPLETE
-- =============================================================================
