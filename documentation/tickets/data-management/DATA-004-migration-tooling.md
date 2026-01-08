# DATA-004: Database Migration Tooling

## Priority: P2
## Category: Data Management
## Status: Not Started
## Epic: [EPIC-12: Data Management & Disaster Recovery](../epics/EPIC-12-data-management.md)

## Description
Improve database migration tooling with better rollback support, validation, and deployment automation.

## Current State
- 66 SQL migration files exist
- Manual migration execution
- No automated rollback scripts
- No pre-migration validation

## Proposed Solution

### Migration Runner
```typescript
// scripts/migrate.ts
import { readdir, readFile } from 'fs/promises';

interface Migration {
  id: number;
  name: string;
  up: string;
  down: string;
  checksum: string;
}

export async function runMigrations(target?: number) {
  const applied = await getAppliedMigrations();
  const pending = await getPendingMigrations(applied);

  for (const migration of pending) {
    console.log(`Applying: ${migration.name}`);

    // Validate first
    await validateMigration(migration);

    // Create savepoint
    await db.query('SAVEPOINT pre_migration');

    try {
      await db.query(migration.up);
      await recordMigration(migration);
    } catch (error) {
      await db.query('ROLLBACK TO SAVEPOINT pre_migration');
      throw error;
    }
  }
}

export async function rollbackMigration(id: number) {
  const migration = await getMigrationById(id);
  await db.query(migration.down);
  await removeMigrationRecord(id);
}
```

### Migration Template
```sql
-- web/db/migrations/XXX_description.sql
-- Migration: XXX_description
-- Created: YYYY-MM-DD

-- UP
BEGIN;

-- Your migration here
CREATE TABLE example (...);

COMMIT;

-- DOWN (in separate file or section)
-- DROP TABLE example;
```

### Validation Checks
```typescript
// lib/db/migration-validator.ts
export async function validateMigration(migration: Migration) {
  // Check syntax
  await db.query(`EXPLAIN ${migration.up}`);

  // Check for dangerous operations
  if (migration.up.includes('DROP TABLE') && !migration.up.includes('IF EXISTS')) {
    throw new Error('DROP TABLE without IF EXISTS');
  }

  // Estimate lock time
  const lockEstimate = await estimateLockTime(migration.up);
  if (lockEstimate > 5000) {
    console.warn(`Migration may lock tables for ${lockEstimate}ms`);
  }
}
```

## Implementation Steps
1. Create migration tracking table
2. Build migration runner script
3. Add rollback support to all migrations
4. Create pre-migration validation
5. Add dry-run mode
6. Integrate with CI/CD
7. Document migration procedures

## Acceptance Criteria
- [ ] All migrations have up/down scripts
- [ ] Migration runner with rollback
- [ ] Pre-migration validation
- [ ] Dry-run mode available
- [ ] CI/CD integration
- [ ] Migration history tracked

## Related Files
- `web/db/migrations/` - SQL migrations
- `scripts/migrate.ts` - Migration runner

## Estimated Effort
- 6 hours
  - Migration runner: 2h
  - Rollback scripts: 2h
  - Validation: 1h
  - CI/CD integration: 1h
