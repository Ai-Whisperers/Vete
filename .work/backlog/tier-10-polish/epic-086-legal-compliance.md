---
id: EPIC-086
title: "Legal & Compliance Pages"
tier: 10
priority: P10
status: backlog
estimated_effort: S
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-086: Legal & Compliance Pages

## Context
Legal compliance pages are required for any SaaS: Terms of Service, Privacy Policy, Cookie consent, and data processing agreements.

## Acceptance Criteria
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Cookie consent banner
- [ ] Data Processing Agreement template
- [ ] GDPR data portability tools

## Stories

### STORY-086.1: Add Terms of Service page
- **Status**: todo
- **Effort**: S
- **Description**: Create Terms of Service page for the platform
- **Files to touch**: src/app/(public)/terms/page.tsx
- **Tests needed**: ToS page accessible and current
- **Done when**: Terms of Service page live

### STORY-086.2: Add Privacy Policy page
- **Status**: todo
- **Effort**: S
- **Description**: Create Privacy Policy page compliant with applicable laws
- **Files to touch**: src/app/(public)/privacy/page.tsx
- **Tests needed**: Privacy Policy accessible and current
- **Done when**: Privacy Policy page live

### STORY-086.3: Add Cookie consent banner
- **Status**: todo
- **Effort**: M
- **Description**: Implement cookie consent banner with preferences
- **Files to touch**: src/components/legal/cookie-consent.tsx
- **Tests needed**: Cookie banner shows and records consent
- **Done when**: Cookie consent banner working

### STORY-086.4: Add Data Processing Agreement template
- **Status**: todo
- **Effort**: S
- **Description**: Create DPA template for enterprise customers
- **Files to touch**: docs/legal/dpa-template.md
- **Tests needed**: DPA available for signing
- **Done when**: DPA template available

### STORY-086.5: Add GDPR data portability tools
- **Status**: todo
- **Effort**: M
- **Description**: Allow users to export their data in machine-readable format
- **Files to touch**: src/app/api/user/export/, src/services/data/export.ts
- **Tests needed**: Users can download all their data
- **Done when**: Data export working

## Technical Notes
While Paraguay doesn't have GDPR, implementing GDPR compliance is good practice and required for EU expansion. Paraguay has Law 6534/2020 on personal data protection. Consult a legal professional.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
