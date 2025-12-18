-- =============================================================================
-- 88_FIX_CHECKOUT_SCHEMA_MISMATCH.SQL
-- =============================================================================
-- Fixes column name mismatches between checkout functions and invoice schema.
--
-- Issues fixed:
-- - owner_id -> client_id (invoices table uses client_id)
-- - amount_due -> balance_due (invoices table uses balance_due)
-- - Removed tax_rate column usage (tax is calculated per-item)
-- =============================================================================

-- =============================================================================
-- A. FIX PROCESS_CHECKOUT FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.process_checkout(
    p_tenant_id TEXT,
    p_user_id UUID,
    p_items JSONB, -- Array of {sku, name, price, quantity, type}
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
    product_record RECORD;
BEGIN
    -- 1. Filter product items for stock validation
    SELECT jsonb_agg(i) INTO product_items
    FROM jsonb_array_elements(p_items) i
    WHERE i->>'type' = 'product';

    -- 2. Validate stock if there are products
    IF product_items IS NOT NULL AND jsonb_array_length(product_items) > 0 THEN
        SELECT public.validate_stock(p_tenant_id, product_items) INTO stock_errors;

        IF jsonb_array_length(stock_errors) > 0 THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Insufficient stock',
                'stock_errors', stock_errors
            );
        END IF;
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
    -- Try to use the generate_invoice_number function if it exists
    BEGIN
        invoice_number := generate_invoice_number(p_tenant_id);
    EXCEPTION WHEN OTHERS THEN
        invoice_number := 'INV-' || EXTRACT(EPOCH FROM NOW())::BIGINT;
    END;

    -- 5. Create invoice (using correct column names from 21_schema_invoicing.sql)
    INSERT INTO invoices (
        tenant_id,
        invoice_number,
        client_id,           -- FIXED: was owner_id
        status,
        subtotal,
        tax_amount,          -- FIXED: removed tax_rate (not a column)
        total,
        amount_paid,
        balance_due,         -- FIXED: was amount_due
        notes,
        due_date,
        created_by
    ) VALUES (
        p_tenant_id,
        invoice_number,
        p_user_id,
        'sent',              -- FIXED: was 'pending', but schema uses 'draft', 'sent', etc.
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
        -- Insert invoice item (using correct column names from invoice_items)
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

        -- Decrement stock for products
        IF item->>'type' = 'product' THEN
            SELECT sp.id INTO product_record
            FROM store_products sp
            WHERE sp.tenant_id = p_tenant_id
            AND sp.sku = item->>'id';

            IF product_record.id IS NOT NULL THEN
                PERFORM public.decrement_stock(
                    product_record.id,
                    p_tenant_id,
                    (item->>'quantity')::INT
                );
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

-- =============================================================================
-- B. FIX RECORD_INVOICE_PAYMENT FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.record_invoice_payment(
    p_invoice_id UUID,
    p_tenant_id TEXT,
    p_amount NUMERIC,
    p_payment_method TEXT DEFAULT 'cash',
    p_reference_number TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_received_by UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_invoice RECORD;
    v_new_amount_paid NUMERIC;
    v_new_balance_due NUMERIC;
    v_new_status TEXT;
    v_payment_id UUID;
BEGIN
    -- Lock the invoice row and get current state
    -- FIXED: Using balance_due instead of amount_due
    SELECT id, status, total, amount_paid, balance_due, tenant_id
    INTO v_invoice
    FROM invoices
    WHERE id = p_invoice_id
    AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF v_invoice IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Factura no encontrada');
    END IF;

    IF v_invoice.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'error', 'No se puede pagar una factura cancelada');
    END IF;

    IF v_invoice.status = 'paid' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Esta factura ya está pagada');
    END IF;

    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'El monto debe ser mayor a 0');
    END IF;

    IF p_amount > v_invoice.balance_due THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('El monto excede el saldo pendiente (%s)', v_invoice.balance_due)
        );
    END IF;

    -- Calculate new amounts
    v_new_amount_paid := v_invoice.amount_paid + p_amount;
    v_new_balance_due := v_invoice.total - v_new_amount_paid;
    v_new_status := CASE WHEN v_new_balance_due <= 0 THEN 'paid' ELSE 'partial' END;

    -- Create payment record
    INSERT INTO payments (
        tenant_id,
        invoice_id,
        amount,
        payment_method,
        reference_number,
        notes,
        received_by,
        paid_at
    ) VALUES (
        p_tenant_id,
        p_invoice_id,
        p_amount,
        p_payment_method,
        p_reference_number,
        p_notes,
        p_received_by,
        NOW()
    ) RETURNING id INTO v_payment_id;

    -- Update invoice
    UPDATE invoices
    SET
        amount_paid = v_new_amount_paid,
        balance_due = v_new_balance_due,  -- FIXED: was amount_due
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object(
        'success', true,
        'payment_id', v_payment_id,
        'amount_paid', v_new_amount_paid,
        'balance_due', v_new_balance_due,
        'status', v_new_status
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- C. FIX PROCESS_INVOICE_REFUND FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.process_invoice_refund(
    p_invoice_id UUID,
    p_tenant_id TEXT,
    p_amount NUMERIC,
    p_reason TEXT DEFAULT NULL,
    p_payment_id UUID DEFAULT NULL,
    p_processed_by UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_invoice RECORD;
    v_new_amount_paid NUMERIC;
    v_new_balance_due NUMERIC;
    v_new_status TEXT;
    v_refund_id UUID;
BEGIN
    -- Lock the invoice row and get current state
    -- FIXED: Using balance_due instead of amount_due
    SELECT id, status, total, amount_paid, balance_due, tenant_id
    INTO v_invoice
    FROM invoices
    WHERE id = p_invoice_id
    AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF v_invoice IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Factura no encontrada');
    END IF;

    IF v_invoice.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'error', 'No se puede reembolsar una factura cancelada');
    END IF;

    IF v_invoice.amount_paid <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'No hay pagos para reembolsar');
    END IF;

    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'El monto debe ser mayor a 0');
    END IF;

    IF p_amount > v_invoice.amount_paid THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('El monto excede lo pagado (%s)', v_invoice.amount_paid)
        );
    END IF;

    IF p_reason IS NULL OR p_reason = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Se requiere una razón para el reembolso');
    END IF;

    -- Calculate new amounts
    v_new_amount_paid := v_invoice.amount_paid - p_amount;
    v_new_balance_due := v_invoice.total - v_new_amount_paid;
    v_new_status := CASE
        WHEN v_new_amount_paid <= 0 THEN 'refunded'
        WHEN v_new_balance_due > 0 THEN 'partial'
        ELSE v_invoice.status
    END;

    -- Create refund record in dedicated refunds table
    INSERT INTO refunds (
        tenant_id,
        invoice_id,
        payment_id,
        amount,
        reason,
        refunded_by,
        refunded_at
    ) VALUES (
        p_tenant_id,
        p_invoice_id,
        p_payment_id,
        p_amount,
        p_reason,
        p_processed_by,
        NOW()
    ) RETURNING id INTO v_refund_id;

    -- Update invoice
    UPDATE invoices
    SET
        amount_paid = v_new_amount_paid,
        balance_due = v_new_balance_due,  -- FIXED: was amount_due
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object(
        'success', true,
        'refund_id', v_refund_id,
        'amount_paid', v_new_amount_paid,
        'balance_due', v_new_balance_due,
        'status', v_new_status
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-grant permissions
GRANT EXECUTE ON FUNCTION public.process_checkout TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_invoice_payment TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_invoice_refund TO authenticated;

-- =============================================================================
-- SCHEMA MISMATCH FIX COMPLETE
-- =============================================================================
--
-- Changes made:
-- 1. process_checkout: owner_id -> client_id, removed tax_rate column,
--    amount_due -> balance_due, fixed invoice_items columns
-- 2. record_invoice_payment: amount_due -> balance_due
-- 3. process_invoice_refund: amount_due -> balance_due
--
-- =============================================================================
