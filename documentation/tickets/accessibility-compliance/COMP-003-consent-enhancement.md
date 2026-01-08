# COMP-003: Consent Tracking Enhancement

## Priority: P2
## Category: Compliance
## Status: Not Started
## Epic: [EPIC-13: Accessibility & Compliance](../epics/EPIC-13-accessibility-compliance.md)

## Description
Enhance the existing consent management system with granular consent tracking, preference management, and audit capabilities.

## Current State
- Basic consent templates exist
- Consent documents tracked
- No granular consent preferences
- Limited consent analytics

## Proposed Solution

### Granular Consent Types
```typescript
// lib/types/consent.ts
export const CONSENT_TYPES = {
  MEDICAL_TREATMENT: 'medical_treatment',
  DATA_PROCESSING: 'data_processing',
  MARKETING_EMAIL: 'marketing_email',
  MARKETING_SMS: 'marketing_sms',
  THIRD_PARTY_SHARING: 'third_party_sharing',
  ANALYTICS_COOKIES: 'analytics_cookies',
  PHOTO_SHARING: 'photo_sharing',
} as const;

interface ConsentPreference {
  userId: string;
  consentType: keyof typeof CONSENT_TYPES;
  granted: boolean;
  grantedAt: Date | null;
  withdrawnAt: Date | null;
  source: 'signup' | 'settings' | 'procedure' | 'banner';
}
```

### Consent Preference Center
```tsx
// components/consent/preference-center.tsx
export function ConsentPreferenceCenter() {
  const { preferences, updatePreference } = useConsentPreferences();

  return (
    <div>
      <h2>Preferencias de Consentimiento</h2>

      <ConsentToggle
        type="MARKETING_EMAIL"
        label="Recibir emails promocionales"
        description="Ofertas, novedades y recordatorios por email"
        checked={preferences.marketing_email}
        onChange={(v) => updatePreference('marketing_email', v)}
      />

      <ConsentToggle
        type="MARKETING_SMS"
        label="Recibir mensajes SMS"
        description="Recordatorios y ofertas por SMS"
        checked={preferences.marketing_sms}
        onChange={(v) => updatePreference('marketing_sms', v)}
      />

      <ConsentToggle
        type="PHOTO_SHARING"
        label="Compartir fotos de mascotas"
        description="Permitir uso de fotos en redes sociales"
        checked={preferences.photo_sharing}
        onChange={(v) => updatePreference('photo_sharing', v)}
      />
    </div>
  );
}
```

### Consent Audit Trail
```typescript
// lib/consent/audit.ts
export async function logConsentChange(change: {
  userId: string;
  consentType: string;
  oldValue: boolean;
  newValue: boolean;
  source: string;
  ipAddress: string;
}) {
  await supabase.from('consent_audit_log').insert({
    user_id: change.userId,
    consent_type: change.consentType,
    old_value: change.oldValue,
    new_value: change.newValue,
    source: change.source,
    ip_address: change.ipAddress,
    changed_at: new Date().toISOString(),
  });
}
```

## Implementation Steps
1. Define granular consent types
2. Create consent preferences table
3. Build preference center UI
4. Implement consent audit logging
5. Add consent to signup flow
6. Create consent analytics dashboard
7. Export consent reports

## Acceptance Criteria
- [ ] 7+ consent types defined
- [ ] Preference center accessible
- [ ] Consent changes audited
- [ ] Consent required at signup
- [ ] Easy withdrawal mechanism
- [ ] Reports exportable

## Related Files
- `lib/consent/` - Consent utilities
- `components/consent/` - Consent components
- `app/[clinic]/portal/settings/` - Settings page

## Estimated Effort
- 6 hours
  - Consent types & schema: 1h
  - Preference center: 2h
  - Audit logging: 1h
  - Integration: 2h
