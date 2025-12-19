-- =============================================================================
-- 07_SCHEMA_INVENTORY.SQL
-- =============================================================================
-- Store and inventory management system:
-- - Product catalog
-- - Stock levels with weighted average cost
-- - Transaction ledger
-- - Campaigns/promotions
-- - Price history
-- =============================================================================

-- =============================================================================
-- A. STORE CATEGORIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,                     -- URL-friendly name
    description TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One slug per tenant
    UNIQUE(tenant_id, slug)
);

-- =============================================================================
-- B. STORE PRODUCTS (Catalog)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    category_id UUID REFERENCES store_categories(id) ON DELETE SET NULL,

    -- Identification
    sku TEXT,                               -- Stock Keeping Unit
    barcode TEXT,

    -- Product Info
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,

    -- Pricing
    base_price NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One SKU per tenant
    UNIQUE(tenant_id, sku)
);

-- =============================================================================
-- C. STORE INVENTORY (Current Stock Levels)
-- =============================================================================
-- Tracks current quantity and weighted average cost per product.

CREATE TABLE IF NOT EXISTS store_inventory (
    product_id UUID PRIMARY KEY REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Stock
    stock_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,    -- Numeric for fractional units
    min_stock_level NUMERIC(12,2) DEFAULT 0,            -- Reorder point

    -- Costing
    weighted_average_cost NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Expiry Tracking
    expiry_date DATE,
    batch_number TEXT,
    supplier_name TEXT,

    -- Metadata
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- D. STORE INVENTORY TRANSACTIONS (Ledger)
-- =============================================================================
-- Immutable transaction log for stock movements.

CREATE TABLE IF NOT EXISTS store_inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,

    -- Transaction Details
    type TEXT NOT NULL CHECK (type IN (
        'purchase', 'sale', 'adjustment', 'return', 'damage', 'theft', 'expired'
    )),
    quantity NUMERIC(12,2) NOT NULL,        -- Positive = add, Negative = remove
    unit_cost NUMERIC(12,2),                -- Cost per unit at time of transaction

    -- Reference
    reference_id UUID,                      -- Link to order/invoice
    notes TEXT,

    -- Audit
    performed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- E. STORE CAMPAIGNS (Promotions)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Campaign Info
    name TEXT NOT NULL,
    description TEXT,

    -- Duration
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Validate dates
    CONSTRAINT store_campaigns_dates CHECK (end_date > start_date)
);

-- =============================================================================
-- F. STORE CAMPAIGN ITEMS
-- =============================================================================
-- Products included in a campaign with their discounts.

CREATE TABLE IF NOT EXISTS store_campaign_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES store_campaigns(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,

    -- Discount
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value NUMERIC(12,2) NOT NULL,

    -- One product per campaign
    UNIQUE(campaign_id, product_id)
);

-- =============================================================================
-- G. STORE PRICE HISTORY
-- =============================================================================
-- Tracks all price changes for audit/analytics.

CREATE TABLE IF NOT EXISTS store_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,

    -- Price Change
    old_price NUMERIC(12,2),
    new_price NUMERIC(12,2) NOT NULL,

    -- Audit
    changed_by UUID REFERENCES profiles(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- H. LEGACY PRODUCTS TABLE (for backwards compatibility)
-- =============================================================================
-- Simple products table used in earlier versions.

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    description TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SCHEMA INVENTORY COMPLETE
-- =============================================================================
