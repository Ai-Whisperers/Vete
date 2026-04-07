# WORK QUEUE — Priority Order

> Last updated: 2026-04-07
> Total: 100 epics, 558 stories

## How to Use
1. Find the highest-priority epic with status `backlog`
2. Check dependencies are met
3. Move to `in-progress/` and start working

---

| # | ID | Title | Tier | Priority | Effort | Status | Dependencies |
|---|-----|-------|------|----------|--------|--------|--------------|
| 1 | EPIC-001 | Fix Login & Authentication | 0 | P0 | M | backlog | — |
| 2 | EPIC-002 | Security Hardening | 0 | P0 | L | backlog | — |
| 3 | EPIC-003 | Fix Test Suite | 0 | P0 | XL | backlog | EPIC-001 |
| 4 | EPIC-004 | Dependency Hygiene | 1 | P1 | M | backlog | EPIC-003 |
| 5 | EPIC-005 | ESLint & Code Quality | 1 | P1 | L | backlog | EPIC-004 |
| 6 | EPIC-006 | Test Coverage Expansion | 1 | P1 | XL | backlog | EPIC-003 |
| 7 | EPIC-007 | CI/CD Pipeline | 1 | P1 | L | backlog | EPIC-003, EPIC-005 |
| 8 | EPIC-008 | Theme & Design System | 2 | P2 | L | backlog | — |
| 9 | EPIC-009 | Internationalization (i18n) | 2 | P2 | XL | backlog | — |
| 10 | EPIC-010 | Performance Optimization | 2 | P2 | L | backlog | EPIC-007 |
| 11 | EPIC-011 | Error Handling & Monitoring | 2 | P2 | M | backlog | — |
| 12 | EPIC-012 | Database Maintenance | 2 | P2 | M | backlog | — |
| 13 | EPIC-013 | Documentation Overhaul | 2 | P2 | L | backlog | — |
| 14 | EPIC-014 | Payment Processing (Paraguay) | 3 | P3 | XL | backlog | EPIC-001 |
| 15 | EPIC-015 | Appointment System Enhancement | 3 | P3 | L | backlog | EPIC-001 |
| 16 | EPIC-016 | Telemedicine Module | 3 | P3 | XL | backlog | EPIC-001, EPIC-015 |
| 17 | EPIC-017 | Medical Imaging | 3 | P3 | L | backlog | — |
| 18 | EPIC-018 | Surgery & Procedure Management | 3 | P3 | L | backlog | — |
| 19 | EPIC-019 | Dental Charting | 3 | P3 | M | backlog | — |
| 20 | EPIC-020 | Pharmacy & Drug Management | 3 | P3 | L | backlog | — |
| 21 | EPIC-021 | Client Communication Hub | 3 | P3 | L | backlog | EPIC-015 |
| 22 | EPIC-022 | Client Portal Enhancement | 3 | P3 | L | backlog | EPIC-001 |
| 23 | EPIC-023 | Reporting & Analytics | 3 | P3 | L | backlog | — |
| 24 | EPIC-024 | Emergency & Triage | 3 | P3 | M | backlog | — |
| 25 | EPIC-025 | Boarding & Daycare | 3 | P3 | L | backlog | — |
| 26 | EPIC-026 | Grooming Module | 3 | P3 | M | backlog | — |
| 27 | EPIC-027 | Mobile PWA | 3 | P3 | L | backlog | — |
| 28 | EPIC-028 | Multi-Clinic Chain Management | 3 | P3 | XL | backlog | — |
| 29 | EPIC-029 | Staff Management Enhancement | 3 | P3 | M | backlog | — |
| 30 | EPIC-030 | Inventory Enhancement | 3 | P3 | L | backlog | — |
| 31 | EPIC-031 | AI-Powered Features | 4 | P4 | XL | backlog | — |
| 32 | EPIC-032 | Client Education Library | 4 | P4 | M | backlog | — |
| 33 | EPIC-033 | Marketplace & Ecosystem | 4 | P4 | XL | backlog | — |
| 34 | EPIC-034 | Insurance Deep Integration | 4 | P4 | L | backlog | — |
| 35 | EPIC-035 | Epidemiology & Public Health | 4 | P4 | L | backlog | — |
| 36 | EPIC-036 | Compliance & Audit | 4 | P4 | L | backlog | — |
| 37 | EPIC-037 | Pet Passport & Travel | 4 | P4 | M | backlog | — |
| 38 | EPIC-038 | Loyalty Program Enhancement | 4 | P4 | M | backlog | — |
| 39 | EPIC-039 | E-commerce Enhancement | 4 | P4 | L | backlog | — |
| 40 | EPIC-040 | Advanced Scheduling | 4 | P4 | M | backlog | EPIC-015 |
| 41 | EPIC-041 | API Gateway & Versioning | 5 | P5 | L | backlog | — |
| 42 | EPIC-042 | Monitoring & Observability | 5 | P5 | L | backlog | — |
| 43 | EPIC-043 | Multi-Region & Scaling | 5 | P5 | L | backlog | — |
| 44 | EPIC-044 | Data Pipeline & Analytics | 5 | P5 | L | backlog | — |
| 45 | EPIC-045 | Backup & Disaster Recovery | 5 | P5 | M | backlog | — |
| 46 | EPIC-046 | DevOps & Infrastructure | 5 | P5 | L | backlog | — |
| 47 | EPIC-047 | Feature Flags & Experimentation | 5 | P5 | M | backlog | — |
| 48 | EPIC-048 | White-Label & Customization | 5 | P5 | XL | backlog | EPIC-008 |
| 49 | EPIC-049 | Developer Experience | 5 | P5 | M | backlog | — |
| 50 | EPIC-050 | Onboarding & Activation | 5 | P5 | M | backlog | — |
| 51 | EPIC-051 | Pricing & Billing Enhancement | 6 | P6 | M | backlog | — |
| 52 | EPIC-052 | Sales & Outreach | 6 | P6 | M | backlog | — |
| 53 | EPIC-053 | Landing Page Optimization | 6 | P6 | M | backlog | — |
| 54 | EPIC-054 | Customer Success | 6 | P6 | M | backlog | — |
| 55 | EPIC-055 | Partner Integrations | 6 | P6 | L | backlog | — |
| 56 | EPIC-056 | Social Features | 6 | P6 | M | backlog | — |
| 57 | EPIC-057 | Notification System Enhancement | 6 | P6 | M | backlog | EPIC-021 |
| 58 | EPIC-058 | Search & Discovery | 6 | P6 | M | backlog | — |
| 59 | EPIC-059 | Data Import & Migration | 6 | P6 | M | backlog | — |
| 60 | EPIC-060 | Print & Label Management | 6 | P6 | M | backlog | — |
| 61 | EPIC-061 | Species-Specific Features | 7 | P7 | L | backlog | — |
| 62 | EPIC-062 | Vaccination Protocol Engine | 7 | P7 | M | backlog | — |
| 63 | EPIC-063 | Nutrition & Diet Management | 7 | P7 | M | backlog | — |
| 64 | EPIC-064 | Behavioral Assessment | 7 | P7 | M | backlog | — |
| 65 | EPIC-065 | Geriatric Care | 7 | P7 | M | backlog | — |
| 66 | EPIC-066 | Reproductive Services | 7 | P7 | M | backlog | — |
| 67 | EPIC-067 | Laboratory Integration | 7 | P7 | L | backlog | — |
| 68 | EPIC-068 | Pathology & Cytology | 7 | P7 | M | backlog | — |
| 69 | EPIC-069 | Paraguay Regulatory Compliance | 8 | P8 | L | backlog | — |
| 70 | EPIC-070 | Paraguay Payment Ecosystem | 8 | P8 | L | backlog | EPIC-014 |
| 71 | EPIC-071 | Rural Veterinary Features | 8 | P8 | L | backlog | — |
| 72 | EPIC-072 | Paraguay-Specific Content | 8 | P8 | M | backlog | EPIC-009 |
| 73 | EPIC-073 | Real-time Features | 9 | P9 | L | backlog | — |
| 74 | EPIC-074 | Offline & Sync | 9 | P9 | XL | backlog | EPIC-027 |
| 75 | EPIC-075 | Machine Learning Pipeline | 9 | P9 | XL | backlog | EPIC-031 |
| 76 | EPIC-076 | Advanced Search & RAG | 9 | P9 | L | backlog | — |
| 77 | EPIC-077 | Webhook & Integration Platform | 9 | P9 | M | backlog | EPIC-041 |
| 78 | EPIC-078 | API Ecosystem | 9 | P9 | L | backlog | EPIC-041 |
| 79 | EPIC-079 | Advanced Billing | 9 | P9 | L | backlog | EPIC-014 |
| 80 | EPIC-080 | Print & Document Generation | 9 | P9 | M | backlog | — |
| 81 | EPIC-081 | Accessibility (a11y) | 10 | P10 | L | backlog | — |
| 82 | EPIC-082 | Performance Benchmarking | 10 | P10 | M | backlog | EPIC-010 |
| 83 | EPIC-083 | Security Hardening (Advanced) | 10 | P10 | L | backlog | EPIC-002 |
| 84 | EPIC-084 | UX Polish | 10 | P10 | M | backlog | — |
| 85 | EPIC-085 | Email System | 10 | P10 | M | backlog | — |
| 86 | EPIC-086 | Legal & Compliance Pages | 10 | P10 | S | backlog | — |
| 87 | EPIC-087 | Multi-Species Medical Records | 10 | P10 | M | backlog | EPIC-061 |
| 88 | EPIC-088 | Client Segmentation & Marketing | 10 | P10 | M | backlog | — |
| 89 | EPIC-089 | Inventory Intelligence | 10 | P10 | M | backlog | EPIC-030 |
| 90 | EPIC-090 | Knowledge Base & Training | 10 | P10 | M | backlog | — |
| 91 | EPIC-091 | Pet Health Score | 11 | P11 | L | backlog | EPIC-031 |
| 92 | EPIC-092 | Predictive Health Alerts | 11 | P11 | L | backlog | EPIC-091 |
| 93 | EPIC-093 | Clinic Performance AI | 11 | P11 | L | backlog | EPIC-031 |
| 94 | EPIC-094 | Pet Owner Mobile Experience | 11 | P11 | M | backlog | EPIC-027 |
| 95 | EPIC-095 | Smart Clinic Dashboard | 11 | P11 | M | backlog | — |
| 96 | EPIC-096 | IoT & Device Integration | 11 | P11 | L | backlog | — |
| 97 | EPIC-097 | Community & Ecosystem | 11 | P11 | L | backlog | — |
| 98 | EPIC-098 | Data Export & Interoperability | 11 | P11 | M | backlog | — |
| 99 | EPIC-099 | Sustainability & Green Vet | 11 | P11 | S | backlog | — |
| 100 | EPIC-100 | Platform Marketplace | 11 | P11 | XL | backlog | EPIC-077 |

---

## Summary by Tier

| Tier | Epics | Priority | Timeline |
|------|-------|----------|----------|
| 0 - Critical | 3 | P0 | Immediate |
| 1 - High | 4 | P1 | 2 weeks |
| 2 - Quality | 6 | P2 | Weeks 3-6 |
| 3 - Features | 17 | P3 | Weeks 7-16 |
| 4 - Growth | 10 | P4 | Months 3-6 |
| 5 - Platform | 10 | P5 | Ongoing |
| 6 - Business | 10 | P6 | Months 6-12 |
| 7 - Specialty | 8 | P7 | Ongoing |
| 8 - Regional | 4 | P8 | Quarter 3 |
| 9 - Advanced | 8 | P9 | Months 9-12 |
| 10 - Polish | 10 | P10 | Ongoing |
| 11 - Differentiation | 10 | P11 | Year 2 |
| **TOTAL** | **100** | | |
