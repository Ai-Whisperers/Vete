# Database Improvement Migrations Summary

## Overview

Created database improvement migrations 107-109 focusing on scheduled jobs, RLS policy documentation, and data validation constraints.

## Files Created

### 1. Migration 107: Scheduled Jobs Refresh
**File**: `web/db/107_scheduled_jobs_refresh.sql` (12 KB)

**Purpose**: Supplementary scheduled jobs and materialized view refresh strategies

**Key Features**:
- Additional maintenance functions for cleanup tasks
- Notification cleanup (keep 3 months of read notifications)
- Message archival (archive conversations after 1 year)
- QR tag cleanup (remove inactive, unassigned tags after 2 years)
- Materialized view refresh jobs (dashboard stats, client summary, analytics)
- Orphaned record cleanup
- Monitoring views for job execution and MV freshness
- Manual refresh function for testing

**Scheduled Jobs Added**:
| Job Name | Frequency | Function |
|----------|-----------|----------|
| cleanup_notifications | Monthly | Delete old read notifications |
| archive_messages | Monthly | Archive old conversations |
| cleanup_qr_tags | Quarterly | Remove expired QR tags |
| refresh_dashboard_stats | Every 15 min | Refresh dashboard MV |
| refresh_client_summary | Hourly | Refresh client summary MV |
| refresh_analytics | Daily 3 AM | Refresh analytics MVs |
| cleanup_orphaned | Weekly | Remove orphaned records |

**Notes**:
- Complements base jobs in `32_scheduled_jobs.sql`
- Requires pg_cron extension enabled in Supabase
- Includes monitoring views and manual refresh capability

---

### 2. Migration 108: RLS Policy Comments
**File**: `web/db/108_rls_policy_comments.sql` (16 KB)

**Purpose**: Add documentation comments to all RLS policies for better maintainability

**Coverage**:
- Core tables (profiles, tenants)
- Pet management (pets, vaccines, medical_records, qr_tags)
- Services & appointments
- Invoicing & payments
- Clinical tools (diagnosis_codes, prescriptions, euthanasia_assessments)
- Hospitalization (kennels, hospitalizations, vitals)
- Laboratory (lab_orders, lab_results)
- Store & inventory (products, orders, campaigns)
- Communications (conversations, messages, whatsapp, reminders)
- Consent management
- Insurance (policies, claims)
- Staff management (schedules, time_off)
- Audit & notifications
- Safety & epidemiology (lost_pets, disease_reports)

**Example Comments**:
```sql
COMMENT ON POLICY "Staff manage pets" ON pets IS
    'Staff members can perform all operations on pets within their tenant';

COMMENT ON POLICY "Owners view own pets" ON pets IS
    'Pet owners can view pets where they are the registered owner';
```

**Benefits**:
- Self-documenting security rules
- Easier onboarding for new developers
- Quick policy purpose identification
- Compliance documentation

---

### 3. Migration 109: Check Constraints
**File**: `web/db/109_check_constraints.sql` (17 KB)

**Purpose**: Add data validation constraints at the database level to ensure data integrity

**Constraint Categories**:

#### A. Financial Constraints
- Price validation (positive amounts for services, products, invoices)
- Quantity validation (positive quantities for line items)
- Balance validation (balance_due <= total_amount)
- Discount validation (percentage 0-100, fixed > 0)
- Loyalty points (non-negative balances)

#### B. Inventory Constraints
- Stock quantity (non-negative)
- Reorder points (non-negative)
- Weighted average cost (non-negative)

#### C. Date & Time Constraints
- End times after start times (appointments, hospitalizations)
- Expiration dates after start dates (insurance, campaigns)
- Next due dates after administered dates (vaccines)
- Signed dates after created dates (consents)

#### D. Contact Information Constraints
- Phone number format (minimum length 6)
- Email format (basic regex validation)

#### E. Pet Constraints
- Weight validation (positive values)
- Species validation (enum: dog, cat, bird, etc.)
- Sex validation (enum: male, female, unknown)
- Birth date not in future

#### F. Clinical Constraints
- Euthanasia scores (0-10 scale, total 0-70)
- Vital signs ranges:
  - Temperature: 30-45°C
  - Heart rate: 20-300 bpm
  - Respiratory rate: 5-100 breaths/min
  - Pain score: 0-10
- Drug dosages (positive values)

#### G. Status & Enum Constraints
- Appointment status (scheduled, confirmed, completed, etc.)
- Invoice status (draft, sent, paid, etc.)
- Payment status (pending, completed, failed, etc.)
- Order status (pending, processing, shipped, etc.)
- Hospitalization status and acuity levels
- Lab order status
- Insurance claim status
- Reminder status
- Vaccine status

#### H. Rating & Review Constraints
- Product reviews (1-5 star rating)

#### I. Capacity & Limit Constraints
- Kennel capacity (positive)
- Coupon usage limits (positive)
- Time off max days (positive)

#### J. Reproductive Cycle Constraints
- End date after start date
- Cycle type validation (heat, pregnancy, lactation, anestrus)

#### K. Messaging Constraints
- Sender type validation (client, staff, system)
- Message status validation
- WhatsApp direction and status
- Conversation channel and status

#### L. Audit Log Constraints
- Action type validation (create, read, update, delete, etc.)

**Example Constraints**:
```sql
-- Price must be positive
ALTER TABLE services
ADD CONSTRAINT services_price_positive
    CHECK (base_price >= 0);

-- End time after start time
ALTER TABLE appointments
ADD CONSTRAINT appointments_end_after_start
    CHECK (end_time > start_time);

-- Email format validation
ALTER TABLE profiles
ADD CONSTRAINT profiles_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Score range validation
ALTER TABLE euthanasia_assessments
ADD CONSTRAINT euthanasia_scores_valid
    CHECK (hurt_score BETWEEN 0 AND 10);
```

**Benefits**:
- Data integrity enforced at database level
- Prevents invalid data insertion
- Clearer error messages for validation failures
- Reduces application-level validation code
- Ensures consistency across all applications

---

### 4. RLS Verification Script
**File**: `web/db/scripts/verify-rls.sql` (13 KB)

**Purpose**: Comprehensive RLS verification and security audit script

**Verification Checks**:
1. Tables without RLS enabled (security risk!)
2. Tables with RLS but no policies (blocks all access)
3. Policy coverage summary
4. Missing CRUD policies
5. Policies with hardcoded tenant IDs
6. Overly permissive policies
7. Detailed policy definitions
8. Policy dependencies on functions
9. Security function verification (is_staff_of, auth.uid)
10. Tables by RLS status summary
11. Recommendations and fixes

**Usage**:
```bash
# Via psql
psql -U postgres -d database -f web/db/scripts/verify-rls.sql

# Via Supabase CLI
supabase db execute -f web/db/scripts/verify-rls.sql

# Via SQL Editor (copy/paste)
```

**Output**: Detailed security report with:
- Issues found
- Recommended fixes
- SQL statements to resolve issues
- Summary statistics

**When to Run**:
- After adding new tables
- Before production deployments
- During security audits
- Monthly security reviews

---

### 5. Scripts Documentation
**File**: `web/db/scripts/README.md` (7 KB)

**Purpose**: Comprehensive documentation for database verification scripts

**Contents**:
- Script descriptions and purpose
- How to run scripts
- Output interpretation guide
- Common fixes and examples
- Best practices for RLS policies
- Troubleshooting guide
- CI/CD integration examples
- Maintenance schedule

**Key Sections**:
- RLS Policy Guidelines
- Tables that should/shouldn't have RLS
- Security function requirements
- Policy naming conventions
- Troubleshooting common issues
- Automation recommendations

---

## Migration Sequence

The existing migration files go up to 106. The new migrations are:

```
105_add_updated_at_triggers.sql
106_add_performance_indexes.sql
107_scheduled_jobs_refresh.sql      ← NEW
108_rls_policy_comments.sql         ← NEW
109_check_constraints.sql           ← NEW
```

## Deployment Order

Run migrations in this order:

1. **107_scheduled_jobs_refresh.sql**
   - Adds supplementary scheduled jobs
   - Safe to run (creates new functions and jobs)
   - Requires pg_cron extension enabled

2. **108_rls_policy_comments.sql**
   - Adds documentation to existing policies
   - Safe to run (metadata only, no behavior changes)
   - No downtime

3. **109_check_constraints.sql**
   - Adds validation constraints
   - **IMPORTANT**: Review existing data first!
   - May fail if invalid data exists
   - Recommended: Test on staging first

## Pre-Deployment Checklist

### Before running 107 (Scheduled Jobs)
- [ ] Verify pg_cron extension is enabled in Supabase
- [ ] Review scheduled job timings for your timezone
- [ ] Ensure base scheduled jobs (32_scheduled_jobs.sql) are deployed

### Before running 108 (RLS Comments)
- [ ] Review policy comments for accuracy
- [ ] No pre-checks needed (safe migration)

### Before running 109 (Check Constraints)
- [ ] Run verification queries to check for invalid data:
  ```sql
  -- Check for negative prices
  SELECT COUNT(*) FROM services WHERE base_price < 0;

  -- Check for invalid appointments (end before start)
  SELECT COUNT(*) FROM appointments WHERE end_time <= start_time;

  -- Check for invalid email formats
  SELECT COUNT(*) FROM profiles WHERE email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';

  -- Check for invalid scores
  SELECT COUNT(*) FROM euthanasia_assessments
  WHERE hurt_score NOT BETWEEN 0 AND 10;
  ```
- [ ] Clean up invalid data before adding constraints
- [ ] Test on staging environment first

## Post-Deployment Verification

### After 107 (Scheduled Jobs)
```sql
-- Verify jobs are scheduled
SELECT * FROM scheduled_jobs WHERE jobname LIKE 'vete_%';

-- Check job execution
SELECT * FROM recent_job_executions;

-- Manually test refresh
SELECT * FROM manual_refresh_all_views();
```

### After 108 (RLS Comments)
```sql
-- Verify comments were added
SELECT tablename, policyname, obj_description(oid) as comment
FROM pg_policies p
JOIN pg_policy po ON po.polname = p.policyname
WHERE schemaname = 'public'
LIMIT 10;
```

### After 109 (Check Constraints)
```sql
-- Verify constraints were added
SELECT conname, contype, conrelid::regclass
FROM pg_constraint
WHERE contype = 'c'
AND conrelid::regclass::text IN ('services', 'appointments', 'pets')
ORDER BY conrelid::regclass::text;

-- Test constraints
-- Should fail:
INSERT INTO services (base_price) VALUES (-10);
-- Error: new row violates check constraint "services_price_positive"
```

## Rollback Procedures

### Rollback 107
```sql
-- Unschedule jobs
SELECT cron.unschedule('vete_cleanup_notifications');
SELECT cron.unschedule('vete_archive_messages');
SELECT cron.unschedule('vete_cleanup_qr_tags');
SELECT cron.unschedule('vete_refresh_dashboard_stats');
SELECT cron.unschedule('vete_refresh_client_summary');
SELECT cron.unschedule('vete_refresh_analytics');
SELECT cron.unschedule('vete_cleanup_orphaned');

-- Drop functions
DROP FUNCTION IF EXISTS job_cleanup_notifications();
DROP FUNCTION IF EXISTS job_archive_old_messages();
DROP FUNCTION IF EXISTS job_cleanup_expired_qr_tags();
DROP FUNCTION IF EXISTS job_refresh_dashboard_stats();
DROP FUNCTION IF EXISTS job_refresh_client_summary();
DROP FUNCTION IF EXISTS job_refresh_analytics();
DROP FUNCTION IF EXISTS job_cleanup_orphaned_records();
DROP FUNCTION IF EXISTS manual_refresh_all_views();

-- Drop views
DROP VIEW IF EXISTS mv_refresh_status;
DROP VIEW IF EXISTS job_frequency_stats;
```

### Rollback 108
```sql
-- Remove comments (generate for each policy)
COMMENT ON POLICY "policy_name" ON table_name IS NULL;
```

### Rollback 109
```sql
-- Drop constraints (example - generate for all constraints)
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_price_positive;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_end_after_start;
-- ... repeat for all constraints
```

## Impact Assessment

### Performance Impact
- **107**: Minimal - scheduled jobs run in background
- **108**: None - comments are metadata only
- **109**: Low - constraints checked on INSERT/UPDATE only

### Downtime Required
- **107**: None
- **108**: None
- **109**: None (but may fail if invalid data exists)

### Risk Level
- **107**: Low - new functionality, doesn't modify existing behavior
- **108**: Very Low - documentation only
- **109**: Medium - can reject invalid data (feature, not bug)

## Benefits Summary

### Security
- Better documented RLS policies (108)
- Verification script for security audits (verify-rls.sql)
- Automated security checks possible

### Data Quality
- Database-level validation (109)
- Prevention of invalid data entry
- Consistent data integrity rules

### Maintenance
- Automated cleanup jobs (107)
- Better materialized view refresh strategy
- Self-documenting security policies (108)

### Operations
- Monitoring views for job execution
- Manual refresh capability for testing
- Detailed verification scripts

## Monitoring

### Scheduled Jobs
```sql
-- View job statistics
SELECT * FROM job_statistics;
SELECT * FROM job_frequency_stats;

-- View recent executions
SELECT * FROM recent_job_executions;

-- View materialized view freshness
SELECT * FROM mv_refresh_status;
```

### RLS Policies
```bash
# Run verification script monthly
psql -f web/db/scripts/verify-rls.sql > rls-report-$(date +%Y%m%d).txt
```

### Check Constraints
```sql
-- Monitor constraint violations (application logs)
-- PostgreSQL will log constraint violations to server logs

-- View all check constraints
SELECT conname, conrelid::regclass, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE contype = 'c'
ORDER BY conrelid::regclass::text;
```

## Next Steps

1. **Review**: Review migration files for any clinic-specific adjustments
2. **Test**: Deploy to staging environment first
3. **Verify**: Run verification script and check for issues
4. **Deploy**: Apply migrations to production
5. **Monitor**: Check scheduled job execution and constraint enforcement
6. **Document**: Update project documentation with new constraints and jobs

## Related Files

- Base scheduled jobs: `web/db/32_scheduled_jobs.sql`
- Materialized views: `web/db/31_materialized_views.sql`, `web/db/57_materialized_views.sql`
- RLS policies: `web/db/14_rls_policies.sql`, `web/db/50_rls_policies_complete.sql`
- Database documentation: `documentation/database/`
- Security audit: `.claude/SUPABASE_AUDIT.md`

## Support

For questions or issues:
1. Review script comments and documentation
2. Check existing policies and constraints for patterns
3. Refer to PostgreSQL and Supabase documentation
4. Review project documentation in `documentation/database/`
