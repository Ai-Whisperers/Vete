# TEST-001: Cron Job Test Coverage

## Priority: P0 (Critical)
## Category: Testing
## Status: Not Started

## Description
13 cron job endpoints have minimal test coverage (only 1 test exists). These background jobs handle critical business logic including payment processing, stock management, and reminders.

## Current State
- **Cron routes**: 13 endpoints
- **Tests**: 1 (`cron-reminders.test.ts`)
- **Coverage**: ~8%

## Untested Cron Endpoints

### Financial (Critical)
1. `/api/cron/billing/auto-charge` - Automatic payment processing
2. `/api/cron/billing/evaluate-grace` - Grace period evaluation
3. `/api/cron/billing/generate-platform-invoices` - Monthly platform billing
4. `/api/cron/billing/send-reminders` - Payment reminders
5. `/api/cron/generate-commission-invoices` - Commission calculations

### Inventory & Orders
6. `/api/cron/release-reservations` - Cart stock reservation release
7. `/api/cron/process-subscriptions` - Subscription order processing
8. `/api/cron/expiry-alerts` - Product expiry notifications
9. `/api/cron/stock-alerts` - Low stock alerts (customer)
10. `/api/cron/stock-alerts/staff` - Staff stock notifications

### Appointments
11. `/api/cron/generate-recurring` - Recurring appointment generation

### Reminders
12. `/api/cron/reminders` - Process scheduled reminders
13. `/api/cron/reminders/generate` - Generate reminder queue

## Risk Assessment
| Endpoint | Risk if Untested |
|----------|------------------|
| auto-charge | Financial loss, double charges |
| release-reservations | Overselling, stock errors |
| process-subscriptions | Order failures, customer complaints |
| generate-recurring | Missing appointments |
| billing/* | Revenue leakage |

## Implementation Steps

### 1. Test Setup (2 hours)
- Create `tests/integration/cron/` directory structure
- Set up CRON_SECRET mock for authentication
- Create database fixtures for cron scenarios

### 2. Financial Cron Tests (4 hours)
```typescript
// tests/integration/cron/billing.test.ts
describe('Billing Cron Jobs', () => {
  test('auto-charge processes due subscriptions')
  test('auto-charge skips subscriptions in grace period')
  test('evaluate-grace updates subscription status')
  test('generate-platform-invoices creates monthly invoice')
  test('send-reminders sends overdue notifications')
})
```

### 3. Inventory Cron Tests (3 hours)
```typescript
// tests/integration/cron/inventory.test.ts
describe('Inventory Cron Jobs', () => {
  test('release-reservations frees expired cart items')
  test('release-reservations respects active carts')
  test('expiry-alerts sends notifications for expiring products')
  test('stock-alerts notifies low stock products')
})
```

### 4. Subscription Processing Tests (3 hours)
```typescript
// tests/integration/cron/subscriptions.test.ts
describe('Subscription Processing', () => {
  test('process-subscriptions creates renewal orders')
  test('process-subscriptions handles insufficient stock')
  test('process-subscriptions skips paused subscriptions')
})
```

### 5. Appointment Cron Tests (2 hours)
```typescript
// tests/integration/cron/appointments.test.ts
describe('Appointment Cron Jobs', () => {
  test('generate-recurring creates appointments for patterns')
  test('generate-recurring respects recurrence limits')
})
```

## Acceptance Criteria
- [ ] All 13 cron endpoints have integration tests
- [ ] Test coverage for happy path scenarios
- [ ] Test coverage for error scenarios
- [ ] Test coverage for edge cases (empty data, duplicates)
- [ ] CRON_SECRET validation tested
- [ ] Idempotency verified where applicable
- [ ] Database state properly verified after execution

## Related Files
- `web/app/api/cron/*/route.ts` (13 files)
- `web/tests/integration/cron/*.test.ts` (new)

## Estimated Effort
- Total: 14 hours
- Setup: 2 hours
- Financial tests: 4 hours
- Inventory tests: 3 hours
- Subscription tests: 3 hours
- Appointment tests: 2 hours

---
*Ticket created: January 2026*
*Based on test coverage analysis*
