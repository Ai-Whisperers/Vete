# Vete Platform - Development Tickets

This folder contains organized development tickets for improvements, features, bug fixes, and technical debt identified during comprehensive code analysis.

## Epic Organization

All tickets are organized under strategic epics for better planning and tracking. See the [Epics Index](./epics/README.md) for the complete list.

### Active Epics

| Epic | Name | Tickets | Status |
|------|------|---------|--------|
| [EPIC-01](./epics/EPIC-01-data-integrity.md) | Data Integrity & Race Conditions | 6 | ✅ Complete |
| [EPIC-02](./epics/EPIC-02-security-hardening.md) | Security Hardening | 12 | ✅ Complete |
| [EPIC-03](./epics/EPIC-03-api-completeness.md) | API Completeness | 6 | ✅ Complete |
| [EPIC-04](./epics/EPIC-04-notification-infrastructure.md) | Notification Infrastructure | 5 | 80% Complete |
| [EPIC-05](./epics/EPIC-05-test-coverage.md) | Test Coverage | 4 | 50% Complete |
| [EPIC-06](./epics/EPIC-06-performance-optimization.md) | Performance Optimization | 6 | ✅ Complete |
| [EPIC-07](./epics/EPIC-07-wip-completion.md) | WIP Completion | 3 | 33% Complete |
| [EPIC-08](./epics/EPIC-08-code-quality.md) | Code Quality & Refactoring | 12 | 30% Complete |
| [EPIC-09](./epics/EPIC-09-feature-expansion.md) | Feature Expansion | 9 | 10% Complete |
| [EPIC-10](./epics/EPIC-10-audit-compliance.md) | Audit & Compliance | 3 | ✅ Complete |
| [EPIC-11](./epics/EPIC-11-operations-observability.md) | Operations & Observability | 5 | Not Started |
| [EPIC-12](./epics/EPIC-12-data-management.md) | Data Management & DR | 5 | Not Started |
| [EPIC-13](./epics/EPIC-13-accessibility-compliance.md) | Accessibility & Compliance | 7 | Not Started |
| [EPIC-14](./epics/EPIC-14-load-testing-scalability.md) | Load Testing & Scalability | 5 | Not Started |
| [EPIC-15](./epics/EPIC-15-integration-expansion.md) | Integration Expansion | 5 | Not Started |
| [EPIC-16](./epics/EPIC-16-user-experience.md) | User Experience | 5 | Not Started |

---

## Ticket Categories

| Category | Description | Count |
|----------|-------------|-------|
| [WIP](./wip/) | Work-in-progress / uncommitted changes | 3 |
| [Notifications](./notifications/) | Notification system TODOs | 3 |
| [Testing](./testing/) | Test coverage gaps | 3 |
| [API Gaps](./api-gaps/) | API CRUD and feature gaps | 3 |
| [Features](./features/) | New feature requests and enhancements | 21 |
| [Refactoring](./refactoring/) | Code improvements, modularization | 8 |
| [Bugs](./bugs/) | Known issues and inconsistencies | 5 |
| [Performance](./performance/) | Performance optimizations | 6 |
| [Security](./security/) | Security improvements | 12 |
| [Technical Debt](./technical-debt/) | Code cleanup and modernization | 11 |
| [Race Conditions](./race-conditions/) | Atomicity and concurrency issues | 4 |
| [Validation](./validation/) | Input validation gaps | 3 |
| [Audit](./audit/) | Logging and compliance gaps | 3 |
| [Operations](./operations/) | Observability and monitoring | 5 |
| [Data Management](./data-management/) | Backup, export, and DR | 5 |
| [Accessibility & Compliance](./accessibility-compliance/) | WCAG, GDPR, consent | 7 |
| [Scalability](./scalability/) | Load testing and scaling | 5 |
| [Integrations](./integrations/) | External service integrations | 5 |
| [User Experience](./user-experience/) | UX improvements | 5 |

**Total Tickets: 130** (includes 13 detailed audit sub-tickets)

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
| ~~[TEST-001](./testing/TEST-001-cron-job-tests.md)~~ | ~~Cron Job Test Coverage~~ | ~~Testing~~ | ~~14h~~ ✓ |
| ~~[RACE-001](./race-conditions/RACE-001-subscription-stock-overselling.md)~~ | ~~Stock Decrement Not Atomic in Subscriptions~~ | ~~Race Condition~~ | ~~5h~~ ✓ |
| ~~[AUDIT-100](./technical-debt/AUDIT-100-mock-availability-route.md)~~ | ~~Mock API Route in Production~~ | ~~Tech Debt~~ | ~~1-2h~~ ✓ |

### P1 - High Priority (Do Soon)

| ID | Title | Category | Effort |
|----|-------|----------|--------|
| ~~[WIP-001](./wip/WIP-001-multi-service-booking.md)~~ | ~~Multi-Service Booking System~~ | ~~WIP~~ | ~~6-9h~~ ✓ |
| ~~[NOTIF-001](./notifications/NOTIF-001-notification-system-integration.md)~~ | ~~Notification System Integration~~ | ~~Notifications~~ | ~~13h~~ ✓ |
| ~~[NOTIF-002](./notifications/NOTIF-002-email-sending-integration.md)~~ | ~~Email Sending Integration~~ | ~~Notifications~~ | ~~7h~~ ✓ |
| ~~[TEST-003](./testing/TEST-003-server-action-tests.md)~~ | ~~Server Action Test Coverage~~ | ~~Testing~~ | ~~17h~~ ✓ |
| ~~[API-001](./api-gaps/API-001-medical-records-crud.md)~~ | ~~Medical Records API CRUD~~ | ~~API Gaps~~ | ~~8h~~ ✓ |
| ~~[API-002](./api-gaps/API-002-vaccines-crud.md)~~ | ~~Vaccines API CRUD Enhancement~~ | ~~API Gaps~~ | ~~7h~~ ✓ |
| ~~[API-003](./api-gaps/API-003-rate-limiting.md)~~ | ~~Implement API Rate Limiting~~ | ~~API Gaps~~ | ~~10h~~ ✓ |
| ~~[REF-001](./refactoring/REF-001-centralize-auth-patterns.md)~~ | ~~Centralize Auth Patterns~~ | ~~Refactoring~~ | ~~10-14h~~ ✓ |
| ~~[SEC-001](./security/SEC-001-tenant-validation.md)~~ | ~~Add Tenant Validation to Portal~~ | ~~Security~~ | ~~2-3h~~ ✓ |
| ~~[BUG-001](./bugs/BUG-001-double-signup-routes.md)~~ | ~~Double Signup Routes~~ | ~~Bug~~ | ~~1.5h~~ ✓ |
| ~~[REF-002](./refactoring/REF-002-form-validation-centralization.md)~~ | ~~Centralize Form Validation~~ | ~~Refactoring~~ | ~~18-22h~~ ✓ |
| ~~[SEC-003](./security/SEC-003-lab-order-number-race.md)~~ | ~~Lab Order Number Race Condition~~ | ~~Security~~ | ~~3h~~ ✓ |
| ~~[SEC-004](./security/SEC-004-hospitalization-number-race.md)~~ | ~~Hospitalization Number Race Condition~~ | ~~Security~~ | ~~3h~~ ✓ |
| ~~[RACE-002](./race-conditions/RACE-002-kennel-status-atomicity.md)~~ | ~~Kennel Status Update Not Atomic~~ | ~~Race Condition~~ | ~~5h~~ ✓ |
| ~~[PERF-002](./performance/PERF-002-subscription-n-plus-1.md)~~ | ~~N+1 Query in Subscription Processing~~ | ~~Performance~~ | ~~4h~~ ✓ |
| ~~[FEAT-009](./features/FEAT-009-client-segmentation-bulk-actions.md)~~ | ~~Client Segmentation Bulk Actions~~ | ~~Feature~~ | ~~18h~~ ✓ |
| ~~[FEAT-010](./features/FEAT-010-invoice-pdf-generation.md)~~ | ~~Invoice PDF Generation~~ | ~~Feature~~ | ~~10h~~ ✓ |
| ~~[FEAT-020](./features/FEAT-020-hospitalization-billing.md)~~ | ~~Hospitalization Billing Integration~~ | ~~Feature~~ | ~~13h~~ ✓ |
| ~~[BUG-005](./bugs/BUG-005-duplicate-checkout-path.md)~~ | ~~Duplicate Checkout Path Without Stock Validation~~ | ~~Bug~~ | ~~2-3h~~ ✓ |
| ~~[NOTIF-003](./notifications/NOTIF-003-sms-channel-implementation.md)~~ | ~~SMS Channel~~ (DESCOPED - use WhatsApp) | ~~Notifications~~ | - |
| [AUDIT-101](./technical-debt/AUDIT-101-god-component-inventory.md) | God Component - Inventory Client | Tech Debt | 16-20h |

### P2 - Medium Priority (Next Sprint)

| ID | Title | Category | Effort |
|----|-------|----------|--------|
| ~~[WIP-002](./wip/WIP-002-pet-weight-history.md)~~ | ~~Pet Weight History Tracking~~ | ~~WIP~~ | ~~4-6h~~ ✓ |
| ~~[WIP-003](./wip/WIP-003-e2e-test-suite-expansion.md)~~ | ~~E2E Test Suite Expansion~~ | ~~WIP~~ | ~~8-10h~~ ✓ |
| ~~[TEST-002](./testing/TEST-002-component-test-coverage.md)~~ | ~~Component Test Coverage~~ | ~~Testing~~ | ~~20h~~ ✓ |
| [FEAT-006](./features/FEAT-006-procurement-completion.md) | Procurement Module Completion | Feature | 14h |
| ~~[REF-003](./refactoring/REF-003-api-error-handling.md)~~ | ~~Standardize API Error Handling~~ | ~~Refactoring~~ | ~~13-16h~~ ✓ |
| ~~[SEC-002](./security/SEC-002-api-rate-limiting.md)~~ | ~~Expand API Rate Limiting~~ | ~~Security~~ | ~~6-7h~~ ✓ |
| ~~[BUG-002](./bugs/BUG-002-redirect-param-inconsistency.md)~~ | ~~Redirect Parameter Inconsistency~~ | ~~Bug~~ | ~~3h~~ ✓ |
| [TECH-001](./technical-debt/TECH-001-component-organization.md) | Improve Component Organization | Tech Debt | 16-18h |
| [FEAT-001](./features/FEAT-001-multi-language.md) | Multi-Language Support (i18n) | Feature | 40h |
| [FEAT-004](./features/FEAT-004-analytics-dashboard.md) | Advanced Analytics Dashboard | Feature | 48h |
| ~~[FEAT-005](./features/FEAT-005-automated-reminders.md)~~ | ~~Automated Reminder Campaigns~~ | ~~Feature~~ | ~~32h~~ ✓ |
| ~~[SEC-005](./security/SEC-005-non-atomic-lab-order-creation.md)~~ | ~~Non-Atomic Lab Order Creation~~ | ~~Security~~ | ~~4h~~ ✓ |
| ~~[SEC-006](./security/SEC-006-cron-auth-timing-attack.md)~~ | ~~Cron Auth Timing Attack~~ | ~~Security~~ | ~~7h~~ ✓ |
| ~~[SEC-007](./security/SEC-007-missing-request-body-validation.md)~~ | ~~Request Body Validation~~ | ~~Security~~ | ~~11h~~ ✓ |
| ~~[SEC-008](./completed/security/SEC-008-invoice-send-admin-auth.md)~~ | ~~Invoice Send Admin Auth Gap~~ | ~~Security~~ | ~~3h~~ ✓ |
| ~~[SEC-011](./completed/security/SEC-011-server-action-rate-limiting.md)~~ | ~~Server Action Rate Limiting~~ | ~~Security~~ | ~~3-4h~~ ✓ |
| ~~[SEC-012](./completed/security/SEC-012-missing-html-sanitization.md)~~ | ~~Missing HTML Sanitization~~ | ~~Security~~ | ~~2-3h~~ ✓ |
| ~~[RACE-003](./race-conditions/RACE-003-appointment-status-toctou.md)~~ | ~~Appointment Status TOCTOU~~ | ~~Race Condition~~ | ~~5h~~ ✓ |
| ~~[RACE-004](./race-conditions/RACE-004-cart-reservation-fallback.md)~~ | ~~Cart Reservation Fallback~~ | ~~Race Condition~~ | ~~8h~~ ✓ |
| ~~[PERF-003](./performance/PERF-003-batch-sales-increment.md)~~ | ~~Batch Sales Increment~~ | ~~Performance~~ | ~~3h~~ ✓ |
| ~~[PERF-004](./performance/PERF-004-campaign-cache.md)~~ | ~~Campaign Cache~~ | ~~Performance~~ | ~~5h~~ ✓ |
| ~~[PERF-005](./performance/PERF-005-missing-composite-indexes.md)~~ | ~~Composite Database Indexes~~ | ~~Performance~~ | ~~7h~~ ✓ |
| ~~[VALID-001](./validation/VALID-001-store-orders-address.md)~~ | ~~Store Orders Address Validation~~ | ~~Validation~~ | ~~4h~~ ✓ |
| ~~[VALID-002](./completed/validation/VALID-002-hospitalization-empty-strings.md)~~ | ~~Hospitalization Empty String Check~~ | ~~Validation~~ | ~~3h~~ ✓ |
| ~~[VALID-003](./completed/validation/VALID-003-lab-order-test-ids.md)~~ | ~~Lab Order Test ID Validation~~ | ~~Validation~~ | ~~3.5h~~ ✓ |
| ~~[AUDIT-001](./audit/AUDIT-001-financial-audit-trail.md)~~ | ~~Financial Audit Trail~~ | ~~Audit~~ | ~~10h~~ ✓ |
| ~~[AUDIT-002](./audit/AUDIT-002-cron-failure-alerting.md)~~ | ~~Cron Failure Alerting~~ | ~~Audit~~ | ~~8h~~ ✓ |
| ~~[BUG-003](./bugs/BUG-003-migration-numbering-conflict.md)~~ | ~~Migration Numbering Conflict~~ | ~~Bug~~ | ~~4h~~ ✓ |
| ~~[BUG-004](./bugs/BUG-004-waitlist-notification-missing.md)~~ | ~~Waitlist Notification~~ | ~~Bug~~ | ~~9h~~ ✓ |

#### New P2 Tickets (Operations, Accessibility, UX)

| ID | Title | Category | Effort |
|----|-------|----------|--------|
| [OPS-001](./operations/OPS-001-api-documentation.md) | OpenAPI Documentation | Operations | 8h |
| [OPS-002](./operations/OPS-002-performance-monitoring.md) | Performance Monitoring | Operations | 6h |
| [OPS-003](./operations/OPS-003-slow-query-detection.md) | Slow Query Detection | Operations | 5h |
| ~~[OPS-004](./completed/operations/OPS-004-error-rate-monitoring.md)~~ | ~~Error Rate Monitoring~~ | ~~Operations~~ | ~~4h~~ ✓ |
| [OPS-005](./operations/OPS-005-uptime-sla-monitoring.md) | Uptime SLA Monitoring | Operations | 5h |
| [DATA-001](./data-management/DATA-001-backup-strategy.md) | Backup Automation | Data Management | 8h |
| [DATA-002](./data-management/DATA-002-data-export-tools.md) | Data Export Tools | Data Management | 6h |
| [DATA-003](./data-management/DATA-003-disaster-recovery.md) | Disaster Recovery Runbook | Data Management | 8h |
| [DATA-004](./data-management/DATA-004-migration-tooling.md) | Migration Rollback Support | Data Management | 6h |
| [DATA-005](./data-management/DATA-005-data-retention.md) | Data Retention Policies | Data Management | 5h |
| [A11Y-001](./accessibility-compliance/A11Y-001-wcag-audit.md) | WCAG 2.1 AA Audit | Accessibility | 12h |
| [A11Y-002](./accessibility-compliance/A11Y-002-keyboard-navigation.md) | Keyboard Navigation | Accessibility | 8h |
| [A11Y-003](./accessibility-compliance/A11Y-003-screen-reader.md) | Screen Reader Support | Accessibility | 10h |
| [COMP-001](./accessibility-compliance/COMP-001-gdpr-rights.md) | GDPR Data Subject Rights | Compliance | 10h |
| [COMP-002](./accessibility-compliance/COMP-002-privacy-automation.md) | Privacy Policy Automation | Compliance | 6h |
| [COMP-003](./accessibility-compliance/COMP-003-consent-enhancement.md) | Consent Tracking Enhancement | Compliance | 6h |
| [SCALE-001](./scalability/SCALE-001-load-testing.md) | Load Testing Framework | Scalability | 10h |
| [SCALE-002](./scalability/SCALE-002-database-optimization.md) | Database Query Optimization | Scalability | 12h |
| [SCALE-003](./scalability/SCALE-003-caching-strategy.md) | Caching Strategy | Scalability | 10h |
| [INT-001](./integrations/INT-001-payment-gateways.md) | Payment Gateway Expansion | Integrations | 16h |
| [INT-002](./integrations/INT-002-calendar-sync.md) | Calendar Synchronization | Integrations | 14h |
| [INT-003](./integrations/INT-003-sms-providers.md) | SMS Provider Integration | Integrations | 12h |
| [UX-001](./user-experience/UX-001-mobile-optimization.md) | Mobile Optimization | UX | 12h |
| [UX-002](./user-experience/UX-002-error-handling.md) | User-Friendly Errors | UX | 10h |
| [UX-003](./user-experience/UX-003-loading-states.md) | Loading States & Skeletons | UX | 8h |
| [UX-004](./user-experience/UX-004-search-improvements.md) | Global Search & Filtering | UX | 12h |
| [UX-005](./user-experience/UX-005-onboarding-flow.md) | User Onboarding Experience | UX | 14h |

#### New P2 Tickets (Feature Completion from INCOMPLETE_FEATURES_ANALYSIS.md)

| ID | Title | Category | Effort |
|----|-------|----------|--------|
| ~~[FEAT-011](./completed/features/FEAT-011-whatsapp-analytics-dashboard.md)~~ | ~~WhatsApp Analytics Dashboard~~ | ~~Feature~~ | ~~8h~~ ✓ |
| ~~[FEAT-012](./features/FEAT-012-consent-email-delivery.md)~~ | ~~Consent Document Email Delivery~~ | ~~Feature~~ | ~~5h~~ ✓ |
| ~~[FEAT-013](./features/FEAT-013-store-prescription-verification.md)~~ | ~~Store Prescription Verification~~ | ~~Feature~~ | ~~9h~~ ✓ |
| ~~[FEAT-015](./features/FEAT-015-lost-pet-management-dashboard.md)~~ | ~~Lost Pet Management Dashboard~~ | ~~Feature~~ | ~~13h~~ ✓ |
| [FEAT-016](./features/FEAT-016-disease-outbreak-reporting.md) | Disease Outbreak Reporting | Feature | 18h |
| ~~[FEAT-017](./features/FEAT-017-message-attachments.md)~~ | ~~Message Attachments~~ | ~~Feature~~ | ~~9h~~ ✓ |
| [FEAT-019](./features/FEAT-019-consent-template-versioning.md) | Consent Template Versioning | Feature | 11h |
| [FEAT-021](./features/FEAT-021-lab-results-notification.md) | Lab Results Notification | Feature | 12h |
| [REF-005](./refactoring/REF-005-server-action-auth-migration.md) | Server Action Auth Migration | Refactoring | 10h |
| [REF-006](./refactoring/REF-006-massive-client-component-decomposition.md) | Massive Client Component Decomposition | Refactoring | 28-35h |
| [RES-001](./technical-debt/RES-001-react-query-adoption.md) | Migrate useEffect+fetch to TanStack Query | Research/Tech Debt | 40h |
| [AUDIT-103](./technical-debt/AUDIT-103-console-log-cleanup.md) | Console.log Cleanup | Tech Debt | 4-6h |
| [AUDIT-104](./technical-debt/AUDIT-104-large-component-decomposition.md) | Large Component Decomposition | Tech Debt | 24-32h |
| [AUDIT-105](./technical-debt/AUDIT-105-todo-comment-resolution.md) | TODO Comment Resolution | Tech Debt | 18-28h |

#### Detailed Audit Sub-Tickets (Decomposition)

| ID | Title | Parent | Effort |
|----|-------|--------|--------|
| ~~[AUDIT-101a](./technical-debt/AUDIT-101a-inventory-filters-extraction.md)~~ | ~~Extract InventoryFilters Component~~ | ~~AUDIT-101~~ | ~~3h~~ ✓ |
| ~~[AUDIT-101b](./technical-debt/AUDIT-101b-inventory-table-extraction.md)~~ | ~~Extract InventoryTable Component~~ | ~~AUDIT-101~~ | ~~4-5h~~ ✓ |
| ~~[AUDIT-101c](./technical-debt/AUDIT-101c-inventory-import-wizard-extraction.md)~~ | ~~Extract ImportWizard Component~~ | ~~AUDIT-101~~ | ~~Pre-existing~~ ✓ |
| [AUDIT-101d](./technical-debt/AUDIT-101d-stock-adjustment-modal-extraction.md) | Extract StockAdjustmentModal | AUDIT-101 | 3-4h |
| [AUDIT-103a](./technical-debt/AUDIT-103a-console-cleanup-api.md) | Console Cleanup - API Routes | AUDIT-103 | 1.5-2h |
| [AUDIT-103b](./technical-debt/AUDIT-103b-console-cleanup-pages.md) | Console Cleanup - Pages | AUDIT-103 | 2.5-3h |
| [AUDIT-103c](./technical-debt/AUDIT-103c-console-cleanup-core.md) | Console Cleanup - Core Files | AUDIT-103 | 1-1.5h |
| [AUDIT-104a](./technical-debt/AUDIT-104a-store-analytics-decomposition.md) | Store Analytics Decomposition | AUDIT-104 | 8-10h |
| [AUDIT-104b](./technical-debt/AUDIT-104b-portal-inventory-decomposition.md) | Portal Inventory Decomposition | AUDIT-104 | 6-8h |
| [AUDIT-104c](./technical-debt/AUDIT-104c-consent-templates-decomposition.md) | Consent Templates Decomposition | AUDIT-104 | 6-8h |
| [AUDIT-105a](./technical-debt/AUDIT-105a-notification-todos.md) | Notification System TODOs | AUDIT-105 | 10-14h |
| [AUDIT-105b](./technical-debt/AUDIT-105b-backend-todos.md) | Backend Enhancement TODOs | AUDIT-105 | 9-12h |
| [AUDIT-105c](./technical-debt/AUDIT-105c-ui-todos.md) | UI Enhancement TODOs | AUDIT-105 | 6-10h |

### P3 - Backlog (Future)

| ID | Title | Category | Effort |
|----|-------|----------|--------|
| [PERF-001](./performance/PERF-001-static-generation.md) | Re-enable Static Generation | Performance | 8-10h |
| [FEAT-007](./features/FEAT-007-external-logging.md) | External Logging Service | Feature | 6h |
| [FEAT-008](./features/FEAT-008-granular-permissions.md) | Granular Permission System | Feature | 16h |
| [REF-004](./refactoring/REF-004-component-barrel-exports.md) | Add Barrel Exports | Refactoring | 2.5-6.5h |
| [REF-007](./refactoring/REF-007-centralize-base-url.md) | Centralize BASE_URL Configuration | Refactoring | 2h |
| [REF-008](./refactoring/REF-008-complete-formatting-migration.md) | Complete Formatting Migration | Refactoring | 4-5h |
| [TECH-005](./technical-debt/TECH-005-centralize-file-size-limits.md) | Centralize File Size Limits | Tech Debt | 2h |
| ~~[TECH-002](./technical-debt/TECH-002-unused-routes-cleanup.md)~~ | ~~Clean Up Unused Routes~~ | ~~Tech Debt~~ | ~~3-4h~~ ✓ |
| [FEAT-002](./features/FEAT-002-mobile-app.md) | Mobile Application | Feature | 8 weeks |
| [FEAT-003](./features/FEAT-003-telemedicine.md) | Telemedicine Integration | Feature | 5 weeks |
| ~~[SEC-009](./completed/security/SEC-009-search-pattern-injection.md)~~ | ~~Search Pattern Injection Risk~~ | ~~Security~~ | ~~3h~~ ✓ |
| ~~[SEC-010](./completed/security/SEC-010-subscription-frequency-bounds.md)~~ | ~~Subscription Frequency Bounds~~ | ~~Security~~ | ~~2h~~ ✓ |
| [PERF-006](./performance/PERF-006-cart-merge-efficiency.md) | Inefficient Cart Merge Logic | Performance | 4h |
| ~~[AUDIT-003](./audit/AUDIT-003-error-context-logging.md)~~ | ~~Error Context Logging~~ | ~~Audit~~ | ~~8h~~ ✓ |
| [TECH-003](./technical-debt/TECH-003-remove-console-logs.md) | Remove Console Logs | Tech Debt | 2h |
| [TECH-004](./technical-debt/TECH-004-demo-page-placeholders.md) | Demo Page Placeholders | Tech Debt | 2h |
| [SCALE-004](./scalability/SCALE-004-horizontal-scaling.md) | Horizontal Scaling Prep | Scalability | 8h |
| [SCALE-005](./scalability/SCALE-005-cdn-optimization.md) | CDN & Asset Optimization | Scalability | 8h |
| [INT-004](./integrations/INT-004-accounting-export.md) | Accounting Software Export | Integrations | 10h |
| [INT-005](./integrations/INT-005-lab-equipment.md) | Lab Equipment Integration | Integrations | 20h |
| [FEAT-014](./features/FEAT-014-store-order-variant-names.md) | Store Order Variant Names | Feature | 4h |
| [FEAT-018](./features/FEAT-018-time-off-types-management.md) | Time-Off Types Management | Feature | 10h |
| [RES-002](./accessibility-compliance/RES-002-div-onclick-accessibility.md) | Replace div onClick with Semantic Buttons | A11y | 3.5h |
| [AUDIT-102](./technical-debt/AUDIT-102-seed-route-any-types.md) | `any` Types in Seed Route | Tech Debt | 2-3h |

---

## Summary by Status

### Completed (55 tickets)

All completed tickets are archived in the [completed/](./completed/) folder, organized by category.

**Data Integrity & Race Conditions:**
- ✅ RACE-001 through RACE-004 (all race conditions fixed)

**Security Hardening:**
- ✅ SEC-001 through SEC-012 (security hardening 100% complete)

**Performance Optimizations:**
- ✅ PERF-002 through PERF-005 (query optimizations, caching, indexes)

**API Completeness:**
- ✅ API-001 through API-003 (medical records, vaccines, rate limiting)

**Audit & Monitoring:**
- ✅ AUDIT-001, AUDIT-002, AUDIT-003 (audit trail, cron alerting, error logging)
- ✅ OPS-004 (error rate monitoring)

**Bug Fixes:**
- ✅ BUG-001 through BUG-005 (all critical bugs resolved)

**Notifications:**
- ✅ NOTIF-001, NOTIF-002, NOTIF-003 (notification system complete)

**Testing:**
- ✅ TEST-001 (cron job tests at 100% coverage)
- ✅ TEST-002 (component tests - 11 test files added)
- ✅ TEST-003 (server action tests - 156 tests added)

**Validation:**
- ✅ VALID-001, VALID-002, VALID-003 (all input validations)

**Refactoring:**
- ✅ REF-001, REF-002, REF-003 (auth, validation, error handling centralized)

**Tech Debt:**
- ✅ TECH-002, TECH-003, TECH-004 (unused routes, console logs, placeholders)

**Features:**
- ✅ FEAT-005 (automated reminders)
- ✅ FEAT-009 (client segmentation bulk actions)
- ✅ FEAT-010 (invoice PDF generation)
- ✅ FEAT-011 (WhatsApp analytics dashboard)
- ✅ FEAT-012 (consent email delivery)
- ✅ FEAT-020 (hospitalization billing)

**WIP:**
- ✅ WIP-001 (multi-service booking)
- ✅ WIP-002 (pet weight history)
- ✅ WIP-003 (E2E test suite expansion)

### Remaining (56 tickets)

| Category | Remaining | Effort |
|----------|-----------|--------|
| Features | 15 | ~260h |
| Testing | 0 | 0h |
| Technical Debt | 3 | 58h |
| Refactoring | 4 | 23h |
| Operations | 4 | 24h |
| Data Management | 5 | 33h |
| Accessibility | 7 | 55.5h |
| Scalability | 5 | 48h |
| Integrations | 5 | 72h |
| User Experience | 5 | 56h |
| Performance | 2 | 14h |
| Security | 0 | 0h |
| WIP | 0 | 0h |

---

## Estimated Total Effort

| Priority | Tickets | Hours |
|----------|---------|-------|
| P0 | 0 | 0h (all complete) |
| P1 | 1 | ~14h |
| P2 | 36 | ~500h |
| P3 | 19 | ~107h + 13 weeks |

**Total Remaining: ~621 hours (~15 weeks full-time)**

> **Note:** 55 tickets have been completed and archived in `completed/`

---

## Quick Reference: New Ticket Categories

### Operations & Observability (EPIC-11)
Focus on platform monitoring, API documentation, and operational excellence.
- OPS-001: OpenAPI/Swagger documentation
- OPS-002: Real-time performance monitoring dashboard
- OPS-003: Slow query detection and alerting
- OPS-004: Error rate monitoring by endpoint
- OPS-005: Uptime SLA monitoring and reporting

### Data Management & DR (EPIC-12)
Focus on data protection, backup strategies, and disaster recovery.
- DATA-001: Automated backup strategy
- DATA-002: Self-service data export tools
- DATA-003: Disaster recovery runbook
- DATA-004: Migration rollback support
- DATA-005: Data retention policy enforcement

### Accessibility & Compliance (EPIC-13)
Focus on WCAG compliance, GDPR rights, and consent management.
- A11Y-001: WCAG 2.1 AA compliance audit
- A11Y-002: Keyboard navigation improvements
- A11Y-003: Screen reader compatibility
- COMP-001: GDPR data subject rights implementation
- COMP-002: Privacy policy versioning and automation
- COMP-003: Granular consent preference tracking

### Load Testing & Scalability (EPIC-14)
Focus on performance under load and horizontal scaling preparation.
- SCALE-001: k6 load testing framework
- SCALE-002: Database query optimization
- SCALE-003: Multi-layer caching strategy
- SCALE-004: Horizontal scaling preparation
- SCALE-005: CDN and static asset optimization

### Integration Expansion (EPIC-15)
Focus on third-party integrations for Paraguay market.
- INT-001: Local payment gateways (Bancard, Tigo Money)
- INT-002: Calendar sync (Google, Outlook)
- INT-003: Local SMS providers (Tigo, Personal)
- INT-004: Accounting software export (Contap, Marangatu)
- INT-005: Lab equipment integration (IDEXX, HL7)

### User Experience (EPIC-16)
Focus on mobile optimization, error handling, and onboarding.
- UX-001: Mobile experience optimization
- UX-002: User-friendly error handling
- UX-003: Loading states and skeleton screens
- UX-004: Global search and filtering
- UX-005: User onboarding experience

---

## Sprint Planning Suggestions

### Sprint 1: Security & Stability (Remaining)
- SEC-002: Expand rate limiting
- SEC-008: Invoice send admin auth
- VALID-002, VALID-003: Remaining validations

### Sprint 2: WIP & Testing
- ~~WIP-002: Pet weight history~~ ✓
- ~~WIP-003: E2E test expansion~~ ✓
- ~~TEST-002: Component tests~~ ✓
- ~~TEST-003: Server action tests~~ ✓

### Sprint 3: Operations Foundation
- OPS-001: OpenAPI documentation
- OPS-002: Performance monitoring
- DATA-001: Backup automation
- DATA-003: Disaster recovery runbook

### Sprint 4: UX Improvements
- UX-001: Mobile optimization
- UX-002: Error handling
- UX-003: Loading states
- UX-004: Global search

### Sprint 5: Accessibility & Compliance
- A11Y-001: WCAG audit
- A11Y-002: Keyboard navigation
- COMP-001: GDPR rights
- COMP-003: Consent tracking

### Sprint 6: Integration & Scale
- INT-001: Payment gateways
- INT-003: SMS providers
- SCALE-001: Load testing
- SCALE-003: Caching strategy

---

## Ticket Format

Each ticket follows this format:
```markdown
# [TICKET-ID] Title

## Priority: P0-P3
## Category: wip|notifications|testing|api-gaps|feature|...
## Status: Not Started|In Progress|Partial Implementation
## Epic: [EPIC-XX: Epic Name](link)

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
4. Link to appropriate epic
5. Add to this README under correct priority

---

*Last updated: January 2026*
*Based on comprehensive codebase analysis including:*
- *Git status analysis (uncommitted changes)*
- *TODO/FIXME comment scan (22 comments)*
- *Test coverage analysis (99 test files)*
- *API completeness audit (269 routes)*
- *Security/performance deep audit*
- *Race condition analysis*
- *Input validation review*
- *Epic organization (16 epics, 90 tickets)*
