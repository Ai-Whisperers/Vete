# Master Product Roadmap: Adris Veterinary Platform

This document outlines the strategic roadmap for the Adris Veterinary Platform, transforming it from a basic clinic management tool into a comprehensive, AI-enhanced ecosystem for modern veterinary medicine.

## Strategic Phases

The implementation is divided into four strategic phases to ensure stability, deliver immediate value, and manage complexity.

### ✅ Phase 1: Foundation (Current Status: Complete/Polishing)

**Goal:** Core record keeping, basic portal, and essential clinical data.

- [x] Pet & Owner Profiles
- [x] Basic Medical Records (Vaccines, Weights)
- [x] Client Portal & Dashboard
- [x] Basic Store & Cart
- [x] Staff Management (Basic) (Team Invites)
- [ ] _Pending: Euthanasia Assessments UI (Carried over)_

---

### 🏥 Phase 2: Clinical Intelligence (The "Smart" Clinic)

**Goal:** Empower veterinarians with advanced tools that save time, improve accuracy, and standardize care.
**Focus:** Medical rigor, automation, and standard compliance.

**Key Features:**

1.  **Standardized Coding (VeNom/SNOMED)**: Implement strict medical coding for diagnoses.
2.  **Smart Calculators**:
    - **Drug Dosages**: Auto-calculate logic based on weight/species.
    - **Growth Charts**: Visual plotting against breed standards.
3.  **Prescription System**: Digital PDF generation with e-signatures.
4.  **Advanced Medical Modules**:
    - **Reproductive Tracking**: Heat cycles, due dates (Enhanced).
    - **Euthanasia & QoL**: HHHHMM scale tools.
    - **Vaccine Safety**: Auto-alerts for past reactions.

---

### 🤝 Phase 3: Connected Practice (Client Engagement)

**Goal:** Increase client retention, streamline communication, and modernize the booking experience.
**Focus:** Frictionless interaction and loyalty.

**Key Features:**

1.  **Booking Engine**: Real-time slots, waitlist management.
2.  **Automated Communication**:
    - SMS/WhatsApp Reminders (Twilio/Meta API).
    - Birthday Emails & Post-Visit Surveys.
3.  **Loyalty & Commercial**:
    - Loyalty Points Program (Full Redemption Logic).
    - Subscription Wellness Plans (Recurring Stripe/MercadoPago).
    - Dynamic Pricing (Emergency/After-hours logic).

---

### 💼 Phase 4: Business Operations (Practice Management)

**Goal:** Optimize clinic operations, inventory, and financial health.
**Focus:** Profitability and efficiency.

**Key Features:**

1.  **Inventory Command Center**:
    - Low-stock alerts & Supplier auto-ordering.
    - Barcode Scanning (Mobile).
    - Expiration tracking.
2.  **Financials**:
    - Expense Tracking & P&L Lite.
    - Staff Commission Tracking.
3.  **Security & Audit**:
    - RBAC Audit Logs (Who viewed what).

---

### 🚀 Phase 5: Ecosystem Expansion (New Verticals)

**Goal:** Expand beyond medical care into holistic pet services.
**Focus:** Revenue diversification.

**Key Features:**

1.  **Grooming Salon**: Scheduler, Style Gallery, Bathing Queue.
2.  **Boarding/Kennel**: Check-in/out, Run management.
3.  **Community Tools**:
    - Lost & Found Map (Geospatial).
    - Adoption Board.
    - Blood Donor Registry.

---

## Technical Foundation (Ongoing)

These initiatives run parallel to all phases to ensure quality and developer velocity.

- **CI/CD**: GitHub Actions for automated testing/deploy.
- **Testing**: Playwright E2E suites for critical flows.
- **Documentation**: OpenAPI/Swagger auto-generation.
- **Developer Tools**: Seed data generators (faker.js), Admin "God-Mode".
