# AUDIT-104c: Consent Templates Page Decomposition

## Priority: P2 - Medium
## Category: Refactoring / Technical Debt
## Status: Not Started
## Epic: [EPIC-08: Code Quality & Refactoring](../epics/EPIC-08-code-quality.md)
## Parent Ticket: [AUDIT-104](./AUDIT-104-large-component-decomposition.md)

## Description

Decompose the consent templates page (1171 lines) into smaller, focused components. This page handles consent template management with significant code duplication between create and edit modals.

## Current State

**File**: `web/app/[clinic]/dashboard/consents/templates/page.tsx`
**Lines**: 1171
**Console.logs**: 4 (guarded by NODE_ENV check)
**Issues**:
- Large inline modal components (EditTemplateModal, CreateTemplateModal)
- Duplicate form code between create and edit modals
- Categories and fieldTypes arrays duplicated
- Template field management mixed with modal rendering
- No separation between list view and modal logic

## Current Responsibilities

1. Template listing with category badges
2. Create template modal with form
3. Edit template modal with form
4. Preview template modal (HTML render)
5. Template field management (add/delete/update)
6. Category label mapping
7. CRUD operations (fetch, create, update)
8. Feedback/notification display

## Proposed Component Structure

```
components/dashboard/consents/templates/
├── TemplatesClient.tsx              # Main orchestrator (~150 lines)
├── TemplateList.tsx                 # Template cards grid (~100 lines)
├── TemplateCard.tsx                 # Individual template card (~80 lines)
├── TemplateFormModal.tsx            # Shared create/edit modal (~200 lines)
├── TemplatePreviewModal.tsx         # HTML preview modal (~80 lines)
├── TemplateFieldEditor.tsx          # Field management UI (~150 lines)
├── TemplateFieldRow.tsx             # Single field row (~60 lines)
├── constants.ts                     # Categories, fieldTypes (~30 lines)
├── hooks/
│   └── useConsentTemplates.ts       # Data fetching + mutations (~150 lines)
└── types.ts                         # ConsentTemplate, TemplateField (~40 lines)
```

## Implementation Steps

### Phase 1: Setup and Extract Constants
1. [ ] Create `components/dashboard/consents/templates/` directory
2. [ ] Create `types.ts` with ConsentTemplate and TemplateField interfaces
3. [ ] Create `constants.ts` with categories and fieldTypes arrays
4. [ ] Create `useConsentTemplates` hook for data fetching + mutations

### Phase 2: Extract Shared Components
5. [ ] Extract `TemplateFieldRow` component (single field)
6. [ ] Extract `TemplateFieldEditor` component (field list management)
7. [ ] Extract `TemplateFormModal` with mode prop ('create' | 'edit')
8. [ ] Extract `TemplatePreviewModal` component

### Phase 3: Extract List Components
9. [ ] Extract `TemplateCard` component
10. [ ] Extract `TemplateList` component

### Phase 4: Integration
11. [ ] Create `TemplatesClient` orchestrator
12. [ ] Update page.tsx to use client component
13. [ ] Review console.log statements (currently NODE_ENV guarded)
14. [ ] Create barrel export

### Phase 5: Testing
15. [ ] Test template creation flow
16. [ ] Test template editing flow
17. [ ] Test field add/delete/update
18. [ ] Test preview modal HTML rendering
19. [ ] Test category filtering (if applicable)

## Key Refactoring: Unified Form Modal

The biggest win is unifying the duplicate create/edit modals:

```typescript
// Before: Two separate components with 90% duplicate code
const EditTemplateModal = ({ template }) => { ... }
const CreateTemplateModal = ({ onClose, onSuccess }) => { ... }

// After: Single component with mode prop
interface TemplateFormModalProps {
  mode: 'create' | 'edit'
  template?: ConsentTemplate        // Required for edit mode
  onClose: () => void
  onSuccess: () => void
}

const TemplateFormModal = ({ mode, template, onClose, onSuccess }) => {
  const initialValues = mode === 'edit' ? template : defaultTemplate
  // ... shared form logic
}
```

## Acceptance Criteria

- [ ] Main page file under 100 lines (server component wrapper)
- [ ] Client orchestrator under 150 lines
- [ ] Each component under 200 lines
- [ ] No duplicate category/fieldType arrays
- [ ] Single TemplateFormModal for create and edit
- [ ] All CRUD operations work correctly
- [ ] Field management preserved (add, delete, reorder)
- [ ] HTML preview renders correctly
- [ ] Proper TypeScript types (no `any`)

## Related Files

- `web/app/[clinic]/dashboard/consents/templates/page.tsx` (source)
- `web/app/api/consents/templates/route.ts` (list, create)
- `web/app/api/consents/templates/[id]/route.ts` (get, update, delete)
- `web/lib/utils.ts` (createSanitizedHtml)

## Estimated Effort

- 6-8 hours

## Dependencies

- API endpoints must remain stable
- Sanitized HTML rendering must be preserved for security

## Risk Assessment

- **Medium risk** - Form state management is complex
- The duplicate code pattern makes this safer to refactor
- Field management has some edge cases to preserve
- Test HTML preview thoroughly (XSS prevention)
