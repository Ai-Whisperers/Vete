-- =============================================================================
-- 82_STORE_ENHANCEMENTS.SQL
-- =============================================================================
-- Enhanced store features for veterinary e-commerce:
-- - Brands management
-- - Product variants (sizes, flavors)
-- - Customer reviews and ratings
-- - Wishlists
-- - Stock alerts
-- - Coupon codes
-- - Recently viewed products
-- - Product Q&A
-- - Enhanced product attributes (species, life stages, health conditions)
-- =============================================================================

-- =============================================================================
-- A. STORE BRANDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Brand Info
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    website_url TEXT,

    -- Display
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One slug per tenant
    UNIQUE(tenant_id, slug)
);

-- =============================================================================
-- B. STORE SUBCATEGORIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    category_id UUID NOT NULL REFERENCES store_categories(id) ON DELETE CASCADE,

    -- Subcategory Info
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    icon TEXT,

    -- Display
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One slug per category
    UNIQUE(category_id, slug)
);

-- =============================================================================
-- C. ENHANCE STORE_PRODUCTS TABLE
-- =============================================================================

-- Add brand reference
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES store_brands(id) ON DELETE SET NULL;

-- Add subcategory reference
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES store_subcategories(id) ON DELETE SET NULL;

-- Add short description for cards
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Add pet-specific attributes
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS species TEXT[] DEFAULT '{}';

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS life_stages TEXT[] DEFAULT '{}';

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS breed_sizes TEXT[] DEFAULT '{}';

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS health_conditions TEXT[] DEFAULT '{}';

-- Add product specifications
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}';

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS ingredients TEXT;

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS nutritional_info JSONB DEFAULT '{}';

-- Add physical attributes
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS weight_grams NUMERIC(10,2);

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS dimensions JSONB;

-- Add prescription flag
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS is_prescription_required BOOLEAN DEFAULT FALSE;

-- Add display flags
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT FALSE;

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT FALSE;

-- Add rating cache (denormalized for performance)
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(2,1) DEFAULT 0;

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Add sales tracking
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add SEO fields
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS meta_title TEXT;

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add sort order
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- =============================================================================
-- D. STORE PRODUCT VARIANTS (Sizes, Flavors, etc.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Variant Info
    sku TEXT NOT NULL,
    name TEXT NOT NULL,                          -- "15kg", "Pollo", etc.
    variant_type TEXT NOT NULL,                  -- "size", "flavor", "color", "weight"

    -- Pricing
    price_modifier NUMERIC(12,2) DEFAULT 0,      -- Added to base_price

    -- Stock (separate from main inventory)
    stock_quantity INTEGER DEFAULT 0,

    -- Display
    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique SKU per tenant
    UNIQUE(tenant_id, sku)
);

-- =============================================================================
-- E. STORE PRODUCT IMAGES (Multiple images per product)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Image Info
    image_url TEXT NOT NULL,
    alt_text TEXT,

    -- Display
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- F. STORE REVIEWS
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,

    -- Verification
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    order_id UUID,                              -- Link to purchase

    -- Engagement
    helpful_count INTEGER DEFAULT 0,
    reported_count INTEGER DEFAULT 0,

    -- Moderation
    is_approved BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One review per user per product
    UNIQUE(user_id, product_id)
);

-- =============================================================================
-- G. STORE REVIEW IMAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_review_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES store_reviews(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Image Info
    image_url TEXT NOT NULL,

    -- Display
    sort_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- H. STORE REVIEW HELPFUL VOTES
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES store_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Vote type
    is_helpful BOOLEAN NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One vote per user per review
    UNIQUE(user_id, review_id)
);

-- =============================================================================
-- I. STORE WISHLISTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Optional variant
    variant_id UUID REFERENCES store_product_variants(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,

    -- Notification
    notify_on_sale BOOLEAN DEFAULT TRUE,
    notify_on_stock BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One product per user
    UNIQUE(user_id, product_id)
);

-- =============================================================================
-- J. STORE STOCK ALERTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Contact
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,

    -- Optional variant
    variant_id UUID REFERENCES store_product_variants(id) ON DELETE SET NULL,

    -- Status
    notified BOOLEAN DEFAULT FALSE,
    notified_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One alert per email per product
    UNIQUE(email, product_id)
);

-- =============================================================================
-- K. STORE COUPONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Coupon Info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    -- Discount
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
    discount_value NUMERIC(12,2) NOT NULL,

    -- Limits
    minimum_purchase NUMERIC(12,2) DEFAULT 0,
    maximum_discount NUMERIC(12,2),             -- Cap for percentage discounts
    max_uses INTEGER,                           -- Total uses allowed
    max_uses_per_user INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,

    -- Validity
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,

    -- Restrictions
    applies_to_sale_items BOOLEAN DEFAULT TRUE,
    first_purchase_only BOOLEAN DEFAULT FALSE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique code per tenant
    UNIQUE(tenant_id, code),

    -- Validate dates
    CONSTRAINT store_coupons_dates CHECK (valid_until > valid_from)
);

-- =============================================================================
-- L. STORE COUPON USAGE
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES store_coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Usage Details
    order_id UUID,                              -- Link to order/invoice
    discount_applied NUMERIC(12,2) NOT NULL,

    -- Metadata
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- M. STORE PRODUCT QUESTIONS (Q&A)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_product_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Question
    question TEXT NOT NULL,

    -- Answer (by staff)
    answer TEXT,
    answered_by UUID REFERENCES profiles(id),
    answered_at TIMESTAMPTZ,

    -- Status
    is_public BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- N. STORE RECENTLY VIEWED
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_recently_viewed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Metadata
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    view_count INTEGER DEFAULT 1,

    -- Keep only latest view per user/product
    UNIQUE(user_id, product_id)
);

-- =============================================================================
-- O. STORE RELATED PRODUCTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_related_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    related_product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Relation Type
    relation_type TEXT NOT NULL CHECK (relation_type IN (
        'similar',           -- Similar products
        'complementary',     -- Goes well with
        'upgrade',           -- Better version
        'accessory',         -- Accessories for product
        'frequently_bought'  -- Often bought together
    )),

    -- Display
    sort_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- No duplicates
    UNIQUE(product_id, related_product_id, relation_type),

    -- No self-reference
    CONSTRAINT no_self_relation CHECK (product_id != related_product_id)
);

-- =============================================================================
-- P. STORE PRESCRIPTIONS (for prescription-required products)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Pet (optional but recommended)
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,

    -- Prescription Document
    prescription_url TEXT,
    prescription_number TEXT,

    -- Issuing Vet
    vet_name TEXT,
    vet_license TEXT,
    vet_id UUID REFERENCES profiles(id),          -- If internal vet

    -- Validity
    issued_date DATE NOT NULL,
    expiry_date DATE,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'under_review', 'approved', 'rejected', 'expired'
    )),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,

    -- Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Q. STORE PRESCRIPTION PRODUCTS (link prescriptions to allowed products)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_prescription_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES store_prescriptions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,

    -- Quantity authorized
    quantity_authorized INTEGER DEFAULT 1,
    quantity_purchased INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One product per prescription
    UNIQUE(prescription_id, product_id)
);

-- =============================================================================
-- R. ENHANCE STORE_CATEGORIES TABLE
-- =============================================================================

ALTER TABLE store_categories
ADD COLUMN IF NOT EXISTS icon TEXT;

ALTER TABLE store_categories
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE store_categories
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

ALTER TABLE store_categories
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

ALTER TABLE store_categories
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Brands
CREATE INDEX IF NOT EXISTS idx_store_brands_tenant ON store_brands(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_brands_slug ON store_brands(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_store_brands_featured ON store_brands(tenant_id, is_featured) WHERE is_featured = TRUE;

-- Subcategories
CREATE INDEX IF NOT EXISTS idx_store_subcategories_tenant ON store_subcategories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_subcategories_category ON store_subcategories(category_id);

-- Product enhancements
CREATE INDEX IF NOT EXISTS idx_store_products_brand ON store_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_store_products_subcategory ON store_products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_store_products_species ON store_products USING GIN(species);
CREATE INDEX IF NOT EXISTS idx_store_products_life_stages ON store_products USING GIN(life_stages);
CREATE INDEX IF NOT EXISTS idx_store_products_breed_sizes ON store_products USING GIN(breed_sizes);
CREATE INDEX IF NOT EXISTS idx_store_products_health_conditions ON store_products USING GIN(health_conditions);
CREATE INDEX IF NOT EXISTS idx_store_products_featured ON store_products(tenant_id, is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_store_products_new_arrival ON store_products(tenant_id, is_new_arrival) WHERE is_new_arrival = TRUE;
CREATE INDEX IF NOT EXISTS idx_store_products_best_seller ON store_products(tenant_id, is_best_seller) WHERE is_best_seller = TRUE;
CREATE INDEX IF NOT EXISTS idx_store_products_prescription ON store_products(tenant_id, is_prescription_required) WHERE is_prescription_required = TRUE;
CREATE INDEX IF NOT EXISTS idx_store_products_rating ON store_products(tenant_id, avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_store_products_sales ON store_products(tenant_id, sales_count DESC);

-- Variants
CREATE INDEX IF NOT EXISTS idx_store_variants_product ON store_product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_store_variants_tenant ON store_product_variants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_variants_sku ON store_product_variants(tenant_id, sku);

-- Images
CREATE INDEX IF NOT EXISTS idx_store_images_product ON store_product_images(product_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_store_reviews_product ON store_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_user ON store_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_tenant ON store_reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_rating ON store_reviews(product_id, rating);
CREATE INDEX IF NOT EXISTS idx_store_reviews_helpful ON store_reviews(product_id, helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_store_reviews_featured ON store_reviews(tenant_id, is_featured) WHERE is_featured = TRUE;

-- Review Images
CREATE INDEX IF NOT EXISTS idx_store_review_images_review ON store_review_images(review_id);

-- Review Votes
CREATE INDEX IF NOT EXISTS idx_store_review_votes_review ON store_review_votes(review_id);

-- Wishlists
CREATE INDEX IF NOT EXISTS idx_store_wishlists_user ON store_wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_store_wishlists_product ON store_wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_store_wishlists_tenant ON store_wishlists(tenant_id);

-- Stock Alerts
CREATE INDEX IF NOT EXISTS idx_store_stock_alerts_product ON store_stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_store_stock_alerts_email ON store_stock_alerts(email);
CREATE INDEX IF NOT EXISTS idx_store_stock_alerts_pending ON store_stock_alerts(product_id, notified) WHERE notified = FALSE;

-- Coupons
CREATE INDEX IF NOT EXISTS idx_store_coupons_tenant ON store_coupons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_coupons_code ON store_coupons(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_store_coupons_active ON store_coupons(tenant_id, is_active, valid_from, valid_until);

-- Coupon Usage
CREATE INDEX IF NOT EXISTS idx_store_coupon_usage_coupon ON store_coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_store_coupon_usage_user ON store_coupon_usage(user_id);

-- Questions
CREATE INDEX IF NOT EXISTS idx_store_questions_product ON store_product_questions(product_id);
CREATE INDEX IF NOT EXISTS idx_store_questions_unanswered ON store_product_questions(product_id, answered_at) WHERE answered_at IS NULL;

-- Recently Viewed
CREATE INDEX IF NOT EXISTS idx_store_recently_viewed_user ON store_recently_viewed(user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_store_recently_viewed_product ON store_recently_viewed(product_id);

-- Related Products
CREATE INDEX IF NOT EXISTS idx_store_related_product ON store_related_products(product_id);
CREATE INDEX IF NOT EXISTS idx_store_related_type ON store_related_products(product_id, relation_type);

-- Prescriptions
CREATE INDEX IF NOT EXISTS idx_store_prescriptions_user ON store_prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_store_prescriptions_tenant ON store_prescriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_prescriptions_status ON store_prescriptions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_store_prescriptions_pet ON store_prescriptions(pet_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all new tables
ALTER TABLE store_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_related_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_prescription_products ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES - BRANDS
-- =============================================================================

CREATE POLICY "Anyone can view active brands" ON store_brands
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Staff can manage brands" ON store_brands
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - SUBCATEGORIES
-- =============================================================================

CREATE POLICY "Anyone can view active subcategories" ON store_subcategories
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Staff can manage subcategories" ON store_subcategories
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - VARIANTS
-- =============================================================================

CREATE POLICY "Anyone can view active variants" ON store_product_variants
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Staff can manage variants" ON store_product_variants
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - PRODUCT IMAGES
-- =============================================================================

CREATE POLICY "Anyone can view product images" ON store_product_images
    FOR SELECT USING (TRUE);

CREATE POLICY "Staff can manage product images" ON store_product_images
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - REVIEWS
-- =============================================================================

CREATE POLICY "Anyone can view approved reviews" ON store_reviews
    FOR SELECT USING (is_approved = TRUE);

CREATE POLICY "Users can create their own reviews" ON store_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON store_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON store_reviews
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Staff can manage all reviews" ON store_reviews
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - REVIEW IMAGES
-- =============================================================================

CREATE POLICY "Anyone can view review images" ON store_review_images
    FOR SELECT USING (TRUE);

CREATE POLICY "Review owner can manage images" ON store_review_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM store_reviews
            WHERE store_reviews.id = store_review_images.review_id
            AND store_reviews.user_id = auth.uid()
        )
    );

-- =============================================================================
-- RLS POLICIES - REVIEW VOTES
-- =============================================================================

CREATE POLICY "Anyone can view votes" ON store_review_votes
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage their own votes" ON store_review_votes
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES - WISHLISTS
-- =============================================================================

CREATE POLICY "Users can view their own wishlist" ON store_wishlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist" ON store_wishlists
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES - STOCK ALERTS
-- =============================================================================

CREATE POLICY "Users can view their own alerts" ON store_stock_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own alerts" ON store_stock_alerts
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Staff can view all alerts" ON store_stock_alerts
    FOR SELECT USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - COUPONS
-- =============================================================================

CREATE POLICY "Anyone can view active coupons" ON store_coupons
    FOR SELECT USING (
        is_active = TRUE
        AND NOW() >= valid_from
        AND NOW() <= valid_until
    );

CREATE POLICY "Staff can manage coupons" ON store_coupons
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - COUPON USAGE
-- =============================================================================

CREATE POLICY "Users can view their own usage" ON store_coupon_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage" ON store_coupon_usage
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Staff can view all usage" ON store_coupon_usage
    FOR SELECT USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - QUESTIONS
-- =============================================================================

CREATE POLICY "Anyone can view public questions" ON store_product_questions
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can ask questions" ON store_product_questions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can manage questions" ON store_product_questions
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - RECENTLY VIEWED
-- =============================================================================

CREATE POLICY "Users can view their own history" ON store_recently_viewed
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own history" ON store_recently_viewed
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES - RELATED PRODUCTS
-- =============================================================================

CREATE POLICY "Anyone can view related products" ON store_related_products
    FOR SELECT USING (TRUE);

CREATE POLICY "Staff can manage related products" ON store_related_products
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - PRESCRIPTIONS
-- =============================================================================

CREATE POLICY "Users can view their own prescriptions" ON store_prescriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create prescriptions" ON store_prescriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can manage prescriptions" ON store_prescriptions
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - PRESCRIPTION PRODUCTS
-- =============================================================================

CREATE POLICY "Users can view their prescription products" ON store_prescription_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM store_prescriptions
            WHERE store_prescriptions.id = store_prescription_products.prescription_id
            AND store_prescriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage prescription products" ON store_prescription_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM store_prescriptions
            WHERE store_prescriptions.id = store_prescription_products.prescription_id
            AND is_staff_of(store_prescriptions.tenant_id)
        )
    );

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to update product rating cache
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE store_products
        SET
            avg_rating = (
                SELECT COALESCE(AVG(rating)::NUMERIC(2,1), 0)
                FROM store_reviews
                WHERE product_id = NEW.product_id AND is_approved = TRUE
            ),
            review_count = (
                SELECT COUNT(*)
                FROM store_reviews
                WHERE product_id = NEW.product_id AND is_approved = TRUE
            )
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE store_products
        SET
            avg_rating = (
                SELECT COALESCE(AVG(rating)::NUMERIC(2,1), 0)
                FROM store_reviews
                WHERE product_id = OLD.product_id AND is_approved = TRUE
            ),
            review_count = (
                SELECT COUNT(*)
                FROM store_reviews
                WHERE product_id = OLD.product_id AND is_approved = TRUE
            )
        WHERE id = OLD.product_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
DROP TRIGGER IF EXISTS trigger_update_product_rating ON store_reviews;
CREATE TRIGGER trigger_update_product_rating
    AFTER INSERT OR UPDATE OR DELETE ON store_reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Function to update review helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE store_reviews
        SET helpful_count = (
            SELECT COUNT(*)
            FROM store_review_votes
            WHERE review_id = NEW.review_id AND is_helpful = TRUE
        )
        WHERE id = NEW.review_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE store_reviews
        SET helpful_count = (
            SELECT COUNT(*)
            FROM store_review_votes
            WHERE review_id = OLD.review_id AND is_helpful = TRUE
        )
        WHERE id = OLD.review_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for helpful count
DROP TRIGGER IF EXISTS trigger_update_review_helpful ON store_review_votes;
CREATE TRIGGER trigger_update_review_helpful
    AFTER INSERT OR UPDATE OR DELETE ON store_review_votes
    FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE store_coupons
    SET used_count = used_count + 1
    WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for coupon usage
DROP TRIGGER IF EXISTS trigger_increment_coupon_usage ON store_coupon_usage;
CREATE TRIGGER trigger_increment_coupon_usage
    AFTER INSERT ON store_coupon_usage
    FOR EACH ROW EXECUTE FUNCTION increment_coupon_usage();

-- Function to validate coupon
CREATE OR REPLACE FUNCTION validate_coupon(
    p_tenant_id TEXT,
    p_code TEXT,
    p_user_id UUID,
    p_cart_total NUMERIC
)
RETURNS JSONB AS $$
DECLARE
    v_coupon RECORD;
    v_user_usage INTEGER;
    v_discount NUMERIC;
BEGIN
    -- Find coupon
    SELECT * INTO v_coupon
    FROM store_coupons
    WHERE tenant_id = p_tenant_id
    AND UPPER(code) = UPPER(p_code)
    AND is_active = TRUE
    AND NOW() >= valid_from
    AND NOW() <= valid_until;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', FALSE, 'error', 'Cupón no válido o expirado');
    END IF;

    -- Check max uses
    IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
        RETURN jsonb_build_object('valid', FALSE, 'error', 'Cupón agotado');
    END IF;

    -- Check user usage
    SELECT COUNT(*) INTO v_user_usage
    FROM store_coupon_usage
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

    IF v_user_usage >= v_coupon.max_uses_per_user THEN
        RETURN jsonb_build_object('valid', FALSE, 'error', 'Ya usaste este cupón');
    END IF;

    -- Check minimum purchase
    IF p_cart_total < v_coupon.minimum_purchase THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'error', format('Compra mínima: Gs. %s', v_coupon.minimum_purchase)
        );
    END IF;

    -- Calculate discount
    IF v_coupon.discount_type = 'percentage' THEN
        v_discount := p_cart_total * (v_coupon.discount_value / 100);
        IF v_coupon.maximum_discount IS NOT NULL THEN
            v_discount := LEAST(v_discount, v_coupon.maximum_discount);
        END IF;
    ELSIF v_coupon.discount_type = 'fixed_amount' THEN
        v_discount := LEAST(v_coupon.discount_value, p_cart_total);
    ELSE
        v_discount := 0; -- free_shipping handled separately
    END IF;

    RETURN jsonb_build_object(
        'valid', TRUE,
        'coupon_id', v_coupon.id,
        'discount_type', v_coupon.discount_type,
        'discount_value', v_coupon.discount_value,
        'calculated_discount', v_discount,
        'name', v_coupon.name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product with full details
CREATE OR REPLACE FUNCTION get_product_details(
    p_tenant_id TEXT,
    p_product_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_product JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', p.id,
        'sku', p.sku,
        'name', p.name,
        'short_description', p.short_description,
        'description', p.description,
        'base_price', p.base_price,
        'specifications', p.specifications,
        'features', p.features,
        'ingredients', p.ingredients,
        'nutritional_info', p.nutritional_info,
        'species', p.species,
        'life_stages', p.life_stages,
        'breed_sizes', p.breed_sizes,
        'health_conditions', p.health_conditions,
        'is_prescription_required', p.is_prescription_required,
        'avg_rating', p.avg_rating,
        'review_count', p.review_count,
        'sales_count', p.sales_count,
        'is_featured', p.is_featured,
        'is_new_arrival', p.is_new_arrival,
        'is_best_seller', p.is_best_seller,
        'meta_title', p.meta_title,
        'meta_description', p.meta_description,
        'category', jsonb_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug
        ),
        'subcategory', CASE WHEN sc.id IS NOT NULL THEN
            jsonb_build_object('id', sc.id, 'name', sc.name, 'slug', sc.slug)
        ELSE NULL END,
        'brand', CASE WHEN b.id IS NOT NULL THEN
            jsonb_build_object('id', b.id, 'name', b.name, 'slug', b.slug, 'logo_url', b.logo_url)
        ELSE NULL END,
        'inventory', jsonb_build_object(
            'stock_quantity', COALESCE(i.stock_quantity, 0),
            'min_stock_level', i.min_stock_level
        ),
        'images', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', img.id,
                    'image_url', img.image_url,
                    'alt_text', img.alt_text,
                    'is_primary', img.is_primary
                ) ORDER BY img.sort_order
            ), '[]')
            FROM store_product_images img
            WHERE img.product_id = p.id
        ),
        'variants', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', v.id,
                    'sku', v.sku,
                    'name', v.name,
                    'variant_type', v.variant_type,
                    'price_modifier', v.price_modifier,
                    'stock_quantity', v.stock_quantity,
                    'is_default', v.is_default
                ) ORDER BY v.sort_order
            ), '[]')
            FROM store_product_variants v
            WHERE v.product_id = p.id AND v.is_active = TRUE
        )
    ) INTO v_product
    FROM store_products p
    LEFT JOIN store_categories c ON c.id = p.category_id
    LEFT JOIN store_subcategories sc ON sc.id = p.subcategory_id
    LEFT JOIN store_brands b ON b.id = p.brand_id
    LEFT JOIN store_inventory i ON i.product_id = p.id
    WHERE p.id = p_product_id
    AND p.tenant_id = p_tenant_id
    AND p.is_active = TRUE;

    RETURN v_product;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track product view
CREATE OR REPLACE FUNCTION track_product_view(
    p_user_id UUID,
    p_product_id UUID,
    p_tenant_id TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Update recently viewed
    INSERT INTO store_recently_viewed (user_id, product_id, tenant_id, viewed_at, view_count)
    VALUES (p_user_id, p_product_id, p_tenant_id, NOW(), 1)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET
        viewed_at = NOW(),
        view_count = store_recently_viewed.view_count + 1;

    -- Update product view count
    UPDATE store_products
    SET view_count = view_count + 1
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================

CREATE TRIGGER handle_updated_at_store_brands
    BEFORE UPDATE ON store_brands
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_store_subcategories
    BEFORE UPDATE ON store_subcategories
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_store_variants
    BEFORE UPDATE ON store_product_variants
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_store_reviews
    BEFORE UPDATE ON store_reviews
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_store_coupons
    BEFORE UPDATE ON store_coupons
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_store_prescriptions
    BEFORE UPDATE ON store_prescriptions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE store_brands IS 'Product brands/manufacturers';
COMMENT ON TABLE store_subcategories IS 'Subcategories within main categories';
COMMENT ON TABLE store_product_variants IS 'Product variations (size, flavor, color)';
COMMENT ON TABLE store_product_images IS 'Multiple images per product';
COMMENT ON TABLE store_reviews IS 'Customer product reviews and ratings';
COMMENT ON TABLE store_review_images IS 'Photos attached to reviews';
COMMENT ON TABLE store_review_votes IS 'Helpful/not helpful votes on reviews';
COMMENT ON TABLE store_wishlists IS 'User saved products for later';
COMMENT ON TABLE store_stock_alerts IS 'Notify user when product back in stock';
COMMENT ON TABLE store_coupons IS 'Discount codes and vouchers';
COMMENT ON TABLE store_coupon_usage IS 'Track coupon redemptions';
COMMENT ON TABLE store_product_questions IS 'Customer Q&A on products';
COMMENT ON TABLE store_recently_viewed IS 'Track user product browsing history';
COMMENT ON TABLE store_related_products IS 'Product relationships (similar, complementary)';
COMMENT ON TABLE store_prescriptions IS 'Vet prescriptions for prescription products';
COMMENT ON TABLE store_prescription_products IS 'Products authorized by prescription';

-- =============================================================================
-- STORE ENHANCEMENTS MIGRATION COMPLETE
-- =============================================================================
