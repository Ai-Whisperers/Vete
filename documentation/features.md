# Detailed Functional Specifications (v2)

## 1. User Stories

### A. The Pet Owner

- **VS-01 (Emergency)**: "As a panic-stricken owner, I want to find the 'Emergency' button immediately so I can call the vet."
  - _Acceptance_: Red/Prominent button visible on Mobile usage. One tap to dial.
- **VS-02 (Booking)**: "As a busy parent, I want to send a WhatsApp message with my pet's name pre-filled so I don't have to type it out."
  - _Acceptance_: "Agendar" button opens WhatsApp with `Hola Vete Adris, quiero turno para [Rex]`.
- **VS-03 (Digital Card)**: "As a traveler, I want to show my dog's vaccines to a hotel using my phone, because I forgot the paper booklet."
  - _Acceptance_: Mobile-optimized "Card View" showing last Rabies/Sextuple dates and "Verified" status.

### B. The Veterinarian (Tenant)

- **VS-04 (Branding)**: "As a clinic owner, I want the site to look like _my_ brand, not a generic portal."
  - _Acceptance_: Logo, Primary Color, and "About Us" text are dynamically loaded from my profile.

## 2. Feature Details

### F. Digital Vaccination Card

**UI States**:

1.  **Empty State**: "No vaccines recorded yet. [Add First Vaccine]"
2.  **Unverified Record**:
    - Visual: Gray background, "Pending Verification" badge.
    - Action: "View Proof" (Shows the uploaded photo).
3.  **Verified Record**:
    - Visual: White card, Green Border, "Verified by [Clinic Name]" badge.
    - Icon: Green Shield with Checkmark.
4.  **Expired/Due Soon**:
    - Visual: Red/Orange text. "Due: Today".

### G. Interactive Tools (The "Awesome" List)

1.  **Toxic Food Checker**

    - **Input**: Text field (e.g., "Chocolate").
    - **Output (Safe)**: Green Icon. "Safe in moderation."
    - **Output (Toxic)**: Red Skull Icon. "HIGHLY TOXIC. Induce vomiting immediately? Call Emergency."
    - _Data Source_: Static JSON list of 50 common foods.

2.  **Pet Age Calculator**
    - **Input**: Date of Birth.
    - **Logic**: `ln(age_in_years) * 16 + 31` (Scientific formula) or simple `x7` multiplier.
    - **Output**: "Rex is 45 in human years!"

## 3. Notifications & Logic

- **Vaccine Reminder**:
  - System checks `next_due_date`.
  - If `today == next_due_date - 7 days`: Send WhatsApp/Email reminder.
