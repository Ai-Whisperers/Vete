---
id: EPIC-013
title: "Documentation Overhaul"
tier: 2
priority: P2
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-013: Documentation Overhaul

## Context
No user docs, no API docs, 12 stale test reports cluttering the root directory. New developers and users have no guidance.

## Acceptance Criteria
- [ ] Test report files organized in docs/
- [ ] README.md comprehensive and current
- [ ] OpenAPI documentation generated
- [ ] Developer onboarding guide exists
- [ ] Deployment guide exists
- [ ] ADRs established
- [ ] End-user documentation exists

## Stories

### STORY-013.1: Move TERRAPET_*.md files to docs/testing/
- **Status**: todo
- **Effort**: S
- **Description**: Clean up root directory by moving all test report files
- **Files to touch**: TERRAPET_*.md → docs/testing/
- **Tests needed**: Root directory clean, files in docs/testing/
- **Done when**: Test reports organized

### STORY-013.2: Write README.md with proper project overview
- **Status**: todo
- **Effort**: M
- **Description**: Write comprehensive README with setup, architecture, and contribution guide
- **Files to touch**: README.md
- **Tests needed**: README covers all essential info
- **Done when**: README complete and current

### STORY-013.3: Generate OpenAPI documentation from routes
- **Status**: todo
- **Effort**: M
- **Description**: Auto-generate OpenAPI/Swagger spec from API routes
- **Files to touch**: scripts/generate-openapi.ts, docs/api/openapi.yml
- **Tests needed**: OpenAPI spec covers all endpoints
- **Done when**: API documentation generated

### STORY-013.4: Write developer onboarding guide
- **Status**: todo
- **Effort**: M
- **Description**: Create step-by-step guide for new developers to get started
- **Files to touch**: docs/development/onboarding.md
- **Tests needed**: New dev can set up in 30 minutes following guide
- **Done when**: Onboarding guide complete

### STORY-013.5: Write deployment guide (VPS, Vercel, GCP)
- **Status**: todo
- **Effort**: M
- **Description**: Document deployment procedures for all supported platforms
- **Files to touch**: docs/deployment/
- **Tests needed**: Deployment guide covers VPS, Vercel, GCP
- **Done when**: Deployment docs for all platforms

### STORY-013.6: Create architecture decision records (ADRs)
- **Status**: todo
- **Effort**: M
- **Description**: Set up ADR template and document key architectural decisions
- **Files to touch**: docs/adr/
- **Tests needed**: At least 5 ADRs documented
- **Done when**: ADR system established

### STORY-013.7: Write end-user manual for clinic staff
- **Status**: todo
- **Effort**: L
- **Description**: Create user-facing documentation for veterinary clinic staff
- **Files to touch**: docs/user-guide/clinic-staff.md
- **Tests needed**: Manual covers all primary workflows
- **Done when**: Clinic staff manual complete

### STORY-013.8: Write pet owner portal guide
- **Status**: todo
- **Effort**: M
- **Description**: Create user guide for pet owners using the client portal
- **Files to touch**: docs/user-guide/pet-owners.md
- **Tests needed**: Guide covers all portal features
- **Done when**: Pet owner guide complete

## Technical Notes
Use markdown for all docs. Consider using Docusaurus or similar for a docs site. ADRs should follow the format: Title, Status, Context, Decision, Consequences.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
