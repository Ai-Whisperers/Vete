-- =============================================================================
-- 03_HELPER_FUNCTIONS.SQL
-- =============================================================================
-- Additional helper functions for business logic and API support.
-- These extend the core functions with specific business operations.
--
-- Dependencies: 02_core_functions.sql
-- =============================================================================

-- =============================================================================
-- A. PET MANAGEMENT FUNCTIONS
-- =============================================================================

-- Get pet by QR tag code (public lookup)
CREATE OR REPLACE FUNCTION public.get_pet_by_tag(tag_code TEXT)
RETURNS TABLE (
    pet_id UUID,
    pet_name TEXT,
    species TEXT,
    breed TEXT,
    photo_url TEXT,
    owner_name TEXT,
    owner_phone TEXT,
    clinic_name TEXT,
    clinic_phone TEXT,
    is_lost BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.species,
        p.breed,
        p.photo_url,
        pr.full_name,
        pr.phone,
        t.name,
        t.phone,
        EXISTS (SELECT 1 FROM public.lost_pets lp WHERE lp.pet_id = p.id AND lp.status = 'lost')
    FROM public.qr_tags qt
    INNER JOIN public.pets p ON qt.pet_id = p.id
    LEFT JOIN public.profiles pr ON p.owner_id = pr.id
    LEFT JOIN public.tenants t ON p.tenant_id = t.id
    WHERE qt.code = tag_code
      AND qt.is_active = TRUE
      AND qt.is_registered = TRUE
      AND p.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_pet_by_tag IS 'Public lookup of pet info by QR tag code';

-- Assign QR tag to pet
CREATE OR REPLACE FUNCTION public.assign_tag_to_pet(
    p_tag_code TEXT,
    p_pet_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_tag_id UUID;
    v_pet_tenant TEXT;
BEGIN
    -- Get pet's tenant
    SELECT tenant_id INTO v_pet_tenant
    FROM public.pets
    WHERE id = p_pet_id AND deleted_at IS NULL;

    IF v_pet_tenant IS NULL THEN
        RAISE EXCEPTION 'Pet not found';
    END IF;

    -- Check authorization
    IF NOT public.is_owner_of_pet(p_pet_id) AND NOT public.is_staff_of(v_pet_tenant) THEN
        RAISE EXCEPTION 'Not authorized to assign tag to this pet';
    END IF;

    -- Find and update tag
    UPDATE public.qr_tags
    SET pet_id = p_pet_id,
        assigned_at = NOW(),
        assigned_by = auth.uid(),
        is_registered = TRUE
    WHERE code = p_tag_code
      AND is_active = TRUE
      AND (pet_id IS NULL OR pet_id = p_pet_id)  -- Allow reassignment to same pet
      AND (tenant_id IS NULL OR tenant_id = v_pet_tenant)
    RETURNING id INTO v_tag_id;

    RETURN v_tag_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.assign_tag_to_pet IS 'Assign a QR tag to a pet';

-- Search pets (staff only, within tenant)
CREATE OR REPLACE FUNCTION public.search_pets(
    p_tenant_id TEXT,
    p_query TEXT,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    species TEXT,
    breed TEXT,
    photo_url TEXT,
    owner_id UUID,
    owner_name TEXT,
    owner_phone TEXT
) AS $$
BEGIN
    -- Check authorization
    IF NOT public.is_staff_of(p_tenant_id) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.species,
        p.breed,
        p.photo_url,
        p.owner_id,
        pr.full_name,
        pr.phone
    FROM public.pets p
    LEFT JOIN public.profiles pr ON p.owner_id = pr.id
    WHERE p.tenant_id = p_tenant_id
      AND p.deleted_at IS NULL
      AND (
          p.name ILIKE '%' || p_query || '%'
          OR p.microchip_number ILIKE '%' || p_query || '%'
          OR pr.full_name ILIKE '%' || p_query || '%'
          OR pr.phone ILIKE '%' || p_query || '%'
      )
    ORDER BY
        CASE WHEN p.name ILIKE p_query || '%' THEN 0 ELSE 1 END,
        p.name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.search_pets IS 'Search pets by name, microchip, or owner info';

-- Get pet age in human-readable format
CREATE OR REPLACE FUNCTION public.get_pet_age(p_pet_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_birth_date DATE;
    v_years INTEGER;
    v_months INTEGER;
BEGIN
    SELECT birth_date INTO v_birth_date
    FROM public.pets
    WHERE id = p_pet_id;

    IF v_birth_date IS NULL THEN
        RETURN NULL;
    END IF;

    v_years := EXTRACT(YEAR FROM age(CURRENT_DATE, v_birth_date));
    v_months := EXTRACT(MONTH FROM age(CURRENT_DATE, v_birth_date));

    IF v_years >= 1 THEN
        IF v_months > 0 THEN
            RETURN v_years || ' año' || CASE WHEN v_years > 1 THEN 's' ELSE '' END || ' y ' || v_months || ' mes' || CASE WHEN v_months > 1 THEN 'es' ELSE '' END;
        ELSE
            RETURN v_years || ' año' || CASE WHEN v_years > 1 THEN 's' ELSE '' END;
        END IF;
    ELSE
        RETURN v_months || ' mes' || CASE WHEN v_months > 1 THEN 'es' ELSE '' END;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_pet_age IS 'Get pet age in human-readable Spanish format';

-- =============================================================================
-- B. INVENTORY FUNCTIONS
-- =============================================================================

-- Process inventory transaction (updates stock and WAC)
CREATE OR REPLACE FUNCTION public.process_inventory_transaction()
RETURNS TRIGGER AS $$
DECLARE
    v_current_qty NUMERIC;
    v_current_cost NUMERIC;
    v_new_qty NUMERIC;
    v_new_cost NUMERIC;
BEGIN
    -- Get current inventory
    SELECT stock_quantity, weighted_average_cost
    INTO v_current_qty, v_current_cost
    FROM public.store_inventory
    WHERE product_id = NEW.product_id;

    IF NOT FOUND THEN
        -- Create inventory record if doesn't exist
        INSERT INTO public.store_inventory (product_id, tenant_id, stock_quantity, weighted_average_cost)
        VALUES (NEW.product_id, NEW.tenant_id, 0, 0);
        v_current_qty := 0;
        v_current_cost := 0;
    END IF;

    -- Calculate new quantity
    v_new_qty := v_current_qty + NEW.quantity;

    -- Calculate new WAC for purchases
    IF NEW.type = 'purchase' AND NEW.quantity > 0 AND NEW.unit_cost IS NOT NULL THEN
        v_new_cost := ((v_current_qty * v_current_cost) + (NEW.quantity * NEW.unit_cost)) / NULLIF(v_new_qty, 0);
    ELSE
        v_new_cost := v_current_cost;
    END IF;

    -- Update inventory
    UPDATE public.store_inventory
    SET stock_quantity = v_new_qty,
        weighted_average_cost = COALESCE(v_new_cost, weighted_average_cost),
        updated_at = NOW()
    WHERE product_id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.process_inventory_transaction IS 'Updates stock and WAC on inventory transaction';

-- Track price changes
CREATE OR REPLACE FUNCTION public.track_price_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.base_price IS DISTINCT FROM NEW.base_price THEN
        INSERT INTO public.store_price_history (tenant_id, product_id, old_price, new_price, price_type, changed_by)
        VALUES (NEW.tenant_id, NEW.id, OLD.base_price, NEW.base_price, 'base', auth.uid());
    END IF;

    IF OLD.sale_price IS DISTINCT FROM NEW.sale_price THEN
        INSERT INTO public.store_price_history (tenant_id, product_id, old_price, new_price, price_type, changed_by)
        VALUES (NEW.tenant_id, NEW.id, OLD.sale_price, NEW.sale_price, 'sale', auth.uid());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.track_price_change IS 'Logs product price changes to history';

-- Validate coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
    p_tenant_id TEXT,
    p_code TEXT,
    p_user_id UUID DEFAULT NULL,
    p_cart_total NUMERIC DEFAULT 0
)
RETURNS TABLE (
    is_valid BOOLEAN,
    coupon_id UUID,
    discount_type TEXT,
    discount_value NUMERIC,
    discount_amount NUMERIC,
    error_message TEXT
) AS $$
DECLARE
    v_coupon RECORD;
    v_user_usage INTEGER;
    v_discount_amount NUMERIC;
BEGIN
    -- Find coupon
    SELECT * INTO v_coupon
    FROM public.store_coupons
    WHERE tenant_id = p_tenant_id
      AND code = UPPER(p_code)
      AND is_active = TRUE
      AND (valid_from IS NULL OR valid_from <= NOW())
      AND (valid_until IS NULL OR valid_until >= NOW());

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, 'Cupón no válido o expirado'::TEXT;
        RETURN;
    END IF;

    -- Check minimum purchase
    IF v_coupon.min_purchase_amount IS NOT NULL AND p_cart_total < v_coupon.min_purchase_amount THEN
        RETURN QUERY SELECT FALSE, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, NULL::NUMERIC,
            ('Compra mínima: Gs. ' || v_coupon.min_purchase_amount::TEXT)::TEXT;
        RETURN;
    END IF;

    -- Check global usage limit
    IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
        RETURN QUERY SELECT FALSE, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, NULL::NUMERIC,
            'Cupón agotado'::TEXT;
        RETURN;
    END IF;

    -- Check per-user limit (if user provided)
    IF p_user_id IS NOT NULL AND v_coupon.usage_limit_per_user IS NOT NULL THEN
        SELECT COUNT(*) INTO v_user_usage
        FROM public.invoices i
        WHERE i.client_id = p_user_id
          AND i.coupon_code = v_coupon.code
          AND i.status NOT IN ('cancelled', 'refunded');

        IF v_user_usage >= v_coupon.usage_limit_per_user THEN
            RETURN QUERY SELECT FALSE, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, NULL::NUMERIC,
                'Ya usaste este cupón'::TEXT;
            RETURN;
        END IF;
    END IF;

    -- Calculate discount
    IF v_coupon.discount_type = 'percentage' THEN
        v_discount_amount := p_cart_total * (v_coupon.discount_value / 100);
    ELSE
        v_discount_amount := v_coupon.discount_value;
    END IF;

    -- Apply max discount cap
    IF v_coupon.max_discount_amount IS NOT NULL AND v_discount_amount > v_coupon.max_discount_amount THEN
        v_discount_amount := v_coupon.max_discount_amount;
    END IF;

    RETURN QUERY SELECT TRUE, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, v_discount_amount, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.validate_coupon IS 'Validates a coupon code and returns discount info';

-- =============================================================================
-- C. CLINICAL FUNCTIONS
-- =============================================================================

-- Handle new pet vaccines (auto-create from templates)
CREATE OR REPLACE FUNCTION public.handle_new_pet_vaccines()
RETURNS TRIGGER AS $$
DECLARE
    v_template RECORD;
BEGIN
    -- Get vaccine templates for this species
    FOR v_template IN
        SELECT * FROM public.vaccine_templates
        WHERE NEW.species = ANY(species)
          AND is_active = TRUE
          AND (tenant_id IS NULL OR tenant_id = NEW.tenant_id)
        ORDER BY display_order
    LOOP
        -- Create scheduled vaccine record
        INSERT INTO public.vaccines (pet_id, template_id, name, administered_date, status)
        VALUES (
            NEW.id,
            v_template.id,
            v_template.name,
            CURRENT_DATE,  -- Placeholder date
            'scheduled'
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.handle_new_pet_vaccines IS 'Auto-creates vaccine records for new pets based on templates';

-- Get pet's active insurance
CREATE OR REPLACE FUNCTION public.get_pet_active_insurance(p_pet_id UUID)
RETURNS TABLE (
    policy_id UUID,
    provider_name TEXT,
    policy_number TEXT,
    plan_name TEXT,
    annual_limit NUMERIC,
    deductible_amount NUMERIC,
    coinsurance_percentage NUMERIC,
    expiration_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ip.id,
        prov.name,
        ip.policy_number,
        ip.plan_name,
        ip.annual_limit,
        ip.deductible_amount,
        ip.coinsurance_percentage,
        ip.expiration_date
    FROM public.insurance_policies ip
    INNER JOIN public.insurance_providers prov ON ip.provider_id = prov.id
    WHERE ip.pet_id = p_pet_id
      AND ip.status = 'active'
      AND (ip.expiration_date IS NULL OR ip.expiration_date >= CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_pet_active_insurance IS 'Get active insurance policy for a pet';

-- =============================================================================
-- D. APPOINTMENT FUNCTIONS
-- =============================================================================

-- Check for appointment overlaps
CREATE OR REPLACE FUNCTION public.check_appointment_overlap(
    p_tenant_id TEXT,
    p_vet_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_exclude_id UUID DEFAULT NULL
)
RETURNS TABLE (
    has_overlap BOOLEAN,
    conflicting_id UUID,
    conflicting_start TIMESTAMPTZ,
    conflicting_end TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TRUE,
        a.id,
        a.start_time,
        a.end_time
    FROM public.appointments a
    WHERE a.tenant_id = p_tenant_id
      AND a.vet_id = p_vet_id
      AND a.status NOT IN ('cancelled', 'no_show')
      AND (p_exclude_id IS NULL OR a.id != p_exclude_id)
      AND a.start_time < p_end_time
      AND a.end_time > p_start_time
    LIMIT 1;

    -- If no overlap found, return false
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.check_appointment_overlap IS 'Check if appointment time conflicts with existing appointments';

-- Get available appointment slots
CREATE OR REPLACE FUNCTION public.get_available_slots(
    p_tenant_id TEXT,
    p_date DATE,
    p_service_id UUID DEFAULT NULL,
    p_vet_id UUID DEFAULT NULL,
    p_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE (
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ,
    vet_id UUID,
    vet_name TEXT
) AS $$
DECLARE
    v_work_start TIME := '08:00';
    v_work_end TIME := '18:00';
    v_slot_time TIMESTAMPTZ;
    v_slot_end TIMESTAMPTZ;
    v_vet RECORD;
BEGIN
    -- Get vets (all or specific)
    FOR v_vet IN
        SELECT p.id, p.full_name
        FROM public.profiles p
        WHERE p.tenant_id = p_tenant_id
          AND p.role = 'vet'
          AND p.deleted_at IS NULL
          AND (p_vet_id IS NULL OR p.id = p_vet_id)
    LOOP
        -- Generate slots for the day
        v_slot_time := p_date + v_work_start;

        WHILE v_slot_time < p_date + v_work_end LOOP
            v_slot_end := v_slot_time + (p_duration_minutes || ' minutes')::INTERVAL;

            -- Check if slot is available
            IF NOT EXISTS (
                SELECT 1 FROM public.appointments a
                WHERE a.tenant_id = p_tenant_id
                  AND a.vet_id = v_vet.id
                  AND a.status NOT IN ('cancelled', 'no_show')
                  AND a.start_time < v_slot_end
                  AND a.end_time > v_slot_time
            ) THEN
                slot_start := v_slot_time;
                slot_end := v_slot_end;
                vet_id := v_vet.id;
                vet_name := v_vet.full_name;
                RETURN NEXT;
            END IF;

            v_slot_time := v_slot_time + (p_duration_minutes || ' minutes')::INTERVAL;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_available_slots IS 'Get available appointment slots for a date';

-- =============================================================================
-- E. CLIENT FUNCTIONS
-- =============================================================================

-- Get client pet counts (batch lookup)
CREATE OR REPLACE FUNCTION public.get_client_pet_counts(
    p_client_ids UUID[],
    p_tenant_id TEXT
)
RETURNS TABLE (
    client_id UUID,
    pet_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.owner_id,
        COUNT(*)
    FROM public.pets p
    WHERE p.owner_id = ANY(p_client_ids)
      AND p.tenant_id = p_tenant_id
      AND p.deleted_at IS NULL
    GROUP BY p.owner_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_client_pet_counts IS 'Get pet counts for multiple clients';

-- Get client last appointments (batch lookup)
CREATE OR REPLACE FUNCTION public.get_client_last_appointments(
    p_client_ids UUID[],
    p_tenant_id TEXT
)
RETURNS TABLE (
    client_id UUID,
    last_appointment_date TIMESTAMPTZ,
    last_appointment_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (p.owner_id)
        p.owner_id,
        a.start_time,
        a.status
    FROM public.appointments a
    INNER JOIN public.pets p ON a.pet_id = p.id
    WHERE p.owner_id = ANY(p_client_ids)
      AND a.tenant_id = p_tenant_id
      AND a.status IN ('completed', 'confirmed', 'checked_in')
    ORDER BY p.owner_id, a.start_time DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_client_last_appointments IS 'Get last appointment for multiple clients';

-- =============================================================================
-- F. INVITE FUNCTIONS
-- =============================================================================

-- Create clinic invite
CREATE OR REPLACE FUNCTION public.create_clinic_invite(
    p_tenant_id TEXT,
    p_email TEXT,
    p_role TEXT,
    p_invitee_name TEXT DEFAULT NULL,
    p_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_invite_id UUID;
    v_token TEXT;
BEGIN
    -- Check authorization
    IF NOT public.is_staff_of(p_tenant_id) THEN
        RAISE EXCEPTION 'Not authorized to invite users';
    END IF;

    -- Only admins can invite vets/admins
    IF p_role IN ('vet', 'admin') THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND tenant_id = p_tenant_id
              AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Only admins can invite staff';
        END IF;
    END IF;

    -- Generate token
    v_token := encode(gen_random_bytes(32), 'hex');

    -- Create invite
    INSERT INTO public.clinic_invites (tenant_id, email, role, token, invitee_name, message, expires_at)
    VALUES (
        p_tenant_id,
        LOWER(TRIM(p_email)),
        p_role,
        v_token,
        p_invitee_name,
        p_message,
        NOW() + INTERVAL '7 days'
    )
    RETURNING id INTO v_invite_id;

    RETURN v_invite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_clinic_invite IS 'Create an invitation for a new user';

-- Expire old invites
CREATE OR REPLACE FUNCTION public.expire_old_invites()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.clinic_invites
    SET status = 'expired'
    WHERE status = 'pending'
      AND expires_at < NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.expire_old_invites IS 'Mark expired invites as expired';

-- =============================================================================
-- G. ADDITIONAL TRIGGERS
-- =============================================================================

-- Note: These triggers should be created after their respective tables exist.
-- They are included here for reference and should be run after table creation.

-- Inventory transaction trigger (if not already created in 60_inventory.sql)
-- DROP TRIGGER IF EXISTS on_inventory_transaction ON public.store_inventory_transactions;
-- CREATE TRIGGER on_inventory_transaction
--     AFTER INSERT ON public.store_inventory_transactions
--     FOR EACH ROW EXECUTE FUNCTION public.process_inventory_transaction();

-- Price change trigger (if not already created in 60_inventory.sql)
-- DROP TRIGGER IF EXISTS on_price_change ON public.store_products;
-- CREATE TRIGGER on_price_change
--     AFTER UPDATE ON public.store_products
--     FOR EACH ROW
--     WHEN (OLD.base_price IS DISTINCT FROM NEW.base_price OR OLD.sale_price IS DISTINCT FROM NEW.sale_price)
--     EXECUTE FUNCTION public.track_price_change();

-- =============================================================================
-- HELPER FUNCTIONS COMPLETE
-- =============================================================================
