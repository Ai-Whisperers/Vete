# Database Schema v2

A modular, self-contained database schema for the Vete veterinary platform.

## Key Improvements Over v1

| Issue in v1 | Solution in v2 |
|-------------|----------------|
| "Fix" files scattered throughout (80, 85, 88, 100, 101) | No fix files - everything correct from start |
| Tables, RLS, indexes, triggers in separate files | Self-contained modules with everything together |
| Duplicate files (31 & 57 both for materialized views) | Single source of truth for each feature |
| Inconsistent numbering with gaps | Clear, logical numbering by domain |
| Missing soft deletes added via patches | Soft delete built in from the start |

## Directory Structure

```
v2/
├── 00_cleanup.sql              # Drop all tables/functions (for reset)
├── 01_extensions.sql           # PostgreSQL extensions
├── 02_functions/
│   └── 02_core_functions.sql   # Shared utility functions
├── 10_core/
│   ├── 10_tenants.sql          # Multi-tenant foundation
│   ├── 11_profiles.sql         # User profiles
│   └── 12_invites.sql          # Clinic invitations
├── 20_pets/
│   ├── 20_pets.sql             # Pet profiles
│   └── 21_vaccines.sql         # Vaccination records
├── 30_clinical/
│   ├── 30_reference_data.sql   # Diagnosis codes, drug dosages, growth standards
│   ├── 31_lab.sql              # Laboratory orders and results
│   ├── 32_hospitalization.sql  # Kennels, hospitalizations, vitals
│   └── 33_medical_records.sql  # Medical records, prescriptions, consent
├── 40_scheduling/
│   ├── 40_services.sql         # Service catalog
│   └── 41_appointments.sql     # Appointment booking
├── 50_finance/
│   ├── 50_invoicing.sql        # Invoices, payments, refunds
│   └── 51_expenses.sql         # Expenses, loyalty points
├── 60_store/
│   └── 60_inventory.sql        # Products, inventory, campaigns
├── 70_communications/
│   └── 70_messaging.sql        # Conversations, messages, reminders
├── 80_insurance/
│   └── 80_insurance.sql        # Insurance providers, policies, claims
├── 85_system/
│   ├── 85_staff.sql            # Staff profiles, schedules, time off
│   └── 86_audit.sql            # Audit logs, notifications, QR tags
├── 95_seeds/                   # Seed data (optional)
├── run-migrations.sql          # psql script to run all
└── setup-db.mjs                # Node.js runner script
```

## Module Template

Each SQL file follows this structure:

```sql
-- =============================================================================
-- XX_MODULE_NAME.SQL
-- =============================================================================
-- Description of what this module provides.
--
-- Dependencies: list of required modules
-- =============================================================================

-- A. TABLE DEFINITIONS
-- B. ROW LEVEL SECURITY
-- C. INDEXES
-- D. TRIGGERS
-- E. FUNCTIONS
-- F. SEED DATA (if any)
```

## Running Migrations

### Option 1: Using Node.js Script

```bash
cd web/db/v2

# Run all migrations
node setup-db.mjs

# Reset and run (DELETES ALL DATA)
node setup-db.mjs --reset

# Include seed data
node setup-db.mjs --seeds

# Dry run (see what would execute)
node setup-db.mjs --dry-run
```

### Option 2: Using psql

```bash
cd web/db/v2
psql $DATABASE_URL -f run-migrations.sql
```

### Option 3: Via Supabase Dashboard

Copy each file's contents into the SQL Editor and run in order.

## Table Summary

### Core (10_core/)
- `tenants` - Clinic/organization records
- `profiles` - User profiles extending auth.users
- `clinic_invites` - Invitation system

### Pets (20_pets/)
- `pets` - Pet profiles
- `vaccine_templates` - Vaccine reference data
- `vaccines` - Vaccination records
- `vaccine_reactions` - Adverse reaction tracking

### Clinical (30_clinical/)
- `diagnosis_codes` - Diagnostic code reference
- `drug_dosages` - Drug dosage calculator data
- `growth_standards` - Growth chart percentiles
- `reproductive_cycles` - Heat cycle tracking
- `euthanasia_assessments` - Quality of life scores
- `lab_test_catalog` - Lab test reference
- `lab_panels` - Test groupings
- `lab_orders` - Lab order requests
- `lab_order_items` - Individual tests in an order
- `lab_results` - Test results
- `lab_result_attachments` - Result file attachments
- `lab_result_comments` - Vet comments on results
- `kennels` - Hospital kennel inventory
- `hospitalizations` - Admission records
- `hospitalization_vitals` - Vital sign logs
- `hospitalization_medications` - Medication administration
- `hospitalization_treatments` - Treatment logs
- `hospitalization_feedings` - Feeding logs
- `hospitalization_notes` - Progress notes
- `medical_records` - SOAP notes
- `prescriptions` - Digital prescriptions
- `consent_templates` - Consent form templates
- `consent_documents` - Signed consent forms

### Scheduling (40_scheduling/)
- `services` - Service catalog with pricing
- `appointments` - Appointment bookings

### Finance (50_finance/)
- `payment_methods` - Payment method configuration
- `invoices` - Invoice records
- `invoice_items` - Line items
- `payments` - Payment records
- `refunds` - Refund records
- `client_credits` - Account credits
- `expenses` - Expense tracking
- `expense_categories` - Custom expense categories
- `loyalty_points` - Client loyalty balances
- `loyalty_transactions` - Point earn/redeem history
- `loyalty_rules` - Earning/redemption rules

### Store (60_store/)
- `store_categories` - Product categories
- `store_brands` - Product brands
- `store_products` - Product catalog
- `store_inventory` - Stock levels
- `store_inventory_transactions` - Stock movement ledger
- `store_campaigns` - Promotional campaigns
- `store_campaign_items` - Products in campaigns
- `store_coupons` - Discount coupons
- `store_price_history` - Price change audit

### Communications (70_communications/)
- `conversations` - Client conversations
- `messages` - Individual messages
- `message_templates` - Template library
- `reminders` - Scheduled reminders
- `notification_queue` - Outbound message queue
- `communication_preferences` - User preferences

### Insurance (80_insurance/)
- `insurance_providers` - Insurance company directory
- `insurance_policies` - Pet insurance policies
- `insurance_claims` - Claim submissions
- `insurance_claim_items` - Claim line items
- `insurance_claim_documents` - Claim attachments

### System (85_system/)
- `staff_profiles` - Extended staff info
- `staff_schedules` - Work schedules
- `staff_schedule_entries` - Schedule time slots
- `time_off_types` - Leave type configuration
- `staff_time_off` - Time off requests
- `audit_logs` - System audit trail
- `notifications` - In-app notifications
- `qr_tags` - Pet QR tag inventory
- `qr_tag_scans` - QR scan tracking
- `lost_pets` - Lost pet reports
- `disease_reports` - Epidemiology tracking

## Security

All tables use Row Level Security (RLS) with these patterns:

1. **Tenant Isolation**: Staff can only access data for their tenant
2. **Owner Access**: Pet owners can view their own pets' data
3. **Staff Elevation**: `is_staff_of(tenant_id)` grants broader access
4. **Service Role**: Full access for backend operations

## Functions

Key utility functions:

| Function | Purpose |
|----------|---------|
| `handle_updated_at()` | Auto-update timestamps |
| `is_staff_of(tenant_id)` | Check if user is staff in tenant |
| `is_owner_of_pet(pet_id)` | Check if user owns the pet |
| `soft_delete(table, id)` | Soft delete helper |
| `generate_sequence_number(prefix, tenant)` | Generate numbered sequences |

## Resetting the Database

To completely reset and start fresh:

```bash
# Using Node script
node setup-db.mjs --reset

# Using psql
psql $DATABASE_URL -f 00_cleanup.sql
psql $DATABASE_URL -f run-migrations.sql
```

⚠️ **WARNING**: This deletes ALL data!

## Migrating from v1

1. Export any custom data you need to preserve
2. Run the v2 cleanup: `psql -f 00_cleanup.sql`
3. Run v2 migrations: `node setup-db.mjs`
4. Re-import your data
5. Delete the v1 files once confirmed working

## Adding New Tables

1. Determine the correct module (or create new one)
2. Follow the module template structure
3. Add to `MIGRATION_ORDER` in `setup-db.mjs`
4. Add DROP statement to `00_cleanup.sql`
5. Test with `--dry-run` first

