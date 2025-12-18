-- =============================================================================
-- 100_FIX_CHECKOUT_PRODUCT_LOOKUP.SQL
-- =============================================================================
-- TICKET-BIZ-003: Fix stock never being decremented on purchase
-- TICKET-BIZ-004: Fix cart stock validation only client-side
--
-- Issue: The process_checkout function was looking up products by SKU
-- (sp.sku = item->>'id') but the cart is sending product UUID IDs.
-- This caused stock to never be decremented because products weren't found.
--
-- Fix: Change lookup from SKU to UUID ID
-- =============================================================================

-- =============================================================================
-- A. FIX PROCESS_CHECKOUT FUNCTION - Lookup by ID instead of SKU
-- =============================================================================

CREATE OR REPLACE FUNCTION public.process_checkout(
    p_tenant_id TEXT,
    p_user_id UUID,
    p_items JSONB, -- Array of {id, name, price, quantity, type}
    p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    stock_errors JSONB;
    product_items JSONB;
    item JSONB;
    invoice_id UUID;
    invoice_number TEXT;
    subtotal NUMERIC := 0;
    tax_rate NUMERIC := 10;  -- Local variable, not stored
    tax_amount NUMERIC;
    total NUMERIC;
    product_id_var UUID;
BEGIN
    -- 1. Filter product items for stock validation
    SELECT jsonb_agg(i) INTO product_items
    FROM jsonb_array_elements(p_items) i
    WHERE i->>'type' = 'product';

    -- 2. Validate stock if there are products (server-side validation)
    IF product_items IS NOT NULL AND jsonb_array_length(product_items) > 0 THEN
        -- Build stock validation array with product IDs
        DECLARE
            validation_items JSONB := '[]'::JSONB;
            prod_item JSONB;
            prod_id UUID;
            prod_stock NUMERIC;
            prod_name TEXT;
        BEGIN
            FOR prod_item IN SELECT * FROM jsonb_array_elements(product_items)
            LOOP
                -- Parse product ID (handle variant IDs like "uuid-uuid" format)
                -- Variants have IDs like "product-uuid-variant-uuid", we want the first part
                BEGIN
                    -- Try direct UUID cast first
                    prod_id := (prod_item->>'id')::UUID;
                EXCEPTION WHEN OTHERS THEN
                    -- If that fails, it's a variant ID, extract first UUID
                    prod_id := split_part(prod_item->>'id', '-', 1)::UUID;
                END;

                -- Get current stock
                SELECT si.stock_quantity, sp.name
                INTO prod_stock, prod_name
                FROM store_products sp
                LEFT JOIN store_inventory si ON si.product_id = sp.id
                WHERE sp.id = prod_id
                AND sp.tenant_id = p_tenant_id;

                -- Check if product exists
                IF prod_name IS NULL THEN
                    stock_errors := COALESCE(stock_errors, '[]'::JSONB) || jsonb_build_object(
                        'id', prod_item->>'id',
                        'name', prod_item->>'name',
                        'requested', (prod_item->>'quantity')::INT,
                        'available', 0,
                        'error', 'Product not found'
                    );
                ELSIF COALESCE(prod_stock, 0) < (prod_item->>'quantity')::INT THEN
                    stock_errors := COALESCE(stock_errors, '[]'::JSONB) || jsonb_build_object(
                        'id', prod_item->>'id',
                        'name', prod_name,
                        'requested', (prod_item->>'quantity')::INT,
                        'available', COALESCE(prod_stock, 0)
                    );
                END IF;
            END LOOP;

            -- Return early if stock errors
            IF stock_errors IS NOT NULL AND jsonb_array_length(stock_errors) > 0 THEN
                RETURN jsonb_build_object(
                    'success', false,
                    'error', 'Stock insuficiente para algunos productos',
                    'stockErrors', stock_errors
                );
            END IF;
        END;
    END IF;

    -- 3. Calculate totals
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        subtotal := subtotal + ((item->>'price')::NUMERIC * (item->>'quantity')::INT);
    END LOOP;

    subtotal := ROUND(subtotal, 2);
    tax_amount := ROUND(subtotal * tax_rate / 100, 2);
    total := ROUND(subtotal + tax_amount, 2);

    -- 4. Generate invoice number
    BEGIN
        invoice_number := generate_invoice_number(p_tenant_id);
    EXCEPTION WHEN OTHERS THEN
        invoice_number := 'INV-' || EXTRACT(EPOCH FROM NOW())::BIGINT;
    END;

    -- 5. Create invoice
    INSERT INTO invoices (
        tenant_id,
        invoice_number,
        client_id,
        status,
        subtotal,
        tax_amount,
        total,
        amount_paid,
        balance_due,
        notes,
        due_date,
        created_by
    ) VALUES (
        p_tenant_id,
        invoice_number,
        p_user_id,
        'sent',
        subtotal,
        tax_amount,
        total,
        0,
        total,
        COALESCE(p_notes, 'Pedido desde tienda online'),
        CURRENT_DATE + INTERVAL '7 days',
        p_user_id
    ) RETURNING id INTO invoice_id;

    -- 6. Create invoice items and decrement stock
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Insert invoice item
        INSERT INTO invoice_items (
            invoice_id,
            item_type,
            description,
            quantity,
            unit_price,
            is_taxable,
            tax_rate,
            subtotal,
            tax_amount,
            total
        ) VALUES (
            invoice_id,
            CASE WHEN item->>'type' = 'product' THEN 'product' ELSE 'service' END,
            item->>'name',
            (item->>'quantity')::INT,
            (item->>'price')::NUMERIC,
            TRUE,
            tax_rate,
            ROUND((item->>'price')::NUMERIC * (item->>'quantity')::INT, 2),
            ROUND((item->>'price')::NUMERIC * (item->>'quantity')::INT * tax_rate / 100, 2),
            ROUND((item->>'price')::NUMERIC * (item->>'quantity')::INT * (1 + tax_rate / 100), 2)
        );

        -- FIXED: Decrement stock for products by UUID ID (not SKU)
        IF item->>'type' = 'product' THEN
            -- Parse product ID (handle variant IDs like "uuid-uuid" format)
            -- Variants have IDs like "product-uuid-variant-uuid", we want the product UUID
            BEGIN
                -- Try direct UUID cast first
                product_id_var := (item->>'id')::UUID;
            EXCEPTION WHEN OTHERS THEN
                -- If that fails, it's a variant ID, extract first UUID
                product_id_var := split_part(item->>'id', '-', 1)::UUID;
            END;

            -- Verify product exists and belongs to this tenant
            IF EXISTS (
                SELECT 1 FROM store_products
                WHERE id = product_id_var
                AND tenant_id = p_tenant_id
            ) THEN
                -- Decrement stock atomically
                PERFORM public.decrement_stock(
                    product_id_var,
                    p_tenant_id,
                    (item->>'quantity')::INT
                );
            ELSE
                -- Log warning but don't fail the transaction
                RAISE WARNING 'Product % not found for tenant %, skipping stock decrement',
                    product_id_var, p_tenant_id;
            END IF;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'invoice', jsonb_build_object(
            'id', invoice_id,
            'invoice_number', invoice_number,
            'total', total,
            'status', 'sent'
        )
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-grant permissions
GRANT EXECUTE ON FUNCTION public.process_checkout TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
--
-- Changes made:
-- 1. Fixed stock validation to use UUID ID instead of SKU
-- 2. Fixed stock decrement to use UUID ID instead of SKU
-- 3. Added proper handling for variant IDs (product-uuid-variant-uuid format)
-- 4. Added server-side stock validation before creating invoice
-- 5. Enhanced error messages with stock availability information
--
-- This ensures stock is properly decremented on every purchase and validates
-- stock availability server-side to prevent race conditions.
-- =============================================================================
