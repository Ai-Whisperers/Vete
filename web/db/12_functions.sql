-- =============================================================================
-- 12_FUNCTIONS.SQL
-- =============================================================================
-- Utility functions used across the application.
-- =============================================================================

-- =============================================================================
-- A. UPDATED_AT TRIGGER FUNCTION
-- =============================================================================
-- Automatically updates the updated_at column on row modification.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- B. IS_STAFF_OF (Authorization Helper)
-- =============================================================================
-- Checks if the current user is a staff member (vet/admin) of a given tenant.
-- Used in RLS policies for row-level security.

CREATE OR REPLACE FUNCTION public.is_staff_of(in_tenant_id TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND tenant_id = in_tenant_id
        AND role IN ('vet', 'admin')
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================================================
-- C. HANDLE_NEW_USER (Auth Trigger)
-- =============================================================================
-- Creates a profile when a new user signs up.
-- Uses invite table to determine role and tenant.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    invite_record RECORD;
    default_tenant TEXT := 'adris';
BEGIN
    -- Look for invite
    SELECT tenant_id, role INTO invite_record
    FROM public.clinic_invites
    WHERE email = NEW.email;

    -- Create profile
    INSERT INTO public.profiles (id, full_name, email, avatar_url, tenant_id, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(invite_record.tenant_id, default_tenant),
        COALESCE(invite_record.role, 'owner')
    );

    -- Clean up used invite
    IF invite_record.tenant_id IS NOT NULL THEN
        DELETE FROM public.clinic_invites WHERE email = NEW.email;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- D. PROTECT_CRITICAL_PROFILE_COLUMNS (Security)
-- =============================================================================
-- Prevents users from modifying their own role or tenant_id.

CREATE OR REPLACE FUNCTION public.protect_critical_profile_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Only service_role can modify role or tenant_id
    IF (current_user NOT IN ('postgres', 'service_role')) THEN
        IF (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.tenant_id IS DISTINCT FROM OLD.tenant_id) THEN
            RAISE EXCEPTION 'You are not authorized to change role or tenant_id.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- E. HANDLE_NEW_PET_VACCINES (Auto-assign vaccines)
-- =============================================================================
-- Creates pending vaccine records based on templates when a pet is registered.

CREATE OR REPLACE FUNCTION public.handle_new_pet_vaccines()
RETURNS TRIGGER AS $$
DECLARE
    template RECORD;
BEGIN
    FOR template IN
        SELECT * FROM vaccine_templates WHERE species = LOWER(NEW.species)
    LOOP
        INSERT INTO vaccines (pet_id, name, status)
        VALUES (NEW.id, template.vaccine_name, 'pending');
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- F. PROCESS_INVENTORY_TRANSACTION (WAC Calculation)
-- =============================================================================
-- Updates stock and weighted average cost after inventory transactions.

CREATE OR REPLACE FUNCTION public.process_inventory_transaction()
RETURNS TRIGGER AS $$
DECLARE
    current_stock NUMERIC;
    current_wac NUMERIC;
    new_stock NUMERIC;
    new_wac NUMERIC;
BEGIN
    -- Get current values (with lock)
    SELECT stock_quantity, weighted_average_cost INTO current_stock, current_wac
    FROM store_inventory
    WHERE product_id = NEW.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
        -- Initialize inventory if missing
        INSERT INTO store_inventory (product_id, tenant_id, stock_quantity, weighted_average_cost)
        VALUES (NEW.product_id, NEW.tenant_id, 0, 0)
        RETURNING stock_quantity, weighted_average_cost INTO current_stock, current_wac;
    END IF;

    -- Calculate new stock
    new_stock := current_stock + NEW.quantity;

    -- Calculate WAC only for additions
    IF NEW.quantity > 0 AND NEW.unit_cost IS NOT NULL AND NEW.unit_cost > 0 THEN
        IF new_stock > 0 THEN
            new_wac := ((current_stock * current_wac) + (NEW.quantity * NEW.unit_cost)) / new_stock;
        ELSE
            new_wac := NEW.unit_cost;
        END IF;
    ELSE
        new_wac := current_wac;
    END IF;

    -- Update inventory
    UPDATE store_inventory
    SET stock_quantity = new_stock,
        weighted_average_cost = new_wac,
        updated_at = NOW()
    WHERE product_id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- G. TRACK_PRICE_CHANGE (Audit)
-- =============================================================================
-- Records price changes in history table.

CREATE OR REPLACE FUNCTION public.track_price_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.base_price IS DISTINCT FROM NEW.base_price) THEN
        INSERT INTO store_price_history (tenant_id, product_id, old_price, new_price, changed_at)
        VALUES (NEW.tenant_id, NEW.id, OLD.base_price, NEW.base_price, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- H. CREATE_DISEASE_REPORT (Epidemiology)
-- =============================================================================
-- Auto-creates disease reports from medical records with diagnosis codes.

CREATE OR REPLACE FUNCTION public.create_disease_report()
RETURNS TRIGGER AS $$
DECLARE
    v_location_zone TEXT;
    v_age_months INTEGER;
    v_is_vaccinated BOOLEAN;
BEGIN
    -- Only create report if diagnosis code is set
    IF NEW.diagnosis_code IS NOT NULL THEN
        -- Fetch anonymized data
        SELECT
            pr.city,
            EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) * 12 +
            EXTRACT(MONTH FROM AGE(CURRENT_DATE, p.birth_date)),
            EXISTS(SELECT 1 FROM vaccines v WHERE v.pet_id = p.id AND v.status = 'verified')
        INTO v_location_zone, v_age_months, v_is_vaccinated
        FROM pets p
        JOIN profiles pr ON p.owner_id = pr.id
        WHERE p.id = NEW.pet_id;

        -- Insert disease report
        INSERT INTO disease_reports (
            tenant_id, diagnosis_code_id, species, reported_date,
            location_zone, severity, age_months, is_vaccinated
        )
        SELECT
            p.tenant_id,
            NEW.diagnosis_code,
            p.species,
            COALESCE(NEW.visit_date, CURRENT_DATE),
            v_location_zone,
            CASE
                WHEN NEW.notes ILIKE '%grave%' OR NEW.notes ILIKE '%severo%' THEN 'severe'
                WHEN NEW.notes ILIKE '%moderado%' THEN 'moderate'
                ELSE 'mild'
            END,
            v_age_months,
            v_is_vaccinated
        FROM pets p
        WHERE p.id = NEW.pet_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- I. LOG_ACTION (Audit Helper)
-- =============================================================================
-- Helper function for audit logging.

CREATE OR REPLACE FUNCTION public.log_action(
    p_tenant_id TEXT,
    p_user_id UUID,
    p_action TEXT,
    p_resource TEXT,
    p_details JSONB
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, details)
    VALUES (p_tenant_id, p_user_id, p_action, p_resource, p_details)
    RETURNING id INTO log_id;
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- J. IMPORT_INVENTORY_BATCH (Bulk Import)
-- =============================================================================
-- Atomic bulk import for inventory from Excel/CSV.

CREATE OR REPLACE FUNCTION public.import_inventory_batch(
    p_tenant_id TEXT,
    p_performer_id UUID,
    p_rows JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_row JSONB;
    v_success_count INT := 0;
    v_error_list TEXT[] := ARRAY[]::TEXT[];
    v_product_id UUID;
    v_cat_id UUID;
    v_sku TEXT;
    v_name TEXT;
    v_cat_name TEXT;
    v_slug TEXT;
    v_price NUMERIC;
    v_qty NUMERIC;
    v_cost NUMERIC;
    v_op TEXT;
BEGIN
    FOR v_row IN SELECT * FROM jsonb_array_elements(p_rows)
    LOOP
        BEGIN
            v_op := LOWER(TRIM(v_row->>'operation'));
            v_sku := TRIM(v_row->>'sku');
            v_name := TRIM(v_row->>'name');
            v_cat_name := TRIM(v_row->>'category');
            v_price := (v_row->>'price')::NUMERIC;
            v_qty := (v_row->>'quantity')::NUMERIC;
            v_cost := (v_row->>'cost')::NUMERIC;

            -- Create/Update Category
            v_cat_id := NULL;
            IF v_cat_name IS NOT NULL AND v_cat_name <> '' THEN
                v_slug := LOWER(REGEXP_REPLACE(v_cat_name, '\s+', '-', 'g'));
                INSERT INTO store_categories (tenant_id, name, slug)
                VALUES (p_tenant_id, v_cat_name, v_slug)
                ON CONFLICT (tenant_id, slug) DO UPDATE SET name = v_cat_name
                RETURNING id INTO v_cat_id;
            END IF;

            -- Product Logic
            IF v_op = 'new product' OR v_sku IS NULL OR v_sku = '' THEN
                INSERT INTO store_products (tenant_id, category_id, sku, name, description, base_price)
                VALUES (
                    p_tenant_id, v_cat_id,
                    COALESCE(v_sku, 'AUTO_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || v_success_count),
                    v_name, v_row->>'description', v_price
                )
                RETURNING id INTO v_product_id;
            ELSE
                SELECT id INTO v_product_id FROM store_products
                WHERE tenant_id = p_tenant_id AND sku = v_sku;

                IF NOT FOUND THEN
                    RAISE EXCEPTION 'SKU % not found', v_sku;
                END IF;

                IF v_name <> '' THEN
                    UPDATE store_products
                    SET name = v_name, category_id = COALESCE(v_cat_id, category_id)
                    WHERE id = v_product_id;
                END IF;

                IF v_price > 0 AND v_op LIKE '%price%' THEN
                    UPDATE store_products SET base_price = v_price WHERE id = v_product_id;
                END IF;
            END IF;

            -- Inventory Transaction
            IF v_qty <> 0 OR v_op = 'purchase' THEN
                INSERT INTO store_inventory_transactions (
                    tenant_id, product_id, type, quantity, unit_cost, performed_by, notes
                )
                VALUES (
                    p_tenant_id, v_product_id,
                    CASE
                        WHEN v_op LIKE '%purchase%' THEN 'purchase'
                        WHEN v_op LIKE '%sale%' THEN 'sale'
                        WHEN v_op LIKE '%damage%' THEN 'damage'
                        WHEN v_op LIKE '%theft%' THEN 'theft'
                        ELSE 'adjustment'
                    END,
                    v_qty, v_cost, p_performer_id, 'Batch Import'
                );
            END IF;

            v_success_count := v_success_count + 1;

        EXCEPTION WHEN OTHERS THEN
            v_error_list := ARRAY_APPEND(v_error_list, 'Row ' || v_success_count || ': ' || SQLERRM);
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'success_count', v_success_count,
        'errors', v_error_list
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNCTIONS COMPLETE
-- =============================================================================
