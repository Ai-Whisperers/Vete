-- =============================================================================
-- 60_INVENTORY.SQL
-- =============================================================================
-- Store and inventory management: products, stock, campaigns.
--
-- Dependencies: 10_core/*
-- =============================================================================

-- =============================================================================
-- A. STORE CATEGORIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.store_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Category info
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.store_categories(id),

    -- Media
    image_url TEXT,

    -- Display
    display_order INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, slug)
);

-- =============================================================================
-- B. STORE BRANDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.store_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Brand info
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    website TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, slug)
);

-- =============================================================================
-- C. STORE PRODUCTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.store_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Classification
    category_id UUID REFERENCES public.store_categories(id),
    brand_id UUID REFERENCES public.store_brands(id),

    -- Identification
    sku TEXT,
    barcode TEXT,

    -- Product info
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,

    -- Pricing
    base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(12,2),
    cost_price NUMERIC(12,2),

    -- Media
    image_url TEXT,
    images TEXT[] DEFAULT '{}',

    -- Attributes
    weight_grams NUMERIC(10,2),
    dimensions JSONB,  -- {length, width, height, unit}
    attributes JSONB DEFAULT '{}',  -- {color, size, etc.}

    -- Species/targeting
    target_species TEXT[],

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    requires_prescription BOOLEAN DEFAULT false,

    -- SEO
    meta_title TEXT,
    meta_description TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, sku)
);

-- =============================================================================
-- D. STORE INVENTORY
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.store_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Stock levels
    stock_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
    reserved_quantity NUMERIC(12,2) DEFAULT 0,
    available_quantity NUMERIC(12,2) GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,

    -- Reorder settings
    min_stock_level NUMERIC(12,2) DEFAULT 0,
    reorder_quantity NUMERIC(12,2),
    reorder_point NUMERIC(12,2),

    -- Cost tracking
    weighted_average_cost NUMERIC(12,2) DEFAULT 0,

    -- Location
    location TEXT,
    bin_number TEXT,

    -- Batch/Expiry
    batch_number TEXT,
    expiry_date DATE,
    supplier_name TEXT,

    -- Timestamps
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(product_id)
);

-- =============================================================================
-- E. INVENTORY TRANSACTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.store_inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    product_id UUID NOT NULL REFERENCES public.store_products(id),

    -- Transaction
    type TEXT NOT NULL
        CHECK (type IN ('purchase', 'sale', 'adjustment', 'return', 'damage', 'theft', 'expired', 'transfer')),
    quantity NUMERIC(12,2) NOT NULL,  -- Positive = add, Negative = remove
    unit_cost NUMERIC(12,2),

    -- Reference
    reference_type TEXT,  -- 'order', 'invoice', 'adjustment'
    reference_id UUID,
    notes TEXT,

    -- Performed by
    performed_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- F. STORE CAMPAIGNS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.store_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Campaign info
    name TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT DEFAULT 'sale'
        CHECK (campaign_type IN ('sale', 'bogo', 'bundle', 'flash', 'seasonal')),

    -- Duration
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,

    -- Discount
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value NUMERIC(12,2),

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT store_campaigns_dates CHECK (end_date > start_date)
);

-- =============================================================================
-- G. CAMPAIGN ITEMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.store_campaign_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.store_campaigns(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.store_products(id) ON DELETE CASCADE,

    -- Override discount for this product
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value NUMERIC(12,2),

    UNIQUE(campaign_id, product_id)
);

-- =============================================================================
-- H. STORE COUPONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.store_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Coupon info
    code TEXT NOT NULL,
    name TEXT,
    description TEXT,

    -- Discount
    discount_type TEXT NOT NULL
        CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
    discount_value NUMERIC(12,2) NOT NULL,
    min_purchase_amount NUMERIC(12,2) DEFAULT 0,
    max_discount_amount NUMERIC(12,2),

    -- Usage limits
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    usage_limit_per_user INTEGER DEFAULT 1,

    -- Validity
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,

    -- Restrictions
    applicable_products UUID[],
    applicable_categories UUID[],

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

-- =============================================================================
-- I. PRICE HISTORY
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.store_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    product_id UUID NOT NULL REFERENCES public.store_products(id) ON DELETE CASCADE,

    -- Price change
    old_price NUMERIC(12,2),
    new_price NUMERIC(12,2) NOT NULL,
    price_type TEXT DEFAULT 'base'
        CHECK (price_type IN ('base', 'sale', 'cost')),

    -- Changed by
    changed_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- J. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_campaign_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_price_history ENABLE ROW LEVEL SECURITY;

-- Categories: Public read active, staff manage
CREATE POLICY "Public read categories" ON public.store_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Staff manage categories" ON public.store_categories
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- Brands: Public read active, staff manage
CREATE POLICY "Public read brands" ON public.store_brands
    FOR SELECT USING (is_active = true);

CREATE POLICY "Staff manage brands" ON public.store_brands
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- Products: Public read active, staff manage
CREATE POLICY "Public read products" ON public.store_products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Staff manage products" ON public.store_products
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- Inventory: Staff only
CREATE POLICY "Staff manage inventory" ON public.store_inventory
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- Inventory transactions: Staff only
CREATE POLICY "Staff manage inventory transactions" ON public.store_inventory_transactions
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- Campaigns: Public read active, staff manage
CREATE POLICY "Public read campaigns" ON public.store_campaigns
    FOR SELECT USING (is_active = true AND start_date <= NOW() AND end_date >= NOW());

CREATE POLICY "Staff manage campaigns" ON public.store_campaigns
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- Campaign items
CREATE POLICY "Public read campaign items" ON public.store_campaign_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.store_campaigns c
            WHERE c.id = store_campaign_items.campaign_id
            AND c.is_active = true AND c.start_date <= NOW() AND c.end_date >= NOW()
        )
    );

CREATE POLICY "Staff manage campaign items" ON public.store_campaign_items
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.store_campaigns c
            WHERE c.id = store_campaign_items.campaign_id
            AND public.is_staff_of(c.tenant_id)
        )
    );

-- Coupons: Staff only (validation done via function)
CREATE POLICY "Staff manage coupons" ON public.store_coupons
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- Price history: Staff only
CREATE POLICY "Staff view price history" ON public.store_price_history
    FOR SELECT TO authenticated
    USING (public.is_staff_of(tenant_id));

-- =============================================================================
-- K. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_store_categories_tenant ON public.store_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_categories_parent ON public.store_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_store_categories_slug ON public.store_categories(slug);

CREATE INDEX IF NOT EXISTS idx_store_brands_tenant ON public.store_brands(tenant_id);

CREATE INDEX IF NOT EXISTS idx_store_products_tenant ON public.store_products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_products_category ON public.store_products(category_id);
CREATE INDEX IF NOT EXISTS idx_store_products_brand ON public.store_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_store_products_sku ON public.store_products(sku);
CREATE INDEX IF NOT EXISTS idx_store_products_active ON public.store_products(is_active)
    WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_store_products_featured ON public.store_products(is_featured)
    WHERE is_featured = true AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_store_inventory_product ON public.store_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_low_stock ON public.store_inventory(stock_quantity)
    WHERE stock_quantity <= min_stock_level;

CREATE INDEX IF NOT EXISTS idx_store_inventory_txn_tenant ON public.store_inventory_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_txn_product ON public.store_inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_txn_date ON public.store_inventory_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_store_campaigns_tenant ON public.store_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_campaigns_active ON public.store_campaigns(start_date, end_date)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_store_coupons_tenant ON public.store_coupons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_coupons_code ON public.store_coupons(code);

CREATE INDEX IF NOT EXISTS idx_store_price_history_product ON public.store_price_history(product_id);

-- =============================================================================
-- L. TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.store_categories;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.store_categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.store_products;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.store_products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.store_inventory;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.store_inventory
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.store_campaigns;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.store_campaigns
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.store_coupons;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.store_coupons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- M. FUNCTIONS
-- =============================================================================

-- Update inventory on transaction
CREATE OR REPLACE FUNCTION public.update_inventory_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert inventory
    INSERT INTO public.store_inventory (product_id, tenant_id, stock_quantity, weighted_average_cost)
    VALUES (
        NEW.product_id,
        NEW.tenant_id,
        NEW.quantity,
        COALESCE(NEW.unit_cost, 0)
    )
    ON CONFLICT (product_id) DO UPDATE SET
        stock_quantity = public.store_inventory.stock_quantity + NEW.quantity,
        weighted_average_cost = CASE
            WHEN NEW.type = 'purchase' AND NEW.quantity > 0 THEN
                (public.store_inventory.stock_quantity * public.store_inventory.weighted_average_cost +
                 NEW.quantity * COALESCE(NEW.unit_cost, 0)) /
                NULLIF(public.store_inventory.stock_quantity + NEW.quantity, 0)
            ELSE public.store_inventory.weighted_average_cost
        END,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inventory_txn_update_stock ON public.store_inventory_transactions;
CREATE TRIGGER inventory_txn_update_stock
    AFTER INSERT ON public.store_inventory_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_transaction();

-- Track price changes
CREATE OR REPLACE FUNCTION public.track_price_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.base_price IS DISTINCT FROM NEW.base_price THEN
        INSERT INTO public.store_price_history (tenant_id, product_id, old_price, new_price, price_type, changed_by)
        VALUES (NEW.tenant_id, NEW.id, OLD.base_price, NEW.base_price, 'base', auth.uid());
    END IF;

    IF OLD.sale_price IS DISTINCT FROM NEW.sale_price THEN
        INSERT INTO public.store_price_history (tenant_id, product_id, old_price, new_price, price_type, changed_by)
        VALUES (NEW.tenant_id, NEW.id, OLD.sale_price, NEW.sale_price, 'sale', auth.uid());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_price_change ON public.store_products;
CREATE TRIGGER product_price_change
    AFTER UPDATE ON public.store_products
    FOR EACH ROW EXECUTE FUNCTION public.track_price_change();

-- Validate coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
    p_tenant_id TEXT,
    p_code TEXT,
    p_user_id UUID DEFAULT NULL,
    p_cart_total NUMERIC DEFAULT 0
)
RETURNS TABLE (
    is_valid BOOLEAN,
    coupon_id UUID,
    discount_type TEXT,
    discount_value NUMERIC,
    message TEXT
) AS $$
DECLARE
    v_coupon public.store_coupons%ROWTYPE;
    v_user_usage INTEGER;
BEGIN
    SELECT * INTO v_coupon
    FROM public.store_coupons
    WHERE tenant_id = p_tenant_id AND code = UPPER(p_code) AND is_active = true;

    IF v_coupon IS NULL THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Cupón no encontrado';
        RETURN;
    END IF;

    IF v_coupon.valid_from > NOW() THEN
        RETURN QUERY SELECT false, v_coupon.id, NULL::TEXT, NULL::NUMERIC, 'Cupón aún no válido';
        RETURN;
    END IF;

    IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < NOW() THEN
        RETURN QUERY SELECT false, v_coupon.id, NULL::TEXT, NULL::NUMERIC, 'Cupón expirado';
        RETURN;
    END IF;

    IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
        RETURN QUERY SELECT false, v_coupon.id, NULL::TEXT, NULL::NUMERIC, 'Cupón agotado';
        RETURN;
    END IF;

    IF p_cart_total < v_coupon.min_purchase_amount THEN
        RETURN QUERY SELECT false, v_coupon.id, NULL::TEXT, NULL::NUMERIC,
            'Mínimo de compra: ' || v_coupon.min_purchase_amount::TEXT;
        RETURN;
    END IF;

    RETURN QUERY SELECT true, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 'Cupón válido';
END;
$$ LANGUAGE plpgsql;

