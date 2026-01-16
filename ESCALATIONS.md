# Escalations

Critical issues that require immediate user attention and halt autonomous work in affected areas.

---

## Template

```markdown
### ESCALATION-XXX: [Title]
**Date**: [Date and time]  
**Severity**: CRITICAL  
**Status**: ACTIVE | RESOLVED

**Problem**: [Clear description of the critical issue]

**Impact**: [What is broken, data at risk, security concern, etc.]

**Actions Taken**: [What was attempted]

**Why Escalated**: [Why this requires user intervention]

**Required Action**: [What the user needs to do]

**Workaround**: [None | Temporary solution]

**Affected Areas**: [What work is blocked]
```

---

## 🚨 ACTIVE ESCALATIONS

(None at this time)

---

## ✅ RESOLVED ESCALATIONS

(None at this time)

---

## Escalation Criteria

Escalate immediately if:
- ✋ Data loss risk
- 🔒 Security vulnerability discovered
- 💥 Production system down
- 🚫 Cannot proceed without user decision
- 🏗️ Fundamental design flaw found
- ⚠️ Breaking changes required to critical APIs

Otherwise, document in `BLOCKERS.md` or `DEFERRED_DECISIONS.md` and continue other work.
