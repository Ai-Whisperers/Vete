# A11Y-002: Keyboard Navigation Improvements

## Priority: P2
## Category: Accessibility
## Status: Not Started
## Epic: [EPIC-13: Accessibility & Compliance](../epics/EPIC-13-accessibility-compliance.md)

## Description
Ensure all interactive elements are accessible via keyboard navigation with visible focus indicators.

## Current State
- Some components not keyboard accessible
- Focus indicators may be missing or unclear
- No skip links for navigation
- Tab order may be illogical

## Proposed Solution

### Focus Styles
```css
/* styles/accessibility.css */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Remove default outline only when using :focus-visible */
:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast focus for buttons */
button:focus-visible,
a:focus-visible {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.3);
}
```

### Skip Links
```tsx
// components/layout/skip-links.tsx
export function SkipLinks() {
  return (
    <div className="skip-links">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <a href="#main-navigation" className="skip-link">
        Saltar a la navegación
      </a>
    </div>
  );
}
```

### Keyboard Trap Prevention
```tsx
// hooks/use-focus-trap.ts
export function useFocusTrap(ref: RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ref, isActive]);
}
```

## Implementation Steps
1. Audit current keyboard navigation
2. Add visible focus indicators to all interactive elements
3. Implement skip links on all pages
4. Fix tab order issues
5. Add focus trapping to modals
6. Test with keyboard-only navigation
7. Document keyboard shortcuts

## Acceptance Criteria
- [ ] All interactive elements focusable
- [ ] Visible focus indicators
- [ ] Skip links on all pages
- [ ] Logical tab order
- [ ] Modal focus trapping
- [ ] Escape key closes modals

## Related Files
- `components/ui/*.tsx` - UI components
- `components/layout/*.tsx` - Layout components
- `styles/globals.css` - Global styles

## Estimated Effort
- 8 hours
  - Focus indicators: 2h
  - Skip links: 1h
  - Tab order fixes: 3h
  - Modal focus trapping: 2h
