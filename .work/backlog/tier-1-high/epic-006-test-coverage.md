---
id: EPIC-006
title: "Test Coverage Expansion"
tier: 1
priority: P1
status: backlog
estimated_effort: XL
dependencies: [EPIC-003]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-006: Test Coverage Expansion

## Context
16 services at 0% coverage, API routes at 10%. Critical business logic has no tests, making refactoring dangerous and bugs likely.

## Acceptance Criteria
- [ ] All listed services at 80%+ coverage
- [ ] Top 20 API endpoints have tests
- [ ] Coverage report generated in CI

## Stories

### STORY-006.1: Write tests for inventory service (0% → 80%)
- **Status**: todo
- **Effort**: M
- **Description**: Write unit tests covering all inventory service methods
- **Files to touch**: src/services/inventory.ts, src/services/__tests__/inventory.test.ts
- **Tests needed**: Coverage report shows ≥80%
- **Done when**: Inventory service at 80%+ coverage

### STORY-006.2: Write tests for prescription service (0% → 80%)
- **Status**: todo
- **Effort**: M
- **Description**: Write unit tests covering all prescription service methods
- **Files to touch**: src/services/prescription.ts, src/services/__tests__/prescription.test.ts
- **Tests needed**: Coverage report shows ≥80%
- **Done when**: Prescription service at 80%+ coverage

### STORY-006.3: Write tests for medical-record service (0% → 80%)
- **Status**: todo
- **Effort**: M
- **Description**: Write unit tests covering all medical record service methods
- **Files to touch**: src/services/medical-record.ts, src/services/__tests__/medical-record.test.ts
- **Tests needed**: Coverage report shows ≥80%
- **Done when**: Medical record service at 80%+ coverage

### STORY-006.4: Write tests for lab service (0% → 80%)
- **Status**: todo
- **Effort**: M
- **Description**: Write unit tests covering all lab service methods
- **Files to touch**: src/services/lab.ts, src/services/__tests__/lab.test.ts
- **Tests needed**: Coverage report shows ≥80%
- **Done when**: Lab service at 80%+ coverage

### STORY-006.5: Write tests for hospitalization service (0% → 80%)
- **Status**: todo
- **Effort**: M
- **Description**: Write unit tests covering all hospitalization service methods
- **Files to touch**: src/services/hospitalization.ts, src/services/__tests__/hospitalization.test.ts
- **Tests needed**: Coverage report shows ≥80%
- **Done when**: Hospitalization service at 80%+ coverage

### STORY-006.6: Write tests for vaccine service (0% → 80%)
- **Status**: todo
- **Effort**: M
- **Description**: Write unit tests covering all vaccine service methods
- **Files to touch**: src/services/vaccine.ts, src/services/__tests__/vaccine.test.ts
- **Tests needed**: Coverage report shows ≥80%
- **Done when**: Vaccine service at 80%+ coverage

### STORY-006.7: Write tests for store service (0% → 80%)
- **Status**: todo
- **Effort**: M
- **Description**: Write unit tests covering all store/e-commerce service methods
- **Files to touch**: src/services/store.ts, src/services/__tests__/store.test.ts
- **Tests needed**: Coverage report shows ≥80%
- **Done when**: Store service at 80%+ coverage

### STORY-006.8: Write tests for messaging service (0% → 80%)
- **Status**: todo
- **Effort**: M
- **Description**: Write unit tests covering all messaging service methods
- **Files to touch**: src/services/messaging.ts, src/services/__tests__/messaging.test.ts
- **Tests needed**: Coverage report shows ≥80%
- **Done when**: Messaging service at 80%+ coverage

### STORY-006.9: Write tests for payment service (0% → 80%)
- **Status**: todo
- **Effort**: M
- **Description**: Write unit tests covering all payment service methods
- **Files to touch**: src/services/payment.ts, src/services/__tests__/payment.test.ts
- **Tests needed**: Coverage report shows ≥80%
- **Done when**: Payment service at 80%+ coverage

### STORY-006.10: Write API route tests for top 20 critical endpoints
- **Status**: todo
- **Effort**: L
- **Description**: Write integration tests for the most critical API endpoints (auth, patients, appointments, billing)
- **Files to touch**: src/app/api/**/*.test.ts
- **Tests needed**: 20 API route test files exist and pass
- **Done when**: Top 20 API endpoints have passing tests

## Technical Notes
Use the Supabase mock from EPIC-003. Focus on testing business logic, not framework boilerplate. Each test file should cover: happy path, error cases, edge cases, and validation.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
