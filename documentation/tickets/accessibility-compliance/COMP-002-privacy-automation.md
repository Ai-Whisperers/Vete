# COMP-002: Privacy Policy Automation

## Priority: P3
## Category: Compliance
## Status: Not Started
## Epic: [EPIC-13: Accessibility & Compliance](../epics/EPIC-13-accessibility-compliance.md)

## Description
Implement automated privacy policy management with version tracking and user acceptance.

## Current State
- Static privacy policy
- No version tracking
- No acceptance tracking
- Manual updates required

## Proposed Solution

### Privacy Policy Schema
```typescript
// lib/types/privacy.ts
interface PrivacyPolicy {
  id: string;
  version: string;
  effectiveDate: Date;
  content: {
    es: string; // Spanish version
    en: string; // English version
  };
  changes: string[]; // Summary of changes from previous
  requiresReacceptance: boolean;
}

interface UserAcceptance {
  userId: string;
  policyVersion: string;
  acceptedAt: Date;
  ipAddress: string;
  userAgent: string;
}
```

### Acceptance Tracking
```typescript
// app/api/privacy/accept/route.ts
export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  const { policyVersion } = await request.json();

  await supabase.from('privacy_acceptances').insert({
    user_id: userId,
    policy_version: policyVersion,
    accepted_at: new Date().toISOString(),
    ip_address: request.ip,
    user_agent: request.headers.get('user-agent'),
  });

  return NextResponse.json({ accepted: true });
}
```

### Re-acceptance Flow
```tsx
// components/privacy/privacy-update-modal.tsx
export function PrivacyUpdateModal({ policy, onAccept }: Props) {
  return (
    <Modal>
      <h2>Actualización de Política de Privacidad</h2>
      <p>Hemos actualizado nuestra política de privacidad (v{policy.version})</p>

      <h3>Cambios principales:</h3>
      <ul>
        {policy.changes.map((change, i) => (
          <li key={i}>{change}</li>
        ))}
      </ul>

      <a href="/privacy" target="_blank">Ver política completa</a>

      <button onClick={onAccept}>Aceptar y continuar</button>
    </Modal>
  );
}
```

## Implementation Steps
1. Create privacy policy versioning system
2. Build acceptance tracking table
3. Implement re-acceptance flow
4. Create policy comparison view
5. Add admin policy update UI
6. Generate acceptance reports

## Acceptance Criteria
- [ ] Policy versions tracked
- [ ] User acceptance recorded
- [ ] Re-acceptance prompted on updates
- [ ] Audit trail maintained
- [ ] Admin can update policy
- [ ] Reports available

## Related Files
- `app/privacy/` - Privacy policy page
- `lib/privacy/` - Privacy utilities
- `components/privacy/` - Privacy components

## Estimated Effort
- 6 hours
  - Versioning system: 2h
  - Acceptance tracking: 2h
  - Re-acceptance flow: 1h
  - Admin UI: 1h
