-- =============================================================================
-- 21_SCHEMA_INVOICING.SQL
-- =============================================================================
-- Complete invoicing and payment system for veterinary services.
-- Includes: invoices, invoice items, payments, payment methods, and credits.
-- =============================================================================

-- =============================================================================
-- A. SERVICES CATALOG
-- =============================================================================
-- Billable services offered by the clinic.

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Service Details
    code TEXT,                              -- Internal code: 'CONSULT-001'
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,                          -- 'consultation', 'surgery', 'grooming', 'lab', etc.

    -- Pricing
    base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,2) DEFAULT 10.00,    -- IVA percentage
    is_taxable BOOLEAN DEFAULT TRUE,

    -- Duration (for scheduling)
    duration_minutes INTEGER DEFAULT 30,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

-- =============================================================================
-- B. PAYMENT METHODS
-- =============================================================================
-- Available payment methods per tenant.

CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Method Details
    name TEXT NOT NULL,                     -- 'Efectivo', 'Tarjeta Débito', 'Transferencia'
    type TEXT NOT NULL CHECK (type IN (
        'cash', 'debit_card', 'credit_card', 'bank_transfer',
        'mobile_payment', 'check', 'credit', 'other'
    )),

    -- Processing
    processing_fee_percent NUMERIC(5,2) DEFAULT 0,
    processing_fee_fixed NUMERIC(10,2) DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default payment methods
INSERT INTO payment_methods (tenant_id, name, type, is_default) VALUES
    ('adris', 'Efectivo', 'cash', TRUE),
    ('adris', 'Tarjeta de Débito', 'debit_card', FALSE),
    ('adris', 'Tarjeta de Crédito', 'credit_card', FALSE),
    ('adris', 'Transferencia Bancaria', 'bank_transfer', FALSE),
    ('petlife', 'Efectivo', 'cash', TRUE),
    ('petlife', 'Tarjeta de Débito', 'debit_card', FALSE)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- C. INVOICES
-- =============================================================================
-- Invoice header with totals and status.

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Invoice Number (human-readable, per tenant)
    invoice_number TEXT NOT NULL,

    -- Client & Pet
    client_id UUID NOT NULL REFERENCES profiles(id),
    pet_id UUID REFERENCES pets(id),        -- Optional: can invoice without pet

    -- Related Records
    appointment_id UUID REFERENCES appointments(id),
    medical_record_id UUID REFERENCES medical_records(id),

    -- Dates
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,

    -- Totals (calculated from items)
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Discount
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(12,2) DEFAULT 0,
    discount_reason TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded'
    )),

    -- Notes
    notes TEXT,
    internal_notes TEXT,                    -- Staff only

    -- Audit
    created_by UUID REFERENCES profiles(id),
    cancelled_by UUID REFERENCES profiles(id),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, invoice_number)
);

-- =============================================================================
-- D. INVOICE ITEMS
-- =============================================================================
-- Line items on an invoice (services, products, or custom).

CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    -- Item Type
    item_type TEXT NOT NULL CHECK (item_type IN ('service', 'product', 'custom')),

    -- Reference (based on type)
    service_id UUID REFERENCES services(id),
    product_id UUID REFERENCES store_products(id),

    -- Item Details (copied at time of invoice for historical accuracy)
    description TEXT NOT NULL,

    -- Pricing
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    tax_rate NUMERIC(5,2) DEFAULT 10.00,
    is_taxable BOOLEAN DEFAULT TRUE,

    -- Discount (per item)
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(12,2) DEFAULT 0,

    -- Calculated
    subtotal NUMERIC(12,2) NOT NULL,        -- quantity * unit_price - discount
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,           -- subtotal + tax

    -- Order
    sort_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- E. PAYMENTS
-- =============================================================================
-- Individual payment transactions.

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    invoice_id UUID NOT NULL REFERENCES invoices(id),

    -- Payment Details
    payment_method_id UUID REFERENCES payment_methods(id),
    amount NUMERIC(12,2) NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Reference
    reference_number TEXT,                  -- Check number, transaction ID, etc.

    -- Status
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN (
        'pending', 'completed', 'failed', 'refunded', 'cancelled'
    )),

    -- Notes
    notes TEXT,

    -- Audit
    received_by UUID REFERENCES profiles(id),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- F. REFUNDS
-- =============================================================================
-- Track refunds separately for clarity.

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    payment_id UUID REFERENCES payments(id),    -- Original payment being refunded

    -- Refund Details
    amount NUMERIC(12,2) NOT NULL,
    refund_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT NOT NULL,

    -- Method
    refund_method TEXT CHECK (refund_method IN (
        'original_method', 'cash', 'bank_transfer', 'credit', 'other'
    )),

    -- Status
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN (
        'pending', 'completed', 'failed'
    )),

    -- Audit
    processed_by UUID REFERENCES profiles(id),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- G. CLIENT CREDITS
-- =============================================================================
-- Store credit / prepaid balance.

CREATE TABLE IF NOT EXISTS client_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    client_id UUID NOT NULL REFERENCES profiles(id),

    -- Credit Details
    amount NUMERIC(12,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'deposit', 'refund_credit', 'promotional', 'adjustment'
    )),

    -- Reference
    invoice_id UUID REFERENCES invoices(id),
    notes TEXT,

    -- Expiry
    expires_at TIMESTAMPTZ,

    -- Status
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    used_invoice_id UUID REFERENCES invoices(id),

    -- Audit
    created_by UUID REFERENCES profiles(id),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- H. RECURRING INVOICES (Templates)
-- =============================================================================
-- For subscription services or regular treatments.

CREATE TABLE IF NOT EXISTS recurring_invoice_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    client_id UUID NOT NULL REFERENCES profiles(id),
    pet_id UUID REFERENCES pets(id),

    -- Template Details
    name TEXT NOT NULL,                     -- 'Monthly Grooming', 'Chronic Medication'

    -- Schedule
    frequency TEXT NOT NULL CHECK (frequency IN (
        'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'
    )),
    next_invoice_date DATE NOT NULL,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES recurring_invoice_templates(id) ON DELETE CASCADE,

    -- Item Details
    item_type TEXT NOT NULL CHECK (item_type IN ('service', 'product', 'custom')),
    service_id UUID REFERENCES services(id),
    product_id UUID REFERENCES store_products(id),
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- I. INVOICE SEQUENCES (Per Tenant)
-- =============================================================================
-- Track invoice numbering per tenant.

CREATE TABLE IF NOT EXISTS invoice_sequences (
    tenant_id TEXT PRIMARY KEY REFERENCES tenants(id),
    prefix TEXT DEFAULT 'INV',
    current_number INTEGER NOT NULL DEFAULT 0,
    format TEXT DEFAULT '{prefix}-{year}-{number}',  -- INV-2024-00001
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initialize sequences
INSERT INTO invoice_sequences (tenant_id, prefix, current_number) VALUES
    ('adris', 'ADR', 0),
    ('petlife', 'PL', 0)
ON CONFLICT (tenant_id) DO NOTHING;

-- =============================================================================
-- J. FUNCTION: Generate Invoice Number
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_invoice_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_number INTEGER;
    v_year TEXT;
    v_invoice_number TEXT;
BEGIN
    -- Lock and increment
    UPDATE invoice_sequences
    SET current_number = current_number + 1,
        updated_at = NOW()
    WHERE tenant_id = p_tenant_id
    RETURNING prefix, current_number INTO v_prefix, v_number;

    -- If no sequence exists, create one
    IF NOT FOUND THEN
        INSERT INTO invoice_sequences (tenant_id, prefix, current_number)
        VALUES (p_tenant_id, 'INV', 1)
        RETURNING prefix, current_number INTO v_prefix, v_number;
    END IF;

    v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    v_invoice_number := v_prefix || '-' || v_year || '-' || LPAD(v_number::TEXT, 5, '0');

    RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- K. FUNCTION: Calculate Invoice Totals
-- =============================================================================

CREATE OR REPLACE FUNCTION calculate_invoice_totals(p_invoice_id UUID)
RETURNS VOID AS $$
DECLARE
    v_subtotal NUMERIC(12,2);
    v_tax_amount NUMERIC(12,2);
    v_discount_amount NUMERIC(12,2);
    v_total NUMERIC(12,2);
    v_amount_paid NUMERIC(12,2);
    v_invoice RECORD;
BEGIN
    -- Get invoice for discount calculation
    SELECT * INTO v_invoice FROM invoices WHERE id = p_invoice_id;

    -- Sum items
    SELECT
        COALESCE(SUM(subtotal), 0),
        COALESCE(SUM(tax_amount), 0)
    INTO v_subtotal, v_tax_amount
    FROM invoice_items
    WHERE invoice_id = p_invoice_id;

    -- Calculate discount
    IF v_invoice.discount_type = 'percentage' THEN
        v_discount_amount := v_subtotal * (v_invoice.discount_value / 100);
    ELSE
        v_discount_amount := COALESCE(v_invoice.discount_value, 0);
    END IF;

    -- Calculate total
    v_total := v_subtotal + v_tax_amount - v_discount_amount;

    -- Sum payments
    SELECT COALESCE(SUM(amount), 0) INTO v_amount_paid
    FROM payments
    WHERE invoice_id = p_invoice_id AND status = 'completed';

    -- Subtract refunds
    SELECT v_amount_paid - COALESCE(SUM(amount), 0) INTO v_amount_paid
    FROM refunds
    WHERE invoice_id = p_invoice_id AND status = 'completed';

    -- Update invoice
    UPDATE invoices SET
        subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        discount_amount = v_discount_amount,
        total = v_total,
        amount_paid = v_amount_paid,
        balance_due = v_total - v_amount_paid,
        status = CASE
            WHEN v_total - v_amount_paid <= 0 THEN 'paid'
            WHEN v_amount_paid > 0 THEN 'partial'
            WHEN v_invoice.due_date < CURRENT_DATE AND v_invoice.status NOT IN ('paid', 'cancelled') THEN 'overdue'
            ELSE v_invoice.status
        END,
        updated_at = NOW()
    WHERE id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- L. TRIGGERS: Auto-calculate totals
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_recalculate_invoice()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM calculate_invoice_totals(OLD.invoice_id);
        RETURN OLD;
    ELSE
        PERFORM calculate_invoice_totals(NEW.invoice_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recalc_invoice_on_item_change ON invoice_items;
CREATE TRIGGER recalc_invoice_on_item_change
    AFTER INSERT OR UPDATE OR DELETE ON invoice_items
    FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_invoice();

DROP TRIGGER IF EXISTS recalc_invoice_on_payment ON payments;
CREATE TRIGGER recalc_invoice_on_payment
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_invoice();

DROP TRIGGER IF EXISTS recalc_invoice_on_refund ON refunds;
CREATE TRIGGER recalc_invoice_on_refund
    AFTER INSERT OR UPDATE OR DELETE ON refunds
    FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_invoice();

-- =============================================================================
-- M. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_services_tenant ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_payment_methods_tenant ON payment_methods(tenant_id);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_pet ON invoices(pet_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_service ON invoice_items(service_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product ON invoice_items(product_id);

CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_refunds_invoice ON refunds(invoice_id);
CREATE INDEX IF NOT EXISTS idx_client_credits_client ON client_credits(client_id);
CREATE INDEX IF NOT EXISTS idx_client_credits_unused ON client_credits(is_used) WHERE is_used = FALSE;

CREATE INDEX IF NOT EXISTS idx_recurring_templates_tenant ON recurring_invoice_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_next_date ON recurring_invoice_templates(next_invoice_date);

-- =============================================================================
-- N. RLS POLICIES
-- =============================================================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoice_items ENABLE ROW LEVEL SECURITY;

-- Services: Staff manage, all view
CREATE POLICY "Staff manage services" ON services FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Tenant view services" ON services FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND tenant_id = services.tenant_id)
);

-- Payment Methods: Staff manage, all view
CREATE POLICY "Staff manage payment methods" ON payment_methods FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Tenant view payment methods" ON payment_methods FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND tenant_id = payment_methods.tenant_id)
);

-- Invoices: Staff manage, clients view own
CREATE POLICY "Staff manage invoices" ON invoices FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Clients view own invoices" ON invoices FOR SELECT USING (client_id = auth.uid());

-- Invoice Items: Via invoice access
CREATE POLICY "Access invoice items via invoice" ON invoice_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND (public.is_staff_of(invoices.tenant_id) OR invoices.client_id = auth.uid())
    )
);

-- Payments: Staff manage, clients view own
CREATE POLICY "Staff manage payments" ON payments FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Clients view own payments" ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payments.invoice_id AND invoices.client_id = auth.uid())
);

-- Refunds: Staff only
CREATE POLICY "Staff manage refunds" ON refunds FOR ALL USING (public.is_staff_of(tenant_id));

-- Client Credits: Staff manage, clients view own
CREATE POLICY "Staff manage credits" ON client_credits FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Clients view own credits" ON client_credits FOR SELECT USING (client_id = auth.uid());

-- Recurring Templates: Staff only
CREATE POLICY "Staff manage recurring templates" ON recurring_invoice_templates FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Staff manage recurring items" ON recurring_invoice_items FOR ALL USING (
    EXISTS (SELECT 1 FROM recurring_invoice_templates t WHERE t.id = recurring_invoice_items.template_id AND public.is_staff_of(t.tenant_id))
);

-- =============================================================================
-- INVOICING SCHEMA COMPLETE
-- =============================================================================
