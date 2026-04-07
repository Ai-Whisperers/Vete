---
id: EPIC-012
title: "Database Maintenance"
tier: 2
priority: P2
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-012: Database Maintenance

## Context
96 migrations with duplicates, FK constraints intentionally disabled. Database maintenance debt is accumulating and could cause data integrity issues.

## Acceptance Criteria
- [ ] Migrations squashed to manageable baseline
- [ ] Duplicate migrations removed
- [ ] FK constraints re-enabled
- [ ] Backup automation working
- [ ] Restore procedure documented and tested
- [ ] Migration testing in CI

## Stories

### STORY-012.1: Squash migrations 001-050 into baseline
- **Status**: todo
- **Effort**: M
- **Description**: Combine first 50 migrations into a single baseline migration
- **Files to touch**: supabase/migrations/
- **Tests needed**: Single baseline migration replaces 50 files
- **Done when**: Migrations squashed to baseline + incremental

### STORY-012.2: Remove duplicate migrations (051 & 090)
- **Status**: todo
- **Effort**: S
- **Description**: Identify and remove duplicate migration files
- **Files to touch**: supabase/migrations/
- **Tests needed**: No duplicate migrations exist
- **Done when**: Duplicate migrations removed

### STORY-012.3: Re-enable FK constraint on profiles → auth.users
- **Status**: todo
- **Effort**: M
- **Description**: Re-enable the foreign key constraint that was intentionally disabled, fixing any orphaned records first
- **Files to touch**: supabase/migrations/, SQL queries
- **Tests needed**: FK constraint exists and is enforced
- **Done when**: FK constraint active, no orphaned records

### STORY-012.4: Add database backup automation
- **Status**: todo
- **Effort**: M
- **Description**: Set up automated daily backups of the Supabase database
- **Files to touch**: scripts/backup.sh, cron configuration
- **Tests needed**: Daily backup runs and uploads to storage
- **Done when**: Automated daily backups running

### STORY-012.5: Create database restore procedure
- **Status**: todo
- **Effort**: M
- **Description**: Document and test the restore procedure from backups
- **Files to touch**: docs/ops/database-restore.md, scripts/restore.sh
- **Tests needed**: Successful test restore from backup
- **Done when**: Restore procedure documented and verified

### STORY-012.6: Add migration testing in CI
- **Status**: todo
- **Effort**: S
- **Description**: Add CI step that tests migrations against a clean database
- **Files to touch**: .github/workflows/ci.yml, supabase/
- **Tests needed**: CI runs migrations on PR
- **Done when**: Migration testing in CI pipeline

## Technical Notes
Be very careful with migration squashing - test on a copy first. For FK constraints, query for orphaned records: `SELECT * FROM profiles WHERE id NOT IN (SELECT id FROM auth.users)`.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
