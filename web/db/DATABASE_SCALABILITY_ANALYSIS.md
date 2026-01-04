# Database Scalability Analysis: 5M+ Tenants

This document analyzes the database schema for scaling to 5 million clinics with potentially billions of records.

## Executive Summary

| Category           | Current State                  | Risk Level | Action Required                    |
| ------------------ | ------------------------------ | ---------- | ---------------------------------- |
| RLS Performance    | `is_staff_of()` function calls | HIGH       | Optimize or use SET tenant context |
| Tenant ID Type     | TEXT                           | MEDIUM     | Consider migration to INTEGER      |
| Partitioning       | None                           | HIGH       | Implement for high-volume tables   |
| Global Catalog     | ✅ Already implemented         | LOW        | Update seed data                   |
| Indexes            | Good coverage                  | LOW        | Add composite indexes              |
| Connection Pooling | Not configured                 | HIGH       | PgBouncer required                 |

---

## 1. Critical Issues

### 1.1 RLS Function Performance (HIGH PRIORITY)

**Problem**: Every query calls `is_staff_of(tenant_id)` which:

```sql
SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND tenant_id = in_tenant_id
    AND role IN ('vet', 'admin')
    AND deleted_at IS NULL
);
```

At 5M tenants with 10 staff each = 50M profile rows. This function:

- Is called per-row in RLS policies
- Causes a nested query on every SELECT/UPDATE
- Creates O(n²) complexity on large result sets

**Solution Options**:

**Option A: Session Context (Recommended)**

```sql
-- Set at session start after auth
SET app.current_tenant_id = 'adris';
SET app.current_user_role = 'vet';

-- RLS policy becomes simple equality
CREATE POLICY "Staff manage" ON medical_records
    USING (tenant_id = current_setting('app.current_tenant_id'));
```

**Option B: Materialized Role Cache**

```sql
CREATE TABLE user_tenant_cache (
    user_id UUID PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    role TEXT NOT NULL,
    cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refresh on login
CREATE OR REPLACE FUNCTION refresh_user_cache()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_tenant_cache (user_id, tenant_id, role)
    SELECT id, tenant_id, role FROM profiles WHERE id = NEW.id
    ON CONFLICT (user_id) DO UPDATE SET
        tenant_id = EXCLUDED.tenant_id,
        role = EXCLUDED.role,
        cached_at = NOW();
    RETURN NEW;
END;
$$;
```

**Option C: Optimized Function with Index Hint**

```sql
CREATE OR REPLACE FUNCTION public.is_staff_of(in_tenant_id TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND tenant_id = in_tenant_id
        AND role IN ('vet', 'admin')
        AND deleted_at IS NULL
        -- Forces index usage
        ORDER BY id
        LIMIT 1
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Ensure covering index exists
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_rls_optimized
ON profiles(id, tenant_id, role)
WHERE deleted_at IS NULL;
```

### 1.2 Table Partitioning (HIGH PRIORITY)

**Tables requiring partitioning at scale**:

| Table             | Estimated Rows (5M tenants) | Partition Strategy                |
| ----------------- | --------------------------- | --------------------------------- |
| `medical_records` | 500M+                       | By tenant_id HASH                 |
| `invoices`        | 200M+                       | By tenant_id HASH                 |
| `appointments`    | 300M+                       | By tenant_id HASH                 |
| `store_orders`    | 100M+                       | By tenant_id HASH                 |
| `audit_logs`      | 1B+                         | By created_at RANGE + tenant HASH |
| `messages`        | 500M+                       | By tenant_id HASH                 |

**Implementation**:

```sql
-- Convert medical_records to partitioned table
CREATE TABLE medical_records_new (
    LIKE medical_records INCLUDING ALL
) PARTITION BY HASH (tenant_id);

-- Create 256 partitions (adjust based on cluster size)
DO $$
BEGIN
    FOR i IN 0..255 LOOP
        EXECUTE format(
            'CREATE TABLE medical_records_p%s PARTITION OF medical_records_new
             FOR VALUES WITH (MODULUS 256, REMAINDER %s)',
            i, i
        );
    END LOOP;
END $$;

-- Migrate data (during maintenance window)
INSERT INTO medical_records_new SELECT * FROM medical_records;
ALTER TABLE medical_records RENAME TO medical_records_old;
ALTER TABLE medical_records_new RENAME TO medical_records;
```

### 1.3 Tenant ID Type Migration (MEDIUM PRIORITY)

**Current**: `tenant_id TEXT` (e.g., "adris", "petlife")
**Problem**: TEXT comparisons are slower than INTEGER/BIGINT

**Trade-offs**:

- TEXT: Human-readable, URL-friendly, ~8 bytes average
- INTEGER: 4 bytes, faster JOINs, requires slug lookup table
- UUID: 16 bytes, universally unique, no coordination needed

**Recommendation**: Keep TEXT but add numeric surrogate for JOINs

```sql
ALTER TABLE tenants ADD COLUMN tenant_num SERIAL;
CREATE UNIQUE INDEX idx_tenants_num ON tenants(tenant_num);

-- Use tenant_num for internal JOINs, keep tenant_id for URLs
```

---

## 2. Existing Good Patterns

### 2.1 Global Product Catalog ✅

The `clinic_product_assignments` table already implements the correct pattern:

- Global products in `store_products` with `tenant_id IS NULL`
- Clinic-specific pricing via `clinic_product_assignments`
- Margin calculation via trigger

### 2.2 BRIN Indexes ✅

Time-series tables correctly use BRIN:

```sql
CREATE INDEX idx_invoices_date_brin ON invoices USING BRIN(invoice_date);
CREATE INDEX idx_payments_date_brin ON payments USING BRIN(payment_date);
```

### 2.3 Covering Indexes ✅

Common queries have covering indexes:

```sql
CREATE INDEX idx_pets_tenant_list ON pets(tenant_id, name)
    INCLUDE (owner_id, species, breed, photo_url, is_deceased, is_active);
```

### 2.4 Soft Delete Pattern ✅

Consistent `deleted_at` column with partial indexes:

```sql
WHERE deleted_at IS NULL
```

---

## 3. Required New Indexes

```sql
-- RLS optimization: ensure profiles lookup is fast
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_auth_lookup
ON profiles(id)
INCLUDE (tenant_id, role)
WHERE deleted_at IS NULL;

-- Multi-tenant queries: tenant + date range
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medical_records_tenant_date
ON medical_records(tenant_id, visit_date DESC)
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_tenant_date
ON invoices(tenant_id, invoice_date DESC)
WHERE deleted_at IS NULL;

-- Global catalog product search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_global_search
ON store_products USING GIN(name gin_trgm_ops)
WHERE tenant_id IS NULL AND is_active = true;

-- Clinic product assignments (frequent JOIN)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clinic_assignments_catalog
ON clinic_product_assignments(catalog_product_id, tenant_id)
WHERE is_active = true;
```

---

## 4. Connection Pooling

**Required**: PgBouncer or Supavisor

At 5M tenants with average 3 concurrent connections each = 15M connections (impossible without pooling).

**Configuration**:

```ini
# pgbouncer.ini
[databases]
vete = host=localhost dbname=vete pool_size=100

[pgbouncer]
pool_mode = transaction
max_client_conn = 100000
default_pool_size = 100
min_pool_size = 10
reserve_pool_size = 25
```

**Supabase**: Already uses Supavisor, but verify pool limits in dashboard.

---

## 5. Read Replicas

**Recommended topology**:

```
                    ┌─────────────┐
                    │   Primary   │
                    │  (Writes)   │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │  Replica 1  │ │  Replica 2  │ │  Replica 3  │
    │ (Americas)  │ │   (EMEA)    │ │   (APAC)    │
    └─────────────┘ └─────────────┘ └─────────────┘
```

**Supabase**: Use read replicas for SELECT-heavy workloads (reports, dashboards).

---

## 6. Data Archiving Strategy

**Cold storage for old data**:

```sql
-- Archive medical records older than 7 years
CREATE TABLE medical_records_archive (LIKE medical_records INCLUDING ALL);

INSERT INTO medical_records_archive
SELECT * FROM medical_records
WHERE visit_date < NOW() - INTERVAL '7 years';

DELETE FROM medical_records
WHERE visit_date < NOW() - INTERVAL '7 years';
```

**Automated archiving**:

```sql
CREATE OR REPLACE FUNCTION archive_old_records()
RETURNS void AS $$
BEGIN
    -- Archive invoices > 10 years
    INSERT INTO invoices_archive
    SELECT * FROM invoices WHERE invoice_date < NOW() - INTERVAL '10 years';

    DELETE FROM invoices WHERE invoice_date < NOW() - INTERVAL '10 years';

    -- Similar for other tables
END;
$$ LANGUAGE plpgsql;

-- Run monthly
SELECT cron.schedule('archive-old-records', '0 3 1 * *', 'SELECT archive_old_records()');
```

---

## 7. Seed Data Architecture

### Current Structure (Incorrect for Scale)

```
03-store/products/  → All products duplicated per tenant
```

### Correct Structure (Global Catalog)

```
03-store/
├── products/           # GLOBAL catalog (tenant_id = NULL)
│   └── *.json
└── tenant-products/    # Clinic assignments (which products they carry)
    ├── adris.json      # SKUs + pricing for Adris
    └── petlife.json    # SKUs + pricing for PetLife
```

### Seed Generator Flow

1. Load global products → INSERT with `tenant_id = NULL, is_global_catalog = true`
2. Load tenant-products → INSERT into `clinic_product_assignments`
3. Initialize inventory → INSERT into `store_inventory` per tenant

---

## 8. Implementation Priority

| Priority | Task                                     | Effort | Impact                   |
| -------- | ---------------------------------------- | ------ | ------------------------ |
| P0       | Add RLS session context                  | 2 days | Critical for scale       |
| P0       | Configure connection pooling             | 1 day  | Critical for concurrency |
| P1       | Add partitioning to high-volume tables   | 1 week | Query performance        |
| P1       | Update seed generator for global catalog | 2 days | Data consistency         |
| P2       | Add recommended indexes                  | 1 day  | Query optimization       |
| P2       | Set up read replicas                     | 2 days | Read scalability         |
| P3       | Implement data archiving                 | 3 days | Long-term storage costs  |
| P3       | Tenant ID numeric surrogate              | 1 week | JOIN performance         |

---

## 9. Monitoring at Scale

**Essential metrics**:

```sql
-- Slow queries
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC LIMIT 20;

-- Table bloat
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
       n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE n_dead_tup > 10000
ORDER BY n_dead_tup DESC;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE '%_pkey';

-- RLS policy cost
EXPLAIN (ANALYZE, COSTS, VERBOSE)
SELECT * FROM medical_records WHERE tenant_id = 'adris' LIMIT 10;
```

---

## 10. Migration Checklist

- [ ] Implement session-based tenant context
- [ ] Configure PgBouncer/Supavisor connection limits
- [ ] Add partitioning to medical_records, invoices, appointments
- [ ] Create recommended indexes (CONCURRENTLY)
- [ ] Update seed generator for global catalog pattern
- [ ] Set up monitoring dashboards
- [ ] Configure read replicas
- [ ] Implement data archiving jobs
- [ ] Load test with simulated 10K tenants
- [ ] Document runbook for scale operations

---

_Generated: December 2024_
_Review before major scaling events_
