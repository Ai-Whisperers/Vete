# A11Y-003: Screen Reader Compatibility

## Priority: P2
## Category: Accessibility
## Status: Not Started
## Epic: [EPIC-13: Accessibility & Compliance](../epics/EPIC-13-accessibility-compliance.md)

## Description
Ensure the platform is fully compatible with screen readers through proper ARIA labels, roles, and semantic HTML.

## Current State
- ARIA labels may be missing
- Some components lack semantic HTML
- Dynamic content may not be announced
- Form labels may be incomplete

## Proposed Solution

### ARIA Labels for Icons
```tsx
// components/ui/icon-button.tsx
interface IconButtonProps {
  icon: React.ReactNode;
  label: string; // Required for accessibility
  onClick: () => void;
}

export function IconButton({ icon, label, onClick }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}
```

### Live Regions for Dynamic Content
```tsx
// components/ui/live-region.tsx
export function LiveRegion({ message, type = 'polite' }: { message: string; type?: 'polite' | 'assertive' }) {
  return (
    <div
      role="status"
      aria-live={type}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Usage for notifications
<LiveRegion message="Cita guardada exitosamente" type="polite" />
```

### Semantic Form Labels
```tsx
// components/forms/form-field.tsx
export function FormField({ id, label, error, children }: FormFieldProps) {
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {React.cloneElement(children, {
        id,
        'aria-describedby': error ? errorId : descriptionId,
        'aria-invalid': !!error,
      })}
      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

### Table Accessibility
```tsx
// components/data/accessible-table.tsx
export function AccessibleTable({ caption, headers, rows }: TableProps) {
  return (
    <table role="table">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {headers.map((header, i) => (
            <th key={i} scope="col">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Implementation Steps
1. Add alt text to all images
2. Add ARIA labels to icon buttons
3. Implement live regions for notifications
4. Fix form label associations
5. Add table captions and headers
6. Test with NVDA and VoiceOver
7. Document screen reader shortcuts

## Acceptance Criteria
- [ ] All images have alt text
- [ ] All buttons have accessible names
- [ ] Live regions announce updates
- [ ] Forms properly labeled
- [ ] Tables have captions
- [ ] Tested with NVDA/VoiceOver

## Related Files
- `components/**/*.tsx` - All components
- `app/[clinic]/**/*.tsx` - All pages

## Estimated Effort
- 10 hours
  - Image alt text: 2h
  - ARIA labels: 3h
  - Live regions: 2h
  - Form labels: 2h
  - Testing: 1h
