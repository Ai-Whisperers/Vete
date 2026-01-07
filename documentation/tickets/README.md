# Vete Platform - Development Tickets

This folder contains organized development tickets for improvements, features, bug fixes, and technical debt identified during comprehensive code analysis.

## Ticket Categories

| Category | Description | Count |
|----------|-------------|-------|
| [WIP](./wip/) | Work-in-progress / uncommitted changes | 3 |
| [Notifications](./notifications/) | Notification system TODOs | 3 |
| [Testing](./testing/) | Test coverage gaps | 3 |
| [API Gaps](./api-gaps/) | API CRUD and feature gaps | 3 |
| [Features](./features/) | New feature requests and enhancements | 9 |
| [Refactoring](./refactoring/) | Code improvements, modularization | 4 |
| [Bugs](./bugs/) | Known issues and inconsistencies | 4 |
| [Performance](./performance/) | Performance optimizations | 6 |
| [Security](./security/) | Security improvements | 10 |
| [Technical Debt](./technical-debt/) | Code cleanup and modernization | 4 |
| [Race Conditions](./race-conditions/) | Atomicity and concurrency issues | 4 |
| [Validation](./validation/) | Input validation gaps | 3 |
| [Audit](./audit/) | Logging and compliance gaps | 3 |

**Total Tickets: 59**

---

## Priority Levels

- **P0 - Critical**: Must fix immediately, security/data issues, blocking
- **P1 - High**: Should fix soon, impacts user experience or revenue
- **P2 - Medium**: Plan for next sprint
- **P3 - Low**: Nice to have, backlog

---

## All Tickets by Priority

### P0 - Critical (Do Immediately)

| ID | Title | Category | Effort |
|----|-------|----------|--------|
| [TEST-001](./testing/TEST-001-cron-job-tests.md) | Cron Job Test Coverage | Testing | 14h |
| [RACE-001](./race-conditions/RACE-001-subscription-stock-overselling.md) | Stock Decrement Not Atomic in Subscriptions | Race Condition | 5h |

### P1 - High Priority (Do Soon)

| ID | Title | Category | Effort |
|----|-------|----------|--------|
| [WIP-001](./wip/WIP-001-multi-service-booking.md) | Multi-Service Booking System | WIP | 6-9h |
| [NOTIF-001](./notifications/NOTIF-001-notification-system-integration.md) | Notification System Integration | Notifications | 13h |
| [NOTIF-002](./notifications/NOTIF-002-email-sending-integration.md) | Email Sending Integration | Notifications | 7h |
| [TEST-003](./testing/TEST-003-server-action-tests.md) | Server Action Test Coverage | Testing | 17h |
| [API-001](./api-gaps/API-001-medical-records-crud.md) | Medical Records API CRUD | API Gaps | 8h |
| [API-002](./api-gaps/API-002-vaccines-crud.md) | Vaccines API CRUD Enhancement | API Gaps | 7h |
| [API-003](./api-gaps/API-003-rate-limiting.md) | Implement API Rate Limiting | API Gaps | 10h |
| [REF-001](./refactoring/REF-001-centralize-auth-patterns.md) | Centralize Auth Patterns | Refactoring | 10-14h |
| [SEC-001](./security/SEC-001-tenant-validation.md) | Add Tenant Validation to Portal | Security | 2-3h |
| [BUG-001](./bugs/BUG-001-double-signup-routes.md) | Double Signup Routes | Bug | 1.5h |
| [REF-002](./refactoring/REF-002-form-validation-centralization.md) | Centralize Form Validation | Refactoring | 18-22h |
| [SEC-003](./security/SEC-003-lab-order-number-race.md) | Lab Order Number Race Condition | Security | 3h |
| [SEC-004](./security/SEC-004-hospitalization-number-race.md) | Hospitalization Number Race Condition | Security | 3h |
| [RACE-002](./race-conditions/RACE-002-kennel-status-atomicity.md) | Kennel Status Update Not Atomic | Race Condition | 5h |
| [PERF-002](./performance/PERF-002-subscription-n-plus-1.md) | N+1 Query in Subscription Processing | Performance | 4h |
| [FEAT-009](./features/FEAT-009-client-segmentation-bulk-actions.md) | Client Segmentation Bulk Actions | Feature | 18h |
| [NOTIF-003](./notifications/NOTIF-003-sms-channel-implementation.md) | SMS Channel Implementation (MVP) | Notifications | 7h |

### P2 - Medium Priority (Next Sprint)

| ID | Title | Category | Effort |
|----|-------|----------|--------|
| [WIP-002](./wip/WIP-002-pet-weight-history.md) | Pet Weight History Tracking | WIP | 4-6h |
| [WIP-003](./wip/WIP-003-e2e-test-suite-expansion.md) | E2E Test Suite Expansion | WIP | 8-10h |
| [TEST-002](./testing/TEST-002-component-test-coverage.md) | Component Test Coverage | Testing | 20h |
| [FEAT-006](./features/FEAT-006-procurement-completion.md) | Procurement Module Completion | Feature | 14h |
| [REF-003](./refactoring/REF-003-api-error-handling.md) | Standardize API Error Handling | Refactoring | 13-16h |
| [SEC-002](./security/SEC-002-api-rate-limiting.md) | Expand API Rate Limiting | Security | 6-7h |
| [BUG-002](./bugs/BUG-002-redirect-param-inconsistency.md) | Redirect Parameter Inconsistency | Bug | 3h |
| [TECH-001](./technical-debt/TECH-001-component-organization.md) | Improve Component Organization | Tech Debt | 16-18h |
| [FEAT-001](./features/FEAT-001-multi-language.md) | Multi-Language Support (i18n) | Feature | 40h |
| [FEAT-004](./features/FEAT-004-analytics-dashboard.md) | Advanced Analytics Dashboard | Feature | 48h |
| [FEAT-005](./features/FEAT-005-automated-reminders.md) | Automated Reminder Campaigns | Feature | 32h |
| [SEC-005](./security/SEC-005-non-atomic-lab-order-creation.md) | Non-Atomic Lab Order Creation | Security | 4h |
| [SEC-006](./security/SEC-006-cron-auth-timing-attack.md) | Cron Auth Timing Attack Vulnerability | Security | 7h |
| [SEC-007](./security/SEC-007-missing-request-body-validation.md) | Missing Request Body Schema Validation | Security | 11h |
| [SEC-008](./security/SEC-008-invoice-send-admin-auth.md) | Invoice Send Admin Auth Gap | Security | 3h |
| [RACE-003](./race-conditions/RACE-003-appointment-status-toctou.md) | Appointment Status TOCTOU Bug | Race Condition | 5h |
| [RACE-004](./race-conditions/RACE-004-cart-reservation-fallback.md) | Cart Reservation Release Only Via Cron | Race Condition | 8h |
| [PERF-003](./performance/PERF-003-batch-sales-increment.md) | Sales Increment Not Batched | Performance | 3h |
| [PERF-004](./performance/PERF-004-campaign-cache.md) | Campaign Cache Missing for Searches | Performance | 5h |
| [PERF-005](./performance/PERF-005-missing-composite-indexes.md) | Missing Composite Database Indexes | Performance | 7h |
| [VALID-001](./validation/VALID-001-store-orders-address.md) | Store Orders Address Validation | Validation | 4h |
| [VALID-002](./validation/VALID-002-hospitalization-empty-strings.md) | Hospitalization Empty String Check | Validation | 3h |
| [VALID-003](./validation/VALID-003-lab-order-test-ids.md) | Lab Order Test ID Validation | Validation | 3.5h |
| [AUDIT-001](./audit/AUDIT-001-financial-audit-trail.md) | Financial Operations Missing Audit Trail | Audit | 10h |
| [AUDIT-002](./audit/AUDIT-002-cron-failure-alerting.md) | Cron Job Failure Alerting | Audit | 8h |
| [BUG-003](./bugs/BUG-003-migration-numbering-conflict.md) | Database Migration Numbering Conflict | Bug | 4h |
| [BUG-004](./bugs/BUG-004-waitlist-notification-missing.md) | Waitlist Notification Not Triggered | Bug | 9h |

### P3 - Backlog (Future)

| ID | Title | Category | Effort |
|----|-------|----------|--------|
| [PERF-001](./performance/PERF-001-static-generation.md) | Re-enable Static Generation (Deprioritized) | Performance | 8-10h |
| [FEAT-007](./features/FEAT-007-external-logging.md) | External Logging Service | Feature | 6h |
| [FEAT-008](./features/FEAT-008-granular-permissions.md) | Granular Permission System | Feature | 16h |
| [REF-004](./refactoring/REF-004-component-barrel-exports.md) | Add Barrel Exports | Refactoring | 2.5-6.5h |
| [TECH-002](./technical-debt/TECH-002-unused-routes-cleanup.md) | Clean Up Unused Routes | Tech Debt | 3-4h |
| [FEAT-002](./features/FEAT-002-mobile-app.md) | Mobile Application | Feature | 8 weeks |
| [FEAT-003](./features/FEAT-003-telemedicine.md) | Telemedicine Integration | Feature | 5 weeks |
| [SEC-009](./security/SEC-009-search-pattern-injection.md) | Search Pattern Injection Risk | Security | 3h |
| [SEC-010](./security/SEC-010-subscription-frequency-bounds.md) | Subscription Frequency Bounds Missing | Security | 2h |
| [PERF-006](./performance/PERF-006-cart-merge-efficiency.md) | Inefficient Cart Merge Logic | Performance | 4h |
| [AUDIT-003](./audit/AUDIT-003-error-context-logging.md) | Insufficient Error Context in Logs | Audit | 8h |
| [TECH-003](./technical-debt/TECH-003-remove-console-logs.md) | Remove Development Console Logs | Tech Debt | 2h |
| [TECH-004](./technical-debt/TECH-004-demo-page-placeholders.md) | Demo Page Placeholder Content | Tech Debt | 2h |

---

## Summary by Status

### Work In Progress (Uncommitted)
These tickets track uncommitted changes that need completion:
- Multi-service booking (1,622 lines changed)
- Pet weight history tracking
- E2E test suite expansion (21 new test files)

### TODO Comments (22 found)
Grouped by theme:
- **Notifications**: 8 TODOs for sending notifications
- **Email**: 2 TODOs for email sending
- **SMS**: 1 TODO for Twilio integration
- **Inventory**: 4 TODOs for procurement features
- **Permissions**: 1 TODO for granular permissions
- **Logging**: 2 TODOs for external logging
- **Other**: 4 TODOs (config, database function)

### Security & Race Conditions (14 issues)
Critical data integrity and security issues:
- **Race Conditions**: 4 issues (stock overselling, kennel double-booking, etc.)
- **Input Validation**: 3 issues (addresses, empty strings, test IDs)
- **Auth Gaps**: 3 issues (timing attacks, admin auth, bounds checking)
- **Atomicity**: 4 issues (lab orders, hospitalizations, appointments)

### Test Coverage Gaps
| Area | Current | Target |
|------|---------|--------|
| API Routes | ~8% | 60%+ |
| Server Actions | ~21% | 80%+ |
| Components | ~1.5% | 30%+ |
| Cron Jobs | ~8% | 100% |

### API CRUD Gaps
| Resource | Missing Operations |
|----------|-------------------|
| Medical Records | GET, PUT, PATCH, DELETE |
| Vaccines | POST, PUT, PATCH, DELETE |
| Store Cart | DELETE items |
| Prescriptions | PUT, DELETE |
| Insurance | PATCH, DELETE |

---

## Estimated Total Effort

| Priority | Tickets | Hours |
|----------|---------|-------|
| P0 | 2 | ~19h |
| P1 | 18 | ~187h |
| P2 | 26 | ~265h |
| P3 | 13 | ~58h + 13 weeks |

**Total P0-P2: ~471 hours (~12 weeks full-time)**

---

## Quick Wins (< 4 hours)

1. [SEC-001](./security/SEC-001-tenant-validation.md) - Tenant Validation (2-3h)
2. [BUG-001](./bugs/BUG-001-double-signup-routes.md) - Remove duplicate signup (1.5h)
3. [SEC-010](./security/SEC-010-subscription-frequency-bounds.md) - Subscription bounds (2h)
4. [TECH-003](./technical-debt/TECH-003-remove-console-logs.md) - Remove console logs (2h)
5. [TECH-004](./technical-debt/TECH-004-demo-page-placeholders.md) - Demo placeholders (2h)
6. [BUG-002](./bugs/BUG-002-redirect-param-inconsistency.md) - Fix redirect params (3h)
7. [SEC-003](./security/SEC-003-lab-order-number-race.md) - Lab order race (3h)
8. [SEC-004](./security/SEC-004-hospitalization-number-race.md) - Hospitalization race (3h)
9. [SEC-009](./security/SEC-009-search-pattern-injection.md) - Search pattern (3h)
10. [VALID-002](./validation/VALID-002-hospitalization-empty-strings.md) - Empty strings (3h)

---

## Sprint Planning Suggestions

### Sprint 1: Critical Fixes
Focus: Fix data integrity and security issues
- RACE-001: Stock overselling (P0)
- SEC-003: Lab order race condition
- SEC-004: Hospitalization race condition
- RACE-002: Kennel atomicity
- TEST-001: Cron job tests

### Sprint 2: Foundation & WIP Completion
Focus: Complete uncommitted work
- WIP-001: Multi-service booking
- WIP-002: Pet weight history
- SEC-001: Tenant validation
- PERF-002: N+1 query fix

### Sprint 3: Notifications (All Channels - MVP)
Focus: Complete notification infrastructure (email, SMS, in-app, push)
- NOTIF-001: Notification system
- NOTIF-002: Email sending
- NOTIF-003: SMS channel (Twilio)
- BUG-004: Waitlist notifications
- API-003: Rate limiting

### Sprint 4: Validation & Audit
Focus: Data quality and compliance
- SEC-007: Request body validation
- VALID-001, 002, 003: Validation schemas
- AUDIT-001: Financial audit trail
- AUDIT-002: Cron alerting

### Sprint 5: API Completeness
Focus: Fill CRUD gaps
- API-001: Medical records CRUD
- API-002: Vaccines CRUD
- FEAT-006: Procurement completion
- FEAT-009: Client segmentation actions

### Sprint 6: Test Coverage
Focus: Improve test coverage
- TEST-002: Component tests
- TEST-003: Server action tests
- WIP-003: E2E test expansion

---

## Ticket Format

Each ticket follows this format:
```markdown
# [TICKET-ID] Title

## Priority: P0-P3
## Category: wip|notifications|testing|api-gaps|feature|...
## Status: Not Started|In Progress|Partial Implementation

## Description
[What is the issue/improvement]

## Current State
[How it works now, TODO comments found]

## Proposed Solution
[How it should work]

## Implementation Steps
1. Step 1
2. Step 2
...

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Related Files
- `path/to/file.ts`

## Estimated Effort
- X hours
```

---

## Creating New Tickets

1. Choose appropriate category folder
2. Use next available ID (FEAT-010, SEC-011, etc.)
3. Follow the template format
4. Add to this README under correct priority

---

*Last updated: January 2026*
*Based on comprehensive codebase analysis including:*
- *Git status analysis (uncommitted changes)*
- *TODO/FIXME comment scan (22 comments)*
- *Test coverage analysis (99 test files)*
- *API completeness audit (257 routes)*
- *Security/performance deep audit*
- *Race condition analysis*
- *Input validation review*
