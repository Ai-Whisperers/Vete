-- =============================================================================
-- STORE ORDERS - E-commerce order management tables
-- =============================================================================

-- Store Orders table
CREATE TABLE IF NOT EXISTS store_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),

  -- Pricing
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  coupon_id UUID REFERENCES store_coupons(id),
  coupon_code TEXT,
  shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 10,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- Addresses (JSONB for flexibility)
  shipping_address JSONB,
  billing_address JSONB,

  -- Delivery info
  shipping_method TEXT DEFAULT 'standard',
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Payment
  payment_method TEXT DEFAULT 'cash_on_delivery',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded', 'failed')),
  paid_at TIMESTAMPTZ,

  -- Additional info
  notes TEXT,
  internal_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,

  UNIQUE(tenant_id, order_number)
);

-- Store Order Items table
CREATE TABLE IF NOT EXISTS store_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES store_products(id),
  variant_id UUID REFERENCES store_product_variants(id),

  -- Product snapshot (in case product changes later)
  product_name TEXT NOT NULL,
  variant_name TEXT,

  -- Pricing
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  line_total NUMERIC(12, 2) NOT NULL,

  -- Status (for partial fulfillment)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled', 'returned')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store Order Status History (for tracking status changes)
CREATE TABLE IF NOT EXISTS store_order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_store_orders_tenant ON store_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_user ON store_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_status ON store_orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_store_orders_created ON store_orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_store_orders_number ON store_orders(tenant_id, order_number);

CREATE INDEX IF NOT EXISTS idx_store_order_items_order ON store_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_store_order_items_product ON store_order_items(product_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_order_status_history ENABLE ROW LEVEL SECURITY;

-- Orders: Users see own orders, staff see all in tenant
CREATE POLICY "Users view own orders" ON store_orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Staff view all orders" ON store_orders FOR SELECT
  USING (is_staff_of(tenant_id));

CREATE POLICY "Users create own orders" ON store_orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff manage orders" ON store_orders FOR ALL
  USING (is_staff_of(tenant_id));

-- Order items: Same as orders
CREATE POLICY "Users view own order items" ON store_order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM store_orders WHERE store_orders.id = store_order_items.order_id
    AND store_orders.user_id = auth.uid()
  ));

CREATE POLICY "Staff view all order items" ON store_order_items FOR SELECT
  USING (is_staff_of(tenant_id));

CREATE POLICY "Users create own order items" ON store_order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM store_orders WHERE store_orders.id = store_order_items.order_id
    AND store_orders.user_id = auth.uid()
  ));

CREATE POLICY "Staff manage order items" ON store_order_items FOR ALL
  USING (is_staff_of(tenant_id));

-- Status history: Same access as orders
CREATE POLICY "Users view own order history" ON store_order_status_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM store_orders WHERE store_orders.id = store_order_status_history.order_id
    AND store_orders.user_id = auth.uid()
  ));

CREATE POLICY "Staff manage order history" ON store_order_status_history FOR ALL
  USING (EXISTS (
    SELECT 1 FROM store_orders WHERE store_orders.id = store_order_status_history.order_id
    AND is_staff_of(store_orders.tenant_id)
  ));

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Decrement stock when order is placed
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE store_inventory
  SET
    stock_quantity = stock_quantity - p_quantity,
    updated_at = NOW()
  WHERE product_id = p_product_id
  AND stock_quantity >= p_quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment stock (for cancellations/returns)
CREATE OR REPLACE FUNCTION increment_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE store_inventory
  SET
    stock_quantity = stock_quantity + p_quantity,
    updated_at = NOW()
  WHERE product_id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment coupon usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE store_coupons
  SET
    used_count = used_count + 1,
    updated_at = NOW()
  WHERE id = p_coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment product sales count
CREATE OR REPLACE FUNCTION increment_product_sales(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE store_products
  SET
    sales_count = sales_count + p_quantity,
    updated_at = NOW()
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update order updated_at
CREATE TRIGGER handle_store_orders_updated_at
  BEFORE UPDATE ON store_orders
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO store_order_status_history (order_id, previous_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_order_status_change
  AFTER UPDATE OF status ON store_orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

GRANT EXECUTE ON FUNCTION decrement_stock TO authenticated;
GRANT EXECUTE ON FUNCTION increment_stock TO authenticated;
GRANT EXECUTE ON FUNCTION increment_coupon_usage TO authenticated;
GRANT EXECUTE ON FUNCTION increment_product_sales TO authenticated;
