# Supabase Database Setup

This directory contains the complete, refactored SQL scripts for setting up the Vete veterinary platform database in Supabase.

## File Structure

### Core Schema (01-17)

| File | Description |
|------|-------------|
| `00_cleanup.sql` | Drops all tables, functions, triggers, storage buckets. **DESTROYS ALL DATA** |
| `01_extensions.sql` | PostgreSQL extensions (uuid-ossp, pgcrypto, pg_trgm) |
| `02_schema_core.sql` | Core tables: tenants, profiles, clinic_invites |
| `03_schema_pets.sql` | Pet tables: pets, vaccines, vaccine_templates, vaccine_reactions, qr_tags |
| `04_schema_medical.sql` | Medical tables: medical_records, prescriptions, voice_notes, dicom_images |
| `05_schema_clinical.sql` | Clinical reference: diagnosis_codes, drug_dosages, growth_standards, reproductive_cycles, euthanasia_assessments |
| `06_schema_appointments.sql` | Appointment booking system |
| `07_schema_inventory.sql` | Store/inventory: categories, products, inventory, transactions, campaigns, price_history |
| `08_schema_finance.sql` | Finance: expenses, loyalty_points, loyalty_transactions |
| `09_schema_safety.sql` | Safety features: pet_qr_codes, lost_pets |
| `10_schema_epidemiology.sql` | Public health: disease_reports, audit_logs |
| `11_indexes.sql` | All performance indexes |
| `12_functions.sql` | Utility functions (handle_updated_at, is_staff_of, etc.) |
| `13_triggers.sql` | All database triggers |
| `14_rls_policies.sql` | Row Level Security policies for all tables |
| `15_rpcs.sql` | Remote Procedure Calls (get_clinic_stats, search_pets_global, etc.) |
| `16_storage.sql` | Supabase Storage buckets and policies |
| `17_realtime.sql` | Realtime subscriptions and dashboard views |

### Extended Features (21-28)

| File | Description |
|------|-------------|
| `21_schema_invoicing.sql` | Billing: services, invoices, invoice_items, payments, refunds, client_credits, recurring_invoices |
| `22_schema_reminders.sql` | Notifications: channels, templates, preferences, reminders, notification_queue, reminder_rules |
| `23_schema_hospitalization.sql` | Boarding: kennels, hospitalizations, vitals, treatments, feedings, transfers, visits |
| `24_schema_lab_results.sql` | Diagnostics: lab_test_catalog, panels, reference_ranges, lab_orders, results, attachments |
| `25_schema_consent.sql` | Consents: templates, consent_documents, consent_audit_log, consent_requests, blanket_consents |
| `26_schema_staff.sql` | Staff: staff_profiles, schedules, shifts, time_off_requests, balances, tasks, reviews |
| `27_schema_messaging.sql` | Messaging: conversations, messages, templates, quick_replies, broadcast_campaigns, preferences |
| `28_schema_insurance.sql` | Insurance: providers, policies, claims, claim_items, pre_authorizations, EOB |

### System Features (29-32)

| File | Description |
|------|-------------|
| `29_soft_deletes.sql` | Soft delete columns, archive tables, restore functions, purge functions |
| `30_enhanced_audit.sql` | Enhanced audit logging with change tracking, security events, data access log |
| `31_materialized_views.sql` | Pre-computed analytics: dashboard stats, appointment analytics, revenue, inventory alerts |
| `32_scheduled_jobs.sql` | pg_cron jobs for automated maintenance, reminders, and data processing |

### Data

| File | Description |
|------|-------------|
| `20_seed_data.sql` | Demo data for testing |

## Execution Order

**IMPORTANT:** Run files in numerical order. Dependencies require specific ordering.

### Fresh Setup (Recommended)

```bash
# 1. Run cleanup (optional - only if resetting)
psql $DATABASE_URL -f 00_cleanup.sql

# 2. Run core schema files in order
psql $DATABASE_URL -f 01_extensions.sql
psql $DATABASE_URL -f 02_schema_core.sql
psql $DATABASE_URL -f 03_schema_pets.sql
psql $DATABASE_URL -f 04_schema_medical.sql
psql $DATABASE_URL -f 05_schema_clinical.sql
psql $DATABASE_URL -f 06_schema_appointments.sql
psql $DATABASE_URL -f 07_schema_inventory.sql
psql $DATABASE_URL -f 08_schema_finance.sql
psql $DATABASE_URL -f 09_schema_safety.sql
psql $DATABASE_URL -f 10_schema_epidemiology.sql
psql $DATABASE_URL -f 11_indexes.sql
psql $DATABASE_URL -f 12_functions.sql
psql $DATABASE_URL -f 13_triggers.sql
psql $DATABASE_URL -f 14_rls_policies.sql
psql $DATABASE_URL -f 15_rpcs.sql
psql $DATABASE_URL -f 16_storage.sql
psql $DATABASE_URL -f 17_realtime.sql

# 3. Run extended feature schemas
psql $DATABASE_URL -f 21_schema_invoicing.sql
psql $DATABASE_URL -f 22_schema_reminders.sql
psql $DATABASE_URL -f 23_schema_hospitalization.sql
psql $DATABASE_URL -f 24_schema_lab_results.sql
psql $DATABASE_URL -f 25_schema_consent.sql
psql $DATABASE_URL -f 26_schema_staff.sql
psql $DATABASE_URL -f 27_schema_messaging.sql
psql $DATABASE_URL -f 28_schema_insurance.sql

# 4. Run system features
psql $DATABASE_URL -f 29_soft_deletes.sql
psql $DATABASE_URL -f 30_enhanced_audit.sql
psql $DATABASE_URL -f 31_materialized_views.sql
psql $DATABASE_URL -f 32_scheduled_jobs.sql

# 5. Create demo users via API
npx tsx web/scripts/create_users.ts

# 6. Seed demo data
psql $DATABASE_URL -f 20_seed_data.sql
```

### Using Supabase SQL Editor

1. Open Supabase Dashboard > SQL Editor
2. Copy and paste each file's content in order
3. Execute each file before moving to the next

## Complete Reset

To completely reset the database:

```bash
psql $DATABASE_URL -f 00_cleanup.sql
# Then run fresh setup steps above
```

## Key Features

### Multi-Tenancy
- `tenant_id` column on most tables
- RLS policies enforce tenant isolation
- `is_staff_of()` function for authorization

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies based on:
  - Ownership (`auth.uid() = owner_id`)
  - Staff role (`is_staff_of(tenant_id)`)
  - Public access (reference data, QR lookups)

### Automatic Timestamps
- `created_at` and `updated_at` on all tables
- `handle_updated_at()` trigger maintains `updated_at`

### Automatic Actions
- Profile created on user signup via `handle_new_user()` trigger
- Pending vaccines created when pet registered via `handle_new_pet_vaccines()` trigger
- Inventory stock/cost updated on transactions via `process_inventory_transaction()` trigger
- Price history tracked via `track_price_change()` trigger
- Disease reports created from medical records via `create_disease_report()` trigger
- Invoice totals calculated automatically via `calculate_invoice_totals()` trigger
- Conversation stats updated on new messages
- Kennel status updated when hospitalization changes
- Time off balances updated when requests change

### Storage Buckets
| Bucket | Public | Purpose |
|--------|--------|---------|
| `vaccines` | Yes | Vaccine photos/certificates |
| `pets` | Yes | Pet photos |
| `records` | Yes | Medical attachments |
| `store-products` | Yes | Product images |
| `pet-qr-codes` | Yes | Generated QR codes |
| `receipts` | No | Expense proofs |

### Realtime Subscriptions
Enabled for: `pets`, `vaccines`, `clinic_invites`, `medical_records`, `appointments`, `qr_tags`, `lost_pets`

### Scheduled Jobs (pg_cron)
| Job | Schedule | Description |
|-----|----------|-------------|
| `refresh_dashboard` | Every 15 min | Refresh dashboard materialized views |
| `refresh_mv` | Hourly | Refresh all materialized views |
| `vaccine_reminders` | Daily 8 AM | Generate vaccine due reminders |
| `appointment_reminders` | Daily 7 AM, 2 PM | Generate appointment reminders |
| `process_notifications` | Every 5 min | Process notification queue |
| `update_invoices` | Daily 1 AM | Mark overdue invoices |
| `expire_consents` | Daily 2 AM | Expire old consent documents |
| `purge_deleted` | Weekly Sunday 3 AM | Purge soft-deleted records (90 days) |
| `purge_audit` | Weekly Sunday 4 AM | Purge expired audit logs |
| `recurring_invoices` | Daily 6 AM | Generate recurring invoices |

### Materialized Views
| View | Purpose |
|------|---------|
| `mv_clinic_dashboard_stats` | Clinic-level KPIs and counts |
| `mv_pet_statistics` | Pet demographics by species/breed |
| `mv_appointment_analytics` | Appointment metrics by month |
| `mv_revenue_analytics` | Revenue metrics by month |
| `mv_service_popularity` | Service usage statistics |
| `mv_vaccine_compliance` | Vaccine compliance rates |
| `mv_client_retention` | Client retention cohort analysis |
| `mv_inventory_alerts` | Low stock and expiring products |
| `mv_disease_heatmap` | Disease outbreak tracking |
| `mv_staff_performance` | Staff productivity metrics |

## Demo Users

| Email | Role | Tenant |
|-------|------|--------|
| admin@demo.com | admin | adris |
| vet@demo.com | vet | adris |
| owner@demo.com | owner | adris |
| owner2@demo.com | owner | adris |
| vet@petlife.com | vet | petlife |

## Extended Features Summary

### Invoicing System
- Services catalog with categories
- Invoice generation with line items
- Multiple payment methods
- Partial payments and refunds
- Client credits
- Recurring invoices
- Automatic invoice numbering

### Reminder System
- Multiple notification channels (in-app, SMS, WhatsApp, email)
- Customizable templates with variables
- User preferences for quiet hours
- Automatic vaccine/appointment reminders
- Notification queue with retry logic

### Hospitalization/Boarding
- Kennel management with features (oxygen, heating, IV)
- Vitals monitoring (temperature, heart rate, etc.)
- Treatment scheduling and tracking
- Feeding schedules
- Kennel transfers
- Visitor management

### Lab Results
- Test catalog with categories
- Reference ranges by species/breed/age/sex
- Lab order management
- Result entry with auto-flagging
- External lab integration support
- Result history for trending

### Consent Forms
- Digital consent templates
- Electronic signatures
- Blanket consents for standing authorizations
- Consent expiration and revocation
- Full audit trail

### Staff Management
- Extended staff profiles
- Weekly schedule templates
- Shift management with clock in/out
- Time off requests and balances
- Availability overrides
- Task assignment
- Performance reviews

### Client Messaging
- Two-way conversations
- Rich message types (text, images, cards)
- Message templates
- Broadcast campaigns
- Auto-replies
- Read receipts

### Insurance Claims
- Insurance provider directory
- Policy management
- Claim submission workflow
- Pre-authorization requests
- Explanation of Benefits (EOB)
- Claims statistics

### Data Protection
- Soft delete with restore capability
- Automatic purge after retention period
- Archive tables for permanent records
- GDPR-friendly data management

### Enhanced Audit
- Detailed change tracking
- Before/after value capture
- Security event logging
- Data access logging
- Configurable per table

## Security Notes

1. **Never modify RLS policies** without understanding the security implications
2. **Service role bypasses RLS** - use only for server-side operations
3. **Critical columns protected** - role and tenant_id cannot be self-modified
4. **QR tag theft prevention** - only owners/staff can reassign tags
5. **Audit logging** - security-relevant actions are logged
6. **Sensitive data masking** - configurable column masking in audit logs
7. **Soft delete protection** - prevents accidental permanent data loss

## Migrations

For incremental changes, create new numbered files:
- `33_add_feature.sql`
- `34_fix_issue.sql`

Always use `IF NOT EXISTS` / `IF EXISTS` for idempotent operations.

## Troubleshooting

### "permission denied for table"
- Check RLS policies
- Ensure user has correct role
- Verify tenant_id matches

### "violates foreign key constraint"
- Run files in order
- Check parent records exist

### "function does not exist"
- Run `12_functions.sql` before `13_triggers.sql`

### "duplicate key value violates unique constraint"
- Use `ON CONFLICT DO NOTHING` for seed data
- Check for duplicate entries

### Materialized views not updating
- Check `scheduled_job_log` for errors
- Manually run: `SELECT refresh_all_materialized_views();`

### pg_cron jobs not running
- Ensure pg_cron extension is enabled in Supabase
- Check job status: `SELECT * FROM cron.job WHERE jobname LIKE 'vete_%';`
