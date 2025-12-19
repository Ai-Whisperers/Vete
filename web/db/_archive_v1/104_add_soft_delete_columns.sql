-- Add deleted_at columns to tables missing soft delete support

ALTER TABLE services ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE lab_test_catalog ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE kennels ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE consent_templates ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE store_categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create partial indexes for efficient soft delete queries
CREATE INDEX IF NOT EXISTS idx_services_active ON services(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_active ON invoices(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payments_active ON payments(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lab_test_catalog_active ON lab_test_catalog(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_kennels_active ON kennels(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consent_templates_active ON consent_templates(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_active ON conversations(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lab_orders_active ON lab_orders(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_store_products_active ON store_products(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_store_categories_active ON store_categories(tenant_id) WHERE deleted_at IS NULL;
