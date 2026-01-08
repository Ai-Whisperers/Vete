# FEAT-019: Consent Template Versioning

## Priority: P2 - Medium
## Category: Feature
## Status: Not Started
## Epic: [EPIC-13: Accessibility & Compliance](../epics/EPIC-13-accessibility-compliance.md)
## Affected Areas: Consents, Templates, Compliance

## Description

Implement version history for consent templates with comparison, rollback, and audit trail capabilities.

## Source

Derived from `documentation/feature-gaps/INCOMPLETE_FEATURES_ANALYSIS.md` (TICKET-013)

## Context

> **Database**: `consent_template_versions` table exists
> **UI**: Templates can be created/edited
> **Missing**: Version history, rollback, comparison

## Current State

- Consent templates can be created and edited
- `consent_template_versions` table exists in schema
- No UI for viewing version history
- No rollback functionality
- Edits overwrite previous content with no audit trail

## Proposed Solution

### 1. Version Creation on Edit

```typescript
// actions/consent-templates.ts
export const updateConsentTemplate = withActionAuth(
  async ({ user, supabase }, templateId: string, content: string) => {
    // Get current version
    const { data: current } = await supabase
      .from('consent_templates')
      .select('version, content')
      .eq('id', templateId)
      .single();

    const newVersion = (current.version || 0) + 1;

    // Archive current version
    await supabase.from('consent_template_versions').insert({
      template_id: templateId,
      version: current.version,
      content: current.content,
      created_by: user.id,
      created_at: new Date().toISOString(),
    });

    // Update template
    await supabase
      .from('consent_templates')
      .update({
        content,
        version: newVersion,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', templateId);

    return actionSuccess({ version: newVersion });
  },
  { requireStaff: true }
);
```

### 2. Version History Sidebar

```typescript
// components/consents/version-history.tsx
export function VersionHistory({ templateId }: { templateId: string }) {
  const { data: versions } = useQuery({
    queryKey: ['template-versions', templateId],
    queryFn: () => getTemplateVersions(templateId),
  });

  return (
    <div className="border-l p-4 w-64">
      <h3 className="font-semibold mb-4">Historial de Versiones</h3>
      <div className="space-y-2">
        {versions?.map(v => (
          <button
            key={v.version}
            onClick={() => setSelectedVersion(v)}
            className="w-full text-left p-2 hover:bg-muted rounded"
          >
            <div className="font-medium">Versión {v.version}</div>
            <div className="text-xs text-muted-foreground">
              {formatDate(v.created_at)} por {v.created_by_name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 3. Version Comparison

```typescript
// components/consents/version-compare.tsx
import { diffLines } from 'diff';

export function VersionCompare({
  oldVersion,
  newVersion,
}: VersionCompareProps) {
  const diff = diffLines(oldVersion.content, newVersion.content);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4>Versión {oldVersion.version}</h4>
        <pre className="whitespace-pre-wrap">{oldVersion.content}</pre>
      </div>
      <div>
        <h4>Versión {newVersion.version}</h4>
        <div>
          {diff.map((part, i) => (
            <span
              key={i}
              className={
                part.added ? 'bg-green-100' :
                part.removed ? 'bg-red-100' :
                ''
              }
            >
              {part.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 4. Rollback Functionality

```typescript
// actions/consent-templates.ts
export const rollbackTemplate = withActionAuth(
  async ({ user, supabase }, templateId: string, targetVersion: number) => {
    // Get target version content
    const { data: targetVersionData } = await supabase
      .from('consent_template_versions')
      .select('content')
      .eq('template_id', templateId)
      .eq('version', targetVersion)
      .single();

    if (!targetVersionData) {
      return actionError('Versión no encontrada');
    }

    // Update template (which will create new version)
    await updateConsentTemplate(templateId, targetVersionData.content);

    // Log rollback in audit
    await supabase.from('audit_logs').insert({
      action: 'consent_template_rollback',
      resource: 'consent_templates',
      resource_id: templateId,
      user_id: user.id,
      details: { from_current: true, to_version: targetVersion },
    });

    return actionSuccess();
  },
  { requireAdmin: true }
);
```

## Implementation Steps

1. [ ] Update template edit to create version on save
2. [ ] Create version history sidebar component
3. [ ] Implement version comparison view
4. [ ] Add rollback functionality (admin only)
5. [ ] Create API endpoints for version management
6. [ ] Add audit trail for all version changes
7. [ ] Test versioning workflow

## Acceptance Criteria

- [ ] Each edit creates new version automatically
- [ ] View history of all versions with timestamps
- [ ] Compare two versions side-by-side
- [ ] Rollback to any previous version (admin)
- [ ] See who made each change
- [ ] Signed consents reference specific version

## Related Files

- `web/app/[clinic]/dashboard/consents/templates/page.tsx` - Template management
- `web/db/consent_template_versions` - Database table
- `web/db/consent_templates` - Template table

## Estimated Effort

- Version creation: 2 hours
- History sidebar: 2 hours
- Comparison view: 3 hours
- Rollback: 2 hours
- Testing: 2 hours
- **Total: 11 hours (1.5 days)**

---
*Created: January 2026*
*Derived from INCOMPLETE_FEATURES_ANALYSIS.md*
