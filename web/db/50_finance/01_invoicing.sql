-- =============================================================================
-- 01_INVOICING.SQL
-- =============================================================================
-- Invoicing system: invoices, items, payments, refunds.
-- INCLUDES tenant_id on invoice_items and FIXED totals calculation.
-- =============================================================================

-- =============================================================================
-- PAYMENT METHODS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Method info
    name TEXT NOT NULL,
    type TEXT NOT NULL
        CHECK (type IN ('cash', 'card', 'transfer', 'check', 'credit', 'other')),
    description TEXT,

    -- Settings
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    requires_reference BOOLEAN DEFAULT false,

    -- Display
    display_order INTEGER DEFAULT 100,
    icon TEXT,

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one default payment method per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_methods_one_default
ON public.payment_methods(tenant_id)
WHERE is_default = true AND is_active = true AND deleted_at IS NULL;

-- =============================================================================
-- INVOICES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Invoice number
    invoice_number TEXT NOT NULL,

    -- Relationships
    client_id UUID NOT NULL REFERENCES public.profiles(id),
    pet_id UUID REFERENCES public.pets(id),
    appointment_id UUID REFERENCES public.appointments(id),

    -- Dates
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,

    -- Amounts (computed by trigger)
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(12,2) DEFAULT 0,
    balance_due NUMERIC(12,2) GENERATED ALWAYS AS (total - amount_paid) STORED,

    -- Currency
    currency TEXT DEFAULT 'PYG',

    -- Status
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN (
            'draft',        -- Being created
            'sent',         -- Sent to client
            'viewed',       -- Client viewed
            'partial',      -- Partially paid
            'paid',         -- Fully paid
            'overdue',      -- Past due date
            'void',         -- Cancelled
            'refunded'      -- Refunded
        )),

    -- Payment terms
    payment_terms TEXT,

    -- Notes
    notes TEXT,
    internal_notes TEXT,
    footer_text TEXT,

    -- PDF
    pdf_url TEXT,
    pdf_generated_at TIMESTAMPTZ,

    -- Email tracking
    sent_at TIMESTAMPTZ,
    sent_to TEXT,
    opened_at TIMESTAMPTZ,

    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, invoice_number)
);

-- =============================================================================
-- INVOICE ITEMS - WITH TENANT_ID AND PRODUCT FK
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Item type
    item_type TEXT NOT NULL DEFAULT 'service'
        CHECK (item_type IN ('service', 'product', 'discount', 'custom')),

    -- References with proper FKs
    service_id UUID REFERENCES public.services(id),
    product_id UUID REFERENCES public.store_products(id),

    -- Details
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0 CHECK (discount_amount >= 0),
    tax_rate NUMERIC(5,2) DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),

    -- Computed total for this line item
    line_subtotal NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    line_tax NUMERIC(12,2) GENERATED ALWAYS AS ((quantity * unit_price - discount_amount) * tax_rate / 100) STORED,
    total NUMERIC(12,2) GENERATED ALWAYS AS ((quantity * unit_price - discount_amount) * (1 + tax_rate / 100)) STORED,

    -- Display
    display_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PAYMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id),

    -- Payment details
    payment_number TEXT,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),

    -- Method
    payment_method_id UUID REFERENCES public.payment_methods(id),
    payment_method_name TEXT,

    -- Reference
    reference_number TEXT,
    authorization_code TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'completed'
        CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),

    -- Notes
    notes TEXT,

    -- Received by
    received_by UUID REFERENCES public.profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- REFUNDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    payment_id UUID NOT NULL REFERENCES public.payments(id),

    -- Refund details
    refund_number TEXT,
    refund_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),

    -- Reason
    reason TEXT NOT NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'completed'
        CHECK (status IN ('pending', 'completed', 'failed')),

    -- Processed by
    processed_by UUID REFERENCES public.profiles(id),

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- CLIENT CREDITS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.client_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    client_id UUID NOT NULL REFERENCES public.profiles(id),

    -- Credit details
    amount NUMERIC(12,2) NOT NULL,
    type TEXT NOT NULL
        CHECK (type IN ('payment', 'refund', 'adjustment', 'reward', 'promo')),
    description TEXT,

    -- Reference
    invoice_id UUID REFERENCES public.invoices(id),
    payment_id UUID REFERENCES public.payments(id),

    -- Status
    status TEXT DEFAULT 'active'
        CHECK (status IN ('active', 'used', 'expired')),
    used_at TIMESTAMPTZ,
    used_on_invoice_id UUID REFERENCES public.invoices(id),
    expires_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_credits ENABLE ROW LEVEL SECURITY;

-- Payment methods: Staff manage
DROP POLICY IF EXISTS "Staff manage payment methods" ON public.payment_methods;
CREATE POLICY "Staff manage payment methods" ON public.payment_methods
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Service role full access payment methods" ON public.payment_methods;
CREATE POLICY "Service role full access payment methods" ON public.payment_methods
    FOR ALL TO service_role USING (true);

-- Invoices: Staff manage, clients view own
DROP POLICY IF EXISTS "Staff manage invoices" ON public.invoices;
CREATE POLICY "Staff manage invoices" ON public.invoices
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Clients view own invoices" ON public.invoices;
CREATE POLICY "Clients view own invoices" ON public.invoices
    FOR SELECT TO authenticated
    USING (client_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Service role full access invoices" ON public.invoices;
CREATE POLICY "Service role full access invoices" ON public.invoices
    FOR ALL TO service_role USING (true);

-- OPTIMIZED RLS: Invoice items uses direct tenant_id
DROP POLICY IF EXISTS "Staff manage invoice items" ON public.invoice_items;
CREATE POLICY "Staff manage invoice items" ON public.invoice_items
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Clients view invoice items" ON public.invoice_items;
CREATE POLICY "Clients view invoice items" ON public.invoice_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices i
            WHERE i.id = invoice_items.invoice_id
            AND i.client_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Service role full access invoice items" ON public.invoice_items;
CREATE POLICY "Service role full access invoice items" ON public.invoice_items
    FOR ALL TO service_role USING (true);

-- Payments: Staff manage, clients view own
DROP POLICY IF EXISTS "Staff manage payments" ON public.payments;
CREATE POLICY "Staff manage payments" ON public.payments
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Clients view own payments" ON public.payments;
CREATE POLICY "Clients view own payments" ON public.payments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices i
            WHERE i.id = payments.invoice_id
            AND i.client_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Service role full access payments" ON public.payments;
CREATE POLICY "Service role full access payments" ON public.payments
    FOR ALL TO service_role USING (true);

-- Refunds: Staff only
DROP POLICY IF EXISTS "Staff manage refunds" ON public.refunds;
CREATE POLICY "Staff manage refunds" ON public.refunds
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Service role full access refunds" ON public.refunds;
CREATE POLICY "Service role full access refunds" ON public.refunds
    FOR ALL TO service_role USING (true);

-- Credits: Staff manage, clients view own
DROP POLICY IF EXISTS "Staff manage credits" ON public.client_credits;
CREATE POLICY "Staff manage credits" ON public.client_credits
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Clients view own credits" ON public.client_credits;
CREATE POLICY "Clients view own credits" ON public.client_credits
    FOR SELECT TO authenticated
    USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Service role full access credits" ON public.client_credits;
CREATE POLICY "Service role full access credits" ON public.client_credits
    FOR ALL TO service_role USING (true);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_payment_methods_tenant ON public.payment_methods(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON public.payment_methods(is_active)
    WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON public.invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_pet ON public.invoices(pet_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status)
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_date_brin ON public.invoices
    USING BRIN(invoice_date) WITH (pages_per_range = 32);
CREATE INDEX IF NOT EXISTS idx_invoices_overdue ON public.invoices(due_date)
    WHERE status NOT IN ('paid', 'void', 'refunded') AND due_date < CURRENT_DATE AND deleted_at IS NULL;

-- Covering index for invoice list
CREATE INDEX IF NOT EXISTS idx_invoices_list ON public.invoices(tenant_id, invoice_date DESC)
    INCLUDE (invoice_number, client_id, status, total, balance_due)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_tenant ON public.invoice_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_service ON public.invoice_items(service_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product ON public.invoice_items(product_id);

CREATE INDEX IF NOT EXISTS idx_payments_tenant ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date_brin ON public.payments
    USING BRIN(payment_date) WITH (pages_per_range = 32);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_refunds_tenant ON public.refunds(tenant_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment ON public.refunds(payment_id);

CREATE INDEX IF NOT EXISTS idx_client_credits_tenant ON public.client_credits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_credits_client ON public.client_credits(client_id);
CREATE INDEX IF NOT EXISTS idx_client_credits_active ON public.client_credits(status)
    WHERE status = 'active';

-- =============================================================================
-- TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.payment_methods;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.invoices;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.payments;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-set tenant_id for invoice items
CREATE OR REPLACE FUNCTION public.invoice_items_set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        SELECT tenant_id INTO NEW.tenant_id
        FROM public.invoices
        WHERE id = NEW.invoice_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invoice_items_auto_tenant ON public.invoice_items;
CREATE TRIGGER invoice_items_auto_tenant
    BEFORE INSERT ON public.invoice_items
    FOR EACH ROW EXECUTE FUNCTION public.invoice_items_set_tenant_id();

-- =============================================================================
-- FIXED: UPDATE INVOICE TOTALS
-- Correctly calculates subtotal, discount, tax, and total
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_invoice_id UUID;
    v_subtotal NUMERIC(12,2);
    v_discount NUMERIC(12,2);
    v_tax NUMERIC(12,2);
    v_total NUMERIC(12,2);
BEGIN
    -- Get the invoice ID from either NEW or OLD
    v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

    -- Calculate subtotal (sum of line items excluding discount type)
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    INTO v_subtotal
    FROM public.invoice_items
    WHERE invoice_id = v_invoice_id
    AND item_type != 'discount';

    -- Calculate total discounts (line item discounts + discount type items)
    SELECT
        COALESCE(SUM(CASE WHEN item_type != 'discount' THEN discount_amount ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN item_type = 'discount' THEN ABS(quantity * unit_price) ELSE 0 END), 0)
    INTO v_discount
    FROM public.invoice_items
    WHERE invoice_id = v_invoice_id;

    -- Calculate tax (on taxable amount after discounts)
    SELECT COALESCE(SUM(
        (quantity * unit_price - discount_amount) * tax_rate / 100
    ), 0)
    INTO v_tax
    FROM public.invoice_items
    WHERE invoice_id = v_invoice_id
    AND item_type != 'discount';

    -- Calculate total
    v_total := v_subtotal - v_discount + v_tax;

    -- Update invoice
    UPDATE public.invoices
    SET
        subtotal = v_subtotal,
        discount_amount = v_discount,
        tax_amount = v_tax,
        total = v_total
    WHERE id = v_invoice_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invoice_items_update_totals ON public.invoice_items;
CREATE TRIGGER invoice_items_update_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
    FOR EACH ROW EXECUTE FUNCTION public.update_invoice_totals();

-- =============================================================================
-- UPDATE INVOICE ON PAYMENT
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_invoice_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_total_paid NUMERIC(12,2);
    v_invoice_total NUMERIC(12,2);
BEGIN
    -- Calculate total paid for this invoice
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_paid
    FROM public.payments
    WHERE invoice_id = NEW.invoice_id
    AND status = 'completed';

    -- Get invoice total
    SELECT total INTO v_invoice_total
    FROM public.invoices
    WHERE id = NEW.invoice_id;

    -- Update invoice
    UPDATE public.invoices
    SET
        amount_paid = v_total_paid,
        status = CASE
            WHEN v_total_paid >= v_invoice_total THEN 'paid'
            WHEN v_total_paid > 0 THEN 'partial'
            ELSE status
        END
    WHERE id = NEW.invoice_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_update_invoice ON public.payments;
CREATE TRIGGER payment_update_invoice
    AFTER INSERT OR UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_invoice_on_payment();

-- =============================================================================
-- THREAD-SAFE INVOICE NUMBER GENERATION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.generate_invoice_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_number INTEGER;
    v_year TEXT;
    v_lock_id BIGINT;
BEGIN
    v_year := TO_CHAR(NOW(), 'YYYY');

    -- Create a unique lock ID from tenant_id hash + document type + year
    v_lock_id := ('x' || substr(md5(p_tenant_id || 'INV' || v_year), 1, 8))::bit(32)::bigint;

    -- Acquire advisory lock
    PERFORM pg_advisory_xact_lock(v_lock_id);

    -- Get next number from sequences table
    INSERT INTO public.document_sequences (tenant_id, document_type, last_number, prefix)
    VALUES (p_tenant_id, 'invoice_' || v_year, 1, 'FAC-' || v_year)
    ON CONFLICT (tenant_id, document_type) DO UPDATE
    SET last_number = public.document_sequences.last_number + 1,
        updated_at = NOW()
    RETURNING last_number INTO v_number;

    RETURN 'FAC-' || v_year || '-' || LPAD(v_number::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- HELPER: GENERATE PAYMENT NUMBER
-- =============================================================================

CREATE OR REPLACE FUNCTION public.generate_payment_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_number INTEGER;
    v_lock_id BIGINT;
BEGIN
    v_lock_id := ('x' || substr(md5(p_tenant_id || 'PAY'), 1, 8))::bit(32)::bigint;
    PERFORM pg_advisory_xact_lock(v_lock_id);

    INSERT INTO public.document_sequences (tenant_id, document_type, last_number, prefix)
    VALUES (p_tenant_id, 'payment', 1, 'PAY')
    ON CONFLICT (tenant_id, document_type) DO UPDATE
    SET last_number = public.document_sequences.last_number + 1,
        updated_at = NOW()
    RETURNING last_number INTO v_number;

    RETURN 'PAY' || LPAD(v_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

