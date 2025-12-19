# Row-Level Security (RLS) Policies

## Overview

Every table in Vete has RLS enabled to ensure:
1. **Tenant isolation**: Users can only access their clinic's data
2. **Role-based access**: Different permissions for owners vs staff
3. **Data privacy**: Owners only see their own pets/appointments

## Core Policies

### Staff Full Access
Staff (vets and admins) have full access within their tenant:

```sql
CREATE POLICY "Staff manage [table]" ON [table]
FOR ALL
USING (is_staff_of(tenant_id));
```

### Owner Limited Access
Pet owners have read access to their own data:

```sql
CREATE POLICY "Owners view own [resource]" ON [table]
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.tenant_id = [table].tenant_id
  )
);
```

## Policy Types by Table

### Public Tables (No Auth Required)
- `services` (SELECT only) - Service catalog
- `growth_standards` - Growth chart reference data
- `diagnosis_codes` - Medical code reference

### Authenticated-Only Tables
- `lab_test_catalog` - Lab test reference
- `lab_reference_ranges` - Lab value ranges
- `drug_dosages` - Drug dosage reference

### Tenant-Isolated Tables (Staff Full, Owner Limited)
- `pets` - Staff: all, Owners: their pets
- `appointments` - Staff: all, Owners: their appointments
- `invoices` - Staff: all, Owners: their invoices
- `medical_records` - Staff: all, Owners: their pets' records
- `vaccines` - Staff: all, Owners: their pets' vaccines

### Staff-Only Tables
- `hospitalizations` - Staff full access
- `lab_orders` - Staff full access
- `lab_results` - Staff full access
- `prescriptions` - Staff full access
- `audit_logs` - Admin only

## Helper Functions

### is_staff_of(tenant_id)
Returns true if current user is vet/admin in the tenant:

```sql
CREATE FUNCTION is_staff_of(check_tenant_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.tenant_id = check_tenant_id
    AND profiles.role IN ('vet', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

### is_owner_of_pet(pet_id)
Returns true if current user owns the pet:

```sql
CREATE FUNCTION is_owner_of_pet(check_pet_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM pets
    WHERE pets.id = check_pet_id
    AND pets.owner_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

## Testing Policies

### Verify Policy Coverage
```sql
-- Find tables without policies
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT DISTINCT tablename FROM pg_policies
);
```

### Test as Different Roles
```sql
-- Test as owner
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "owner-uuid"}';
SELECT * FROM pets; -- Should only see owned pets

-- Test as staff
SET LOCAL "request.jwt.claims" = '{"sub": "staff-uuid"}';
SELECT * FROM pets; -- Should see all tenant pets
```

## Security Best Practices

1. **Always use tenant_id**: Never query without tenant filter
2. **Use SECURITY DEFINER carefully**: Only for helper functions
3. **Test policies**: Verify access patterns with different roles
4. **Audit regularly**: Run RLS verification scripts
5. **Log access**: Use audit_logs for sensitive operations
