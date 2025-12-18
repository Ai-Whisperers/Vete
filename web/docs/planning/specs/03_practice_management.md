# Feature Spec: Phase 4 - Practice Management & Expansion

**Goal:** Operate the business side of the clinic efficiently.

## 1. Smart Inventory Management

**Priority:** High
**Implementation:**

- **Database:** `inventory_items` (sku, name, quantity, min_level, supplier_id, expiry_date).
- **Features:**
  - **Low Stock Alerts:** Email/Dashboard banner when `quantity < min_level`.
  - **Mobile Scanning:** Use device camera via HTML5 API to scan barcodes and +/- stock.
  - **Batch Tracking:** FIFO logic for expiration dates.

## 2. Financial Dashboard

**Priority:** Medium
**Implementation:**

- **Expense Tracking:** Simple form to log "Rent", "Supplies", "Utilities".
- **Revenue:** Auto-aggregated from `cart` transactions.
- **P&L Report:** Monthly view of Revenue - Expenses.
- **Commission:**
  - Tag each service line item in Cart with a `provider_id`.
  - Report: "Dr. Smith generated $5000 in services vs $1000 in product sales".

## 3. Specialized Service Modules

**Priority:** Low (Expansion)
**Implementation:**

- **Grooming:**
  - Calendar view separated by "Tub" or "Table".
  - Duration based on Breed size (e.g., German Shepherd = 90m, Pug = 45m).
- **Boarding:**
  - "Hotel View": Grid of runs/cages.
  - Check-in logic: Verify vaccines are up to date before allowing check-in.

## 4. Role-Based Access Control (RBAC) Audit

**Priority:** High (Security)
**Implementation:**

- **Database:** `audit_logs` (user_id, action, resource_id, timestamp, ip_address).
- **Middleware:** Wrap all Sensitive Data access (Get Patient, Get Revenue) with logging.
- **UI:** Admin view of "Who accessed Fluffy's record yesterday?".
