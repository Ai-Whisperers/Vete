# Supabase Database Setup

This directory contains the complete SQL schema for the Vete multi-tenant veterinary platform.

---

## Quick Start

```bash
# Complete setup (schema + demo data + users)
npx tsx web/scripts/db-setup.ts setup dev

# Reset database (DESTRUCTIVE - deletes all data)
npx tsx web/scripts/db-setup.ts reset dev

# Create demo users only
npx tsx web/scripts/db-setup.ts users

# Validate current state
npx tsx web/scripts/db-setup.ts validate

# Show database info
npx tsx web/scripts/db-setup.ts info
```

### Demo Accounts

| Email | Password | Role | Tenant | Pets |
|-------|----------|------|--------|------|
| `owner@demo.com` | password123 | Pet Owner | adris | Firulais, Mishi, Luna |
| `owner2@demo.com` | password123 | Pet Owner | adris | Thor, Max |
| `vet@demo.com` | password123 | Veterinarian | adris | - |
| `admin@demo.com` | password123 | Admin | adris | - |
| `vet@petlife.com` | password123 | Veterinarian | petlife | - |

### Testing After Setup

1. Visit `http://localhost:3000/adris`
2. Login as `owner@demo.com` / `password123`
3. See 3 pets with vaccines and appointments
4. Browse services, add to cart
5. Complete checkout

---

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

### Tenant Management (50s)

| File | Description |
|------|-------------|
| `54_tenant_setup.sql` | Tenant onboarding function and helper utilities |

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

# 5. Run tenant management features
psql $DATABASE_URL -f 54_tenant_setup.sql

# 6. Create demo users via API
npx tsx web/scripts/create_users.ts

# 7. Seed demo data
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

## Tenant Onboarding

### Quick Start: Create a New Tenant

The easiest way to onboard a new tenant is using the TypeScript script:

```bash
npx tsx web/scripts/setup-tenant.ts "myclinic" "My Veterinary Clinic"
```

This will:
1. Create the tenant record
2. Set up default payment methods (cash, credit card, debit card, bank transfer, mobile payment)
3. Initialize invoice sequence with auto-generated prefix
4. Create default services (consultations, vaccinations, surgeries, lab tests, grooming, dentistry, hospitalization)
5. Set up default store categories (dog food, cat food, antiparasitics, accessories, hygiene, medications)
6. Create default reminder templates (vaccine due, appointments, post-surgery follow-ups)

### Manual Tenant Creation (SQL)

You can also create tenants directly via SQL:

```sql
-- Create tenant with all default data
SELECT setup_new_tenant('myclinic', 'My Veterinary Clinic');

-- Check if tenant exists
SELECT tenant_exists('myclinic');

-- View tenant info and statistics
SELECT * FROM get_tenant_info('myclinic');
```

### What Gets Created

When you run `setup_new_tenant()`, the following data is automatically created:

| Category | Items | Description |
|----------|-------|-------------|
| **Payment Methods** | 5 methods | Cash (default), Credit Card, Debit Card, Bank Transfer, Mobile Payment |
| **Invoice Sequence** | 1 sequence | Auto-generated prefix based on tenant ID |
| **Services** | 13 services | Consultations, vaccinations, surgeries, lab tests, imaging, grooming, dentistry, hospitalization |
| **Store Categories** | 6 categories | Dog food, cat food, antiparasitics, accessories, hygiene, medications |
| **Reminder Templates** | 3 templates | Vaccine reminders, appointment reminders, post-surgery follow-ups |

### Complete Tenant Setup Checklist

After creating a tenant with the SQL function, complete these additional steps:

1. **Create Content Folder**
   ```bash
   # Copy template
   cp -r web/.content_data/_TEMPLATE web/.content_data/myclinic
   ```

2. **Customize Config Files**
   - Edit `web/.content_data/myclinic/config.json` (clinic name, contact info, modules)
   - Edit `web/.content_data/myclinic/theme.json` (colors, fonts, gradients)
   - Customize other JSON files as needed

3. **Create Admin User**
   - Create user via Supabase Auth or API
   - Update profile with admin role:
   ```sql
   UPDATE profiles
   SET role = 'admin', tenant_id = 'myclinic'
   WHERE email = 'admin@myclinic.com';
   ```

4. **Deploy Static Routes**
   - Add tenant to `generateStaticParams()` in pages:
   ```typescript
   export async function generateStaticParams() {
     return [
       { clinic: 'adris' },
       { clinic: 'petlife' },
       { clinic: 'myclinic' }  // Add new tenant
     ]
   }
   ```

5. **Test Access**
   - Visit `https://yourdomain.com/myclinic`
   - Log in with admin account
   - Verify theme and content

### Delete a Tenant (Caution!)

**WARNING:** This permanently deletes ALL tenant data including users, pets, appointments, invoices, etc.

```sql
-- This is IRREVERSIBLE - use with extreme caution
SELECT delete_tenant_cascade('myclinic');
```

### Tenant Management Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `setup_new_tenant(id, name)` | Create tenant with defaults | `SELECT setup_new_tenant('clinic', 'My Clinic');` |
| `tenant_exists(id)` | Check if tenant exists | `SELECT tenant_exists('clinic');` |
| `get_tenant_info(id)` | View tenant statistics | `SELECT * FROM get_tenant_info('clinic');` |
| `delete_tenant_cascade(id)` | Delete tenant and all data | `SELECT delete_tenant_cascade('clinic');` |

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

---

## Comprehensive Test Data

The `45_seed_comprehensive.sql` file creates complete test data for E2E testing:

### Pets Created

| Owner | Pet | Species | Breed | Vaccines | Notes |
|-------|-----|---------|-------|----------|-------|
| owner@demo.com | Firulais | Dog | Golden Retriever | Up to date | QR tag assigned |
| owner@demo.com | Mishi | Cat | Siames | Partial | Needs leucemia |
| owner@demo.com | Luna | Dog | Labrador | Up to date | Neutered |
| owner2@demo.com | Thor | Dog | Bulldog Frances | Recent | Castrated |
| owner2@demo.com | Max | Dog | Beagle | **OVERDUE** | Dermatitis treatment |

### Appointments Created

- Past completed appointments (7-14 days ago)
- Today's appointments (confirmed)
- Tomorrow's appointments
- Next week appointments (pending)
- Cancelled appointment (for history)

### Store Products

25+ products across categories:
- Dog Food (4 products)
- Cat Food (3 products)
- Antiparasitics (5 products)
- Accessories (4 products)
- Hygiene (4 products)
- Toys (3 products)
- Snacks (2 products)

All products have inventory with stock quantities for cart testing.

### Medical History

Each pet has realistic medical records:
- Consultations
- Vaccinations
- Surgeries (Luna, Thor)
- Lab exams (Mishi)
- Treatment follow-ups (Max)

---

## Improvement Report

See `DB_IMPROVEMENT_REPORT.md` for:
- File renumbering recommendations (duplicate 55, 85)
- Schema fixes needed
- Test data improvements
- Environment management guide

---

*Last updated: December 2024*
