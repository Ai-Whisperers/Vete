# Database Verification Scripts

This directory contains utility scripts for verifying and auditing the database security and integrity.

## Scripts

### verify-rls.sql

**Purpose**: Comprehensive Row-Level Security (RLS) verification script

**What it checks**:
1. Tables without RLS enabled
2. Tables with RLS but no policies (blocks all access)
3. Policy coverage summary
4. Missing CRUD policies (SELECT, INSERT, UPDATE, DELETE)
5. Policies with hardcoded tenant IDs (security risk)
6. Overly permissive policies
7. Detailed policy definitions
8. Policy dependencies on custom functions
9. Verification of security functions (is_staff_of, auth.uid, etc.)
10. Summary of tables by RLS status
11. Recommendations for fixes

**How to run**:

```bash
# Via psql
psql -U postgres -d your_database -f verify-rls.sql

# Via Supabase CLI
supabase db execute -f web/db/scripts/verify-rls.sql

# Via Supabase SQL Editor (copy/paste sections)
# Navigate to: Dashboard > SQL Editor > New Query
# Copy the contents of verify-rls.sql and execute
```

**Output**: Detailed report with issues and recommended fixes

**When to run**:
- After adding new tables
- After modifying RLS policies
- During security audits
- Before production deployments
- Monthly as part of security review

**Example output interpretation**:

```
1. TABLES WITHOUT RLS ENABLED (Security Risk!)
-------------------------------------------------------------------
tablename          | issue                      | fix
-------------------+----------------------------+---------------------
new_feature_table  | MISSING RLS - HIGH RISK   | ALTER TABLE new_feature_table ENABLE ROW LEVEL SECURITY;
```

**Action required**: Enable RLS on these tables immediately!

```
2. TABLES WITH RLS ENABLED BUT NO POLICIES (Will block all access!)
-------------------------------------------------------------------
table_name         | issue                                  | fix
-------------------+----------------------------------------+------------------------
settings           | RLS ENABLED BUT NO POLICIES...         | Add policies or disable RLS
```

**Action required**: Add at least one policy or disable RLS

```
5. POLICIES WITH HARDCODED VALUES (Potential Security Issue)
-------------------------------------------------------------------
tablename  | policyname         | issue              | policy_definition
-----------+--------------------+--------------------+-------------------
pets       | Demo access        | HARDCODED: demo    | tenant_id = 'demo'
```

**Action required**: Replace hardcoded values with dynamic tenant lookup

**Common fixes**:

```sql
-- Fix 1: Enable RLS on a table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Fix 2: Add staff management policy
CREATE POLICY "Staff manage" ON table_name FOR ALL
  USING (is_staff_of(tenant_id));

-- Fix 3: Add owner access policy
CREATE POLICY "Owner view" ON table_name FOR SELECT
  USING (owner_id = auth.uid());

-- Fix 4: Add public read policy (for reference data)
CREATE POLICY "Public read" ON table_name FOR SELECT
  USING (true);

-- Fix 5: Replace hardcoded tenant ID
-- Before:
CREATE POLICY "Demo access" ON pets FOR ALL
  USING (tenant_id = 'demo');

-- After:
CREATE POLICY "Staff manage" ON pets FOR ALL
  USING (is_staff_of(tenant_id));
```

## Best Practices

### RLS Policy Guidelines

1. **Always enable RLS** on tables containing tenant-specific data
2. **Never hardcode tenant IDs** - use dynamic lookups
3. **Test policies** with different user roles before deploying
4. **Document policies** using COMMENT ON POLICY statements
5. **Use is_staff_of()** function for staff access checks
6. **Use auth.uid()** for user-specific access checks
7. **Consider performance** - policies run on every query

### Tables that should NOT have RLS

- Reference data tables (diagnosis_codes, drug_dosages, growth_standards)
- Public lookup tables (toxic_foods, vaccine_schedules)
- System tables (schema_migrations, scheduled_job_log)

### Tables that MUST have RLS

- All tenant-specific data (pets, appointments, invoices, etc.)
- User data (profiles, messages, notifications)
- Clinical data (medical_records, prescriptions, lab_results)
- Financial data (payments, expenses, loyalty_points)

### Security Function Requirements

All policies should use these security functions:

```sql
-- Check if user is staff (vet or admin) of tenant
is_staff_of(tenant_id TEXT) RETURNS BOOLEAN

-- Get current authenticated user ID
auth.uid() RETURNS UUID

-- Get tenant ID for current user
get_tenant_id() RETURNS TEXT
```

### Policy Naming Conventions

Use descriptive names that indicate:
- Who: Staff, Owner, Client, Public
- What: manage, view, create, update, delete
- Scope: own, all, tenant

Examples:
- "Staff manage all" - Staff can do everything
- "Owner view own pets" - Owners can view their pets
- "Public read services" - Anyone can read services
- "Client create appointments" - Clients can create appointments

## Troubleshooting

### Issue: Script fails with "permission denied"

**Solution**: Run as database owner or superuser

```bash
psql -U postgres -d database_name -f verify-rls.sql
```

### Issue: "pg_cron extension not found"

**Solution**: The script will still work for RLS verification. pg_cron is only checked in section 9.

### Issue: Many tables showing "NO RLS"

**Solution**: This is expected for:
- Reference data tables
- System tables
- Public lookup tables

Review each table and determine if RLS is needed based on data sensitivity.

### Issue: Policies using hardcoded tenant IDs

**Solution**: Replace hardcoded values with dynamic lookups using is_staff_of() or profile joins.

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Project RLS Policies: `documentation/database/rls-policies.md`
- Security Audit: `.claude/SUPABASE_AUDIT.md`

## Automation

Consider adding RLS verification to your CI/CD pipeline:

```yaml
# .github/workflows/database-security.yml
name: Database Security Check

on:
  pull_request:
    paths:
      - 'web/db/**'

jobs:
  rls-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run RLS verification
        run: |
          supabase db execute -f web/db/scripts/verify-rls.sql > rls-report.txt
          cat rls-report.txt
          # Fail if critical issues found
          if grep -q "MISSING RLS - HIGH RISK" rls-report.txt; then
            echo "Critical RLS issues found!"
            exit 1
          fi
```

## Maintenance

Run this verification script:
- **Weekly**: During development
- **Before every deployment**: As part of pre-deployment checklist
- **After schema changes**: When adding/modifying tables
- **Monthly**: As part of security review process

Keep this script updated as new tables and policies are added to the system.
