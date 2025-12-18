-- =============================================================================
-- 50_INVOICING.SQL
-- =============================================================================
-- Invoicing system: invoices, items, payments, refunds, payment methods.
--
-- Dependencies: 10_core/*, 40_scheduling/*
-- =============================================================================

-- =============================================================================
-- A. PAYMENT METHODS
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

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- B. INVOICES
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

    -- Amounts
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

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, invoice_number)
);

-- =============================================================================
-- C. INVOICE ITEMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,

    -- Item type
    item_type TEXT NOT NULL DEFAULT 'service'
        CHECK (item_type IN ('service', 'product', 'discount', 'custom')),

    -- References
    service_id UUID REFERENCES public.services(id),
    product_id UUID,  -- FK to products table

    -- Details
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    tax_rate NUMERIC(5,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Display
    display_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- D. PAYMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id),

    -- Payment details
    payment_number TEXT,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(12,2) NOT NULL,

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
-- E. REFUNDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    payment_id UUID NOT NULL REFERENCES public.payments(id),

    -- Refund details
    refund_number TEXT,
    refund_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(12,2) NOT NULL,

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
-- F. CREDITS (Client account credits)
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
-- G. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_credits ENABLE ROW LEVEL SECURITY;

-- Payment methods: Staff manage
CREATE POLICY "Staff manage payment methods" ON public.payment_methods
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- Invoices: Staff manage, clients view own
CREATE POLICY "Staff manage invoices" ON public.invoices
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id) AND deleted_at IS NULL);

CREATE POLICY "Clients view own invoices" ON public.invoices
    FOR SELECT TO authenticated
    USING (client_id = auth.uid() AND deleted_at IS NULL);

-- Invoice items: Via invoice policy
CREATE POLICY "Staff manage invoice items" ON public.invoice_items
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices i
            WHERE i.id = invoice_items.invoice_id
            AND public.is_staff_of(i.tenant_id)
        )
    );

CREATE POLICY "Clients view invoice items" ON public.invoice_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices i
            WHERE i.id = invoice_items.invoice_id
            AND i.client_id = auth.uid()
        )
    );

-- Payments: Staff manage, clients view own
CREATE POLICY "Staff manage payments" ON public.payments
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

CREATE POLICY "Clients view own payments" ON public.payments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices i
            WHERE i.id = payments.invoice_id
            AND i.client_id = auth.uid()
        )
    );

-- Refunds: Staff only
CREATE POLICY "Staff manage refunds" ON public.refunds
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

-- Credits: Staff manage, clients view own
CREATE POLICY "Staff manage credits" ON public.client_credits
    FOR ALL TO authenticated
    USING (public.is_staff_of(tenant_id));

CREATE POLICY "Clients view own credits" ON public.client_credits
    FOR SELECT TO authenticated
    USING (client_id = auth.uid());

-- =============================================================================
-- H. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_payment_methods_tenant ON public.payment_methods(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON public.payment_methods(is_active)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON public.invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_pet ON public.invoices(pet_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status)
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(invoice_date DESC)
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_overdue ON public.invoices(due_date)
    WHERE status NOT IN ('paid', 'void', 'refunded') AND due_date < CURRENT_DATE AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_service ON public.invoice_items(service_id);

CREATE INDEX IF NOT EXISTS idx_payments_tenant ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_refunds_tenant ON public.refunds(tenant_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment ON public.refunds(payment_id);

CREATE INDEX IF NOT EXISTS idx_client_credits_tenant ON public.client_credits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_credits_client ON public.client_credits(client_id);
CREATE INDEX IF NOT EXISTS idx_client_credits_active ON public.client_credits(status)
    WHERE status = 'active';

-- =============================================================================
-- I. TRIGGERS
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

-- =============================================================================
-- J. FUNCTIONS
-- =============================================================================

-- Generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_sequence INTEGER;
    v_year TEXT;
BEGIN
    v_year := TO_CHAR(NOW(), 'YYYY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM 9) AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM public.invoices
    WHERE tenant_id = p_tenant_id
      AND invoice_number LIKE 'FAC-' || v_year || '-%';

    RETURN 'FAC-' || v_year || '-' || LPAD(v_sequence::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Update invoice totals
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.invoices
    SET
        subtotal = COALESCE((
            SELECT SUM(quantity * unit_price)
            FROM public.invoice_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
              AND item_type != 'discount'
        ), 0),
        discount_amount = COALESCE((
            SELECT SUM(discount_amount)
            FROM public.invoice_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ), 0) + COALESCE((
            SELECT SUM(quantity * unit_price)
            FROM public.invoice_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
              AND item_type = 'discount'
        ), 0),
        tax_amount = COALESCE((
            SELECT SUM((quantity * unit_price - discount_amount) * tax_rate / 100)
            FROM public.invoice_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ), 0),
        total = COALESCE((
            SELECT SUM(total)
            FROM public.invoice_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ), 0)
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invoice_items_update_totals ON public.invoice_items;
CREATE TRIGGER invoice_items_update_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
    FOR EACH ROW EXECUTE FUNCTION public.update_invoice_totals();

-- Update invoice on payment
CREATE OR REPLACE FUNCTION public.update_invoice_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_total_paid NUMERIC(12,2);
    v_invoice_total NUMERIC(12,2);
BEGIN
    SELECT COALESCE(SUM(amount), 0), i.total
    INTO v_total_paid, v_invoice_total
    FROM public.invoices i
    LEFT JOIN public.payments p ON p.invoice_id = i.id AND p.status = 'completed'
    WHERE i.id = NEW.invoice_id
    GROUP BY i.total;

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
-- K. SEED DATA
-- =============================================================================

-- Default payment methods (per tenant - should be created on tenant setup)
-- This will be handled by tenant setup function

