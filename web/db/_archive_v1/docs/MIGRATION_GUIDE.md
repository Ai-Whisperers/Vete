# Database Migration Guide

## Migration File Format

Migrations are numbered SQL files in `web/db/`:

```
01_extensions.sql
02_schema_core.sql
...
100_fix_something.sql
```

## Creating a New Migration

1. **Determine the next number**:
   ```bash
   ls -1 web/db/*.sql | tail -5
   ```

2. **Create the file**:
   ```bash
   touch web/db/XXX_description.sql
   ```

3. **Write idempotent SQL**:
   ```sql
   -- Add column if not exists
   ALTER TABLE pets ADD COLUMN IF NOT EXISTS color TEXT;

   -- Create index if not exists
   CREATE INDEX IF NOT EXISTS idx_pets_color ON pets(color);

   -- Create or replace function
   CREATE OR REPLACE FUNCTION my_function() ...
   ```

## Migration Checklist

- [ ] Uses `IF NOT EXISTS` or `IF EXISTS` for idempotency
- [ ] Includes RLS policy if creating new table
- [ ] Adds appropriate indexes
- [ ] Updates related functions if needed
- [ ] Has a rollback section (commented out)

## Running Migrations

### Development
Use Supabase Studio SQL editor or CLI:
```bash
supabase db push
```

### Production
1. Review migration in Supabase dashboard
2. Test in staging first
3. Apply during low-traffic period
4. Monitor for errors

## Common Patterns

### Adding a Column
```sql
ALTER TABLE table_name
ADD COLUMN IF NOT EXISTS column_name TYPE DEFAULT value;
```

### Creating a Table with RLS
```sql
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage" ON new_table FOR ALL
  USING (is_staff_of(tenant_id));
```

### Adding an Index
```sql
CREATE INDEX IF NOT EXISTS idx_table_column
ON table_name(column_name);

-- Partial index for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_upcoming
ON appointments(tenant_id, start_time)
WHERE status = 'scheduled';
```

## Rollback Procedures

Always include rollback SQL (commented):
```sql
-- ROLLBACK:
-- ALTER TABLE pets DROP COLUMN IF EXISTS color;
-- DROP INDEX IF EXISTS idx_pets_color;
```
