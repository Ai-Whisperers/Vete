# COMP-001: GDPR Data Subject Rights

## Priority: P2
## Category: Compliance
## Status: Not Started
## Epic: [EPIC-13: Accessibility & Compliance](../epics/EPIC-13-accessibility-compliance.md)

## Description
Implement GDPR data subject rights including data access, portability, rectification, and erasure.

## Current State
- No formal GDPR compliance
- No data export for users
- No account deletion workflow
- Data access requests handled manually

## Proposed Solution

### Data Subject Rights API
```typescript
// app/api/gdpr/route.ts

// Right to Access (Article 15)
export async function GET(request: NextRequest) {
  const userId = await getUserId(request);

  const data = await collectUserData(userId);

  return NextResponse.json({
    personalData: data,
    exportedAt: new Date().toISOString(),
    format: 'json',
  });
}

// Right to Erasure (Article 17)
export async function DELETE(request: NextRequest) {
  const userId = await getUserId(request);

  // Verify identity (require password confirmation)
  const { password } = await request.json();
  await verifyPassword(userId, password);

  // Start deletion process
  const job = await queueDeletion(userId);

  return NextResponse.json({
    status: 'pending',
    jobId: job.id,
    estimatedCompletion: '30 days',
  });
}
```

### Data Collection
```typescript
// lib/gdpr/collect-data.ts
export async function collectUserData(userId: string) {
  return {
    profile: await getProfile(userId),
    pets: await getPets(userId),
    appointments: await getAppointments(userId),
    invoices: await getInvoices(userId),
    medicalRecords: await getMedicalRecords(userId),
    messages: await getMessages(userId),
    activityLog: await getActivityLog(userId),
  };
}
```

### Deletion Workflow
```typescript
// lib/gdpr/delete-data.ts
export async function deleteUserData(userId: string) {
  // 1. Anonymize medical records (legal retention required)
  await anonymizeMedicalRecords(userId);

  // 2. Delete personal data
  await deletePersonalData(userId);

  // 3. Delete from auth system
  await deleteAuthUser(userId);

  // 4. Notify user
  await sendDeletionConfirmation(userId);

  // 5. Log for compliance
  await logDeletionCompliance(userId);
}
```

## Implementation Steps
1. Create data export functionality
2. Implement account deletion workflow
3. Add data rectification (profile edit)
4. Create GDPR request management UI
5. Add identity verification
6. Implement retention period handling
7. Create compliance audit log

## Acceptance Criteria
- [ ] Users can export all their data
- [ ] Users can delete their account
- [ ] Identity verified before deletion
- [ ] 30-day processing SLA
- [ ] Medical records anonymized (not deleted)
- [ ] Compliance log maintained

## Related Files
- `app/api/gdpr/` - GDPR endpoints
- `lib/gdpr/` - GDPR utilities
- `app/[clinic]/portal/settings/` - User settings

## Estimated Effort
- 10 hours
  - Data export: 3h
  - Account deletion: 4h
  - UI & workflows: 2h
  - Compliance logging: 1h
