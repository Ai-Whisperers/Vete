-- =============================================================================
-- 107_SCHEDULED_JOBS_REFRESH.SQL
-- =============================================================================
-- Additional scheduled jobs and materialized view refresh optimizations
-- Note: Base scheduled jobs are defined in 32_scheduled_jobs.sql
-- This migration adds supplementary jobs and refresh strategies
-- =============================================================================

-- =============================================================================
-- A. VERIFY PG_CRON EXTENSION
-- =============================================================================

-- Ensure pg_cron extension is enabled (should already exist from 32_scheduled_jobs.sql)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        RAISE NOTICE 'pg_cron extension not found. Please enable it in Supabase dashboard.';
        RAISE NOTICE 'Go to: Database > Extensions > Enable pg_cron';
    ELSE
        RAISE NOTICE 'pg_cron extension is enabled.';
    END IF;
END $$;

-- =============================================================================
-- B. ADDITIONAL MAINTENANCE FUNCTIONS
-- =============================================================================

-- Cleanup old notifications (keep 3 months of read notifications)
CREATE OR REPLACE FUNCTION job_cleanup_notifications()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Delete read notifications older than 3 months
    DELETE FROM notifications
    WHERE read_at IS NOT NULL
    AND created_at < NOW() - INTERVAL '3 months';

    GET DIAGNOSTICS v_count = ROW_COUNT;

    -- Delete unread notifications older than 6 months
    DELETE FROM notifications
    WHERE read_at IS NULL
    AND created_at < NOW() - INTERVAL '6 months';

    GET DIAGNOSTICS v_count = v_count + ROW_COUNT;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Archive old messages (keep 1 year)
CREATE OR REPLACE FUNCTION job_archive_old_messages()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Archive conversations older than 1 year
    UPDATE conversations
    SET status = 'archived'
    WHERE status = 'active'
    AND last_message_at < NOW() - INTERVAL '1 year';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Cleanup expired QR tags (inactive for 2 years)
CREATE OR REPLACE FUNCTION job_cleanup_expired_qr_tags()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Delete inactive QR tags with no pet assignment that are older than 2 years
    DELETE FROM qr_tags
    WHERE is_active = FALSE
    AND pet_id IS NULL
    AND created_at < NOW() - INTERVAL '2 years';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Refresh specific materialized views individually
CREATE OR REPLACE FUNCTION job_refresh_dashboard_stats()
RETURNS VOID AS $$
BEGIN
    -- Refresh dashboard statistics view if it exists
    IF EXISTS (
        SELECT 1 FROM pg_matviews
        WHERE schemaname = 'public'
        AND matviewname = 'mv_clinic_dashboard_stats'
    ) THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_clinic_dashboard_stats;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION job_refresh_client_summary()
RETURNS VOID AS $$
BEGIN
    -- Refresh client summary view if it exists
    IF EXISTS (
        SELECT 1 FROM pg_matviews
        WHERE schemaname = 'public'
        AND matviewname = 'mv_client_summary'
    ) THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_client_summary;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION job_refresh_analytics()
RETURNS VOID AS $$
BEGIN
    -- Refresh appointment analytics
    IF EXISTS (
        SELECT 1 FROM pg_matviews
        WHERE schemaname = 'public'
        AND matviewname = 'mv_appointment_analytics'
    ) THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_appointment_analytics;
    END IF;

    -- Refresh revenue analytics
    IF EXISTS (
        SELECT 1 FROM pg_matviews
        WHERE schemaname = 'public'
        AND matviewname = 'mv_revenue_analytics'
    ) THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_analytics;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Cleanup orphaned records
CREATE OR REPLACE FUNCTION job_cleanup_orphaned_records()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_deleted INTEGER;
BEGIN
    -- Delete invoice items for non-existent invoices
    DELETE FROM invoice_items
    WHERE NOT EXISTS (
        SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id
    );
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    v_count := v_count + v_deleted;

    -- Delete store order items for non-existent orders
    DELETE FROM store_order_items
    WHERE NOT EXISTS (
        SELECT 1 FROM store_orders WHERE store_orders.id = store_order_items.order_id
    );
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    v_count := v_count + v_deleted;

    -- Delete lab results for non-existent lab orders
    DELETE FROM lab_results
    WHERE NOT EXISTS (
        SELECT 1 FROM lab_orders WHERE lab_orders.id = lab_results.lab_order_id
    );
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    v_count := v_count + v_deleted;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- C. SCHEDULE ADDITIONAL JOBS
-- =============================================================================

-- Note: These jobs supplement the base jobs in 32_scheduled_jobs.sql
-- Remove existing jobs if re-running this script
DO $$
BEGIN
    -- Remove jobs if they exist
    PERFORM cron.unschedule('vete_cleanup_notifications');
    PERFORM cron.unschedule('vete_archive_messages');
    PERFORM cron.unschedule('vete_cleanup_qr_tags');
    PERFORM cron.unschedule('vete_refresh_dashboard_stats');
    PERFORM cron.unschedule('vete_refresh_client_summary');
    PERFORM cron.unschedule('vete_refresh_analytics');
    PERFORM cron.unschedule('vete_cleanup_orphaned');
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'cron schema not available - jobs will be created if pg_cron is enabled';
END $$;

-- Cleanup notifications monthly (1st day at 5 AM)
SELECT cron.schedule(
    'vete_cleanup_notifications',
    '0 5 1 * *',
    $$SELECT run_scheduled_job('cleanup_notifications', 'job_cleanup_notifications')$$
);

-- Archive old messages monthly (1st day at 6 AM)
SELECT cron.schedule(
    'vete_archive_messages',
    '0 6 1 * *',
    $$SELECT run_scheduled_job('archive_messages', 'job_archive_old_messages')$$
);

-- Cleanup expired QR tags quarterly (1st day of Jan, Apr, Jul, Oct at 7 AM)
SELECT cron.schedule(
    'vete_cleanup_qr_tags',
    '0 7 1 1,4,7,10 *',
    $$SELECT run_scheduled_job('cleanup_qr_tags', 'job_cleanup_expired_qr_tags')$$
);

-- Refresh dashboard stats every 15 minutes
SELECT cron.schedule(
    'vete_refresh_dashboard_stats',
    '*/15 * * * *',
    $$SELECT run_scheduled_job('refresh_dashboard_stats', 'job_refresh_dashboard_stats')$$
);

-- Refresh client summary hourly
SELECT cron.schedule(
    'vete_refresh_client_summary',
    '0 * * * *',
    $$SELECT run_scheduled_job('refresh_client_summary', 'job_refresh_client_summary')$$
);

-- Refresh analytics daily at 3 AM
SELECT cron.schedule(
    'vete_refresh_analytics',
    '0 3 * * *',
    $$SELECT run_scheduled_job('refresh_analytics', 'job_refresh_analytics')$$
);

-- Cleanup orphaned records weekly (Sunday at 6 AM)
SELECT cron.schedule(
    'vete_cleanup_orphaned',
    '0 6 * * 0',
    $$SELECT run_scheduled_job('cleanup_orphaned', 'job_cleanup_orphaned_records')$$
);

-- =============================================================================
-- D. MONITORING QUERIES
-- =============================================================================

-- View for monitoring materialized view freshness
CREATE OR REPLACE VIEW mv_refresh_status AS
SELECT
    schemaname,
    matviewname,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || matviewname)) as size,
    ispopulated,
    -- Last refresh time (estimated from stats)
    (SELECT max(started_at)
     FROM scheduled_job_log
     WHERE job_name LIKE '%refresh%'
     AND status = 'completed'
    ) as last_refresh_estimate
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY matviewname;

GRANT SELECT ON mv_refresh_status TO authenticated;

-- View for monitoring job execution frequency
CREATE OR REPLACE VIEW job_frequency_stats AS
SELECT
    job_name,
    COUNT(*) as total_executions,
    COUNT(*) FILTER (WHERE status = 'completed') as successful,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    MIN(started_at) as first_run,
    MAX(started_at) as last_run,
    EXTRACT(EPOCH FROM (MAX(started_at) - MIN(started_at))) / NULLIF(COUNT(*) - 1, 0) as avg_interval_seconds,
    ROUND(AVG(duration_ms) FILTER (WHERE status = 'completed'), 2) as avg_duration_ms
FROM scheduled_job_log
WHERE started_at > NOW() - INTERVAL '30 days'
GROUP BY job_name
ORDER BY last_run DESC;

GRANT SELECT ON job_frequency_stats TO authenticated;

-- =============================================================================
-- E. MANUAL REFRESH FUNCTION (FOR TESTING)
-- =============================================================================

-- Function to manually refresh all materialized views
CREATE OR REPLACE FUNCTION manual_refresh_all_views()
RETURNS TABLE(view_name TEXT, status TEXT, duration_ms NUMERIC) AS $$
DECLARE
    v_view RECORD;
    v_start TIMESTAMPTZ;
    v_end TIMESTAMPTZ;
BEGIN
    FOR v_view IN
        SELECT matviewname
        FROM pg_matviews
        WHERE schemaname = 'public'
        ORDER BY matviewname
    LOOP
        v_start := clock_timestamp();

        BEGIN
            EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I', v_view.matviewname);
            v_end := clock_timestamp();

            RETURN QUERY SELECT
                v_view.matviewname::TEXT,
                'success'::TEXT,
                EXTRACT(MILLISECONDS FROM (v_end - v_start))::NUMERIC;

        EXCEPTION WHEN OTHERS THEN
            v_end := clock_timestamp();

            RETURN QUERY SELECT
                v_view.matviewname::TEXT,
                ('error: ' || SQLERRM)::TEXT,
                EXTRACT(MILLISECONDS FROM (v_end - v_start))::NUMERIC;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Allow admins to manually refresh views
GRANT EXECUTE ON FUNCTION manual_refresh_all_views() TO authenticated;

-- =============================================================================
-- SCHEDULED JOBS REFRESH COMPLETE
-- =============================================================================

-- Summary of scheduled jobs:
-- - Cleanup notifications: Monthly
-- - Archive old messages: Monthly
-- - Cleanup expired QR tags: Quarterly
-- - Refresh dashboard stats: Every 15 minutes
-- - Refresh client summary: Hourly
-- - Refresh analytics: Daily at 3 AM
-- - Cleanup orphaned records: Weekly

-- To view all scheduled jobs:
-- SELECT * FROM scheduled_jobs;

-- To view job execution history:
-- SELECT * FROM recent_job_executions;

-- To manually trigger a refresh:
-- SELECT * FROM manual_refresh_all_views();
