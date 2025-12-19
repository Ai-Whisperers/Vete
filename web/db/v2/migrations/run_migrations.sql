-- =============================================================================
-- RUN_MIGRATIONS.SQL - Execute all migrations in order
-- =============================================================================
\timing on
\set ON_ERROR_STOP on

SELECT 'Starting migrations at ' || now() as status;

\echo '>>> 001: Add tenant_id to child tables...'
\i 001_add_tenant_id_to_child_tables.sql

\echo '>>> 002: Add missing foreign keys...'
\i 002_add_missing_foreign_keys.sql

\echo '>>> 003: Fix sequence generation...'
\i 003_fix_sequence_generation.sql

\echo '>>> 004: Fix handle_new_user...'
\i 004_fix_handle_new_user.sql

\echo '>>> 005: Add BRIN indexes...'
\i 005_add_brin_indexes.sql

\echo '>>> 006: Add constraints...'
\i 006_add_constraints.sql

\echo '>>> 007: Optimize RLS policies...'
\i 007_optimize_rls_policies.sql

\echo '>>> 008: Add covering indexes...'
\i 008_add_covering_indexes.sql

\echo '>>> 009: Fix invoice totals...'
\i 009_fix_invoice_totals.sql

\echo '>>> 010: Add soft delete...'
\i 010_add_soft_delete.sql

\echo '>>> 011: Fix available slots...'
\i 011_fix_available_slots.sql

\echo '>>> Running ANALYZE...'
ANALYZE;

\echo '>>> Verification...'
\i verify_migrations.sql

SELECT 'All migrations completed at ' || now() as status;
