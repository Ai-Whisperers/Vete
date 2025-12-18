-- =============================================================================
-- 85_FIX_CHECKOUT_INVENTORY_TABLE.SQL
-- =============================================================================
-- TICKET-BIZ-003: Fix decrement_stock function to use correct table name
-- =============================================================================
-- This migration updates the decrement_stock function to use
-- store_inventory_transactions instead of inventory_transactions
-- =============================================================================

-- Drop and recreate the decrement_stock function with correct table name
DROP FUNCTION IF EXISTS public.decrement_stock(UUID, TEXT, INT);

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

    -- Log the transaction (FIXED: use store_inventory_transactions)
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.decrement_stock TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
