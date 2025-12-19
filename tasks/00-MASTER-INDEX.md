# Vete Codebase Refactoring - Master Task Index

> **Generated:** December 19, 2025
> **Total Issues:** 150+
> **Estimated Effort:** 80-120 hours

## Quick Navigation

| File | Area | Critical | High | Medium | Effort |
|------|------|----------|------|--------|--------|
| [01-SECURITY.md](./01-SECURITY.md) | Security & Auth | 7 | 5 | 3 | 8-12h |
| [02-API-ROUTES.md](./02-API-ROUTES.md) | API Routes | 3 | 10 | 15 | 16-24h |
| [03-SERVER-ACTIONS.md](./03-SERVER-ACTIONS.md) | Server Actions | 3 | 8 | 12 | 12-16h |
| [04-COMPONENTS.md](./04-COMPONENTS.md) | React Components | 5 | 15 | 30 | 40-60h |
| [05-DATABASE.md](./05-DATABASE.md) | Database & SQL | 2 | 6 | 8 | 8-12h |
| [06-TYPES-SCHEMAS.md](./06-TYPES-SCHEMAS.md) | Types & Schemas | 8 | 5 | 7 | 8-12h |
| [07-PAGES.md](./07-PAGES.md) | Next.js Pages | 4 | 8 | 20 | 16-24h |
| [08-UTILITIES.md](./08-UTILITIES.md) | Lib & Utilities | 3 | 6 | 5 | 6-10h |

---

## Priority Levels

- **CRITICAL** - Security vulnerabilities, data exposure risks. Fix immediately.
- **HIGH** - Major code quality issues, significant duplication. Fix this sprint.
- **MEDIUM** - Refactoring opportunities, maintainability. Plan for next sprint.
- **LOW** - Nice-to-have improvements. Backlog.

---

## Sprint Planning Suggestion

### Sprint 1 (Week 1-2): Security & Foundation
- [ ] All CRITICAL security fixes from `01-SECURITY.md`
- [ ] Create auth utility (`lib/auth/require-staff.ts`)
- [ ] Add error boundaries to dashboard/portal
- [ ] Fix duplicate type definitions

### Sprint 2 (Week 3-4): API & Actions Cleanup
- [ ] HIGH priority API route fixes from `02-API-ROUTES.md`
- [ ] HIGH priority server action fixes from `03-SERVER-ACTIONS.md`
- [ ] Add missing Zod validation schemas
- [ ] Standardize error handling patterns

### Sprint 3 (Week 5-6): Component Refactoring
- [ ] Split 5 massive components (1000+ lines)
- [ ] Consolidate duplicate components
- [ ] Extract shared hooks
- [ ] Create form abstraction

### Sprint 4 (Week 7-8): Pages & Polish
- [ ] Add SEO metadata to 80 pages
- [ ] Convert client components to server where possible
- [ ] Database migration cleanup
- [ ] Documentation updates

---

## Files Changed Summary

After completing all tasks, approximately:

| Directory | Files Changed | Lines Reduced |
|-----------|---------------|---------------|
| `web/components/` | 50+ | ~5,000 |
| `web/app/api/` | 40+ | ~1,500 |
| `web/app/actions/` | 24 | ~800 |
| `web/app/[clinic]/` | 30+ | ~3,000 |
| `web/lib/` | 15+ | ~500 |
| `web/db/` | 10+ | ~200 |

---

## How to Use These Tasks

1. **For Individual Work:** Pick a file, work through tasks in priority order
2. **For Team:** Assign different files to different developers
3. **For Code Review:** Use as checklist when reviewing related PRs
4. **For Estimation:** Each task has effort estimate in hours

---

## Completion Tracking

Update this section as tasks are completed:

```
[ ] 01-SECURITY.md - 0/15 tasks
[ ] 02-API-ROUTES.md - 0/28 tasks
[ ] 03-SERVER-ACTIONS.md - 0/23 tasks
[ ] 04-COMPONENTS.md - 0/50 tasks
[ ] 05-DATABASE.md - 0/16 tasks
[ ] 06-TYPES-SCHEMAS.md - 0/20 tasks
[ ] 07-PAGES.md - 0/32 tasks
[ ] 08-UTILITIES.md - 0/14 tasks
```

---

## Quick Wins (< 30 minutes each)

These can be done immediately for quick improvements:

1. Add `error.tsx` to `web/app/[clinic]/dashboard/` (copy from root)
2. Add `error.tsx` to `web/app/[clinic]/portal/` (copy from root)
3. Rename `55_appointment_workflow.sql` to `56_appointment_workflow.sql`
4. Rename `85_owner_clinic_connections.sql` to `86_owner_clinic_connections.sql`
5. Add auth check to `web/app/actions/send-email.ts` (5 lines)
6. Fix WhatsApp tenant filter (1 line change)

---

## Related Documentation

- `CLAUDE.md` - Project overview and coding standards
- `documentation/database/schema-reference.md` - Database schema
- `documentation/architecture/overview.md` - System architecture
- `.claude/exemplars/` - Code pattern examples
