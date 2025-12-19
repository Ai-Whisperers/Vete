# Supabase Database Setup

This directory contains the complete SQL schema for the Vete multi-tenant veterinary platform.

---

## Quick Start

### Using Supabase SQL Editor (Recommended)

Run these files in order in the Supabase SQL Editor:

1. **Schema files** (01-28): Core database structure
2. **System features** (29-32): Audit, views, jobs
3. **Additional features** (50-86): Indexes, triggers, functions
4. **Seed data** (90-99): Demo users, pets, products

### Manual Testing

1. Go to Supabase Dashboard > SQL Editor
2. Run files in numerical order
3. Login at `http://localhost:3000/adris`

### Demo Accounts

| Email | Password | Role | Tenant | Pets |
|-------|----------|------|--------|------|
| `owner@demo.com` | password123 | Pet Owner | adris | Firulais, Mishi, Luna |
| `owner2@demo.com` | password123 | Pet Owner | adris | Thor, Max |
| `vet@demo.com` | password123 | Veterinarian | adris | - |
| `admin@demo.com` | password123 | Admin | adris | - |
| `vet@petlife.com` | password123 | Veterinarian | petlife | - |

---

## File Structure

### Phase 1: Extensions & Core (00-10)

| File | Description |
|------|-------------|
| `00_cleanup.sql` | Drops all tables, functions, triggers. **DESTROYS ALL DATA** |
| `01_extensions.sql` | PostgreSQL extensions (uuid-ossp, pgcrypto, pg_trgm) |
| `02_schema_core.sql` | Core tables: tenants, profiles, clinic_invites |
| `03_schema_pets.sql` | Pet tables: pets, vaccines, vaccine_templates |
| `04_schema_medical.sql` | Medical tables: medical_records, prescriptions |
| `05_schema_clinical.sql` | Clinical reference: diagnosis_codes, drug_dosages |
| `06_schema_appointments.sql` | Appointment booking system |
| `07_schema_inventory.sql` | Store/inventory: products, stock, transactions |
| `08_schema_finance.sql` | Finance: expenses, loyalty_points |
| `09_schema_safety.sql` | Safety features: pet_qr_codes, lost_pets |
| `10_schema_epidemiology.sql` | Public health: disease_reports, audit_logs |

### Phase 2: Functions & Security (11-17)

| File | Description |
|------|-------------|
| `11_indexes.sql` | Performance indexes |
| `12_functions.sql` | Utility functions (handle_updated_at, is_staff_of, etc.) |
| `13_triggers.sql` | Database triggers |
| `14_rls_policies.sql` | Row Level Security policies |
| `15_rpcs.sql` | Remote Procedure Calls |
| `16_storage.sql` | Supabase Storage buckets and policies |
| `17_realtime.sql` | Realtime subscriptions |

### Phase 3: Extended Features (21-28)

| File | Description |
|------|-------------|
| `21_schema_invoicing.sql` | Billing: invoices, payments, refunds |
| `22_schema_reminders.sql` | Notifications: channels, templates, queue |
| `23_schema_hospitalization.sql` | Boarding: kennels, hospitalizations |
| `24_schema_lab_results.sql` | Diagnostics: lab_orders, results |
| `25_schema_consent.sql` | Consents: templates, signatures |
| `26_schema_staff.sql` | Staff: schedules, shifts, time_off |
| `27_schema_messaging.sql` | Messaging: conversations, messages |
| `28_schema_insurance.sql` | Insurance: policies, claims |

### Phase 4: System Features (29-32)

| File | Description |
|------|-------------|
| `29_soft_deletes.sql` | Soft delete columns, archive tables |
| `30_enhanced_audit.sql` | Enhanced audit logging with change tracking |
| `31_materialized_views.sql` | Pre-computed analytics |
| `32_scheduled_jobs.sql` | pg_cron jobs for automation |

### Phase 5: Additional Features (50-70)

| File | Description |
|------|-------------|
| `50_rls_policies_complete.sql` | Additional RLS policies |
| `51_fk_cascades.sql` | Foreign key cascade rules |
| `52_performance_indexes.sql` | Additional performance indexes |
| `53_updated_at_triggers.sql` | Updated_at triggers |
| `54_tenant_setup.sql` | Tenant onboarding function |
| `55_appointment_overlap.sql` | Appointment overlap detection |
| `56_appointment_functions.sql` | Appointment helper functions |
| `57_materialized_views.sql` | Additional materialized views |
| `58_appointment_workflow.sql` | Appointment workflow functions |
| `70_whatsapp_messages.sql` | WhatsApp integration |

### Phase 6: Fixes & Enhancements (80-89)

| File | Description |
|------|-------------|
| `80_fix_missing_rls_and_indexes.sql` | Missing RLS and index fixes |
| `81_checkout_functions.sql` | Store checkout functions |
| `82_store_enhancements.sql` | Store feature enhancements |
| `83_store_orders.sql` | Order management |
| `84_notification_read_status.sql` | Notification read status |
| `85_fix_checkout_inventory_table.sql` | Checkout inventory fix |
| `86_owner_clinic_connections.sql` | Owner-clinic connection tracking |
| `88_fix_checkout_schema_mismatch.sql` | Schema mismatch fixes |
| `89_exec_sql_helper.sql` | SQL execution helper (service_role only) |

### Phase 7: Seed Data (90-99) - RUN LAST

| File | Description |
|------|-------------|
| `90_seed_tenants.sql` | Create tenant records (adris, petlife, testclinic) |
| `91_seed_demo_users.sql` | Create demo auth users and profiles |
| `92_seed_services.sql` | Service catalog for clinics |
| `93_seed_store.sql` | Store categories, products, inventory |
| `94_seed_pets.sql` | Demo pets, vaccines, medical records |
| `95_seed_appointments.sql` | Sample appointments |
| `96_seed_invites.sql` | Clinic invites for testing signup |
| `99_seed_finalize.sql` | Refresh views and validate |

---

## Execution Order

**IMPORTANT:** Run files in numerical order. The seed files (90-99) must run LAST.

```sql
-- Core schema (01-17)
-- Extended features (21-28)
-- System features (29-32)
-- Additional features (50-70)
-- Fixes (80-89)
-- Seed data (90-99) <-- LAST
```

### Complete Setup via Supabase SQL Editor

Copy and execute each file in order:

```
01_extensions.sql
02_schema_core.sql
... (all numbered files in order)
99_seed_finalize.sql
```

---

## Key Features

### Multi-Tenancy
- `tenant_id` column on most tables
- RLS policies enforce tenant isolation
- `is_staff_of()` function for authorization

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies based on ownership, staff role, or public access

### Automatic Timestamps
- `created_at` and `updated_at` on all tables
- `handle_updated_at()` trigger maintains `updated_at`

### Storage Buckets
| Bucket | Public | Purpose |
|--------|--------|---------|
| `vaccines` | Yes | Vaccine photos/certificates |
| `pets` | Yes | Pet photos |
| `records` | Yes | Medical attachments |
| `store-products` | Yes | Product images |

---

## Test Data Summary

### Pets Created (via 94_seed_pets.sql)

| Owner | Pet | Species | Breed | Vaccines |
|-------|-----|---------|-------|----------|
| owner@demo.com | Firulais | Dog | Golden Retriever | Up to date |
| owner@demo.com | Mishi | Cat | Siames | Partial |
| owner@demo.com | Luna | Dog | Labrador | Up to date |
| owner2@demo.com | Thor | Dog | Bulldog Frances | Recent |
| owner2@demo.com | Max | Dog | Beagle | **OVERDUE** |

### Store Products (via 93_seed_store.sql)

30+ products across categories:
- Dog Food, Cat Food
- Antiparasitics
- Accessories, Hygiene
- Toys, Snacks

All products have inventory for cart testing.

### Services (via 92_seed_services.sql)

- Consultations (general, urgent, specialist)
- Vaccinations (rabies, sextuple, triple felina)
- Grooming (baths, nail, haircut)
- Surgeries (neuter, spay)
- Diagnostics (x-ray, ultrasound, blood work)

---

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

### Pets not showing in portal
- Ensure `91_seed_demo_users.sql` ran before `94_seed_pets.sql`
- Check that user profile has correct `tenant_id`
- Run `94_seed_pets.sql` again after user creation

### Login not working
- Ensure `91_seed_demo_users.sql` ran successfully
- Password for all demo users: `password123`
- Try creating user via Supabase Auth dashboard

---

## Tenant Onboarding

### Create a New Tenant

```sql
-- In Supabase SQL Editor:
SELECT setup_new_tenant('myclinic', 'My Veterinary Clinic');
```

This creates:
- Tenant record
- Default payment methods
- Invoice sequence
- Default services
- Store categories
- Reminder templates

### Complete Setup Checklist

1. Run `setup_new_tenant()` SQL
2. Copy `web/.content_data/_TEMPLATE` to `web/.content_data/myclinic`
3. Edit `config.json` and `theme.json`
4. Create admin user
5. Add to `generateStaticParams()` in pages
6. Deploy

---

## Security Notes

1. **Never modify RLS policies** without understanding implications
2. **Service role bypasses RLS** - use only for server-side operations
3. **Critical columns protected** - role and tenant_id cannot be self-modified
4. **Seed files require service_role** - run in SQL Editor or with service key

---

*Last updated: December 2024*
