# VETE Platform - Comprehensive Bug & Issue Tickets

> **Generated:** December 18, 2024
> **Last Updated:** February 16, 2026 (Audit Pass)
> **Total Tickets:** 127 | **Closed:** 52 | **Open:** 75
> **Critical:** 18 (15 closed) | **High:** 42 (25 closed) | **Medium:** 47 (12 closed) | **Low:** 20

---

## Closed Tickets Summary

The following tickets have been verified as **FIXED** in the codebase:

### Security (10 Closed)
- [x] **SEC-001**: QR Code endpoint authentication
- [x] **SEC-002**: Diagnosis codes API authentication (Refactored with withApiAuth)
- [x] **SEC-003**: Appointment Slots Multi-Tenancy Leak (Validated against profile.tenant_id)
- [x] **SEC-004**: Services API Unauthenticated Read Access (Design choice: public with rate limiting)
- [x] **SEC-005**: Expenses API tenant validation (Uses server-controlled clinic_id)
- [x] **SEC-006**: Remove invite authorization (Restricted to admins via withActionAuth)
- [x] **SEC-007**: Medical records pet ownership (Validated against profile.tenant_id)
- [x] **SEC-008**: Vaccine pet ownership check (Validated against owner_id/tenant_id)
- [x] **SEC-009**: Inventory import file validation (Strict size and type checks added)
- [x] **SEC-010**: Missing Rate Limiting (Comprehensive rateLimit utility implemented)

### Business Logic (8 Closed)
- [x] **BIZ-001**: Double-Booking Prevention (Uses atomic RPC with exclusion constraints)
- [x] **BIZ-002**: Appointment End Time Lost (Calculated from service duration)
- [x] **BIZ-003**: Stock Never Decremented (Handled atomically via process_checkout RPC)
- [x] **BIZ-004**: Cart Stock Validation (Server-side validation in checkout API)
- [x] **BIZ-005**: Invoice refund race condition (Uses atomic RPC)
- [x] **BIZ-006**: Invoice Floating Point Arithmetic (Uses roundCurrency/Math.round)
- [x] **BIZ-008**: Vaccine status based on role (Staff-created are 'verified')
- [x] **BIZ-009**: Vaccine date validation (next_due_date > administered_date check)
- [x] **BIZ-010**: Appointment status transitions (Validated state machine in RPC)

### Database (6 Closed)
- [x] **DB-001**: Missing RLS Policies (Migration 065 achieved 100% coverage)
- [x] **DB-002**: Missing Foreign Key Cascades (Added ON DELETE CASCADE to clinical tables)
- [x] **DB-003**: Missing Indexes (Migration 040 added comprehensive FK indexes)
- [x] **DB-004**: N+1 Query in Clients API (Uses materialized view mv_client_summary)
- [x] **DB-005**: Missing Updated_at Triggers (Migration 087 added handles to all tables)
- [x] **DB-006**: Hardcoded Tenant IDs (Implementation of setup_new_tenant function)

### Type Safety (5 Closed)
- [x] **TYPE-001**: Core Library Uses any (Centralized types/clinic-config implemented)
- [x] **TYPE-002**: Server actions missing types (Migrated to withActionAuth + ActionResult)
- [x] **TYPE-003**: Component props using any (Proper interfaces for UI components)
- [x] **TYPE-004**: Catch blocks using any (Standardized catch (error: unknown) pattern)
- [x] **TYPE-005**: Map/Filter/Reduce Callbacks Missing Types (Unified entity interfaces applied)

### Form Validation (4 Closed)
- [x] **FORM-001**: Booking Wizard Missing Try-Catch (Handled in useBookingStore)
- [x] **FORM-002**: Lab order using alert() (Now uses role="alert" UI feedback)
- [x] **FORM-003**: Missing signup validation (Zod schemas for all auth actions)
- [x] **FORM-004**: Double-Submit Protection (Buttons disabled during isSubmitting)

### Performance (1 Closed)
- [x] **PERF-003**: Missing useMemo in booking wizard (Optimized transformations)

### Error Handling (1 Closed)
- [x] **ERR-003**: Consent form XSS risk (DOMPurify added)

### Accessibility (4 Closed)
- [x] **A11Y-001**: Cart Icon Missing aria-label (Added localized labels)
- [x] **A11Y-004**: Error messages role="alert" (Standardized in form components)
- [x] **A11Y-005**: Hardcoded Spanish Text (Migrated to i18n with config overrides)

---

## Table of Contents

1. [Critical Security Issues](#1-critical-security-issues)
2. [Critical Business Logic Bugs](#2-critical-business-logic-bugs)
3. [Critical Database Issues](#3-critical-database-issues)
4. [High Priority - Type Safety](#4-high-priority---type-safety)
5. [High Priority - Form Validation](#5-high-priority---form-validation)
6. [High Priority - Performance](#6-high-priority---performance)
7. [Medium Priority - Accessibility](#7-medium-priority---accessibility)
8. [Medium Priority - Error Handling](#8-medium-priority---error-handling)
9. [Medium Priority - Database](#9-medium-priority---database)
10. [Low Priority - Code Quality](#10-low-priority---code-quality)
11. [Feature Gaps (TODOs)](#11-feature-gaps-todos)

---

## 1. Critical Security Issues

### ~~TICKET-SEC-001: QR Code Endpoint Missing Authentication~~ [CLOSED]
**Status:** ✅ FIXED (2025-01-10)
**Priority:** CRITICAL
**Type:** Security Vulnerability
**Solution:** Added `supabase.auth.getUser()` check and tenant validation.

---

### ~~TICKET-SEC-002: Diagnosis Codes API Completely Unauthenticated~~ [CLOSED]
**Status:** ✅ FIXED (2025-02-15)
**Priority:** CRITICAL
**Type:** Security Vulnerability
**Solution:** Wrapped with `withApiAuth` requiring `vet` or `admin` roles.

---

### ~~TICKET-SEC-003: Appointment Slots Multi-Tenancy Leak~~ [CLOSED]
**Status:** ✅ FIXED (2025-03-20)
**Priority:** CRITICAL
**Type:** Security Vulnerability
**Solution:** Added server-side validation that `clinicSlug` matches the authenticated user's `tenant_id`.

---

### ~~TICKET-SEC-004: Services API Unauthenticated Read Access~~ [CLOSED]
**Status:** ✅ FIXED (2025-04-05)
**Priority:** CRITICAL
**Type:** Security Vulnerability
**Solution:** Endpoint remains public by design but added rate limiting and removed sensitive internal pricing fields.

---

### ~~TICKET-SEC-005: Expenses API Tenant Validation Issue~~ [CLOSED]
**Status:** ✅ FIXED (2025-05-12)
**Priority:** CRITICAL
**Type:** Security Vulnerability
**Solution:** Now uses server-controlled `tenant_id` from profile and strict Zod validation for body spreading.

---

### ~~TICKET-SEC-006: Remove Invite Action Missing Authorization~~ [CLOSED]
**Status:** ✅ FIXED (2025-06-18)
**Priority:** HIGH
**Type:** Security Vulnerability
**Solution:** Wrapped with `withActionAuth` requiring `admin` role and validating tenant ownership.

---

### ~~TICKET-SEC-007: Medical Records Missing Pet Ownership Validation~~ [CLOSED]
**Status:** ✅ FIXED (2025-07-22)
**Priority:** HIGH
**Type:** Security Vulnerability
**Solution:** Added server-side check that target `petId` belongs to the authenticated user's `tenant_id`.

---

### ~~TICKET-SEC-008: Vaccine Creation Missing Pet Ownership Check~~ [CLOSED]
**Status:** ✅ FIXED (2025-08-14)
**Priority:** HIGH
**Type:** Security Vulnerability
**Solution:** Integrated ownership check ensuring only pet owners or clinic staff can add vaccines.

---

### ~~TICKET-SEC-009: Inventory Import File Upload Vulnerability~~ [CLOSED]
**Status:** ✅ FIXED (2025-09-05)
**Priority:** HIGH
**Type:** Security Vulnerability
**Solution:** Added 5MB file size limit, MIME type whitelist, and row count limits (1000 rows).

---

### ~~TICKET-SEC-010: Missing Rate Limiting on All Endpoints~~ [CLOSED]
**Status:** ✅ FIXED (2025-10-30)
**Priority:** HIGH
**Type:** Security Vulnerability
**Solution:** Implemented Redis-backed sliding window rate limiting for all API routes and server actions.

---

## 2. Critical Business Logic Bugs

### ~~TICKET-BIZ-001: Double-Booking Prevention Insufficient~~ [CLOSED]
**Status:** ✅ FIXED (2025-11-12)
**Priority:** CRITICAL
**Type:** Business Logic Bug
**Solution:** Replaced exact start_time check with a range overlap check using atomic RPC and Postgres exclusion constraints.

---

### ~~TICKET-BIZ-002: Appointment End Time Lost on Reschedule~~ [CLOSED]
**Status:** ✅ FIXED (2025-11-12)
**Priority:** CRITICAL
**Type:** Business Logic Bug
**Solution:** End time is now dynamically calculated based on the selected service duration during update operations.

---

### ~~TICKET-BIZ-003: Stock Never Decremented on Purchase~~ [CLOSED]
**Status:** ✅ FIXED (2025-12-05)
**Priority:** CRITICAL
**Type:** Business Logic Bug
**Solution:** Created `POST /api/store/checkout` using `process_checkout` RPC which atomically decrements stock and creates invoices.

---

### ~~TICKET-BIZ-004: Cart Stock Validation Only Client-Side~~ [CLOSED]
**Status:** ✅ FIXED (2025-12-05)
**Priority:** CRITICAL
**Type:** Business Logic Bug
**Solution:** Added server-side stock validation within the checkout transaction to prevent race conditions.

---

### ~~TICKET-BIZ-005: Invoice Payment/Refund Race Condition~~ [CLOSED]
**Status:** ✅ FIXED (2026-01-08)
**Priority:** CRITICAL
**Type:** Business Logic Bug
**Solution:** Implemented atomic RPC functions `record_invoice_payment` and `process_invoice_refund` with row locking.

---

### ~~TICKET-BIZ-006: Invoice Floating Point Arithmetic~~ [CLOSED]
**Status:** ✅ FIXED (2026-01-15)
**Priority:** HIGH
**Type:** Business Logic Bug
**Solution:** Standardized on `roundCurrency` utility using `Math.round(val * 100) / 100` for all financial calculations.

---

### TICKET-BIZ-007: Loyalty Points Can Go Negative
**Priority:** HIGH
**Type:** Business Logic Bug
**Status:** ⚠️ PARTIALLY FIXED (DB Constraint added, API needs explicit error handling)
**Affected Files:**
- `web/app/api/clients/[id]/loyalty/route.ts`

**Description:**
No validation in API that points don't go negative. While DB has a constraint, the API doesn't catch it gracefully to provide user feedback.

---

### ~~TICKET-BIZ-008: Vaccine Status Always 'Pending'~~ [CLOSED]
**Status:** ✅ FIXED (2026-01-20)
**Priority:** HIGH
**Type:** Business Logic Bug
**Solution:** Logic added to set status to 'verified' automatically when created by clinic staff.

---

### ~~TICKET-BIZ-009: Missing Vaccine Date Validation~~ [CLOSED]
**Status:** ✅ FIXED (2026-01-20)
**Priority:** HIGH
**Type:** Business Logic Bug
**Solution:** Added Zod validation ensuring `next_due_date` is always after `administered_date`.

---

### ~~TICKET-BIZ-010: Appointment Status Transitions Not Validated~~ [CLOSED]
**Status:** ✅ FIXED (2026-01-25)
**Priority:** HIGH
**Type:** Business Logic Bug
**Solution:** Implemented state machine validation in `update_appointment_status_atomic` RPC.

---

## 3. Critical Database Issues

### ~~TICKET-DB-001: Missing RLS Policies on Multiple Tables~~ [CLOSED]
**Status:** ✅ FIXED (2026-01-17)
**Priority:** CRITICAL
**Type:** Database Security
**Solution:** Migration 065 enabled RLS on all 130+ tables with standardized tenant isolation policies.

---

### ~~TICKET-DB-002: Missing Foreign Key Cascades~~ [CLOSED]
**Status:** ✅ FIXED (2026-01-10)
**Priority:** CRITICAL
**Type:** Database Integrity
**Solution:** Audited and updated foreign keys to use `ON DELETE CASCADE` for child records and `SET NULL` for references.

---

### ~~TICKET-DB-003: Missing Indexes on Frequently Queried Columns~~ [CLOSED]
**Status:** ✅ FIXED (2026-01-06)
**Priority:** HIGH
**Type:** Database Performance
**Solution:** Migration 040 added CONCURRENT indexes to all foreign key columns and frequently filtered fields.

---

### ~~TICKET-DB-004: N+1 Query in Clients API~~ [CLOSED]
**Status:** ✅ FIXED (2026-02-05)
**Priority:** HIGH
**Type:** Database Performance
**Solution:** Optimized Clients API to use `mv_client_summary` materialized view, reducing query count from O(N) to O(1).

---

### ~~TICKET-DB-005: Missing Updated_at Triggers~~ [CLOSED]
**Status:** ✅ FIXED (2026-01-22)
**Priority:** MEDIUM
**Type:** Database Integrity
**Solution:** Migration 087 added `handle_updated_at` triggers to all tables across public and archive schemas.

---

### ~~TICKET-DB-006: Hardcoded Tenant IDs in Seed Scripts~~ [CLOSED]
**Status:** ✅ FIXED (2026-01-15)
**Priority:** MEDIUM
**Type:** Database Design
**Solution:** Implemented `setup_new_tenant` function to handle onboarding; seeds now use variables or factory patterns.

---

## 4. High Priority - Type Safety

### ~~TICKET-TYPE-001: Core Library Uses any Types Extensively~~ [CLOSED]
**Status:** ✅ FIXED (2025-12-15)
**Priority:** HIGH
**Type:** Code Quality
**Solution:** Replaced `any` with strict Zod-validated interfaces in `web/lib/clinics.ts`.

---

### ~~TICKET-TYPE-002: Server Actions Missing Type Annotations~~ [CLOSED]
**Status:** ✅ FIXED (2026-01-05)
**Priority:** HIGH
**Type:** Code Quality
**Solution:** All server actions now return `Promise<ActionResult<T>>` and use standardized `ActionState`.

---

### ~~TICKET-TYPE-003: Component Props Using any~~ [CLOSED]
**Status:** ✅ FIXED (2026-01-10)
**Priority:** HIGH
**Type:** Code Quality
**Solution:** Audited and applied explicit interfaces to 30+ core UI components.

---

### ~~TICKET-TYPE-004: Catch Blocks Using any for Errors~~ [CLOSED]
**Status:** ✅ FIXED (2026-01-12)
**Priority:** MEDIUM
**Type:** Code Quality
**Solution:** Replaced `catch (error: any)` with `catch (error: unknown)` and safe error logging wrappers.

---

### ~~TICKET-TYPE-005: Map/Filter/Reduce Callbacks Missing Types~~ [CLOSED]
**Status:** ✅ FIXED (2026-02-10)
**Priority:** MEDIUM
**Type:** Code Quality
**Solution:** Applied explicit entity types to array transformation callbacks in portal and dashboard pages.

---

[... Remaining sections preserved ...]
