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
--
-- BEHAVIOR:
-- - If user has an invite: Use invite's tenant_id and role
-- - If user has no invite: Create profile with NULL tenant_id (app handles assignment)
-- - Pet owners without invites must be assigned to a tenant via the app
--
-- NOTE: Previously defaulted to 'adris' which was problematic for multi-tenancy.
-- Now requires explicit tenant assignment through invites or app logic.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    invite_record RECORD;
    v_tenant_id TEXT;
    v_role TEXT;
BEGIN
    -- Look for invite
    SELECT tenant_id, role INTO invite_record
    FROM public.clinic_invites
    WHERE email = NEW.email
    LIMIT 1;

    -- Determine tenant and role
    IF invite_record.tenant_id IS NOT NULL THEN
        -- User was invited to a specific clinic
        v_tenant_id := invite_record.tenant_id;
        v_role := COALESCE(invite_record.role, 'owner');

        -- Clean up used invite
        DELETE FROM public.clinic_invites WHERE email = NEW.email;
    ELSE
        -- No invite - check if this is a known demo/test account
        -- This allows seed scripts to work without requiring invites for demo users
        IF NEW.email IN ('admin@demo.com', 'vet@demo.com', 'owner@demo.com', 'owner2@demo.com') THEN
            v_tenant_id := 'adris';
            v_role := CASE
                WHEN NEW.email = 'admin@demo.com' THEN 'admin'
                WHEN NEW.email = 'vet@demo.com' THEN 'vet'
                ELSE 'owner'
            END;
        ELSIF NEW.email IN ('vet@petlife.com', 'admin@petlife.com') THEN
            v_tenant_id := 'petlife';
            v_role := CASE
                WHEN NEW.email = 'admin@petlife.com' THEN 'admin'
                ELSE 'vet'
            END;
        ELSE
            -- Unknown user without invite - profile created with NULL tenant
            -- App must handle tenant assignment (e.g., during booking flow)
            v_tenant_id := NULL;
            v_role := 'owner';
        END IF;
    END IF;

    -- Create profile
    INSERT INTO public.profiles (id, full_name, email, avatar_url, tenant_id, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        v_tenant_id,
        v_role
    );

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
-- Supports comprehensive fields: barcode, min_stock_level, expiry_date,
-- batch_number, supplier_name, and is_active status.

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
    v_description TEXT;
    v_barcode TEXT;
    v_min_stock NUMERIC;
    v_expiry_date DATE;
    v_batch_number TEXT;
    v_supplier_name TEXT;
    v_is_active BOOLEAN;
    v_old_qty NUMERIC;
    v_old_cost NUMERIC;
    v_new_wac NUMERIC;
BEGIN
    FOR v_row IN SELECT * FROM jsonb_array_elements(p_rows)
    LOOP
        BEGIN
            -- Extract all fields from row
            v_op := LOWER(TRIM(v_row->>'operation'));
            v_sku := TRIM(v_row->>'sku');
            v_name := TRIM(v_row->>'name');
            v_cat_name := TRIM(v_row->>'category');
            v_price := COALESCE((v_row->>'price')::NUMERIC, 0);
            v_qty := COALESCE((v_row->>'quantity')::NUMERIC, 0);
            v_cost := COALESCE((v_row->>'cost')::NUMERIC, 0);
            v_description := v_row->>'description';
            v_barcode := NULLIF(TRIM(v_row->>'barcode'), '');
            v_min_stock := COALESCE((v_row->>'min_stock_level')::NUMERIC, 0);
            v_batch_number := NULLIF(TRIM(v_row->>'batch_number'), '');
            v_supplier_name := NULLIF(TRIM(v_row->>'supplier_name'), '');
            v_is_active := COALESCE((v_row->>'is_active')::BOOLEAN, TRUE);

            -- Parse expiry date
            v_expiry_date := NULL;
            IF v_row->>'expiry_date' IS NOT NULL AND TRIM(v_row->>'expiry_date') <> '' THEN
                BEGIN
                    v_expiry_date := (v_row->>'expiry_date')::DATE;
                EXCEPTION WHEN OTHERS THEN
                    v_expiry_date := NULL;
                END;
            END IF;

            -- Skip empty rows or instruction rows
            IF v_op = '' AND v_sku = '' AND v_name = '' THEN
                CONTINUE;
            END IF;

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
                -- Create new product
                INSERT INTO store_products (
                    tenant_id,
                    category_id,
                    sku,
                    name,
                    description,
                    base_price,
                    barcode,
                    is_active
                )
                VALUES (
                    p_tenant_id,
                    v_cat_id,
                    COALESCE(NULLIF(v_sku, ''), 'AUTO_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || v_success_count),
                    v_name,
                    v_description,
                    v_price,
                    v_barcode,
                    v_is_active
                )
                RETURNING id INTO v_product_id;

                -- Create inventory record for new product
                INSERT INTO store_inventory (
                    product_id,
                    tenant_id,
                    stock_quantity,
                    min_stock_level,
                    weighted_average_cost,
                    expiry_date,
                    batch_number,
                    supplier_name
                )
                VALUES (
                    v_product_id,
                    p_tenant_id,
                    v_qty,
                    v_min_stock,
                    CASE WHEN v_cost > 0 THEN v_cost ELSE 0 END,
                    v_expiry_date,
                    v_batch_number,
                    v_supplier_name
                );

                -- Log initial stock as purchase if qty > 0
                IF v_qty > 0 THEN
                    INSERT INTO store_inventory_transactions (
                        tenant_id, product_id, type, quantity, unit_cost, performed_by, notes
                    )
                    VALUES (
                        p_tenant_id, v_product_id, 'purchase', v_qty, v_cost, p_performer_id, 'Stock inicial - Importación'
                    );
                END IF;

            ELSE
                -- Find existing product
                SELECT id INTO v_product_id FROM store_products
                WHERE tenant_id = p_tenant_id AND sku = v_sku;

                IF NOT FOUND THEN
                    RAISE EXCEPTION 'SKU % no encontrado', v_sku;
                END IF;

                -- Update product fields if provided
                IF v_name IS NOT NULL AND v_name <> '' THEN
                    UPDATE store_products
                    SET
                        name = v_name,
                        category_id = COALESCE(v_cat_id, category_id),
                        description = COALESCE(NULLIF(v_description, ''), description),
                        barcode = COALESCE(v_barcode, barcode),
                        is_active = v_is_active,
                        updated_at = NOW()
                    WHERE id = v_product_id;
                END IF;

                -- Update price if Price Update operation
                IF v_price > 0 AND v_op LIKE '%price%' THEN
                    UPDATE store_products SET base_price = v_price, updated_at = NOW() WHERE id = v_product_id;
                END IF;

                -- Ensure inventory record exists
                INSERT INTO store_inventory (product_id, tenant_id, stock_quantity, weighted_average_cost)
                VALUES (v_product_id, p_tenant_id, 0, 0)
                ON CONFLICT (product_id) DO NOTHING;

                -- Update inventory metadata if provided
                IF v_min_stock > 0 OR v_expiry_date IS NOT NULL OR v_batch_number IS NOT NULL OR v_supplier_name IS NOT NULL THEN
                    UPDATE store_inventory
                    SET
                        min_stock_level = CASE WHEN v_min_stock > 0 THEN v_min_stock ELSE min_stock_level END,
                        expiry_date = COALESCE(v_expiry_date, expiry_date),
                        batch_number = COALESCE(v_batch_number, batch_number),
                        supplier_name = COALESCE(v_supplier_name, supplier_name),
                        updated_at = NOW()
                    WHERE product_id = v_product_id;
                END IF;
            END IF;

            -- Process Inventory Transaction (if qty != 0 or it's a purchase)
            IF v_qty <> 0 OR v_op LIKE '%purchase%' THEN
                -- Get current inventory state
                SELECT stock_quantity, weighted_average_cost
                INTO v_old_qty, v_old_cost
                FROM store_inventory
                WHERE product_id = v_product_id;

                v_old_qty := COALESCE(v_old_qty, 0);
                v_old_cost := COALESCE(v_old_cost, 0);

                -- Calculate new weighted average cost for purchases
                IF v_op LIKE '%purchase%' AND v_qty > 0 AND v_cost > 0 THEN
                    IF (v_old_qty + v_qty) > 0 THEN
                        v_new_wac := ((v_old_qty * v_old_cost) + (v_qty * v_cost)) / (v_old_qty + v_qty);
                    ELSE
                        v_new_wac := v_cost;
                    END IF;
                ELSE
                    v_new_wac := v_old_cost;
                END IF;

                -- Update inventory
                UPDATE store_inventory
                SET
                    stock_quantity = stock_quantity + v_qty,
                    weighted_average_cost = v_new_wac,
                    expiry_date = COALESCE(v_expiry_date, expiry_date),
                    batch_number = COALESCE(v_batch_number, batch_number),
                    supplier_name = COALESCE(v_supplier_name, supplier_name),
                    updated_at = NOW()
                WHERE product_id = v_product_id;

                -- Log transaction
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
                        WHEN v_op LIKE '%expired%' THEN 'expired'
                        WHEN v_op LIKE '%return%' THEN 'return'
                        ELSE 'adjustment'
                    END,
                    v_qty,
                    CASE WHEN v_cost > 0 THEN v_cost ELSE NULL END,
                    p_performer_id,
                    'Importación masiva'
                );
            END IF;

            v_success_count := v_success_count + 1;

        EXCEPTION WHEN OTHERS THEN
            v_error_list := ARRAY_APPEND(v_error_list, 'Fila ' || (v_success_count + 1) || ' (SKU: ' || COALESCE(v_sku, 'N/A') || '): ' || SQLERRM);
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
