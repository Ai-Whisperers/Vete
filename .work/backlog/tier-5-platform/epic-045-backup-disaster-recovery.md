---
id: EPIC-045
title: "Backup & Disaster Recovery"
tier: 5
priority: P5
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-045: Backup & Disaster Recovery

## Context
No automated backup or disaster recovery plan. Data loss would be catastrophic for veterinary records.

## Acceptance Criteria
- [ ] Daily Supabase backup automated
- [ ] Disaster recovery runbook
- [ ] Point-in-time recovery procedure
- [ ] Monthly restore testing
- [ ] Backup monitoring alerts

## Stories

### STORY-045.1: Automate daily Supabase backup to MinIO
- **Status**: todo
- **Effort**: M
- **Description**: Set up automated daily pg_dump to MinIO/S3 compatible storage
- **Files to touch**: scripts/backup.sh, cron configuration, docker-compose.yml
- **Tests needed**: Daily backup runs and uploads successfully
- **Done when**: Daily backups automated

### STORY-045.2: Create disaster recovery runbook
- **Status**: todo
- **Effort**: M
- **Description**: Document step-by-step disaster recovery procedures
- **Files to touch**: docs/ops/disaster-recovery.md
- **Tests needed**: Runbook covers all failure scenarios
- **Done when**: DR runbook complete

### STORY-045.3: Add point-in-time recovery procedure
- **Status**: todo
- **Effort**: M
- **Description**: Document and test PITR using Supabase WAL archiving
- **Files to touch**: docs/ops/pitr.md, scripts/pitr-restore.sh
- **Tests needed**: PITR tested and documented
- **Done when**: PITR procedure verified

### STORY-045.4: Test restore procedure monthly
- **Status**: todo
- **Effort**: S
- **Description**: Create automated restore test that runs monthly
- **Files to touch**: scripts/test-restore.sh, cron configuration
- **Tests needed**: Monthly restore test passes
- **Done when**: Monthly restore tests running

### STORY-045.5: Add backup monitoring alerts
- **Status**: todo
- **Effort**: S
- **Description**: Alert if backup fails or is older than 25 hours
- **Files to touch**: scripts/backup-monitor.sh, src/services/monitoring/
- **Tests needed**: Alert fires on backup failure
- **Done when**: Backup monitoring active

## Technical Notes
Supabase Pro includes automatic backups, but having independent backups is critical. Use pg_dump with --format=custom for efficient compression. Store backups in at least 2 locations.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
