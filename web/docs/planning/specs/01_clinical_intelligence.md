# Feature Spec: Phase 2 - Clinical Intelligence

**Goal:** Transform the platform into a clinical decision support system.

## 1. Standardized Diagnosis Codes (VeNom/SNOMED)

**Priority:** High
**Implementation:**

- **Database:** Create `diagnosis_codes` table (code, term, category, system).
- **Seed Data:** Import a subset of VeNom or SNOMED-CT codes suited for small animals.
- **UI:** `AsyncSelect` component in consultation forms to search diagnoses by keyword.
- **Logic:** Store `code_id` in `medical_records` instead of free text.

## 2. Smart Drug Dosage Calculator

**Priority:** High
**Implementation:**

- **Database:**
  - `drug_dosages` table: `drug_id`, `species` (dog/cat), `min_dose_mg_kg`, `max_dose_mg_kg`, `concentration_mg_ml`.
- **UI:** Calculator Widget in Prescription flow.
  - Input: Select Drug + Patient Weight (auto-filled).
  - Output: Range of mL required.
  - Action: "Apply to Prescription" button.

## 3. Automated Growth Charts

**Priority:** Medium
**Implementation:**

- **Data Source:** Use public datasets for breed weight curves (e.g., Waltham charts).
- **Database:** `growth_standards` table (breed, sex, age_weeks, p25_weight, p50_weight, p75_weight).
- **Visualization:** Recharts line graph comparing `pets.weights` history vs. standard curves.
- **UI:** Tab in Patient Profile -> "Growth".

## 4. Digital Prescriptions & Signatures

**Priority:** High
**Implementation:**

- **PDF Generation:** Use `react-pdf` or a server-side generator (Puppeteer) to render standardized prescription templates.
- **Digital Signature:**
  - Vet saves signature image in Profile.
  - Secure hash generated for each prescription UUID.
  - QR code on PDF linking to a public verification URL: `adris.com/verify/prescription/[uuid]`.

## 5. Vaccine Reaction Warning

**Priority:** Critical (Safety)
**Implementation:**

- **Database:** `vaccine_reactions` table (`pet_id`, `vaccine_brand`, `reaction_severity`, `date`, `notes`).
- **Logic:** Middleware/Hook checking `vaccine_reactions` when adding a new vaccine.
- **UI:**
  - Red Warning Banner if brand matches history.
  - "Override" confirmation modal required to proceed.

## 6. Euthanasia & Quality of Life

**Priority:** Medium
**Implementation:**

- **Tools:**
  - **HHHHHMM Scale:** Interactive form sliders (0-10) for Hurt, Hunger, Hydration, Hygiene, Happiness, Mobility, More Good Days.
  - **Result:** Auto-calculated score with interpretation guide.
- **Record:** PDF exportable report for owner discussions.
