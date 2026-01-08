# DATA-005: Data Retention Policy Implementation

## Priority: P2
## Category: Data Management
## Status: Not Started
## Epic: [EPIC-12: Data Management & Disaster Recovery](../epics/EPIC-12-data-management.md)

## Description
Implement automated data retention policies to manage data lifecycle, comply with regulations, and optimize storage costs.

## Current State
- No data retention policies
- All data kept indefinitely
- Storage costs growing
- Potential compliance issues

## Proposed Solution

### Retention Configuration
```typescript
// lib/data/retention-config.ts
export const retentionPolicies: RetentionPolicy[] = [
  {
    table: 'audit_logs',
    retention: '2 years',
    action: 'archive',
    archiveLocation: 's3://vete-archives/audit/',
  },
  {
    table: 'notifications',
    retention: '90 days',
    action: 'delete',
    condition: 'read_at IS NOT NULL',
  },
  {
    table: 'sessions',
    retention: '30 days',
    action: 'delete',
  },
  {
    table: 'store_carts',
    retention: '7 days',
    action: 'delete',
    condition: 'updated_at < NOW() - INTERVAL \'7 days\'',
  },
  {
    table: 'medical_records',
    retention: '10 years', // Legal requirement
    action: 'archive',
  },
];
```

### Retention Job
```typescript
// lib/cron/data-retention.ts
export async function runRetentionJob() {
  for (const policy of retentionPolicies) {
    const cutoffDate = calculateCutoff(policy.retention);

    if (policy.action === 'archive') {
      await archiveOldRecords(policy.table, cutoffDate);
    } else {
      await deleteOldRecords(policy.table, cutoffDate, policy.condition);
    }

    await logRetentionAction(policy.table, policy.action);
  }
}

async function archiveOldRecords(table: string, cutoff: Date) {
  // Export to S3
  const data = await fetchOldRecords(table, cutoff);
  await uploadToS3(data, `archives/${table}/${cutoff.toISOString()}.json`);

  // Delete from database
  await deleteOldRecords(table, cutoff);
}
```

### Retention Schedule
| Data Type | Retention | Action |
|-----------|-----------|--------|
| Audit logs | 2 years | Archive |
| Medical records | 10 years | Archive |
| Invoices | 7 years | Archive |
| Notifications (read) | 90 days | Delete |
| Sessions | 30 days | Delete |
| Abandoned carts | 7 days | Delete |
| Temp files | 24 hours | Delete |

## Implementation Steps
1. Define retention policies per table
2. Create archive storage in S3
3. Build retention job with logging
4. Add to cron schedule (weekly)
5. Create retention dashboard
6. Document legal requirements
7. Add retention reports

## Acceptance Criteria
- [ ] Policies defined for all tables
- [ ] Automated weekly retention job
- [ ] Archival to S3 working
- [ ] Retention logs maintained
- [ ] Legal requirements documented
- [ ] Storage savings tracked

## Related Files
- `lib/cron/data-retention.ts` - Retention job
- `app/api/cron/retention/` - Cron endpoint

## Estimated Effort
- 5 hours
  - Policy definition: 1h
  - Archive implementation: 2h
  - Cron job: 1h
  - Dashboard: 1h
