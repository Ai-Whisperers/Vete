---
id: EPIC-048
title: "White-Label & Customization"
tier: 5
priority: P5
status: backlog
estimated_effort: XL
dependencies: [EPIC-008]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-048: White-Label & Customization

## Context
Need complete white-label support so each clinic can have its own branding, domain, email templates, and landing page.

## Acceptance Criteria
- [ ] Theme engine with CSS variables from DB
- [ ] Custom domain per clinic
- [ ] Custom email templates per clinic
- [ ] Custom SMS templates per clinic
- [ ] Custom branding on PDF exports
- [ ] Custom landing page builder

## Stories

### STORY-048.1: Complete theme engine (CSS variables from DB)
- **Status**: todo
- **Effort**: L
- **Description**: Load CSS custom properties from clinic settings in database
- **Files to touch**: src/lib/theme.ts, src/app/layout.tsx
- **Tests needed**: Theme colors loaded from DB per clinic
- **Done when**: Theme engine working from DB

### STORY-048.2: Add custom domain per clinic
- **Status**: todo
- **Effort**: M
- **Description**: Support custom domains beyond subdomains, with SSL
- **Files to touch**: src/middleware.ts, nginx/traefik config
- **Tests needed**: Custom domain serves clinic app with SSL
- **Done when**: Custom domains working

### STORY-048.3: Add custom email templates per clinic
- **Status**: todo
- **Effort**: M
- **Description**: Allow clinics to customize email templates with their branding
- **Files to touch**: src/services/email/templates.ts, src/app/(admin)/email-templates/
- **Tests needed**: Emails sent with clinic branding
- **Done when**: Custom email templates working

### STORY-048.4: Add custom SMS templates per clinic
- **Status**: todo
- **Effort**: S
- **Description**: Allow clinics to customize SMS message templates
- **Files to touch**: src/services/notification/sms-templates.ts
- **Tests needed**: SMS sent with clinic-customized text
- **Done when**: Custom SMS templates working

### STORY-048.5: Add custom branding on all PDF exports
- **Status**: todo
- **Effort**: M
- **Description**: Apply clinic logo, colors, and contact info to all PDF exports
- **Files to touch**: src/services/pdf/, src/templates/
- **Tests needed**: PDFs show clinic branding
- **Done when**: PDF branding customizable

### STORY-048.6: Add custom landing page builder
- **Status**: todo
- **Effort**: L
- **Description**: Create no-code landing page builder for clinic public pages
- **Files to touch**: src/app/(admin)/page-builder/, src/components/page-builder/
- **Tests needed**: Clinics can build custom landing pages
- **Done when**: Landing page builder functional

## Technical Notes
For custom domains, use Caddy or Traefik for automatic SSL. Store theme settings in the clinics table. Landing page builder can use a block-based editor like Editor.js or TipTap.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
