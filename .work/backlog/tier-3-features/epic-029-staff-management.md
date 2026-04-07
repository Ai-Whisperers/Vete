---
id: EPIC-029
title: "Staff Management Enhancement"
tier: 3
priority: P3
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-029: Staff Management Enhancement

## Context
Basic team exists but no full HR features. Growing clinics need time tracking, vacation management, performance reviews, and certification tracking.

## Acceptance Criteria
- [ ] Staff roles and permissions matrix
- [ ] Time tracking and timesheet
- [ ] Vacation/sick day management
- [ ] Staff performance reviews
- [ ] Continuing education tracking
- [ ] License/certification expiry alerts

## Stories

### STORY-029.1: Add staff roles and permissions matrix
- **Status**: todo
- **Effort**: M
- **Description**: Create granular role-based access control with permission matrix
- **Files to touch**: src/services/auth/rbac.ts, src/types/permissions.ts
- **Tests needed**: Permissions enforced per role
- **Done when**: RBAC working with permission matrix

### STORY-029.2: Add time tracking and timesheet
- **Status**: todo
- **Effort**: M
- **Description**: Implement clock-in/clock-out with timesheet generation
- **Files to touch**: src/components/staff/timesheet.tsx, src/services/staff/
- **Tests needed**: Staff can clock in/out, timesheets generated
- **Done when**: Time tracking functional

### STORY-029.3: Add vacation/sick day management
- **Status**: todo
- **Effort**: M
- **Description**: Create leave request and approval workflow
- **Files to touch**: src/components/staff/leave.tsx, src/services/staff/
- **Tests needed**: Leave requests submitted and approved/denied
- **Done when**: Leave management working

### STORY-029.4: Add staff performance reviews
- **Status**: todo
- **Effort**: M
- **Description**: Create performance review templates and scheduling
- **Files to touch**: src/components/staff/review.tsx
- **Tests needed**: Performance reviews conducted and stored
- **Done when**: Performance review system working

### STORY-029.5: Add continuing education tracking
- **Status**: todo
- **Effort**: S
- **Description**: Track CE credits and courses for veterinary staff
- **Files to touch**: src/components/staff/education.tsx
- **Tests needed**: CE credits tracked per staff member
- **Done when**: CE tracking functional

### STORY-029.6: Add license/certification expiry alerts
- **Status**: todo
- **Effort**: S
- **Description**: Alert when staff licenses or certifications are expiring
- **Files to touch**: src/services/staff/certifications.ts
- **Tests needed**: Alert fires 30 days before expiry
- **Done when**: Certification expiry alerts working

## Technical Notes
Paraguay labor law requires specific record-keeping. Consult local regulations for timesheet requirements. Use role hierarchy: Super Admin > Admin > Vet > Technician > Receptionist > Viewer.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
