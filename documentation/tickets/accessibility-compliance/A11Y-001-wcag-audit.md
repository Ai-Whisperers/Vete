# A11Y-001: WCAG 2.1 AA Compliance Audit

## Priority: P2
## Category: Accessibility
## Status: Not Started
## Epic: [EPIC-13: Accessibility & Compliance](../epics/EPIC-13-accessibility-compliance.md)

## Description
Conduct a comprehensive WCAG 2.1 AA compliance audit and create a remediation plan for identified issues.

## Current State
- No formal accessibility audit conducted
- Unknown compliance status
- Potential legal liability
- Users with disabilities may be excluded

## Proposed Solution

### Audit Scope
1. **Perceivable**
   - Text alternatives for images
   - Captions for videos
   - Color contrast ratios
   - Resizable text

2. **Operable**
   - Keyboard navigation
   - Focus indicators
   - Skip links
   - Time limits

3. **Understandable**
   - Language declaration
   - Consistent navigation
   - Error identification
   - Labels and instructions

4. **Robust**
   - Valid HTML
   - ARIA usage
   - Name, role, value

### Audit Tools
```bash
# Automated testing
npx axe-core --reporter html ./pages

# Manual testing checklist
# - Screen reader testing (NVDA, VoiceOver)
# - Keyboard-only navigation
# - Color contrast analyzer
# - Focus order verification
```

### Reporting Template
```typescript
interface AccessibilityIssue {
  wcagCriterion: string; // e.g., "1.4.3 Contrast (Minimum)"
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  component: string;
  description: string;
  remediation: string;
  effort: number; // hours
}
```

## Implementation Steps
1. Set up axe-core automated testing
2. Run automated audit on all pages
3. Conduct manual screen reader testing
4. Test keyboard navigation
5. Check color contrast ratios
6. Document all issues found
7. Prioritize remediation plan
8. Create accessibility statement

## Acceptance Criteria
- [ ] All pages audited
- [ ] Issues documented with WCAG references
- [ ] Severity levels assigned
- [ ] Remediation plan created
- [ ] Estimated effort per issue
- [ ] Accessibility statement drafted

## Related Files
- `app/[clinic]/**/*.tsx` - All pages
- `components/**/*.tsx` - All components

## Estimated Effort
- 12 hours
  - Automated testing: 2h
  - Manual testing: 6h
  - Documentation: 2h
  - Remediation plan: 2h
