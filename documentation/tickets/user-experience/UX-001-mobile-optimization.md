# UX-001: Mobile Experience Optimization

## Priority: P2
## Category: User Experience
## Status: Not Started
## Epic: [EPIC-16: User Experience](../epics/EPIC-16-user-experience.md)

## Description
Optimize the mobile experience across all user flows, ensuring touch-friendly interactions, fast load times, and intuitive navigation.

## Current State
- Responsive design exists
- Some touch targets too small
- Mobile navigation could be improved
- Forms not optimized for mobile

## Proposed Solution

### Touch Target Sizing
```css
/* styles/mobile.css */

/* Ensure minimum 44px touch targets (Apple HIG) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* Larger touch targets for important actions */
.touch-target-lg {
  min-height: 56px;
  padding: 16px 24px;
}

/* Spacing between touch targets */
.touch-spacing > * + * {
  margin-top: 8px;
}
```

### Mobile Navigation Component
```tsx
// components/layout/mobile-nav.tsx
export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        <NavItem href="/portal" icon={Home} label="Inicio" />
        <NavItem href="/portal/pets" icon={PawPrint} label="Mascotas" />
        <NavItem href="/book" icon={Calendar} label="Citas" isPrimary />
        <NavItem href="/portal/store" icon={ShoppingBag} label="Tienda" />
        <NavItem href="/portal/profile" icon={User} label="Perfil" />
      </div>
    </nav>
  );
}

function NavItem({ href, icon: Icon, label, isPrimary }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center w-16 h-full",
        isPrimary && "relative -mt-4",
        isActive ? "text-primary" : "text-gray-500"
      )}
    >
      {isPrimary ? (
        <div className="absolute -top-6 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <Icon className="w-6 h-6 text-white" />
        </div>
      ) : (
        <Icon className="w-6 h-6" />
      )}
      <span className={cn("text-xs mt-1", isPrimary && "mt-8")}>{label}</span>
    </Link>
  );
}
```

### Mobile-Optimized Forms
```tsx
// components/forms/mobile-form-field.tsx
export function MobileFormField({ label, type, ...props }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        className={cn(
          "w-full h-12 px-4 rounded-lg border border-gray-300",
          "text-base", // Prevents zoom on iOS
          "focus:ring-2 focus:ring-primary focus:border-transparent",
          "touch-manipulation" // Removes 300ms delay
        )}
        // Auto-capitalize and autocomplete hints
        autoCapitalize={type === 'email' ? 'off' : 'sentences'}
        autoComplete={getAutoComplete(type)}
        inputMode={getInputMode(type)}
        {...props}
      />
    </div>
  );
}

function getInputMode(type: string): HTMLInputTypeAttribute {
  const modes: Record<string, string> = {
    email: 'email',
    tel: 'tel',
    number: 'numeric',
    url: 'url',
  };
  return modes[type] || 'text';
}
```

### Pull-to-Refresh
```tsx
// hooks/use-pull-refresh.ts
export function usePullRefresh(onRefresh: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].pageY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    const pullDistance = e.touches[0].pageY - startY.current;
    if (pullDistance > 80 && !refreshing) {
      triggerRefresh();
    }
  };

  const triggerRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return { refreshing };
}
```

### Swipe Actions for Lists
```tsx
// components/ui/swipeable-row.tsx
import { useSwipeable } from 'react-swipeable';

export function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
}: SwipeableRowProps) {
  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipeLeft?.(),
    onSwipedRight: () => onSwipeRight?.(),
    trackMouse: false,
    delta: 50,
  });

  return (
    <div className="relative overflow-hidden" {...handlers}>
      {/* Left action (shown on right swipe) */}
      <div className="absolute left-0 h-full flex items-center bg-green-500 px-4">
        {rightAction}
      </div>

      {/* Right action (shown on left swipe) */}
      <div className="absolute right-0 h-full flex items-center bg-red-500 px-4">
        {leftAction}
      </div>

      {/* Main content */}
      <div className="relative bg-white">{children}</div>
    </div>
  );
}
```

## Implementation Steps
1. Audit all touch targets for 44px minimum
2. Implement bottom navigation component
3. Optimize all forms for mobile input
4. Add pull-to-refresh where appropriate
5. Implement swipe actions for lists
6. Test on various mobile devices
7. Optimize for safe areas (notch, home indicator)

## Acceptance Criteria
- [ ] All touch targets ≥ 44px
- [ ] Bottom navigation on mobile
- [ ] Forms use appropriate keyboards
- [ ] Pull-to-refresh implemented
- [ ] Swipe actions on lists
- [ ] Safe area handling

## Mobile Testing Checklist
- [ ] iPhone SE (small screen)
- [ ] iPhone 14 Pro (notch)
- [ ] iPhone 15 Pro Max (dynamic island)
- [ ] Samsung Galaxy (Android)
- [ ] Tablet portrait mode

## Related Files
- `components/layout/` - Navigation components
- `components/ui/` - UI components
- `styles/` - Global styles

## Estimated Effort
- 12 hours
  - Touch target audit: 2h
  - Bottom navigation: 2h
  - Form optimization: 3h
  - Swipe/pull gestures: 3h
  - Testing: 2h
