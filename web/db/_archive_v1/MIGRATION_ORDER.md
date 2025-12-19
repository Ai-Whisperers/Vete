# Migration Execution Order

## Active Migrations (v1)

Execute in this order for fresh database setup:

### Core Schema (01-19)
1. `01_extensions.sql` - Enable required extensions
2. `02_schema_core.sql` - Core tables (tenants, profiles, pets)
3. `03_schema_pets.sql` - Pet-related tables
4. `04_schema_medical.sql` - Medical records, vaccines
5. `05_schema_clinical.sql` - Clinical tools
6. `06_schema_appointments.sql` - Appointments, services
7. `07_schema_inventory.sql` - Inventory management
8. `08_schema_finance.sql` - Invoices, payments
9. `09_schema_safety.sql` - Safety features
10. `10_schema_epidemiology.sql` - Disease tracking
11. `11_indexes.sql` - Base indexes
12. `12_functions.sql` - Database functions
13. `13_triggers.sql` - Database triggers
14. `14_rls_policies.sql` - Base RLS policies
15. `15_rpcs.sql` - RPC functions
16. `16_storage.sql` - Storage configuration
17. `17_realtime.sql` - Realtime configuration

### Extended Schema (20-32)
21. `21_schema_invoicing.sql` - Enhanced invoicing
22. `22_schema_reminders.sql` - Reminder system
23. `23_schema_hospitalization.sql` - Hospitalization module
24. `24_schema_lab_results.sql` - Laboratory module
25. `25_schema_consent.sql` - Consent management
26. `26_schema_staff.sql` - Staff management
27. `27_schema_messaging.sql` - Messaging system
28. `28_schema_insurance.sql` - Insurance module
29. `29_soft_deletes.sql` - Soft delete support
30. `30_enhanced_audit.sql` - Audit logging
31. `31_materialized_views.sql` - Materialized views
32. `32_scheduled_jobs.sql` - Scheduled jobs

### RLS & Security (50-59)
50. `50_rls_policies_complete.sql` - Extended RLS policies
51. `51_fk_cascades.sql` - Foreign key cascades
52. `52_performance_indexes.sql` - Performance indexes
53. `53_updated_at_triggers.sql` - Updated_at triggers
54. `54_tenant_setup.sql` - Tenant setup
55. `55_appointment_overlap.sql` - Appointment overlap checking
56. `56_appointment_functions.sql` - Appointment functions
57. `57_materialized_views.sql` - Additional materialized views
58. `58_appointment_workflow.sql` - Appointment workflow

### Additional Features (70-89)
70. `70_whatsapp_messages.sql` - WhatsApp integration
80. `80_fix_missing_rls_and_indexes.sql` - RLS and index fixes
81. `81_checkout_functions.sql` - Checkout functions
82. `82_store_enhancements.sql` - Store enhancements
83. `83_store_orders.sql` - Store orders
84. `84_notification_read_status.sql` - Notification status
85. `85_fix_checkout_inventory_table.sql` - Checkout inventory fixes
86. `86_owner_clinic_connections.sql` - Owner clinic connections
88. `88_fix_checkout_schema_mismatch.sql` - Checkout schema fixes
89. `89_exec_sql_helper.sql` - SQL helper functions

### Seed Data (90-99)
90. `90_seed_tenants.sql` - Tenant data
91. `91_seed_demo_users.sql` - Demo users
92. `92_seed_services.sql` - Service catalog
93. `93_seed_store.sql` - Store products
94. `94_seed_pets.sql` - Demo pets
95. `95_seed_appointments.sql` - Demo appointments
96. `96_seed_invites.sql` - Clinic invites
97. `97_reseed_today_appointments.sql` - Today's appointments
98. `98_seed_comprehensive.sql` - Comprehensive seed data
99. `99_rls_fixes.sql` - Final RLS fixes
99. `99_seed_finalize.sql` - Finalize seed data

### Fix Migrations (100-106)
Apply after base schema to fix issues:
100. `100_comprehensive_fixes.sql` - Comprehensive fixes
100. `100_fix_checkout_product_lookup.sql` - Checkout product lookup
101. `101_message_attachments_storage.sql` - Message attachments
101. `101_rls_verification.sql` - RLS verification
102. `102_comprehensive_db_fixes.sql` - Comprehensive DB fixes
102. `102_loyalty_rewards.sql` - Loyalty rewards
103. `103_consent_versioning.sql` - Consent versioning
103. `103_fix_public_rls_policies.sql` - Fix public RLS policies
104. `104_add_soft_delete_columns.sql` - Add soft delete columns
105. `105_add_updated_at_triggers.sql` - Add updated_at triggers
106. `106_add_performance_indexes.sql` - Add performance indexes

## v2 Migration System

The `web/db/v2/` directory contains a reorganized modular system.
See `web/db/v2/README.md` for details.

## Notes

- Always run migrations in order
- Test in development before production
- Back up database before running fix migrations
- Some migration numbers have duplicates (100-103) - these are alternate fixes, choose appropriate ones
- For production deployments, use the v2 system for better organization
