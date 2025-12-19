-- =============================================================================
-- RUN-MIGRATIONS.SQL
-- =============================================================================
-- Master script to run all migrations in correct order.
--
-- USAGE:
--   psql $DATABASE_URL -f run-migrations.sql
--
-- Or run via Node.js:
--   node setup-db.mjs
--
-- ORDER IS CRITICAL - dependencies must be resolved before use.
-- =============================================================================

\echo ''
\echo '============================================'
\echo 'VETE DATABASE v2 MIGRATION'
\echo '============================================'
\echo ''

-- =============================================================================
-- PHASE 1: EXTENSIONS
-- =============================================================================
-- PostgreSQL extensions must be loaded first.

\echo 'Phase 1: Loading extensions...'
\i 01_extensions.sql

-- =============================================================================
-- PHASE 2: CORE FUNCTIONS
-- =============================================================================
-- Utility functions used throughout the schema.

\echo 'Phase 2: Loading core functions...'
\i 02_functions/02_core_functions.sql
\i 02_functions/03_helper_functions.sql

-- =============================================================================
-- PHASE 3: CORE ENTITIES
-- =============================================================================
-- Tenants and user profiles - foundation of multi-tenancy.

\echo 'Phase 3: Loading core entities...'
\i 10_core/10_tenants.sql
\i 10_core/11_profiles.sql
\i 10_core/12_invites.sql

-- =============================================================================
-- PHASE 4: PET MANAGEMENT
-- =============================================================================
-- Pets and vaccination records.

\echo 'Phase 4: Loading pet management...'
\i 20_pets/20_pets.sql
\i 20_pets/21_vaccines.sql

-- =============================================================================
-- PHASE 5: CLINICAL
-- =============================================================================
-- Clinical reference data, lab, hospitalization, medical records.

\echo 'Phase 5: Loading clinical modules...'
\i 30_clinical/30_reference_data.sql
\i 30_clinical/31_lab.sql
\i 30_clinical/32_hospitalization.sql
\i 30_clinical/33_medical_records.sql

-- =============================================================================
-- PHASE 6: SCHEDULING
-- =============================================================================
-- Services and appointments.

\echo 'Phase 6: Loading scheduling...'
\i 40_scheduling/40_services.sql
\i 40_scheduling/41_appointments.sql

-- =============================================================================
-- PHASE 7: FINANCE
-- =============================================================================
-- Invoicing, payments, expenses, loyalty.

\echo 'Phase 7: Loading finance...'
\i 50_finance/50_invoicing.sql
\i 50_finance/51_expenses.sql

-- =============================================================================
-- PHASE 8: STORE
-- =============================================================================
-- Product catalog, inventory, campaigns.

\echo 'Phase 8: Loading store...'
\i 60_store/60_inventory.sql

-- =============================================================================
-- PHASE 9: COMMUNICATIONS
-- =============================================================================
-- Messaging, reminders, notifications.

\echo 'Phase 9: Loading communications...'
\i 70_communications/70_messaging.sql

-- =============================================================================
-- PHASE 10: INSURANCE
-- =============================================================================
-- Insurance providers, policies, claims.

\echo 'Phase 10: Loading insurance...'
\i 80_insurance/80_insurance.sql

-- =============================================================================
-- PHASE 11: SYSTEM
-- =============================================================================
-- Staff management, audit logs, QR tags, etc.

\echo 'Phase 11: Loading system...'
\i 85_system/85_staff.sql
\i 85_system/86_audit.sql

-- =============================================================================
-- PHASE 12: INFRASTRUCTURE
-- =============================================================================
-- Storage buckets, realtime, and views.

\echo 'Phase 12: Loading infrastructure...'
\i 90_infrastructure/90_storage.sql
\i 90_infrastructure/91_realtime.sql
\i 90_infrastructure/92_views.sql

-- =============================================================================
-- PHASE 13: SEED DATA (Optional)
-- =============================================================================
-- Reference data and demo content.

\echo 'Phase 13: Loading seed data...'
\i 95_seeds/95_seed_services.sql
\i 95_seeds/96_seed_store.sql
\i 95_seeds/97_seed_demo_data.sql

-- =============================================================================
-- COMPLETE
-- =============================================================================

\echo ''
\echo '============================================'
\echo 'ALL MIGRATIONS COMPLETED SUCCESSFULLY!'
\echo '============================================'
\echo ''
\echo 'Database v2 is ready.'
\echo ''
\echo 'Demo Accounts (create in Supabase Auth):'
\echo '  - admin@demo.com / password123 (adris admin)'
\echo '  - vet@demo.com / password123 (adris vet)'
\echo '  - owner@demo.com / password123 (adris owner)'
\echo '  - owner2@demo.com / password123 (adris owner)'
\echo '  - vet@petlife.com / password123 (petlife vet)'
\echo '  - admin@petlife.com / password123 (petlife admin)'
\echo ''
\echo 'Access the app at:'
\echo '  - http://localhost:3000/adris'
\echo '  - http://localhost:3000/petlife'
\echo ''
