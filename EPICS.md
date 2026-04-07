# VETE (ParaguAI) - 100 EPICS WITH STORIES
## Comprehensive Future Work Plan
### Generated: 2026-04-07 from deep codebase analysis

---

## CRITICAL ASSESSMENT

**Codebase**: Next.js 15, TypeScript, Supabase, 735 app files, 311 API routes, 94 DB tables, 674 components
**Quality Score**: 8/10 architecture, 4/10 test stability, 6/10 production readiness
**Live at**: https://paragu-ai.com (Docker Swarm on VPS)

### Showstoppers:
- /terrapet/portal/login returns 500 (users CAN'T LOG IN)
- 509 integration tests failing
- 249 component tests failing
- SERVICE_ROLE_KEY exposed in committed .env.production
- Setup/debug API endpoints accessible in production

---

# TIER 0: CRITICAL (Fix Before Anything Else)

## EPIC-001: Fix Login & Authentication
> Portal login returns 500 - users cannot access the platform
- STORY-001.1: Debug /terrapet/portal/login 500 error, check server logs
- STORY-001.2: Fix auth callback chain (Supabase → Next.js middleware → redirect)
- STORY-001.3: Add E2E test for complete login flow
- STORY-001.4: Add E2E test for signup flow
- STORY-001.5: Add E2E test for password reset flow
- STORY-001.6: Test OAuth providers (Google, Facebook) if configured

## EPIC-002: Security Hardening
> Service role key exposed, debug endpoints accessible
- STORY-002.1: Remove .env.production from git history (git filter-branch)
- STORY-002.2: Rotate all Supabase keys immediately
- STORY-002.3: Disable /api/setup and /api/setup/seed in production
- STORY-002.4: Disable /api/debug-network in production
- STORY-002.5: Add environment-based guards for dangerous endpoints
- STORY-002.6: Audit all API routes for missing auth checks
- STORY-002.7: Add CSP headers and security response headers
- STORY-002.8: Enable rate limiting even without Upstash (in-memory fallback)
- STORY-002.9: Add secrets scanning to CI pipeline
- STORY-002.10: Create secrets management documentation

## EPIC-003: Fix Test Suite
> 758 tests failing across component and integration suites
- STORY-003.1: Fix 249 failing component tests (mock issues)
- STORY-003.2: Set up test Supabase project for integration tests
- STORY-003.3: Fix Next.js cookies() scope errors in API route tests
- STORY-003.4: Fix Supabase mock chainable query builder
- STORY-003.5: Fix schema drift (microchip_id vs microchip_number)
- STORY-003.6: Remove all 16 test.skip() and fix underlying issues
- STORY-003.7: Achieve 80% line coverage on critical services
- STORY-003.8: Add CI gate that blocks merge on test failure

---

# TIER 1: HIGH PRIORITY (Next 2 Weeks)

## EPIC-004: Dependency Hygiene
> 12 dependabot PRs sitting unmerged for weeks
- STORY-004.1: Review and merge #63 (9 patch deps)
- STORY-004.2: Review and merge #44 (Next.js update)
- STORY-004.3: Review and merge #49 (Sentry update)
- STORY-004.4: Review and merge #40, #23, #22 (CI action bumps)
- STORY-004.5: Review #50 (@types/node major bump) - test carefully
- STORY-004.6: Review #45 (eslint-config-next 15→16) - test carefully
- STORY-004.7: Review #60 (TanStack group update)
- STORY-004.8: Close or merge PR #59 (Invoices + i18n)
- STORY-004.9: Set up auto-merge for patch dependabot PRs
- STORY-004.10: Configure Dependabot grouping strategy

## EPIC-005: ESLint & Code Quality
> 776+ lint warnings, 9000 allowed on commit
- STORY-005.1: Fix 126 console.log warnings → use logger
- STORY-005.2: Fix 30 no-explicit-any warnings → proper types
- STORY-005.3: Fix 200+ TypeScript warnings
- STORY-005.4: Fix 50+ react-hooks dependency warnings
- STORY-005.5: Reduce lint-staged max-warnings from 9000 to 100
- STORY-005.6: Fix 113 non-null assertions → proper null checks
- STORY-005.7: Enable strict ESLint rules incrementally
- STORY-005.8: Add pre-commit hook that fails on new warnings

## EPIC-006: Test Coverage Expansion
> 16 services at 0% coverage, API routes at 10%
- STORY-006.1: Write tests for inventory service (0% → 80%)
- STORY-006.2: Write tests for prescription service (0% → 80%)
- STORY-006.3: Write tests for medical-record service (0% → 80%)
- STORY-006.4: Write tests for lab service (0% → 80%)
- STORY-006.5: Write tests for hospitalization service (0% → 80%)
- STORY-006.6: Write tests for vaccine service (0% → 80%)
- STORY-006.7: Write tests for store service (0% → 80%)
- STORY-006.8: Write tests for messaging service (0% → 80%)
- STORY-006.9: Write tests for payment service (0% → 80%)
- STORY-006.10: Write API route tests for top 20 critical endpoints

## EPIC-007: CI/CD Pipeline
> No proper CI gate, builds need 8GB heap
- STORY-007.1: Fix GitHub Actions workflow for PR checks
- STORY-007.2: Add test coverage gate (fail if drops below 60%)
- STORY-007.3: Add lint gate (fail if warnings exceed 200)
- STORY-007.4: Optimize build to reduce 8GB memory requirement
- STORY-007.5: Add Docker image size check (fail if >2GB)
- STORY-007.6: Set up auto-deploy to VPS on main push
- STORY-007.7: Add Playwright E2E tests to CI
- STORY-007.8: Add security scanning (npm audit, Snyk)

---

# TIER 2: PRODUCT QUALITY (Weeks 3-6)

## EPIC-008: Theme & Design System
> 285 files with hardcoded colors
- STORY-008.1: Audit all hardcoded colors → CSS variables
- STORY-008.2: Create Tailwind theme config for white-label support
- STORY-008.3: Add dark mode support
- STORY-008.4: Fix responsive design issues on mobile
- STORY-008.5: Create component library documentation (Storybook)
- STORY-008.6: Add accessibility audit (axe-core)

## EPIC-009: Internationalization (i18n)
> Currently Spanish-only, Paraguay market needs Guaraní support
- STORY-009.1: Complete next-intl setup (already partially in place)
- STORY-009.2: Extract all hardcoded Spanish strings to locale files
- STORY-009.3: Add Portuguese locale (Brazil market)
- STORY-009.4: Add English locale (international market)
- STORY-009.5: Add locale switcher in UI
- STORY-009.6: Add RTL support for future markets

## EPIC-010: Performance Optimization
> 735 route files, 8GB build heap, slow cold starts
- STORY-010.1: Implement ISR/SSG for public clinic pages
- STORY-010.2: Add route-level code splitting
- STORY-010.3: Optimize Docker image size (currently ~1GB+)
- STORY-010.4: Add Redis caching for frequently accessed data
- STORY-010.5: Implement database query optimization (N+1 queries)
- STORY-010.6: Add CDN for static assets
- STORY-010.7: Implement lazy loading for heavy components
- STORY-010.8: Profile and optimize TypeScript compilation

## EPIC-011: Error Handling & Monitoring
> Sentry configured but error boundaries incomplete
- STORY-011.1: Add error boundaries to all page routes
- STORY-011.2: Add Sentry breadcrumbs for user actions
- STORY-011.3: Create custom error pages (404, 500, 503)
- STORY-011.4: Add health check dashboard
- STORY-011.5: Set up alerts for error rate spikes
- STORY-011.6: Add structured logging to all API routes

## EPIC-012: Database Maintenance
> 96 migrations, duplicates, FK constraints disabled
- STORY-012.1: Squash migrations 001-050 into baseline
- STORY-012.2: Remove duplicate migrations (051 & 090)
- STORY-012.3: Re-enable FK constraint on profiles → auth.users
- STORY-012.4: Add database backup automation
- STORY-012.5: Create database restore procedure
- STORY-012.6: Add migration testing in CI

## EPIC-013: Documentation Overhaul
> No user docs, no API docs, 12 stale test reports in root
- STORY-013.1: Move TERRAPET_*.md files to docs/testing/
- STORY-013.2: Write README.md with proper project overview
- STORY-013.3: Generate OpenAPI documentation from routes
- STORY-013.4: Write developer onboarding guide
- STORY-013.5: Write deployment guide (VPS, Vercel, GCP)
- STORY-013.6: Create architecture decision records (ADRs)
- STORY-013.7: Write end-user manual for clinic staff
- STORY-013.8: Write pet owner portal guide

---

# TIER 3: FEATURE DEVELOPMENT (Weeks 7-16)

## EPIC-014: Payment Processing (Paraguay)
> Only Stripe configured, Paraguay needs local methods
- STORY-014.1: Integrate Tigo Money (most used in Paraguay)
- STORY-014.2: Integrate Billetera Personal
- STORY-014.3: Integrate Bancard POS terminal API
- STORY-014.4: Add QR payment support (Paraguay standard)
- STORY-014.5: Add cash payment recording workflow
- STORY-014.6: Add payment receipt PDF generation
- STORY-014.7: Add split payment support

## EPIC-015: Appointment System Enhancement
> Basic CRUD exists, needs real-world clinic features
- STORY-015.1: Add drag-and-drop calendar rescheduling
- STORY-015.2: Add multi-vet scheduling with conflict detection
- STORY-015.3: Add SMS appointment reminders (Twilio integration)
- STORY-015.4: Add WhatsApp appointment reminders
- STORY-015.5: Add online booking with real-time availability
- STORY-015.6: Add appointment follow-up automation
- STORY-015.7: Add group appointments (vaccination days)

## EPIC-016: Telemedicine Module
> Completely missing - competitive necessity
- STORY-016.1: Integrate video call (WebRTC or Zoom SDK)
- STORY-016.2: Add teleconsultation booking flow
- STORY-016.3: Add in-call note-taking interface
- STORY-016.4: Add post-consultation summary + prescription
- STORY-016.5: Add telemedicine billing integration
- STORY-016.6: Add recording consent and storage

## EPIC-017: Medical Imaging
> No DICOM support, no image management
- STORY-017.1: Add image upload for X-rays/ultrasounds
- STORY-017.2: Add image annotation tools
- STORY-017.3: Add image comparison (before/after)
- STORY-017.4: Add DICOM viewer integration
- STORY-017.5: Add image storage with Supabase Storage

## EPIC-018: Surgery & Procedure Management
> No dedicated surgical workflow
- STORY-018.1: Create surgery scheduling module
- STORY-018.2: Add pre-operative checklist
- STORY-018.3: Add anesthesia monitoring form
- STORY-018.4: Add surgery notes template
- STORY-018.5: Add post-operative care plan
- STORY-018.6: Add surgical inventory tracking

## EPIC-019: Dental Charting
> No dental recording interface
- STORY-019.1: Create dental chart component (tooth diagram)
- STORY-019.2: Add dental procedure recording
- STORY-019.3: Add dental history timeline
- STORY-019.4: Add dental image attachment

## EPIC-020: Pharmacy & Drug Management
> Prescriptions exist but no dispensing workflow
- STORY-020.1: Add drug interaction checking database
- STORY-020.2: Add dispensing workflow (pick, verify, dispense)
- STORY-020.3: Add controlled substance tracking
- STORY-020.4: Add prescription refill management
- STORY-020.5: Add drug allergy alerts
- STORY-020.6: Add withdrawal period tracking for food animals

## EPIC-021: Client Communication Hub
> WhatsApp/SMS partially implemented
- STORY-021.1: Complete WhatsApp Business API integration
- STORY-021.2: Add appointment reminder templates
- STORY-021.3: Add vaccine reminder templates
- STORY-021.4: Add billing reminder templates
- STORY-021.5: Add bulk messaging campaigns
- STORY-021.6: Add message delivery tracking
- STORY-021.7: Add chatbot for common inquiries

## EPIC-022: Client Portal Enhancement
> Portal exists but login is broken, UX incomplete
- STORY-022.1: Fix portal login (EPIC-001)
- STORY-022.2: Add pet health timeline view
- STORY-022.3: Add vaccination certificate download
- STORY-022.4: Add appointment self-service (book, cancel, reschedule)
- STORY-022.5: Add billing/payment history view
- STORY-022.6: Add prescription refill request
- STORY-022.7: Add food/product auto-reorder from store
- STORY-022.8: Add pet profile sharing (QR code)

## EPIC-023: Reporting & Analytics
> Basic analytics exist, no custom report builder
- STORY-023.1: Add custom report builder (drag-and-drop fields)
- STORY-023.2: Add financial reports (revenue by service, by vet, by month)
- STORY-023.3: Add patient reports (top conditions, species breakdown)
- STORY-023.4: Add inventory reports (turnover, dead stock, cost analysis)
- STORY-023.5: Add staff performance dashboard (appointments/day, revenue/vet)
- STORY-023.6: Add export to Excel/CSV for all reports
- STORY-023.7: Add scheduled report email delivery

## EPIC-024: Emergency & Triage
> No emergency workflow
- STORY-024.1: Add triage assessment form
- STORY-024.2: Add priority queue for emergencies
- STORY-024.3: Add emergency contact notification
- STORY-024.4: Add after-hours on-call scheduling
- STORY-024.5: Add emergency protocol templates

## EPIC-025: Boarding & Daycare
> Kennel endpoints exist but module is minimal
- STORY-025.1: Create boarding reservation system
- STORY-025.2: Add kennel capacity management
- STORY-025.3: Add boarding check-in/check-out workflow
- STORY-025.4: Add daily activity logging
- STORY-025.5: Add feeding schedule management
- STORY-025.6: Add photo/video sharing with owners
- STORY-025.7: Add boarding billing integration

## EPIC-026: Grooming Module
> Not implemented
- STORY-026.1: Add grooming service catalog
- STORY-026.2: Add grooming appointment booking
- STORY-026.3: Add groomer assignment and scheduling
- STORY-026.4: Add grooming history per pet
- STORY-026.5: Add before/after photos

## EPIC-027: Mobile PWA
> Web-only, no offline or push notifications
- STORY-027.1: Add PWA manifest and service worker
- STORY-027.2: Add offline mode for critical features
- STORY-027.3: Add push notifications (Web Push API)
- STORY-027.4: Add camera integration for pet photos
- STORY-027.5: Add barcode scanner (native camera)
- STORY-027.6: Add install prompt for mobile users

## EPIC-028: Multi-Clinic Chain Management
> Single-tenant per clinic, no chain features
- STORY-028.1: Add clinic group/chain entity
- STORY-028.2: Add cross-clinic patient transfer
- STORY-028.3: Add consolidated chain reporting
- STORY-028.4: Add shared inventory across locations
- STORY-028.5: Add chain-level admin dashboard

## EPIC-029: Staff Management Enhancement
> Basic team exists, no full HR features
- STORY-029.1: Add staff roles and permissions matrix
- STORY-029.2: Add time tracking and timesheet
- STORY-029.3: Add vacation/sick day management
- STORY-029.4: Add staff performance reviews
- STORY-029.5: Add continuing education tracking
- STORY-029.6: Add license/certification expiry alerts

## EPIC-030: Inventory Enhancement
> CRUD exists, needs smarter features
- STORY-030.1: Add AI-powered demand forecasting
- STORY-030.2: Add automatic reorder point calculation
- STORY-030.3: Add vendor EDI integration (electronic ordering)
- STORY-030.4: Add lot number/batch tracking
- STORY-030.5: Add expiry date management with FEFO
- STORY-030.6: Add inventory valuation reports (FIFO, WAC)
- STORY-030.7: Add multi-location inventory sync

---

# TIER 4: GROWTH & SCALE (Months 3-6)

## EPIC-031: AI-Powered Features
- STORY-031.1: Add AI symptom checker for pre-triage
- STORY-031.2: Add AI-assisted diagnosis suggestions
- STORY-031.3: Add AI-powered treatment plan recommendations
- STORY-031.4: Add NLP for medical record summarization
- STORY-031.5: Add chatbot for client inquiries (LLM-powered)
- STORY-031.6: Add predictive analytics for patient health risks

## EPIC-032: Client Education Library
- STORY-032.1: Create article/content management system
- STORY-032.2: Add species/breed-specific care guides
- STORY-032.3: Add post-procedure care instructions (auto-sent)
- STORY-032.4: Add nutrition guides
- STORY-032.5: Add video content support

## EPIC-033: Marketplace & Ecosystem
- STORY-033.1: Add veterinary supplier marketplace
- STORY-033.2: Add inter-clinic referral marketplace
- STORY-033.3: Add pet adoption integration
- STORY-033.4: Add pet sitting/walking service directory
- STORY-033.5: Add integration with pet food delivery services

## EPIC-034: Insurance Deep Integration
- STORY-034.1: Add direct API integration with insurance providers
- STORY-034.2: Add real-time eligibility verification
- STORY-034.3: Add automated claim submission
- STORY-034.4: Add claim status tracking
- STORY-034.5: Add insurance estimate calculator

## EPIC-035: Epidemiology & Public Health
- STORY-035.1: Add disease outbreak detection algorithm
- STORY-035.2: Add geographic disease heatmap (Leaflet)
- STORY-035.3: Add automated SENACSA reporting (Paraguay)
- STORY-035.4: Add rabies vaccination compliance tracking
- STORY-035.5: Add zoonotic disease alerts

## EPIC-036: Compliance & Audit
- STORY-036.1: Add comprehensive audit trail for all data changes
- STORY-036.2: Add controlled substance DEA logging
- STORY-036.3: Add HIPAA-equivalent compliance (veterinary standards)
- STORY-036.4: Add data retention policies and automated archival
- STORY-036.5: Add compliance reporting dashboard

## EPIC-037: Pet Passport & Travel
- STORY-037.1: Add international health certificate generation
- STORY-037.2: Add vaccination requirement checker by destination
- STORY-037.3: Add TRACES-NT integration (EU pet travel)
- STORY-037.4: Add microchip registration integration
- STORY-037.5: Add quarantine period tracking

## EPIC-038: Loyalty Program Enhancement
- STORY-038.1: Complete loyalty points widget (currently TODO)
- STORY-038.2: Complete loyalty redemption component (currently TODO)
- STORY-038.3: Add tiered loyalty levels (Bronze, Silver, Gold)
- STORY-038.4: Add points for referrals
- STORY-038.5: Add loyalty program analytics

## EPIC-039: E-commerce Enhancement
- STORY-039.1: Add product recommendations engine
- STORY-039.2: Add subscription boxes (monthly pet supply boxes)
- STORY-039.3: Add same-day delivery tracking
- STORY-039.4: Add product comparison feature
- STORY-039.5: Add store search with faceted filters
- STORY-039.6: Add product bundles/kits

## EPIC-040: Advanced Scheduling
- STORY-040.1: Add resource scheduling (rooms, equipment)
- STORY-040.2: Add buffer time configuration between appointments
- STORY-040.3: Add seasonal schedule templates
- STORY-040.4: Add automated schedule optimization
- STORY-040.5: Add client-preferred time learning

---

# TIER 5: PLATFORM & INFRASTRUCTURE (Ongoing)

## EPIC-041: API Gateway & Versioning
- STORY-041.1: Add API versioning (v1/v2)
- STORY-041.2: Add API rate limiting per tenant
- STORY-041.3: Add API key management for third-party integrations
- STORY-041.4: Add webhook management for external systems
- STORY-041.5: Generate SDK clients from OpenAPI spec

## EPIC-042: Monitoring & Observability
- STORY-042.1: Add Langfuse tracing for all LLM calls
- STORY-042.2: Add distributed tracing (OpenTelemetry)
- STORY-042.3: Add custom metrics for business KPIs
- STORY-042.4: Add log aggregation to VPS Loki
- STORY-042.5: Add real-user monitoring (RUM)
- STORY-042.6: Add synthetic monitoring for critical paths

## EPIC-043: Multi-Region & Scaling
- STORY-043.1: Add read replicas for Supabase
- STORY-043.2: Add CDN edge caching for static content
- STORY-043.3: Add horizontal scaling documentation
- STORY-043.4: Add database connection pooling (PgBouncer)
- STORY-043.5: Add queue system for heavy operations (Inngest)

## EPIC-044: Data Pipeline & Analytics
- STORY-044.1: Set up data warehouse (ClickHouse or DuckDB)
- STORY-044.2: Add ETL pipeline for analytics
- STORY-044.3: Add business intelligence dashboard
- STORY-044.4: Add cohort analysis for client retention
- STORY-044.5: Add revenue forecasting

## EPIC-045: Backup & Disaster Recovery
- STORY-045.1: Automate daily Supabase backup to MinIO
- STORY-045.2: Create disaster recovery runbook
- STORY-045.3: Add point-in-time recovery procedure
- STORY-045.4: Test restore procedure monthly
- STORY-045.5: Add backup monitoring alerts

## EPIC-046: DevOps & Infrastructure
- STORY-046.1: Set up staging environment on VPS
- STORY-046.2: Add blue-green deployment support
- STORY-046.3: Add canary deployment for risky changes
- STORY-046.4: Add infrastructure-as-code (Docker Compose versioned)
- STORY-046.5: Add load testing pipeline (k6)
- STORY-046.6: Add chaos engineering tests

## EPIC-047: Feature Flags & Experimentation
- STORY-047.1: Expand features_enabled to full feature flag system
- STORY-047.2: Add A/B testing framework
- STORY-047.3: Add gradual rollout percentages
- STORY-047.4: Add feature flag audit trail
- STORY-047.5: Add feature flag UI in admin panel

## EPIC-048: White-Label & Customization
- STORY-048.1: Complete theme engine (CSS variables from DB)
- STORY-048.2: Add custom domain per clinic (not just subdomain)
- STORY-048.3: Add custom email templates per clinic
- STORY-048.4: Add custom SMS templates per clinic
- STORY-048.5: Add custom branding on all PDF exports
- STORY-048.6: Add custom landing page builder

## EPIC-049: Developer Experience
- STORY-049.1: Add local development setup script (one command)
- STORY-049.2: Add Docker Compose for local dev with Supabase
- STORY-049.3: Add seed data generator for testing
- STORY-049.4: Add API playground (like Swagger UI)
- STORY-049.5: Add component playground (Storybook)
- STORY-049.6: Write contribution guidelines

## EPIC-050: Onboarding & Activation
- STORY-050.1: Add guided setup wizard for new clinics
- STORY-050.2: Add sample data import (demo mode)
- STORY-050.3: Add contextual help tooltips
- STORY-050.4: Add video tutorials embedded in UI
- STORY-050.5: Add progress tracker for setup completion
- STORY-050.6: Add in-app chat support widget

---

# TIER 6: BUSINESS & GROWTH (Months 6-12)

## EPIC-051: Pricing & Billing Enhancement
- STORY-051.1: Add usage-based pricing tier
- STORY-051.2: Add free trial with credit card
- STORY-051.3: Add annual billing discount
- STORY-051.4: Add invoice PDF with custom branding
- STORY-051.5: Add dunning management (failed payment recovery)

## EPIC-052: Sales & Outreach
- STORY-052.1: Add demo booking page on paragu-ai.com
- STORY-052.2: Add ROI calculator for clinics
- STORY-052.3: Add case studies / testimonials page
- STORY-052.4: Add comparison page vs competitors (VetPraxis, Daysmart Vet)
- STORY-052.5: Add referral tracking analytics

## EPIC-053: Landing Page Optimization
- STORY-053.1: Add A/B testing for landing page
- STORY-053.2: Add SEO optimization (meta, schema markup)
- STORY-053.3: Add blog/content marketing section
- STORY-053.4: Add pricing page with feature comparison
- STORY-053.5: Add live chat on landing page

## EPIC-054: Customer Success
- STORY-054.1: Add NPS survey system
- STORY-054.2: Add usage analytics per clinic (feature adoption)
- STORY-054.3: Add automated onboarding email sequence
- STORY-054.4: Add churn prediction alerts
- STORY-054.5: Add customer health score dashboard

## EPIC-055: Partner Integrations
- STORY-055.1: Integrate with veterinary lab services API
- STORY-055.2: Integrate with pet food distributors
- STORY-055.3: Integrate with veterinary imaging equipment
- STORY-055.4: Integrate with payment terminals (Bancard POS)
- STORY-055.5: Integrate with accounting software (Tesaka - Paraguay)

## EPIC-056: Social Features
- STORY-056.1: Add social feed for pet updates
- STORY-056.2: Add pet birthday reminders
- STORY-056.3: Add pet achievement badges
- STORY-056.4: Add community forum for pet owners
- STORY-056.5: Add share pet profile on social media

## EPIC-057: Notification System Enhancement
- STORY-057.1: Add notification preferences per channel (email, SMS, push, WhatsApp)
- STORY-057.2: Add notification scheduling (quiet hours)
- STORY-057.3: Add notification templates with variables
- STORY-057.4: Add notification delivery analytics
- STORY-057.5: Add notification escalation rules

## EPIC-058: Search & Discovery
- STORY-058.1: Add global search across all entities
- STORY-058.2: Add recent items / frequently accessed
- STORY-058.3: Add saved searches / filters
- STORY-058.4: Add barcode/QR scanner search
- STORY-058.5: Index all content in Meilisearch

## EPIC-059: Data Import & Migration
- STORY-059.1: Add CSV import for patients
- STORY-059.2: Add CSV import for clients
- STORY-059.3: Add CSV import for inventory
- STORY-059.4: Add migration tool from competing VMS (VetPraxis, Fichas Vet)
- STORY-059.5: Add data validation and error reporting on import

## EPIC-060: Print & Label Management
- STORY-060.1: Add prescription label printing
- STORY-060.2: Add medication label printing
- STORY-060.3: Add cage/kennel card printing
- STORY-060.4: Add barcode label printing for inventory
- STORY-060.5: Add receipt/invoice thermal printer support

---

# TIER 7: VETERINARY SPECIALTY (Ongoing)

## EPIC-061: Species-Specific Features
- STORY-061.1: Add canine-specific health protocols
- STORY-061.2: Add feline-specific health protocols
- STORY-061.3: Add equine module (different workflow)
- STORY-061.4: Add exotic animal module
- STORY-061.5: Add avian module
- STORY-061.6: Add cattle/livestock module (important for Paraguay)

## EPIC-062: Vaccination Protocol Engine
- STORY-062.1: Add species/breed-specific vaccination schedules
- STORY-062.2: Add vaccine lot tracking and recall management
- STORY-062.3: Add adverse reaction reporting (pharmacovigilance)
- STORY-062.4: Add vaccination certificate generation (official format)
- STORY-062.5: Add rabies certificate for municipal compliance

## EPIC-063: Nutrition & Diet Management
- STORY-063.1: Add body condition score tracking
- STORY-063.2: Add diet plan creation tool
- STORY-063.3: Add calorie calculator by species/weight/activity
- STORY-063.4: Add food allergy tracking
- STORY-063.5: Add nutrition supplement recommendations

## EPIC-064: Behavioral Assessment
- STORY-064.1: Add behavioral assessment templates
- STORY-064.2: Add behavior tracking over time
- STORY-064.3: Add training program integration
- STORY-064.4: Add behavioral red flag alerts

## EPIC-065: Geriatric Care
- STORY-065.1: Add senior wellness protocol templates
- STORY-065.2: Add chronic condition management (diabetes, arthritis, kidney)
- STORY-065.3: Add medication interaction checker for elderly pets
- STORY-065.4: Add quality of life scoring
- STORY-065.5: Add palliative care planning

## EPIC-066: Reproductive Services
- STORY-066.1: Enhance reproductive cycle tracking (currently exists)
- STORY-066.2: Add breeding management module
- STORY-066.3: Add pregnancy monitoring timeline
- STORY-066.4: Add whelping/kittening planning
- STORY-066.5: Add puppy/kitten well-check schedule generator

## EPIC-067: Laboratory Integration
- STORY-067.1: Add HL7/FHIR message parsing for lab results
- STORY-067.2: Add IDEXX VetConnect integration
- STORY-067.3: Add Zoetis Reference Lab integration
- STORY-067.4: Add in-house lab equipment integration (analyzers)
- STORY-067.5: Add reference range management by species/age

## EPIC-068: Pathology & Cytology
- STORY-068.1: Add pathology report templates
- STORY-068.2: Add cytology image upload and annotation
- STORY-068.3: Add sample tracking workflow
- STORY-068.4: Add pathology report PDF generation

---

# TIER 8: REGIONAL EXPANSION (Paraguay Market Deep)

## EPIC-069: Paraguay Regulatory Compliance
- STORY-069.1: Add SENACSA reporting automation
- STORY-069.2: Add municipal animal registration integration
- STORY-069.3: Add rabies campaign compliance tracking
- STORY-069.4: Add controlled substance DINAVISA reporting
- STORY-069.5: Add RUC (tax ID) validation and invoicing

## EPIC-070: Paraguay Payment Ecosystem
- STORY-070.1: Complete Tigo Money integration
- STORY-070.2: Add Billetera Personal integration
- STORY-070.3: Add Bancard vPOS integration
- STORY-070.4: Add Aquí Pago integration
- STORY-070.5: Add IVA (VAT) calculation and reporting

## EPIC-071: Rural Veterinary Features
- STORY-071.1: Add offline mode for areas without internet
- STORY-071.2: Add mobile-first field visit workflow
- STORY-071.3: Add GPS-based farm visit tracking
- STORY-071.4: Add herd management basics (cattle)
- STORY-071.5: Add simplified UI for low-bandwidth connections

## EPIC-072: Paraguay-Specific Content
- STORY-072.1: Add Guaraní language support
- STORY-072.2: Add local breed database (Paraguayan dog/cat breeds)
- STORY-072.3: Add local disease prevalence data
- STORY-072.4: Add local drug availability database
- STORY-072.5: Add Paraguay holiday calendar integration

---

# TIER 9: ADVANCED TECHNICAL (Months 9-12)

## EPIC-073: Real-time Features
- STORY-073.1: Add real-time waiting room status board
- STORY-073.2: Add real-time appointment status updates
- STORY-073.3: Add real-time messaging with WebSocket
- STORY-073.4: Add real-time inventory alerts
- STORY-073.5: Add live dashboard with real-time metrics

## EPIC-074: Offline & Sync
- STORY-074.1: Add IndexedDB storage for offline data
- STORY-074.2: Add conflict resolution for offline changes
- STORY-074.3: Add background sync when connection restored
- STORY-074.4: Add offline appointment recording
- STORY-074.5: Add offline medical record creation

## EPIC-075: Machine Learning Pipeline
- STORY-075.1: Add pet image classification (species, breed)
- STORY-075.2: Add dermatology image analysis
- STORY-075.3: Add X-ray anomaly detection
- STORY-075.4: Add predictive modeling for appointment no-shows
- STORY-075.5: Add churn prediction for clients

## EPIC-076: Advanced Search & RAG
- STORY-076.1: Index all medical records in Qdrant
- STORY-076.2: Add semantic search for diagnosis
- STORY-076.3: Add similar case finder
- STORY-076.4: Add RAG-powered medical reference assistant
- STORY-076.5: Add drug interaction database with vector search

## EPIC-077: Webhook & Integration Platform
- STORY-077.1: Add outgoing webhook management UI
- STORY-077.2: Add incoming webhook endpoints for IoT devices
- STORY-077.3: Add Zapier/n8n trigger support
- STORY-077.4: Add event bus for decoupled integrations
- STORY-077.5: Add integration marketplace

## EPIC-078: API Ecosystem
- STORY-078.1: Add public API with OAuth2 authentication
- STORY-078.2: Add API documentation portal
- STORY-078.3: Add rate limiting per API key
- STORY-078.4: Add API usage analytics
- STORY-078.5: Add SDK generation (TypeScript, Python)

## EPIC-079: Advanced Billing
- STORY-079.1: Add recurring billing automation
- STORY-079.2: Add payment plan support (installments)
- STORY-079.3: Add insurance co-pay calculator
- STORY-079.4: Add credit/debit notes
- STORY-079.5: Add multi-currency support (PYG, USD, BRL)

## EPIC-080: Print & Document Generation
- STORY-080.1: Add custom PDF template builder
- STORY-080.2: Add batch document generation
- STORY-080.3: Add digital signature for documents
- STORY-080.4: Add document versioning and history
- STORY-080.5: Add template marketplace (clinic-customizable)

---

# TIER 10: POLISH & EXCELLENCE (Ongoing)

## EPIC-081: Accessibility (a11y)
- STORY-081.1: Add WCAG 2.1 AA compliance audit
- STORY-081.2: Add keyboard navigation for all features
- STORY-081.3: Add screen reader support
- STORY-081.4: Add high contrast mode
- STORY-081.5: Add font size adjustment

## EPIC-082: Performance Benchmarking
- STORY-082.1: Add Lighthouse CI scores tracking
- STORY-082.2: Add Core Web Vitals monitoring
- STORY-082.3: Add database query performance dashboard
- STORY-082.4: Add API response time tracking (p50, p95, p99)
- STORY-082.5: Add load testing benchmarks (k6)

## EPIC-083: Security Hardening (Advanced)
- STORY-083.1: Add penetration testing
- STORY-083.2: Add OWASP Top 10 compliance check
- STORY-083.3: Add dependency vulnerability scanning (Snyk)
- STORY-083.4: Add WAF rules in Cloudflare
- STORY-083.5: Add DDoS protection configuration

## EPIC-084: UX Polish
- STORY-084.1: Add skeleton loading states for all pages
- STORY-084.2: Add optimistic UI updates
- STORY-084.3: Add undo/redo for form changes
- STORY-084.4: Add keyboard shortcuts for power users
- STORY-084.5: Add breadcrumb navigation
- STORY-084.6: Add command palette (Cmd+K)

## EPIC-085: Email System
- STORY-085.1: Set up Resend API with custom domain (paragu-ai.com)
- STORY-085.2: Add transactional email templates (appointments, invoices)
- STORY-085.3: Add email tracking (opens, clicks)
- STORY-085.4: Add email preference center
- STORY-085.5: Add SPF/DKIM/DMARC for paragu-ai.com

## EPIC-086: Legal & Compliance Pages
- STORY-086.1: Add Terms of Service page
- STORY-086.2: Add Privacy Policy page
- STORY-086.3: Add Cookie consent banner
- STORY-086.4: Add Data Processing Agreement template
- STORY-086.5: Add GDPR data portability tools

## EPIC-087: Multi-Species Medical Records
- STORY-087.1: Add species-specific form fields
- STORY-087.2: Add breed-specific health risk alerts
- STORY-087.3: Add species-specific normal vital ranges
- STORY-087.4: Add age calculation by species (cat years, dog years)
- STORY-087.5: Add species-specific growth chart templates

## EPIC-088: Client Segmentation & Marketing
- STORY-088.1: Add client segmentation engine (RFM analysis)
- STORY-088.2: Add automated email campaigns based on segments
- STORY-088.3: Add win-back campaigns for inactive clients
- STORY-088.4: Add birthday/anniversary promotions
- STORY-088.5: Add referral program gamification

## EPIC-089: Inventory Intelligence
- STORY-089.1: Add dead stock identification and alerts
- STORY-089.2: Add seasonal demand prediction
- STORY-089.3: Add vendor performance scoring
- STORY-089.4: Add cost optimization suggestions
- STORY-089.5: Add inventory audit workflow

## EPIC-090: Knowledge Base & Training
- STORY-090.1: Add in-app help center with searchable articles
- STORY-090.2: Add interactive walkthroughs for new features
- STORY-090.3: Add admin training mode (sandbox)
- STORY-090.4: Add contextual help tooltips
- STORY-090.5: Add keyboard shortcut reference card

---

# TIER 11: COMPETITIVE DIFFERENTIATION

## EPIC-091: Pet Health Score
- STORY-091.1: Create proprietary health score algorithm
- STORY-091.2: Add health score widget on pet profile
- STORY-091.3: Add health score trend tracking
- STORY-091.4: Add health score alerts for declining pets
- STORY-091.5: Add health score benchmarking by breed/age

## EPIC-092: Predictive Health Alerts
- STORY-092.1: Add vaccine overdue prediction
- STORY-092.2: Add chronic disease early warning
- STORY-092.3: Add weight gain/loss anomaly detection
- STORY-092.4: Add appointment no-show prediction
- STORY-092.5: Add medication adherence tracking

## EPIC-093: Clinic Performance AI
- STORY-093.1: Add revenue optimization suggestions
- STORY-093.2: Add staffing optimization recommendations
- STORY-093.3: Add client retention risk alerts
- STORY-093.4: Add service pricing optimization
- STORY-093.5: Add appointment slot optimization

## EPIC-094: Pet Owner Mobile Experience
- STORY-094.1: Add native-like PWA with bottom navigation
- STORY-094.2: Add pet health dashboard widget
- STORY-094.3: Add quick-action buttons (book, refill, message)
- STORY-094.4: Add pet photo gallery
- STORY-094.5: Add milestone tracking (first visit, neutered, etc.)

## EPIC-095: Smart Clinic Dashboard
- STORY-095.1: Add customizable widget dashboard
- STORY-095.2: Add real-time revenue counter
- STORY-095.3: Add patient flow visualization
- STORY-095.4: Add quick actions panel
- STORY-095.5: Add daily briefing summary (AI-generated)

## EPIC-096: IoT & Device Integration
- STORY-096.1: Add weight scale integration (auto-record)
- STORY-096.2: Add temperature monitor integration
- STORY-096.3: Add pet activity tracker data import
- STORY-096.4: Add smart kennel sensors
- STORY-096.5: Add clinic environment monitoring

## EPIC-097: Community & Ecosystem
- STORY-097.1: Add veterinary professional directory
- STORY-097.2: Add specialist referral network
- STORY-097.3: Add CE/training event calendar
- STORY-097.4: Add peer consultation forum
- STORY-097.5: Add shared treatment protocol library

## EPIC-098: Data Export & Interoperability
- STORY-098.1: Add FHIR-compatible data export
- STORY-098.2: Add bulk data export for analytics
- STORY-098.3: Add data migration tool (export to competing systems)
- STORY-098.4: Add API for government reporting
- STORY-098.5: Add data portability compliance (GDPR Article 20)

## EPIC-099: Sustainability & Green Vet
- STORY-099.1: Add paperless consent workflow
- STORY-099.2: Add digital prescription delivery
- STORY-099.3: Add carbon footprint tracking for clinic
- STORY-099.4: Add eco-friendly product badges in store
- STORY-099.5: Add waste management tracking

## EPIC-100: Platform Marketplace
- STORY-100.1: Add plugin/extension marketplace
- STORY-100.2: Add third-party widget support
- STORY-100.3: Add custom integration builder (no-code)
- STORY-100.4: Add marketplace revenue sharing model
- STORY-100.5: Add developer documentation and sandbox

---

# SUMMARY STATISTICS

| Tier | Epics | Stories | Priority | Timeline |
|------|-------|---------|----------|----------|
| 0 - Critical | 3 | 24 | P0 | Immediate |
| 1 - High | 4 | 36 | P1 | 2 weeks |
| 2 - Quality | 6 | 42 | P2 | Weeks 3-6 |
| 3 - Features | 17 | 108 | P3 | Weeks 7-16 |
| 4 - Growth | 10 | 50 | P4 | Months 3-6 |
| 5 - Platform | 10 | 50 | P5 | Ongoing |
| 6 - Business | 10 | 50 | P6 | Months 6-12 |
| 7 - Specialty | 8 | 38 | P7 | Ongoing |
| 8 - Regional | 4 | 20 | P8 | Quarter 3 |
| 9 - Advanced | 8 | 40 | P9 | Months 9-12 |
| 10 - Polish | 10 | 50 | P10 | Ongoing |
| 11 - Differentiation | 10 | 50 | P11 | Year 2 |
| **TOTAL** | **100** | **558** | | |

---

## NEXT STEPS (for Hermes autonomous work)

1. Start with EPIC-001 (Fix Login) - this blocks everything
2. Then EPIC-002 (Security) - exposed secrets are dangerous
3. Then EPIC-003 (Fix Tests) - need stable test suite
4. Then EPIC-004 (Dependencies) - security updates
5. Work through Tier 1 and Tier 2 systematically
6. Pick Tier 3 features based on customer demand
