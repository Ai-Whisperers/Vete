# UX-003: Loading States & Skeletons

## Priority: P2
## Category: User Experience
## Status: Not Started
## Epic: [EPIC-16: User Experience](../epics/EPIC-16-user-experience.md)

## Description
Implement consistent loading states and skeleton screens throughout the application to improve perceived performance and user experience.

## Current State
- Spinner used for most loading states
- No skeleton screens
- Flash of empty content before data loads
- Inconsistent loading indicators

## Proposed Solution

### Skeleton Component Library
```tsx
// components/ui/skeleton.tsx
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-200',
        animation === 'pulse' && 'animate-pulse',
        animation === 'wave' && 'animate-shimmer',
        variant === 'text' && 'rounded h-4',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

// Shimmer animation
// tailwind.config.js
// animation: { shimmer: 'shimmer 2s infinite' }
// keyframes: { shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } } }
```

### Pet Card Skeleton
```tsx
// components/pets/pet-card-skeleton.tsx
export function PetCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex gap-4">
        {/* Pet photo */}
        <Skeleton variant="circular" width={80} height={80} />

        <div className="flex-1 space-y-3">
          {/* Name */}
          <Skeleton width="60%" height={24} />

          {/* Species & breed */}
          <Skeleton width="40%" />

          {/* Age */}
          <Skeleton width="30%" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <Skeleton variant="rectangular" height={36} className="flex-1" />
        <Skeleton variant="rectangular" height={36} className="flex-1" />
      </div>
    </div>
  );
}

export function PetListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PetCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### Table Skeleton
```tsx
// components/ui/table-skeleton.tsx
interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b p-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width={`${100 / columns}%`} height={20} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b last:border-0 p-4 flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              width={`${100 / columns}%`}
              height={16}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Page Loading States
```tsx
// components/loading/page-loading.tsx
export function PageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <Skeleton width={200} height={32} />
        <Skeleton variant="rectangular" width={120} height={40} />
      </div>

      {/* Content skeleton varies by page type */}
      <div className="space-y-4">
        <Skeleton variant="rectangular" height={200} />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton variant="rectangular" height={150} />
          <Skeleton variant="rectangular" height={150} />
          <Skeleton variant="rectangular" height={150} />
        </div>
      </div>
    </div>
  );
}
```

### Suspense Integration
```tsx
// app/[clinic]/portal/pets/page.tsx
import { Suspense } from 'react';
import { PetListSkeleton } from '@/components/pets/pet-card-skeleton';

export default function PetsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mis Mascotas</h1>

      <Suspense fallback={<PetListSkeleton count={4} />}>
        <PetList />
      </Suspense>
    </div>
  );
}
```

### Button Loading State
```tsx
// components/ui/button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

export function Button({
  children,
  isLoading,
  loadingText,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Spinner className="w-4 h-4 animate-spin" />
          {loadingText || 'Cargando...'}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
```

### Progress Indicators
```tsx
// components/ui/progress.tsx
interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
}

export function Progress({
  value,
  max = 100,
  label,
  showPercentage = true,
}: ProgressProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className="space-y-2">
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-gray-600">{label}</span>}
          {showPercentage && <span className="text-gray-500">{percentage}%</span>}
        </div>
      )}
      <div
        className="h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

## Implementation Steps
1. Create base skeleton component
2. Build skeleton variants for common elements
3. Implement page-specific skeletons
4. Add Suspense boundaries to all pages
5. Implement button loading states
6. Add progress indicators where needed
7. Test loading states with network throttling

## Acceptance Criteria
- [ ] Skeleton component library
- [ ] Page-specific loading states
- [ ] React Suspense integration
- [ ] Button loading states
- [ ] Progress indicators
- [ ] No flash of empty content

## Skeleton Inventory Needed
- [ ] Pet card skeleton
- [ ] Appointment card skeleton
- [ ] Product card skeleton
- [ ] Table skeleton
- [ ] Form skeleton
- [ ] Calendar skeleton
- [ ] Dashboard stats skeleton

## Related Files
- `components/ui/skeleton.tsx` - Base skeleton
- `components/loading/` - Page loading states
- `app/[clinic]/*/loading.tsx` - Route loading

## Estimated Effort
- 8 hours
  - Skeleton library: 2h
  - Page skeletons: 3h
  - Suspense integration: 2h
  - Testing: 1h
