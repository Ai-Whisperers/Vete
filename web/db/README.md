# Vete Database Schema

This directory contains the complete SQL schema for the Vete multi-tenant veterinary platform.

## Directory Structure

```
db/
├── v2/                      # ← CURRENT SCHEMA (use this)
│   ├── 00_cleanup.sql       # Reset script (DELETES ALL DATA)
│   ├── 01_extensions.sql    # PostgreSQL extensions
│   ├── 02_functions/        # Core utility functions
│   ├── 10_core/             # Tenants, profiles, invites
│   ├── 20_pets/             # Pets, vaccines
│   ├── 30_clinical/         # Lab, hospitalization, medical records
│   ├── 40_scheduling/       # Services, appointments
│   ├── 50_finance/          # Invoicing, payments, expenses
│   ├── 60_store/            # Products, inventory, campaigns
│   ├── 70_communications/   # Messaging, reminders
│   ├── 80_insurance/        # Insurance policies, claims
│   ├── 85_system/           # Staff, audit, QR tags
│   ├── 90_infrastructure/   # Storage, realtime, views
│   ├── 95_seeds/            # Seed data
│   ├── run-migrations.sql   # Master migration script
│   ├── setup-db.mjs         # Node.js runner
│   └── README.md            # Detailed v2 documentation
│
└── _archive_v1/             # Legacy schema (archived)
    ├── 00-99_*.sql          # Old flat file structure
    └── *.md                 # Old documentation
```

## Quick Start

### Option 1: Using psql (Recommended)

```bash
cd web/db/v2
psql $DATABASE_URL -f run-migrations.sql
```

### Option 2: Using Node.js Script

```bash
cd web/db/v2
node setup-db.mjs           # Run all migrations
node setup-db.mjs --reset   # Reset and run (DELETES ALL DATA)
node setup-db.mjs --dry-run # Preview what would run
```

### Option 3: Supabase SQL Editor

1. Go to Supabase Dashboard → SQL Editor
2. Run files from `v2/` in order (follow `run-migrations.sql`)

## Demo Accounts

After running migrations, create these users in Supabase Auth:

| Email | Password | Role | Clinic |
|-------|----------|------|--------|
| `admin@demo.com` | password123 | Admin | adris |
| `vet@demo.com` | password123 | Vet | adris |
| `owner@demo.com` | password123 | Owner | adris |
| `owner2@demo.com` | password123 | Owner | adris |
| `vet@petlife.com` | password123 | Vet | petlife |
| `admin@petlife.com` | password123 | Admin | petlife |

## Key Features

- **Multi-Tenancy**: All tables use `tenant_id` for isolation
- **Row-Level Security**: Comprehensive RLS policies on all tables
- **Soft Deletes**: Major tables support `deleted_at` column
- **Audit Logging**: Full audit trail with `audit_logs` table
- **100+ Tables**: Complete veterinary clinic management

## Schema Overview

| Domain | Tables | Description |
|--------|--------|-------------|
| Core | 3 | Tenants, profiles, invites |
| Pets | 4 | Pets, vaccines, reactions |
| Clinical | 20 | Lab, hospitalization, medical records |
| Scheduling | 2 | Services, appointments |
| Finance | 12 | Invoices, payments, expenses, loyalty |
| Store | 9 | Products, inventory, campaigns |
| Communications | 6 | Messaging, reminders |
| Insurance | 5 | Policies, claims |
| System | 8 | Staff, audit, QR tags, lost pets |

## Resetting the Database

⚠️ **WARNING**: This deletes ALL data!

```bash
cd web/db/v2
psql $DATABASE_URL -f 00_cleanup.sql
psql $DATABASE_URL -f run-migrations.sql
```

## Why v2?

The v2 schema is a complete refactor that fixes issues in the original:

| Issue in v1 | Solution in v2 |
|-------------|----------------|
| 60+ scattered files | Organized into domain directories |
| Many "fix" files (80s, 100s) | No fix files needed |
| RLS in 4+ different files | Self-contained in each module |
| Duplicate materialized views | Single source of truth |
| Ad-hoc numbering gaps | Clear, logical numbering |

## Documentation

See `v2/README.md` for detailed documentation including:
- Complete table reference
- Function signatures
- RLS policy patterns
- Migration guides

---

*Last updated: December 2024*
