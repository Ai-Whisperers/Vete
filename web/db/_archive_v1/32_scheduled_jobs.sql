-- =============================================================================
-- 32_SCHEDULED_JOBS.SQL
-- =============================================================================
-- Scheduled jobs using pg_cron for automated maintenance and background tasks.
-- NOTE: pg_cron must be enabled in your Supabase project settings.
-- =============================================================================

-- =============================================================================
-- A. ENABLE PG_CRON EXTENSION
-- =============================================================================

-- Note: In Supabase, pg_cron is available but may need to be enabled
-- Go to Database > Extensions and enable pg_cron

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres (required for Supabase)
GRANT USAGE ON SCHEMA cron TO postgres;

-- =============================================================================
-- B. JOB EXECUTION LOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS scheduled_job_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    result JSONB,
    error_message TEXT,
    rows_affected INTEGER
);

CREATE INDEX IF NOT EXISTS idx_job_log_name ON scheduled_job_log(job_name);
CREATE INDEX IF NOT EXISTS idx_job_log_time ON scheduled_job_log(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_log_status ON scheduled_job_log(status);

-- =============================================================================
-- C. JOB WRAPPER FUNCTION
-- =============================================================================

-- Generic job wrapper that logs execution
CREATE OR REPLACE FUNCTION run_scheduled_job(
    p_job_name TEXT,
    p_function_name TEXT
)
RETURNS VOID AS $$
DECLARE
    v_log_id UUID;
    v_start_time TIMESTAMPTZ;
    v_result JSONB;
    v_rows INTEGER;
BEGIN
    v_start_time := NOW();

    -- Log job start
    INSERT INTO scheduled_job_log (job_name, started_at)
    VALUES (p_job_name, v_start_time)
    RETURNING id INTO v_log_id;

    -- Execute the job function
    BEGIN
        EXECUTE format('SELECT %I()', p_function_name);
        GET DIAGNOSTICS v_rows = ROW_COUNT;

        -- Log success
        UPDATE scheduled_job_log
        SET completed_at = NOW(),
            duration_ms = EXTRACT(MILLISECONDS FROM (NOW() - v_start_time)),
            status = 'completed',
            rows_affected = v_rows
        WHERE id = v_log_id;

    EXCEPTION WHEN OTHERS THEN
        -- Log failure
        UPDATE scheduled_job_log
        SET completed_at = NOW(),
            duration_ms = EXTRACT(MILLISECONDS FROM (NOW() - v_start_time)),
            status = 'failed',
            error_message = SQLERRM
        WHERE id = v_log_id;

        RAISE WARNING 'Scheduled job % failed: %', p_job_name, SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- D. MAINTENANCE JOBS
-- =============================================================================

-- 1. Refresh Materialized Views (every hour)
CREATE OR REPLACE FUNCTION job_refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
    PERFORM refresh_all_materialized_views();
END;
$$ LANGUAGE plpgsql;

-- 2. Refresh Dashboard Views Only (every 15 minutes)
CREATE OR REPLACE FUNCTION job_refresh_dashboard_views()
RETURNS VOID AS $$
BEGIN
    PERFORM refresh_dashboard_views();
END;
$$ LANGUAGE plpgsql;

-- 3. Expire Old Consents
CREATE OR REPLACE FUNCTION job_expire_consents()
RETURNS VOID AS $$
BEGIN
    PERFORM expire_old_consents();
END;
$$ LANGUAGE plpgsql;

-- 4. Purge Soft Deleted Records (older than 90 days)
CREATE OR REPLACE FUNCTION job_purge_deleted_records()
RETURNS VOID AS $$
BEGIN
    PERFORM purge_old_deleted_records(90);
END;
$$ LANGUAGE plpgsql;

-- 5. Purge Old Audit Logs
CREATE OR REPLACE FUNCTION job_purge_audit_logs()
RETURNS VOID AS $$
BEGIN
    PERFORM purge_expired_audit_logs();
END;
$$ LANGUAGE plpgsql;

-- 6. Generate Vaccine Reminders
CREATE OR REPLACE FUNCTION job_generate_vaccine_reminders()
RETURNS VOID AS $$
DECLARE
    v_tenant RECORD;
BEGIN
    FOR v_tenant IN SELECT id FROM tenants LOOP
        PERFORM generate_vaccine_reminders(v_tenant.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 7. Generate Appointment Reminders
CREATE OR REPLACE FUNCTION job_generate_appointment_reminders()
RETURNS VOID AS $$
DECLARE
    v_tenant RECORD;
BEGIN
    FOR v_tenant IN SELECT id FROM tenants LOOP
        PERFORM generate_appointment_reminders(v_tenant.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 8. Process Notification Queue
CREATE OR REPLACE FUNCTION job_process_notifications()
RETURNS INTEGER AS $$
DECLARE
    v_processed INTEGER := 0;
    v_notification RECORD;
BEGIN
    -- Get pending notifications
    FOR v_notification IN
        SELECT nq.* FROM notification_queue nq
        WHERE nq.status = 'pending'
          AND nq.scheduled_for <= NOW()
        ORDER BY nq.scheduled_for
        LIMIT 100
    LOOP
        -- Mark as processing
        UPDATE notification_queue SET status = 'processing' WHERE id = v_notification.id;

        -- Here you would integrate with your notification service
        -- For now, just mark as sent (actual sending would be done via edge function)
        UPDATE notification_queue
        SET status = 'sent',
            sent_at = NOW()
        WHERE id = v_notification.id;

        v_processed := v_processed + 1;
    END LOOP;

    RETURN v_processed;
END;
$$ LANGUAGE plpgsql;

-- 9. Update Invoice Status (mark overdue)
CREATE OR REPLACE FUNCTION job_update_invoice_status()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE invoices
    SET status = 'overdue'
    WHERE status = 'sent'
      AND due_date < CURRENT_DATE
      AND deleted_at IS NULL;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Expire Insurance Pre-authorizations
CREATE OR REPLACE FUNCTION job_expire_preauthorizations()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE insurance_pre_authorizations
    SET status = 'expired'
    WHERE status = 'approved'
      AND valid_until < CURRENT_DATE;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 11. Clean Old Job Logs (keep last 30 days)
CREATE OR REPLACE FUNCTION job_clean_job_logs()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM scheduled_job_log
    WHERE started_at < NOW() - INTERVAL '30 days';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 12. Update Insurance Policy Status
CREATE OR REPLACE FUNCTION job_update_policy_status()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE pet_insurance_policies
    SET status = 'expired'
    WHERE status = 'active'
      AND expiration_date < CURRENT_DATE;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 13. Generate Recurring Invoices
CREATE OR REPLACE FUNCTION job_generate_recurring_invoices()
RETURNS INTEGER AS $$
DECLARE
    v_template RECORD;
    v_count INTEGER := 0;
    v_next_date DATE;
BEGIN
    FOR v_template IN
        SELECT * FROM recurring_invoice_templates
        WHERE is_active = TRUE
          AND next_generation_date <= CURRENT_DATE
          AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    LOOP
        -- Generate invoice from template
        INSERT INTO invoices (
            tenant_id,
            client_id,
            invoice_number,
            subtotal,
            tax_rate,
            tax_amount,
            discount_amount,
            total_amount,
            balance_due,
            due_date,
            status,
            notes
        )
        SELECT
            v_template.tenant_id,
            v_template.client_id,
            generate_invoice_number(v_template.tenant_id),
            v_template.subtotal,
            v_template.tax_rate,
            v_template.tax_amount,
            v_template.discount_amount,
            v_template.total_amount,
            v_template.total_amount,
            CURRENT_DATE + v_template.payment_terms_days,
            'draft',
            'Generated from recurring template'
        ;

        -- Copy line items
        INSERT INTO invoice_items (invoice_id, service_id, description, quantity, unit_price, total_price)
        SELECT
            (SELECT id FROM invoices ORDER BY created_at DESC LIMIT 1),
            service_id,
            description,
            quantity,
            unit_price,
            total_price
        FROM recurring_invoice_items
        WHERE template_id = v_template.id;

        -- Calculate next generation date
        v_next_date := CASE v_template.frequency
            WHEN 'weekly' THEN v_template.next_generation_date + INTERVAL '7 days'
            WHEN 'biweekly' THEN v_template.next_generation_date + INTERVAL '14 days'
            WHEN 'monthly' THEN v_template.next_generation_date + INTERVAL '1 month'
            WHEN 'quarterly' THEN v_template.next_generation_date + INTERVAL '3 months'
            WHEN 'annually' THEN v_template.next_generation_date + INTERVAL '1 year'
        END;

        -- Update template
        UPDATE recurring_invoice_templates
        SET next_generation_date = v_next_date,
            last_generated_at = NOW()
        WHERE id = v_template.id;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 14. Database Statistics Update
CREATE OR REPLACE FUNCTION job_update_statistics()
RETURNS VOID AS $$
BEGIN
    -- Analyze frequently queried tables
    ANALYZE pets;
    ANALYZE appointments;
    ANALYZE medical_records;
    ANALYZE invoices;
    ANALYZE vaccines;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- E. SCHEDULE JOBS
-- =============================================================================

-- Note: These schedules assume pg_cron is enabled in Supabase
-- Cron syntax: minute hour day month day_of_week

-- Remove existing jobs (if re-running this script)
SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname LIKE 'vete_%';

-- Schedule jobs
SELECT cron.schedule(
    'vete_refresh_dashboard',
    '*/15 * * * *', -- Every 15 minutes
    $$SELECT run_scheduled_job('refresh_dashboard', 'job_refresh_dashboard_views')$$
);

SELECT cron.schedule(
    'vete_refresh_materialized_views',
    '0 * * * *', -- Every hour at minute 0
    $$SELECT run_scheduled_job('refresh_mv', 'job_refresh_materialized_views')$$
);

SELECT cron.schedule(
    'vete_generate_vaccine_reminders',
    '0 8 * * *', -- Daily at 8 AM
    $$SELECT run_scheduled_job('vaccine_reminders', 'job_generate_vaccine_reminders')$$
);

SELECT cron.schedule(
    'vete_generate_appointment_reminders',
    '0 7,14 * * *', -- Twice daily at 7 AM and 2 PM
    $$SELECT run_scheduled_job('appointment_reminders', 'job_generate_appointment_reminders')$$
);

SELECT cron.schedule(
    'vete_process_notifications',
    '*/5 * * * *', -- Every 5 minutes
    $$SELECT run_scheduled_job('process_notifications', 'job_process_notifications')$$
);

SELECT cron.schedule(
    'vete_update_invoice_status',
    '0 1 * * *', -- Daily at 1 AM
    $$SELECT run_scheduled_job('update_invoices', 'job_update_invoice_status')$$
);

SELECT cron.schedule(
    'vete_expire_consents',
    '0 2 * * *', -- Daily at 2 AM
    $$SELECT run_scheduled_job('expire_consents', 'job_expire_consents')$$
);

SELECT cron.schedule(
    'vete_expire_preauthorizations',
    '0 2 * * *', -- Daily at 2 AM
    $$SELECT run_scheduled_job('expire_preauths', 'job_expire_preauthorizations')$$
);

SELECT cron.schedule(
    'vete_update_policy_status',
    '0 2 * * *', -- Daily at 2 AM
    $$SELECT run_scheduled_job('update_policies', 'job_update_policy_status')$$
);

SELECT cron.schedule(
    'vete_generate_recurring_invoices',
    '0 6 * * *', -- Daily at 6 AM
    $$SELECT run_scheduled_job('recurring_invoices', 'job_generate_recurring_invoices')$$
);

SELECT cron.schedule(
    'vete_purge_deleted_records',
    '0 3 * * 0', -- Weekly on Sunday at 3 AM
    $$SELECT run_scheduled_job('purge_deleted', 'job_purge_deleted_records')$$
);

SELECT cron.schedule(
    'vete_purge_audit_logs',
    '0 4 * * 0', -- Weekly on Sunday at 4 AM
    $$SELECT run_scheduled_job('purge_audit', 'job_purge_audit_logs')$$
);

SELECT cron.schedule(
    'vete_clean_job_logs',
    '0 5 * * 0', -- Weekly on Sunday at 5 AM
    $$SELECT run_scheduled_job('clean_job_logs', 'job_clean_job_logs')$$
);

SELECT cron.schedule(
    'vete_update_statistics',
    '0 4 * * *', -- Daily at 4 AM
    $$SELECT run_scheduled_job('update_stats', 'job_update_statistics')$$
);

-- =============================================================================
-- F. JOB MONITORING VIEWS
-- =============================================================================

-- Recent job executions
CREATE OR REPLACE VIEW recent_job_executions AS
SELECT
    job_name,
    started_at,
    completed_at,
    duration_ms,
    status,
    rows_affected,
    error_message
FROM scheduled_job_log
WHERE started_at > NOW() - INTERVAL '24 hours'
ORDER BY started_at DESC;

-- Job statistics
CREATE OR REPLACE VIEW job_statistics AS
SELECT
    job_name,
    COUNT(*) AS total_runs,
    COUNT(*) FILTER (WHERE status = 'completed') AS successful_runs,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed_runs,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0), 2) AS success_rate,
    AVG(duration_ms) FILTER (WHERE status = 'completed') AS avg_duration_ms,
    MAX(started_at) AS last_run
FROM scheduled_job_log
WHERE started_at > NOW() - INTERVAL '7 days'
GROUP BY job_name
ORDER BY job_name;

-- Currently scheduled jobs
CREATE OR REPLACE VIEW scheduled_jobs AS
SELECT
    jobid,
    jobname,
    schedule,
    command,
    nodename,
    active
FROM cron.job
WHERE jobname LIKE 'vete_%'
ORDER BY jobname;

GRANT SELECT ON recent_job_executions TO authenticated;
GRANT SELECT ON job_statistics TO authenticated;
GRANT SELECT ON scheduled_jobs TO authenticated;

-- =============================================================================
-- G. MANUAL JOB EXECUTION FUNCTION
-- =============================================================================

-- Allow admins to manually trigger jobs
CREATE OR REPLACE FUNCTION trigger_job(p_job_name TEXT)
RETURNS TEXT AS $$
DECLARE
    v_function_name TEXT;
BEGIN
    -- Validate job name and get function
    v_function_name := CASE p_job_name
        WHEN 'refresh_dashboard' THEN 'job_refresh_dashboard_views'
        WHEN 'refresh_mv' THEN 'job_refresh_materialized_views'
        WHEN 'vaccine_reminders' THEN 'job_generate_vaccine_reminders'
        WHEN 'appointment_reminders' THEN 'job_generate_appointment_reminders'
        WHEN 'process_notifications' THEN 'job_process_notifications'
        WHEN 'update_invoices' THEN 'job_update_invoice_status'
        WHEN 'expire_consents' THEN 'job_expire_consents'
        WHEN 'purge_deleted' THEN 'job_purge_deleted_records'
        WHEN 'purge_audit' THEN 'job_purge_audit_logs'
        WHEN 'recurring_invoices' THEN 'job_generate_recurring_invoices'
        ELSE NULL
    END;

    IF v_function_name IS NULL THEN
        RETURN 'Unknown job: ' || p_job_name;
    END IF;

    PERFORM run_scheduled_job(p_job_name, v_function_name);
    RETURN 'Job triggered: ' || p_job_name;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SCHEDULED JOBS COMPLETE
-- =============================================================================
