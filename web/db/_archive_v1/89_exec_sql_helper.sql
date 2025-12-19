-- =============================================================================
-- 89_EXEC_SQL_HELPER.SQL
-- =============================================================================
-- Helper function for executing SQL from scripts.
--
-- SECURITY WARNING: This function allows arbitrary SQL execution and should
-- only be callable by service_role. It is designed for setup/migration scripts.
-- =============================================================================

-- Only create if it doesn't exist (prevents overwriting security settings)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'exec_sql') THEN
        EXECUTE $func$
            CREATE FUNCTION public.exec_sql(sql_query TEXT)
            RETURNS JSONB
            LANGUAGE plpgsql
            SECURITY DEFINER
            SET search_path = public
            AS $inner$
            DECLARE
                result_count INT;
            BEGIN
                -- Only allow service_role or postgres
                IF current_user NOT IN ('postgres', 'service_role') THEN
                    RETURN jsonb_build_object(
                        'success', false,
                        'error', 'Unauthorized: Only service_role can execute SQL'
                    );
                END IF;

                -- Execute the SQL
                EXECUTE sql_query;
                GET DIAGNOSTICS result_count = ROW_COUNT;

                RETURN jsonb_build_object(
                    'success', true,
                    'rows_affected', result_count
                );

            EXCEPTION WHEN OTHERS THEN
                RETURN jsonb_build_object(
                    'success', false,
                    'error', SQLERRM,
                    'detail', SQLSTATE
                );
            END;
            $inner$;
        $func$;

        -- Revoke from public and only grant to service_role
        REVOKE ALL ON FUNCTION public.exec_sql FROM PUBLIC;
        REVOKE ALL ON FUNCTION public.exec_sql FROM anon;
        REVOKE ALL ON FUNCTION public.exec_sql FROM authenticated;
        -- Note: service_role can always call SECURITY DEFINER functions

        RAISE NOTICE 'exec_sql function created';
    ELSE
        RAISE NOTICE 'exec_sql function already exists';
    END IF;
END $$;

-- =============================================================================
-- HELPER FUNCTION COMPLETE
-- =============================================================================
--
-- Usage from TypeScript (requires service_role key):
--
--   const { data, error } = await supabaseAdmin.rpc('exec_sql', {
--     sql_query: 'SELECT 1'
--   });
--
-- =============================================================================
