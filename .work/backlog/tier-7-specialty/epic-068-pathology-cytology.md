---
id: EPIC-068
title: "Pathology & Cytology"
tier: 7
priority: P7
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-068: Pathology & Cytology

## Context
No pathology workflow exists. Pathology reports, cytology images, and sample tracking are needed for diagnostic workflows.

## Acceptance Criteria
- [ ] Pathology report templates
- [ ] Cytology image upload and annotation
- [ ] Sample tracking workflow
- [ ] Pathology report PDF generation

## Stories

### STORY-068.1: Add pathology report templates
- **Status**: todo
- **Effort**: M
- **Description**: Create structured pathology report templates
- **Files to touch**: src/components/pathology/report-template.tsx, src/data/pathology/
- **Tests needed**: Pathology reports created from templates
- **Done when**: Report templates functional

### STORY-068.2: Add cytology image upload and annotation
- **Status**: todo
- **Effort**: M
- **Description**: Allow uploading and annotating cytology microscope images
- **Files to touch**: src/components/pathology/cytology.tsx
- **Tests needed**: Cytology images uploaded and annotated
- **Done when**: Cytology image management working

### STORY-068.3: Add sample tracking workflow
- **Status**: todo
- **Effort**: M
- **Description**: Track samples from collection to results (accessioning, processing, reporting)
- **Files to touch**: src/services/pathology/sample-tracking.ts
- **Tests needed**: Sample status tracked through workflow
- **Done when**: Sample tracking functional

### STORY-068.4: Add pathology report PDF generation
- **Status**: todo
- **Effort**: M
- **Description**: Generate professional pathology report PDFs
- **Files to touch**: src/services/pdf/pathology-report.ts
- **Tests needed**: Pathology report PDF generated
- **Done when**: Pathology PDF generation working

## Technical Notes
Sample tracking states: Collected → Accessioned → Processing → Reviewed → Reported. Reports should include: gross description, histological findings, diagnosis, and recommendations.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
