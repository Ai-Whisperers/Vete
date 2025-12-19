-- =============================================================================
-- 005_ADD_BRIN_INDEXES.SQL - Time-series indexes
-- =============================================================================
BEGIN;

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_brin ON public.audit_logs USING brin(created_at) WITH (pages_per_range = 32);
CREATE INDEX IF NOT EXISTS idx_messages_created_brin ON public.messages USING brin(created_at) WITH (pages_per_range = 32);
CREATE INDEX IF NOT EXISTS idx_notification_queue_created_brin ON public.notification_queue USING brin(created_at) WITH (pages_per_range = 32);
CREATE INDEX IF NOT EXISTS idx_store_inventory_txn_date_brin ON public.store_inventory_transactions USING brin(created_at) WITH (pages_per_range = 32);
CREATE INDEX IF NOT EXISTS idx_qr_tag_scans_date_brin ON public.qr_tag_scans USING brin(scanned_at) WITH (pages_per_range = 32);
CREATE INDEX IF NOT EXISTS idx_hospitalization_vitals_recorded_brin ON public.hospitalization_vitals USING brin(recorded_at) WITH (pages_per_range = 32);
CREATE INDEX IF NOT EXISTS idx_disease_reports_date_brin ON public.disease_reports USING brin(case_date) WITH (pages_per_range = 32);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_brin ON public.reminders USING brin(scheduled_at) WITH (pages_per_range = 32);
CREATE INDEX IF NOT EXISTS idx_payments_date_brin ON public.payments USING brin(payment_date) WITH (pages_per_range = 32);
CREATE INDEX IF NOT EXISTS idx_appointments_start_brin ON public.appointments USING brin(start_time) WITH (pages_per_range = 64);
CREATE INDEX IF NOT EXISTS idx_store_price_history_date_brin ON public.store_price_history USING brin(created_at) WITH (pages_per_range = 32);

COMMIT;
