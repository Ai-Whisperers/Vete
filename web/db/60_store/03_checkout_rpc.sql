-- Function to process checkout atomically
-- Returns JSON with success/error status

CREATE OR REPLACE FUNCTION process_checkout(
  p_tenant_id TEXT,
  p_user_id UUID,
  p_items JSONB,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_product_id UUID;
  v_quantity INTEGER;
  v_price NUMERIC;
  v_type TEXT;
  v_product_name TEXT;
  v_current_stock NUMERIC;
  v_invoice_id UUID;
  v_invoice_number TEXT;
  v_total NUMERIC := 0;
  v_stock_errors JSONB := '[]'::JSONB;
  v_item_total NUMERIC;
BEGIN
  -- 1. Validate Stock for all products first (Fail fast)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_type := v_item->>'type';
    v_quantity := (v_item->>'quantity')::INTEGER;
    v_product_id := (v_item->>'id')::UUID;
    v_product_name := v_item->>'name';
    v_price := (v_item->>'price')::NUMERIC;

    v_total := v_total + (v_price * v_quantity);

    IF v_type = 'product' THEN
      SELECT stock_quantity INTO v_current_stock
      FROM store_inventory
      WHERE product_id = v_product_id AND tenant_id = p_tenant_id
      FOR UPDATE;

      IF v_current_stock IS NULL THEN
         v_stock_errors := v_stock_errors || jsonb_build_object(
          'id', v_product_id,
          'name', v_product_name,
          'requested', v_quantity,
          'available', 0
        );
      ELSIF v_current_stock < v_quantity THEN
        v_stock_errors := v_stock_errors || jsonb_build_object(
          'id', v_product_id,
          'name', v_product_name,
          'requested', v_quantity,
          'available', v_current_stock
        );
      END IF;
    END IF;
  END LOOP;

  IF jsonb_array_length(v_stock_errors) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Stock insuficiente',
      'stock_errors', v_stock_errors
    );
  END IF;

  -- 2. Create Invoice
  v_invoice_number := public.next_document_number(p_tenant_id, 'invoice', 'FAC');

  INSERT INTO invoices (
    tenant_id,
    client_id,
    invoice_number,
    due_date,
    status,
    subtotal,
    total,
    notes
  ) VALUES (
    p_tenant_id,
    p_user_id,
    v_invoice_number,
    CURRENT_DATE + INTERVAL '30 days',
    'draft',
    v_total,
    v_total,
    COALESCE(p_notes, 'Pedido desde tienda online')
  ) RETURNING id INTO v_invoice_id;

  -- 3. Process Items: Decrement Stock & Create Invoice Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_type := v_item->>'type';
    v_quantity := (v_item->>'quantity')::INTEGER;
    v_product_id := (v_item->>'id')::UUID;
    v_price := (v_item->>'price')::NUMERIC;
    v_product_name := v_item->>'name';
    v_item_total := v_price * v_quantity;

    IF v_type = 'product' THEN
      UPDATE store_inventory
      SET stock_quantity = stock_quantity - v_quantity,
          updated_at = now()
      WHERE product_id = v_product_id AND tenant_id = p_tenant_id;
    END IF;

    INSERT INTO invoice_items (
      tenant_id,
      invoice_id,
      description,
      quantity,
      unit_price,
      total,
      item_type,
      product_id,
      service_id
    ) VALUES (
      p_tenant_id,
      v_invoice_id,
      v_product_name,
      v_quantity,
      v_price,
      v_item_total,
      v_type,
      CASE WHEN v_type = 'product' THEN v_product_id ELSE NULL END,
      CASE WHEN v_type = 'service' THEN v_product_id ELSE NULL END
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'invoice', jsonb_build_object(
      'id', v_invoice_id,
      'invoice_number', v_invoice_number,
      'total', v_total,
      'status', 'pending'
    )
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;
