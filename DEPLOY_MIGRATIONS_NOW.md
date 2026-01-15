# 🚀 DEPLOY MIGRATIONS 088-090 TO PRODUCTION

**Status**: ✅ Ready for deployment  
**Risk**: LOW (additive only, backward compatible)  
**Time**: 10-15 minutes  
**Downtime**: None

---

## Pre-Deployment Checklist

- [x] Migrations tested on local database ✅
- [x] Application code already using atomic functions ✅
- [x] All changes committed and pushed ✅
- [ ] **YOU NEED TO DO**: Backup production database
- [ ] **YOU NEED TO DO**: Deploy via Supabase SQL Editor

---

## What Will Be Deployed

| Migration | Function | Race Condition Fixed |
|-----------|----------|---------------------|
| 088 | `book_appointment_atomic()` | Double-booking in appointment slots |
| 089 | `reschedule_appointment_atomic()` | Double-booking during reschedule |
| 090 | `merge_cart_atomic()` | Lost cart items on multi-device login |

---

## Deployment Steps

### Step 1: Backup Production Database

1. Open your Supabase Dashboard
2. Go to **Project Settings → Database → Database Backups**
3. Click **"Create Backup"**
4. Wait for confirmation (1-2 minutes)

### Step 2: Open SQL Editor

1. In Supabase Dashboard, click **SQL Editor** in sidebar
2. Click **"New query"**

### Step 3: Execute Migration 088

1. Open file: `web/db/migrations/088_atomic_appointment_booking.sql`
2. Copy entire contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press F5)
5. ✅ Expected output: `Atomic appointment booking migration complete`

### Step 4: Execute Migration 089

1. Click **"New query"** again
2. Open file: `web/db/migrations/089_atomic_appointment_reschedule.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click **"Run"**
6. ✅ Expected output: `Atomic appointment reschedule migration complete`

### Step 5: Execute Migration 090

1. Click **"New query"** again
2. Open file: `web/db/migrations/090_atomic_cart_merge.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click **"Run"**
6. ✅ Expected output: `Atomic cart merge migration complete`

### Step 6: Verify Deployment

Run this verification query in SQL Editor:

```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN (
  'book_appointment_atomic', 
  'reschedule_appointment_atomic', 
  'merge_cart_atomic'
)
ORDER BY proname;
```

✅ **Expected**: 3 rows returned (one for each function)

### Step 7: Monitor Production

- Check Supabase logs for errors (first 15 minutes)
- Test booking flow manually (create 1 test appointment)
- Monitor for 24 hours

---

## Rollback Plan (If Needed)

If something goes wrong (unlikely), run this in SQL Editor:

```sql
DROP FUNCTION IF EXISTS book_appointment_atomic CASCADE;
DROP FUNCTION IF EXISTS reschedule_appointment_atomic CASCADE;
DROP FUNCTION IF EXISTS merge_cart_atomic CASCADE;
```

This will NOT affect data, only removes the functions.

---

## Migration File Locations

```
C:\Users\Alejandro\Documents\Ivan\Adris\Vete\web\db\migrations\

088_atomic_appointment_booking.sql
089_atomic_appointment_reschedule.sql
090_atomic_cart_merge.sql
```

---

## Post-Deployment Success Metrics

Within 24 hours, you should see:
- ✅ Zero appointment double-booking incidents
- ✅ Zero cart merge conflicts
- ✅ All booking operations working normally

---

## What This Accomplishes

By deploying these migrations, you:
1. ✅ **Eliminate 3 critical race conditions** in production
2. ✅ **Improve data integrity** for appointments and carts
3. ✅ **Enhance user experience** (no more "slot taken" errors)
4. ✅ **Prevent lost cart items** across devices
5. ✅ **Production-harden** the booking system

---

## Questions?

If you encounter any issues during deployment:
1. Check the error message in Supabase SQL Editor
2. Verify you're in the correct project/environment
3. Ensure the backup was created successfully
4. Contact development team if needed

---

**Estimated Time**: 10-15 minutes  
**Risk Level**: LOW  
**Downtime**: None  
**Rollback**: Simple (DROP FUNCTION)

✅ You're ready to deploy! Follow Steps 1-7 above.
