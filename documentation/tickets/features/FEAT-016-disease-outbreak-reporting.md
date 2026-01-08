# FEAT-016: Disease Outbreak Reporting

## Priority: P2 - Medium
## Category: Feature
## Status: Not Started
## Epic: [EPIC-09: New Capabilities](../epics/EPIC-09-new-capabilities.md)
## Affected Areas: Epidemiology, Medical Records, Reports

## Description

Enable veterinarians to report disease cases and implement outbreak detection with trend analysis.

## Source

Derived from `documentation/feature-gaps/INCOMPLETE_FEATURES_ANALYSIS.md` (TICKET-009)

## Context

> **Database**: `disease_reports` table exists
> **API**: `api/epidemiology/heatmap/route.ts` can fetch data
> **UI**: `portal/epidemiology/page.tsx` shows heatmap
> **Missing**: Way to CREATE disease reports

## Current State

- `disease_reports` table exists with location and diagnosis data
- Epidemiology heatmap page displays existing reports
- GET API endpoint exists for fetching data
- No way for vets to create disease reports
- No auto-suggestion for notifiable diseases
- No trend analysis or alerts

## Proposed Solution

### 1. Report Creation from Medical Record

```typescript
// components/medical-records/disease-report-modal.tsx
export function DiseaseReportModal({
  medicalRecord,
  diagnosisCode,
  onSubmit,
}: DiseaseReportModalProps) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reportar Caso de Enfermedad</DialogTitle>
        </DialogHeader>

        <Form onSubmit={handleSubmit}>
          <FormField
            name="location_zone"
            label="Zona/Barrio"
            required
          />
          <FormField
            name="severity"
            label="Severidad"
            options={['leve', 'moderado', 'severo']}
          />
          <FormField
            name="notes"
            label="Observaciones"
            multiline
          />
          <Button type="submit">Reportar</Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Auto-Suggest for Notifiable Diseases

```typescript
// lib/epidemiology/notifiable-diseases.ts
export const NOTIFIABLE_DISEASES = [
  { code: 'A020', name: 'Rabia', mandatory: true },
  { code: 'A021', name: 'Leptospirosis', mandatory: false },
  { code: 'A022', name: 'Parvovirus', mandatory: false },
  // ...
];

export function shouldSuggestReport(diagnosisCode: string): boolean {
  return NOTIFIABLE_DISEASES.some(d => d.code === diagnosisCode);
}
```

### 3. Create Report API

```typescript
// api/epidemiology/reports/route.ts
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  // Auth & staff check...

  const body = await request.json();

  const { data, error } = await supabase
    .from('disease_reports')
    .insert({
      tenant_id: profile.tenant_id,
      diagnosis_code_id: body.diagnosis_code_id,
      species: body.species,
      location_zone: body.location_zone,
      severity: body.severity,
      reported_by: user.id,
      reported_at: new Date().toISOString(),
    })
    .select()
    .single();

  // Check for cluster/outbreak
  await checkForOutbreak(body.diagnosis_code_id, body.location_zone);

  return NextResponse.json(data);
}
```

### 4. Trend Analysis Dashboard

```typescript
// dashboard/epidemiology/trends/page.tsx
// Show:
// - Cases over time chart
// - Geographic distribution
// - Species breakdown
// - Outbreak alerts
```

### 5. Outbreak Detection

```typescript
// lib/epidemiology/outbreak-detection.ts
export async function checkForOutbreak(
  diagnosisCodeId: string,
  zone: string
): Promise<boolean> {
  const recentCases = await getRecentCasesInZone(diagnosisCodeId, zone, 14); // 14 days

  const threshold = getThresholdForDisease(diagnosisCodeId);

  if (recentCases.length >= threshold) {
    await createOutbreakAlert({
      disease: diagnosisCodeId,
      zone,
      cases: recentCases.length,
    });
    return true;
  }

  return false;
}
```

## Implementation Steps

1. [ ] Create disease report modal component
2. [ ] Add POST endpoint for creating reports
3. [ ] Implement auto-suggestion for notifiable diseases
4. [ ] Create trend analysis dashboard
5. [ ] Implement outbreak detection algorithm
6. [ ] Add export functionality for health authorities
7. [ ] Create alert system for detected outbreaks

## Acceptance Criteria

- [ ] Vets can report disease from patient record
- [ ] System suggests reporting for notifiable diseases
- [ ] Admin can see trend analysis charts
- [ ] Export data in standard format (CSV/PDF)
- [ ] Alert when cluster detected (configurable threshold)
- [ ] Reports linked to medical records

## Related Files

- `web/app/api/epidemiology/heatmap/route.ts` - Existing GET endpoint
- `web/app/[clinic]/portal/epidemiology/page.tsx` - Heatmap view
- `web/db/disease_reports` - Database table

## Estimated Effort

- Report creation UI: 3 hours
- API endpoint: 2 hours
- Auto-suggestion: 2 hours
- Trend dashboard: 4 hours
- Outbreak detection: 3 hours
- Export: 2 hours
- Testing: 2 hours
- **Total: 18 hours (2-3 days)**

---
*Created: January 2026*
*Derived from INCOMPLETE_FEATURES_ANALYSIS.md*
