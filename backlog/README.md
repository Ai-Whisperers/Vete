# Vete Backlog

Multi-tenant veterinary SaaS platform backlog.

## Project Board

**GitHub Project:** https://github.com/users/Ai-Whisperers/projects/4

## Rules

- Agent changes must be implemented on feature branches only
- No direct pushes to `main` or `master`
- Open PR first, then review + merge
- All work must be linked to an epic
- Stories must have acceptance criteria

## Label System

| Label | Purpose |
|-------|---------|
| `epic` | Large feature container |
| `story` | Implementable user story |
| `spike` | Research task |
| `priority:critical` | Must fix now |
| `priority:high` | Next sprint |
| `priority:medium` | Scheduled |
| `priority:low` | Backlog |

## Sprint Schedule

| Sprint | Focus | Due |
|--------|-------|-----|
| Sprint 1: Critical Fixes | Portal login, security, tests | Apr 26 |
| Sprint 2: Core Features | Multi-tenant, portal, dashboard, store | May 10 |
| Sprint 3: Payments & Quality | Paraguay payments, monitoring, PWA | May 24 |

## Epic Registry (30 Epics)

### Critical Priority
| # | Epic | Sprint |
|---|------|--------|
| 87 | Security & Compliance | 1 |
| 88 | Test Suite Restoration | 1 |
| 102 | Enhanced Client Portal | 1 |
| 190 | Technical Debt & Code Quality | 1 |
| 194 | Data Privacy & Compliance | 1 |

### High Priority
| # | Epic | Sprint |
|---|------|--------|
| 72 | Multi-Tenant Clinic Platform | 2 |
| 73 | Pet Owner Portal | 2 |
| 74 | Staff Dashboard | 2 |
| 75 | E-Commerce Store | 2 |
| 89 | Code Quality & Technical Debt | 2 |
| 90 | Internationalization (i18n) | 2 |
| 100 | Paraguay Payment Methods | 3 |
| 101 | Loyalty & Rewards System | 2 |
| 191 | Performance Optimization | 3 |
| 193 | CI/CD & DevOps Excellence | 3 |
| 195 | Developer Experience (DX) | 3 |

### Medium Priority
| # | Epic | Sprint |
|---|------|--------|
| 76 | Clinical Tools | 3 |
| 77 | Hospitalization Module | 3 |
| 78 | Laboratory Module | 3 |
| 79 | Messaging & Notifications | 3 |
| 80 | Adoptions System | 3 |
| 81 | Lost & Found Pets | 3 |
| 82 | Procurement & Suppliers | 3 |
| 83 | Insurance Claims | 3 |
| 91 | API Platform | 3 |
| 92 | Monitoring & Observability | 3 |
| 93 | PWA & Mobile Optimization | 3 |
| 94 | Telemedicine | 3 |
| 95 | Medical Imaging | 3 |
| 96 | Surgery Management | 3 |
| 97 | Dental Module | 3 |
| 98 | Pharmacy Dispensing | 3 |
| 99 | Grooming Services | 3 |
| 103 | Analytics & Business Intelligence | 3 |
| 192 | Documentation Refresh | 3 |

## Project Custom Fields

- **Story Points** (Number) - Fibonacci sizing
- **Effort** (XS/S/M/L/XL) - Time estimate
- **Category** (Feature/Infrastructure/Bug Fix/Tech Debt/Security/Documentation)
- **Status** (Todo/In Progress/Done)
- **Milestone** - Sprint assignment

## Gap Analysis Summary

### Critical Gaps Found
1. Portal login returns 500 error
2. 758 tests failing (249 component + 509 integration)
3. `ignoreBuildErrors: true` masks TypeScript errors
4. 2300+ console.log calls in production code
5. ESLint max-warnings set to 800

### Security Status
- RLS policies: 1257 CREATE POLICY (comprehensive)
- CSP headers: Configured
- Rate limiting: Upstash Redis (partial)
- SQL injection: Protected (parameterized queries)
- XSS: Sanitized with DOMPurify

### Performance Status
- Bundle splitting: Configured
- Image optimization: AVIF/WebP enabled
- Database indexes: 1573 CREATE INDEX
- Caching: Redis configured

## Intake
- [x] [AUTO] Add initial repository-specific backlog items
- [x] [AUTO-EXEC] Keep backlog current with pending work
