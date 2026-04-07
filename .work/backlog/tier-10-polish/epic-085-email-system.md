---
id: EPIC-085
title: "Email System"
tier: 10
priority: P10
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-085: Email System

## Context
Need professional email system: transactional emails via Resend, email tracking, preference center, and proper DNS configuration for deliverability.

## Acceptance Criteria
- [ ] Resend API with custom domain
- [ ] Transactional email templates
- [ ] Email tracking (opens, clicks)
- [ ] Email preference center
- [ ] SPF/DKIM/DMARC configured

## Stories

### STORY-085.1: Set up Resend API with custom domain (paragu-ai.com)
- **Status**: todo
- **Effort**: M
- **Description**: Configure Resend for transactional email from paragu-ai.com
- **Files to touch**: src/services/email/resend.ts, DNS configuration
- **Tests needed**: Emails sent from @paragu-ai.com via Resend
- **Done when**: Resend configured with custom domain

### STORY-085.2: Add transactional email templates
- **Status**: todo
- **Effort**: M
- **Description**: Create email templates for appointments, invoices, reminders
- **Files to touch**: src/templates/email/
- **Tests needed**: Transactional emails sent with templates
- **Done when**: Email templates working

### STORY-085.3: Add email tracking (opens, clicks)
- **Status**: todo
- **Effort**: S
- **Description**: Track email open and click rates
- **Files to touch**: src/services/email/tracking.ts
- **Tests needed**: Open and click rates visible
- **Done when**: Email tracking working

### STORY-085.4: Add email preference center
- **Status**: todo
- **Effort**: M
- **Description**: Allow users to manage email preferences and unsubscribe
- **Files to touch**: src/app/(portal)/email-preferences/
- **Tests needed**: Users manage email preferences
- **Done when**: Preference center functional

### STORY-085.5: Add SPF/DKIM/DMARC for paragu-ai.com
- **Status**: todo
- **Effort**: S
- **Description**: Configure email authentication DNS records
- **Files to touch**: DNS configuration
- **Tests needed**: Email authentication passing
- **Done when**: SPF/DKIM/DMARC configured

## Technical Notes
Resend offers 100 emails/day free, then $20/month for 50K. SPF/DKIM/DMARC are essential for deliverability. Use React Email for template design.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
