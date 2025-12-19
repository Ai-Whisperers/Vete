-- =============================================================================
-- 006_ADD_CONSTRAINTS.SQL - Business rule constraints
-- =============================================================================
BEGIN;

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_hospitalization ON public.hospitalizations (pet_id)
    WHERE status NOT IN ('discharged', 'deceased', 'transferred') AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_payment_method ON public.payment_methods (tenant_id)
    WHERE is_default = true AND is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_microchip ON public.pets (microchip_number)
    WHERE microchip_number IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_qr_tag_per_pet ON public.qr_tags (pet_id)
    WHERE pet_id IS NOT NULL AND is_active = true;

-- Invoice constraints
DO $$ BEGIN ALTER TABLE public.invoices ADD CONSTRAINT invoices_amounts_non_negative
    CHECK (subtotal >= 0 AND total >= 0 AND amount_paid >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE public.invoices ADD CONSTRAINT invoices_due_date_valid
    CHECK (due_date IS NULL OR due_date >= invoice_date);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Payment constraints
DO $$ BEGIN ALTER TABLE public.payments ADD CONSTRAINT payments_amount_positive CHECK (amount > 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE public.refunds ADD CONSTRAINT refunds_amount_positive CHECK (amount > 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Store constraints
DO $$ BEGIN ALTER TABLE public.store_products ADD CONSTRAINT store_products_prices_valid
    CHECK (base_price >= 0 AND (sale_price IS NULL OR sale_price >= 0));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE public.store_inventory ADD CONSTRAINT store_inventory_stock_non_negative
    CHECK (stock_quantity >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE public.store_coupons ADD CONSTRAINT store_coupons_discount_positive CHECK (discount_value > 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE public.store_coupons ADD CONSTRAINT store_coupons_percentage_valid
    CHECK (discount_type != 'percentage' OR (discount_value > 0 AND discount_value <= 100));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Hospitalization constraints
DO $$ BEGIN ALTER TABLE public.kennels ADD CONSTRAINT kennels_daily_rate_non_negative CHECK (daily_rate >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE public.hospitalizations ADD CONSTRAINT hospitalizations_discharge_after_admission
    CHECK (actual_discharge IS NULL OR actual_discharge >= admitted_at);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Vitals constraints
DO $$ BEGIN ALTER TABLE public.hospitalization_vitals ADD CONSTRAINT vitals_temperature_valid
    CHECK (temperature IS NULL OR (temperature >= 30 AND temperature <= 45));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE public.hospitalization_vitals ADD CONSTRAINT vitals_heart_rate_valid
    CHECK (heart_rate IS NULL OR (heart_rate >= 20 AND heart_rate <= 400));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMIT;
