# Feature Spec: Phase 3 - Client Engagement

**Goal:** Create a "sticky" platform that clients love to use.

## 1. Online Booking System

**Priority:** High
**Implementation:**

- **Database:** `slots` (time, vet_id, status), `appointments` (link to slot).
- **Logic:**
  - Vets define "Available Hours" blocks.
  - System generates 15/30min slots.
  - Clients select Service -> Vet (Optional) -> Date/Time.
- **Integration:** Google Calendar Sync (Two-way).
- **Features:**
  - Waitlist: If slot taken, add to waitlist. Auto-email if cancellation occurs.

## 2. Omnichannel Communication (SMS/WhatsApp)

**Priority:** High
**Implementation:**

- **Provider:** Twilio (SMS) / Meta Business API (WhatsApp).
- **Triggers:**
  - Appointment Confirmation (Immediate).
  - Reminder (24h before).
  - Booster Due (30 days before).
- **UI:** Chat interface in Clinic Dashboard mirroring the WhatsApp conversation.

## 3. Loyalty Points Program

**Priority:** Medium
**Implementation:**

- **Logic:**
  - Earn: X points per $1 spent (configurable).
  - Burn: Redeem Y points for specific services (e.g., Free Bath = 500pts).
- **Database:** `loyalty_ledger` (pet_id, transaction_type, points_delta).
- **UI:** Owner Dashboard shows "Points Balance" and "Rewards Catalog".

## 4. Subscription Wellness Plans

**Priority:** Medium (Revenue Driver)
**Implementation:**

- **Concept:** "Puppy Plan" ($30/mo) covers all vaccines + 2 exams.
- **Integration:** Stripe / MercadoPago Subscriptions.
- **Logic:**
  - Grant "Credits" for services upon subscription active status.
  - Deduct credits when service used.
- **UI:** "My Plan" usage tracker for owners.
