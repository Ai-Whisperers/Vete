-- =============================================================================
-- 102_ENHANCED_INVENTORY_IMPORT.SQL
-- =============================================================================
-- Enhanced inventory import function with support for:
-- - Barcode
-- - Minimum stock level (reorder point)
-- - Expiry date
-- - Batch number
-- - Supplier name
-- - Active status
-- =============================================================================

-- Drop existing function
DROP FUNCTION IF EXISTS public.import_inventory_batch(text, uuid, jsonb) CASCADE;

-- Create enhanced function
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.import_inventory_batch(TEXT, UUID, JSONB) TO authenticated;

-- =============================================================================
-- ENHANCED INVENTORY IMPORT COMPLETE
-- =============================================================================
