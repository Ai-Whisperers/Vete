-- =============================================================================
-- 009_FIX_INVOICE_TOTALS.SQL - Fix invoice calculation logic
-- =============================================================================
BEGIN;

DROP TRIGGER IF EXISTS invoice_items_update_totals ON public.invoice_items;

CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_invoice_id UUID;
    v_subtotal NUMERIC(12,2);
    v_line_discounts NUMERIC(12,2);
    v_discount_rows NUMERIC(12,2);
    v_tax_amount NUMERIC(12,2);
    v_total NUMERIC(12,2);
BEGIN
    v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

    SELECT
        COALESCE(SUM(CASE WHEN item_type != 'discount' THEN quantity * unit_price ELSE 0 END), 0),
        COALESCE(SUM(COALESCE(discount_amount, 0)), 0),
        ABS(COALESCE(SUM(CASE WHEN item_type = 'discount' THEN total ELSE 0 END), 0))
    INTO v_subtotal, v_line_discounts, v_discount_rows
    FROM public.invoice_items WHERE invoice_id = v_invoice_id;

    SELECT COALESCE(SUM(
        CASE WHEN item_type != 'discount' THEN
            (quantity * unit_price - COALESCE(discount_amount, 0)) * COALESCE(tax_rate, 0) / 100
        ELSE 0 END
    ), 0)
    INTO v_tax_amount FROM public.invoice_items WHERE invoice_id = v_invoice_id;

    v_total := v_subtotal - (v_line_discounts + v_discount_rows) + v_tax_amount;

    UPDATE public.invoices SET
        subtotal = v_subtotal,
        discount_amount = v_line_discounts + v_discount_rows,
        tax_amount = v_tax_amount,
        total = GREATEST(v_total, 0)
    WHERE id = v_invoice_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_items_update_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
    FOR EACH ROW EXECUTE FUNCTION public.update_invoice_totals();

CREATE OR REPLACE FUNCTION public.calculate_invoice_item_total()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.item_type = 'discount' THEN
        NEW.total := -ABS(COALESCE(NEW.total, NEW.quantity * NEW.unit_price));
    ELSE
        NEW.total := (NEW.quantity * NEW.unit_price - COALESCE(NEW.discount_amount, 0)) * (1 + COALESCE(NEW.tax_rate, 0) / 100);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invoice_items_calc_total ON public.invoice_items;
CREATE TRIGGER invoice_items_calc_total
    BEFORE INSERT OR UPDATE ON public.invoice_items
    FOR EACH ROW EXECUTE FUNCTION public.calculate_invoice_item_total();

COMMIT;
