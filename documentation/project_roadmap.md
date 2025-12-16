# Project Implementation Roadmap

## Overview

This roadmap outlines the phased execution of the Veterinary Platform, moving from a single-clinic MVP to a robust multi-tenant SaaS.

## Phase 1: The "Digital Card" MVP (Pilot)

**Goal**: Build a functional Digital Card + Basic Landing Page for the pilot clinic (`Adris`).
**Timeline**: Weeks 1-2

### 1.1 Engineering Setup

- [ ] Initialize Next.js 14 Project (App Router) with TailwindCSS.
- [ ] Setup Supabase Project (Dev & Prod environments).
- [ ] Configure Database Tables (`pets`, `vaccinations`, `owners` - simplified).

### 1.2 Core "Digital Card" Features

- [ ] **Owner View**: Login (Phone/OTP), View Pet List, View Vaccine Timeline.
- [ ] **Admin View**: Simple dashboard for Adris to "Add Vaccine" to a pet.
- [ ] **Card UI**: Mobile-first design for the vaccination record (Verified vs Unverified visual states).

### 1.3 The "One Page" Site

- [ ] Implement the Landing Page (Adris Branding).
- [ ] Add "Floating WhatsApp" button.
- [ ] Add "Interactive Tools" (Toxic Food Checker) to drive engagement.

## Phase 2: Multi-Tenant Architecture

**Goal**: Abstract the "One Page" site to support multiple clinics (Adris, Juan, Zoo).
**Timeline**: Weeks 3-4

### 2.1 Tenant Logic

- [ ] Create `tenants` table in Supabase.
- [ ] Implement Middleware to route `subdomain.platform.com` -> Tenant Config.
- [ ] Refactor Landing Page components to use dynamic colors/text from DB.

### 2.2 Universal Data Layer

- [ ] Refactor `pets` table to be strictly linked to Owners, not Clinics.
- [ ] Implement "Owner Upload" feature (S3/Storage bucket for proofs).
- [ ] Implement "Scan QR" logic for Vets to view _any_ pet's record.

## Phase 3: Launch & Growth

**Goal**: Public rollout to Paraguay vets.

### 3.1 Marketing & Sales

- [ ] Deploy "Sales Landing Page" (using the copy from `clinic_value_proposition.md`).
- [ ] Alpha Test with 3 friendly clinics.

### 3.2 Polish

- [ ] **Seed Data**: Pre-populate "Paraguay Vaccine Schedule" (Rabies @ 3mo, etc.) for auto-reminders.
- [ ] **Performance**: Optimize images and caching.

## Seed Data Requirements (Paraguay Context)

Based on research, we will seed the DB with:

- **Dog Core Vaccines**:
  - _Moquillo/Parvo/Hepatitis_: 6w, 9w, 12w.
  - _Rabies_: 3 months (Required by Law).
  - _Leishmania_: Optional but highly recommended locally.
- **Cat Core Vaccines**:
  - _Triple Felina_: 8w, 12w.
  - _Rabies_: 3 months.
