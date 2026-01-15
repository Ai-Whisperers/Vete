# Deploy Migrations 088-090 to Production

## Quick Deployment Steps

### Option 1: Supabase SQL Editor (Easiest)
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste each file and run:

**Migration 088**: `db/migrations/088_atomic_appointment_booking.sql`
**Migration 089**: `db/migrations/089_atomic_appointment_reschedule.sql`  
**Migration 090**: `db/migrations/090_atomic_cart_merge.sql`

3. Verify:
```sql
SELECT proname FROM pg_proc 
WHERE proname IN (
  'book_appointment_atomic',
  'reschedule_appointment_atomic',
  'merge_cart_atomic'
);
-- Should return 3 rows
```

### Option 2: Run Script Locally
```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-url"
node scripts/apply-migrations-088-090.mjs
```

## Post-Deployment Checklist
- [ ] All 3 functions exist (run verification query above)
- [ ] Check Supabase logs for any errors (first 15 minutes)
- [ ] Test booking flow manually (1 appointment)
- [ ] Monitor for 24 hours

## Rollback (if needed)
```sql
DROP FUNCTION IF EXISTS book_appointment_atomic CASCADE;
DROP FUNCTION IF EXISTS reschedule_appointment_atomic CASCADE;
DROP FUNCTION IF EXISTS merge_cart_atomic CASCADE;
```

**Full guide**: `documentation/database/migrations-088-090-guide.md`
