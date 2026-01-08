# SCALE-002: Database Query Optimization

## Priority: P2
## Category: Scalability
## Status: Not Started
## Epic: [EPIC-14: Load Testing & Scalability](../epics/EPIC-14-load-testing-scalability.md)

## Description
Optimize database queries and indexes for improved performance under load, targeting sub-100ms response times for common operations.

## Current State
- Queries generally fast but unoptimized
- Some N+1 query patterns exist
- Missing composite indexes
- No query performance monitoring

## Proposed Solution

### Query Analysis
```sql
-- Find slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time,
  rows
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY total_exec_time DESC
LIMIT 20;
```

### Index Optimization
```sql
-- web/db/migrations/070_performance_indexes.sql

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_appointments_tenant_date
ON appointments(tenant_id, start_time)
WHERE status != 'cancelled';

CREATE INDEX CONCURRENTLY idx_invoices_tenant_status_date
ON invoices(tenant_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY idx_pets_tenant_owner
ON pets(tenant_id, owner_id)
INCLUDE (name, species, breed);

-- Partial indexes for active records
CREATE INDEX CONCURRENTLY idx_products_active
ON store_products(tenant_id, category_id)
WHERE is_active = true;

-- Expression index for search
CREATE INDEX CONCURRENTLY idx_pets_search
ON pets USING gin(
  to_tsvector('spanish', name || ' ' || COALESCE(breed, ''))
);
```

### Query Optimization Patterns
```typescript
// lib/db/optimized-queries.ts

// Bad: N+1 query pattern
async function getPetsWithVaccinesBad(ownerId: string) {
  const pets = await db.select().from(petsTable).where(eq(petsTable.ownerId, ownerId));

  for (const pet of pets) {
    pet.vaccines = await db.select().from(vaccinesTable).where(eq(vaccinesTable.petId, pet.id));
  }
  return pets;
}

// Good: Single query with join
async function getPetsWithVaccinesGood(ownerId: string) {
  return db
    .select({
      pet: petsTable,
      vaccines: sql`json_agg(${vaccinesTable})`,
    })
    .from(petsTable)
    .leftJoin(vaccinesTable, eq(petsTable.id, vaccinesTable.petId))
    .where(eq(petsTable.ownerId, ownerId))
    .groupBy(petsTable.id);
}
```

### Connection Pooling
```typescript
// lib/db/pool-config.ts
export const poolConfig = {
  max: 20,                    // Max connections
  min: 5,                     // Min connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 10000,  // Connection timeout
  maxUses: 7500,              // Close after N uses (prevent leaks)
};
```

## Implementation Steps
1. Enable pg_stat_statements for query analysis
2. Identify top 20 slow queries
3. Create missing indexes
4. Refactor N+1 query patterns
5. Implement connection pooling
6. Add query timing instrumentation
7. Set up slow query alerts

## Acceptance Criteria
- [ ] pg_stat_statements enabled
- [ ] Top slow queries identified
- [ ] 10+ new indexes created
- [ ] N+1 patterns eliminated
- [ ] Connection pooling configured
- [ ] P95 query time < 100ms

## Related Files
- `web/db/migrations/` - Index migrations
- `lib/db/` - Database utilities
- `lib/supabase/` - Supabase clients

## Estimated Effort
- 12 hours
  - Query analysis: 2h
  - Index creation: 3h
  - Query refactoring: 4h
  - Connection pooling: 2h
  - Monitoring setup: 1h
