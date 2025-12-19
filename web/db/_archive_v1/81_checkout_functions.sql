-- =============================================================================
-- 81_CHECKOUT_FUNCTIONS.SQL
-- =============================================================================
-- TICKET-BIZ-003: Functions for checkout and stock management
-- =============================================================================

-- =============================================================================
-- A. DECREMENT_STOCK
-- =============================================================================
-- Atomically decrements stock for a product. Returns the new stock quantity.
-- Uses row-level locking to prevent race conditions.

CREATE OR REPLACE FUNCTION public.decrement_stock(
    p_product_id UUID,
    p_tenant_id TEXT,
    p_quantity INT
) RETURNS INT AS $$
DECLARE
    current_stock INT;
    new_stock INT;
BEGIN
    -- Lock the row and get current stock
    SELECT stock_quantity INTO current_stock
    FROM store_inventory
    WHERE product_id = p_product_id
    AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF current_stock IS NULL THEN
        RAISE EXCEPTION 'Product not found in inventory';
    END IF;

    IF current_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_stock, p_quantity;
    END IF;

    -- Decrement stock
    new_stock := current_stock - p_quantity;

    UPDATE store_inventory
    SET
        stock_quantity = new_stock,
        updated_at = NOW()
    WHERE product_id = p_product_id
    AND tenant_id = p_tenant_id;

    -- Log the transaction
    INSERT INTO store_inventory_transactions (
        tenant_id,
        product_id,
        type,
        quantity,
        notes,
        performed_by,
        created_at
    ) VALUES (
        p_tenant_id,
        p_product_id,
        'sale',
        -p_quantity,
        'Checkout via store',
        NULL,
        NOW()
    );

    RETURN new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- B. VALIDATE_STOCK
-- =============================================================================
-- Validates that all items in a cart have sufficient stock.
-- Returns a JSON array of items with insufficient stock.

CREATE OR REPLACE FUNCTION public.validate_stock(
    p_tenant_id TEXT,
    p_items JSONB -- Array of {sku: string, quantity: int}
) RETURNS JSONB AS $$
DECLARE
    item JSONB;
    product_record RECORD;
    errors JSONB := '[]'::JSONB;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT
            sp.id,
            sp.sku,
            sp.name,
            COALESCE(si.stock_quantity, 0) as stock
        INTO product_record
        FROM store_products sp
        LEFT JOIN store_inventory si ON si.product_id = sp.id AND si.tenant_id = p_tenant_id
        WHERE sp.tenant_id = p_tenant_id
        AND sp.sku = item->>'sku';

        IF product_record IS NULL THEN
            errors := errors || jsonb_build_object(
                'sku', item->>'sku',
                'error', 'Product not found',
                'requested', (item->>'quantity')::INT,
                'available', 0
            );
        ELSIF product_record.stock < (item->>'quantity')::INT THEN
            errors := errors || jsonb_build_object(
                'sku', item->>'sku',
                'name', product_record.name,
                'error', 'Insufficient stock',
                'requested', (item->>'quantity')::INT,
                'available', product_record.stock
            );
        END IF;
    END LOOP;

    RETURN errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- C. PROCESS_CHECKOUT (Atomic checkout)
-- =============================================================================
-- Atomically processes a checkout: validates stock, creates invoice, decrements stock.
-- This ensures consistency even with concurrent requests.

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
    tax_rate NUMERIC := 10;
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
    invoice_number := 'INV-' || EXTRACT(EPOCH FROM NOW())::BIGINT;

    -- 5. Create invoice
    INSERT INTO invoices (
        tenant_id,
        invoice_number,
        owner_id,
        status,
        subtotal,
        tax_rate,
        tax_amount,
        total,
        amount_paid,
        amount_due,
        notes,
        due_date,
        created_by
    ) VALUES (
        p_tenant_id,
        invoice_number,
        p_user_id,
        'pending',
        subtotal,
        tax_rate,
        tax_amount,
        total,
        0,
        total,
        COALESCE(p_notes, 'Pedido desde tienda online'),
        NOW() + INTERVAL '7 days',
        p_user_id
    ) RETURNING id INTO invoice_id;

    -- 6. Create invoice items and decrement stock
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Insert invoice item
        INSERT INTO invoice_items (
            invoice_id,
            description,
            quantity,
            unit_price,
            discount_percent,
            line_total
        ) VALUES (
            invoice_id,
            item->>'name',
            (item->>'quantity')::INT,
            (item->>'price')::NUMERIC,
            0,
            ROUND((item->>'price')::NUMERIC * (item->>'quantity')::INT, 2)
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
            'status', 'pending'
        )
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.decrement_stock TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_stock TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_checkout TO authenticated;

-- =============================================================================
-- D. RECORD_PAYMENT (Atomic payment recording)
-- =============================================================================
-- TICKET-BIZ-005: Atomically records a payment to prevent race conditions.
-- Uses row-level locking to ensure concurrent payments don't corrupt data.

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
    v_new_amount_due NUMERIC;
    v_new_status TEXT;
    v_payment_id UUID;
BEGIN
    -- Lock the invoice row and get current state
    SELECT id, status, total, amount_paid, amount_due, tenant_id
    INTO v_invoice
    FROM invoices
    WHERE id = p_invoice_id
    AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF v_invoice IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Factura no encontrada');
    END IF;

    IF v_invoice.status = 'void' THEN
        RETURN jsonb_build_object('success', false, 'error', 'No se puede pagar una factura anulada');
    END IF;

    IF v_invoice.status = 'paid' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Esta factura ya está pagada');
    END IF;

    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'El monto debe ser mayor a 0');
    END IF;

    IF p_amount > v_invoice.amount_due THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('El monto excede el saldo pendiente (%s)', v_invoice.amount_due)
        );
    END IF;

    -- Calculate new amounts
    v_new_amount_paid := v_invoice.amount_paid + p_amount;
    v_new_amount_due := v_invoice.total - v_new_amount_paid;
    v_new_status := CASE WHEN v_new_amount_due <= 0 THEN 'paid' ELSE 'partial' END;

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
        amount_due = v_new_amount_due,
        status = v_new_status,
        paid_at = CASE WHEN v_new_status = 'paid' THEN NOW() ELSE NULL END,
        updated_at = NOW()
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object(
        'success', true,
        'payment_id', v_payment_id,
        'amount_paid', v_new_amount_paid,
        'amount_due', v_new_amount_due,
        'status', v_new_status
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- E. PROCESS_REFUND (Atomic refund processing)
-- =============================================================================
-- TICKET-BIZ-005: Atomically processes a refund to prevent race conditions.
-- Uses the refunds table for dedicated refund tracking.

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
    v_new_amount_due NUMERIC;
    v_new_status TEXT;
    v_refund_id UUID;
BEGIN
    -- Lock the invoice row and get current state
    SELECT id, status, total, amount_paid, amount_due, tenant_id
    INTO v_invoice
    FROM invoices
    WHERE id = p_invoice_id
    AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF v_invoice IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Factura no encontrada');
    END IF;

    IF v_invoice.status = 'void' THEN
        RETURN jsonb_build_object('success', false, 'error', 'No se puede reembolsar una factura anulada');
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
    v_new_amount_due := v_invoice.total - v_new_amount_paid;
    v_new_status := CASE
        WHEN v_new_amount_paid <= 0 THEN 'refunded'
        WHEN v_new_amount_due > 0 THEN 'partial'
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
        amount_due = v_new_amount_due,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object(
        'success', true,
        'refund_id', v_refund_id,
        'amount_paid', v_new_amount_paid,
        'amount_due', v_new_amount_due,
        'status', v_new_status
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.record_invoice_payment TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_invoice_refund TO authenticated;

-- =============================================================================
-- CHECKOUT AND PAYMENT FUNCTIONS COMPLETE
-- =============================================================================
